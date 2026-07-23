/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    fvttIsActiveGM,
    fvttWorldTime,
    fvttResolveUuidAsync,
    fvttActiveSceneUuid,
} from "@src/core/FoundryHelpers";
import type { SohlTriggerContext } from "@src/entity/event/event-trigger";
import type { SafeExpression } from "@src/entity/expr/SafeExpression";
import { toFilePath, defaultToJSON } from "@src/utils/helpers";

/** The generic timed-effect reminder card posted when a scheduled effect is due. */
const REMINDER_CARD_TEMPLATE = "systems/sohl/templates/chat/reminder-card.hbs";

/**
 * A single registered subscription, uniquely identified by `(uuid, actionName)`.
 *
 * @see {@link SohlEventQueue}
 */
export interface SohlSubscription {
    /** UUID of the document this subscription belongs to. */
    uuid: string;
    /**
     * The **action** to run, scoped to {@link uuid}. A document may have at most
     * one subscription per action name; re-subscribing overwrites.
     *
     * It is the action's shortcode, run on the owning document's logic when the
     * subscription is offered (see {@link SohlEventQueue.fire}) — so the queue is
     * a *deferred action runner*: an event reuses the very same action a user
     * could invoke manually, on the same document.
     */
    actionName: string;
    /**
     * Trigger this subscription listens to (e.g. `"updateWorldTime"`,
     * `"combatStart"`). Must match the `name` of a {@link SohlTriggerContext}
     * passed to {@link SohlEventQueue.fire}.
     */
    triggerName: string;
    /**
     * Optional scheduled world-time. When the trigger is `updateWorldTime`,
     * the subscription is *due* (and fires) only when `ctx.worldTime >= fireAt`,
     * and due subscriptions dispatch in ascending `fireAt` order. Also the value
     * returned by {@link SohlEventQueue.nextFireTime}.
     */
    fireAt?: number;
    /**
     * Optional predicate expression. When present, the subscription fires only
     * when this {@link SafeExpression} evaluates truthy against the trigger
     * context (`ctx` supplies the bindings — `name`, `worldTime`, `payload`, …),
     * plus `subscriberUuid`: this subscription's own {@link uuid}, so a predicate
     * can compare the trigger to the document it belongs to without baking an id
     * into its source — e.g. gating a combat `turnEnd` schedule to the end of the
     * subscriber's **own** turn with `combatant.actor.uuid === subscriberUuid`.
     * Expressions that throw are caught and logged; the dispatch is skipped but
     * the subscription is preserved.
     */
    predicate?: SafeExpression;
    /**
     * Optional data attached to the subscription. On dispatch it is forwarded to
     * the action as `ctx.payload` (the action context's `scope`).
     */
    payload?: Record<string, unknown>;
    /**
     * Optional uuid of the scene this subscription is bound to (issue #590).
     * When set, a due subscription is offered only while that scene is the
     * **active** scene ({@link fvttActiveSceneUuid}); while its scene is inactive
     * the due subscription is skipped **without being consumed**, so it stays
     * armed and surfaces when the scene next becomes active. Absent means the
     * subscription is world-wide (offered regardless of the active scene).
     */
    sceneUuid?: string;
    /**
     * If true, the subscription is removed immediately before its handler
     * runs. Set by {@link SohlEventQueue.scheduleAt}.
     */
    oneShot?: boolean;
}

const MAX_TRIGGER_DEPTH = 16;

/**
 * In-memory trigger dispatcher for SoHL.
 *
 * Accessible at runtime as `sohl.events`.
 *
 * ## Overview
 *
 * Documents subscribe to **triggers** — named lifecycle moments shared
 * with Foundry's `CONFIG.ActiveEffect.expiryEvents` vocabulary
 * (`updateWorldTime`, `combatStart`, `combatEnd`, `roundStart`,
 * `roundEnd`, `turnStart`, `turnEnd`, plus any custom names registered
 * via `registerSohlTrigger`). When a trigger fires, matching subscriptions
 * dispatch by **executing the action** named by the subscription's `actionName` on the
 * owning document's logic — the trigger context (with the subscription's
 * `payload`) becomes the action's scope. An event therefore reuses the very
 * same action a user could invoke manually.
 *
 * Time scheduling is one trigger among many: a `scheduleAt(uuid, actionName,
 * fireAt, payload)` call creates a one-shot subscription on
 * `updateWorldTime` that fires when world time reaches `fireAt`.
 *
 * ## Identity and overwrite semantics
 *
 * Each subscription is uniquely identified by `(uuid, actionName)`. Re-subscribing
 * with the same identity **overwrites** the previous entry. Documents
 * re-register their subscriptions on every preparation cycle, so only the most
 * recent registration matters.
 *
 * ## Populate everywhere, fire on the active GM only
 *
 * The queue is a **pure projection of document state**: every client — GM or
 * player — populates its own copy from its own document preparation, so
 * `subscribe` / `unsubscribe` / `scheduleAt` run on **all** clients. A player's
 * queue is therefore a *permission-scoped subset* of the active GM's (it holds
 * only the subscriptions for documents that client can see), which is exactly
 * enough to answer sheet-side date queries ({@link nextFireTime} /
 * {@link timeUntil}) locally.
 *
 * Only **`fire`** is gated to the active GM. Nothing else evolves schedule state,
 * so no GM-only side effect can drift the clients out of sync — schedule changes
 * flow through document updates (which replicate) and their re-preparation.
 *
 * ## Single-pass dispatch (no cascade)
 *
 * A `fire(ctx)` dispatches each matching subscription **once**, from a snapshot
 * taken at the start of the call. For `updateWorldTime`, "matching" additionally
 * requires the subscription be *due* (`fireAt` undefined or `<= worldTime`), and
 * due subscriptions dispatch in ascending `fireAt` order. Subscriptions a handler
 * adds mid-dispatch are **not** re-fired within the same call — they wait for the
 * next `fire`.
 *
 * The queue deliberately does **not** catch up recurring events over a large time
 * jump. That is the consuming document's responsibility: its handler resolves
 * every elapsed interval in `(lastAnchor, worldTime]` in one pass and persists the
 * advanced anchor, and its `finalize()` re-registers the single next occurrence
 * beyond `worldTime`. See the Event Queue reference doc for the contract.
 *
 * ## Loop protection
 *
 * Re-entrant `fire(...)` for the same trigger name is capped at
 * `MAX_TRIGGER_DEPTH` (16); beyond that the call aborts with an error. This
 * backstops non-time loops (e.g. a `combatStart` handler that fires
 * `combatStart`). Because there is no cascade, no same-tick guard is needed:
 * a handler that re-arms during dispatch simply schedules a subscription that the
 * next `fire` sees.
 *
 * ## Predicate error policy
 *
 * Predicates that throw are caught and logged; that dispatch is skipped; the
 * subscription is not removed. Predicates may legitimately fail on stale data
 * (e.g., resolving an effect that was just deleted) and one bad tick should not
 * permanently disarm a check.
 */
export class SohlEventQueue {
    private subs: Map<string, SohlSubscription> = new Map();

    /** Per-trigger reentrancy depth for the loop-protection backstop. */
    private depthByTrigger: Map<string, number> = new Map();

    /**
     * Which due occurrences have already been *offered* (a `[Perform]` reminder
     * posted), keyed `uuid::actionName` → the `fireAt` last offered. Prevents
     * re-posting the same due reminder every time world time advances while it
     * sits unperformed; a new `fireAt` (after the effect is performed and
     * re-armed) offers again. In-memory on the active GM only — a GM reload may
     * re-offer once, which is harmless.
     */
    private offered: Map<string, number> = new Map();

    /**
     * Build the composite map key for a subscription.
     *
     * @param uuid - The subscribed document's UUID.
     * @param actionName - The subscription actionName.
     * @returns The `uuid::actionName` map key.
     */
    private key(uuid: string, actionName: string): string {
        return `${uuid}::${actionName}`;
    }

    /**
     * Register or overwrite a subscription. Runs on **all** clients (the queue is
     * a projection of document state); only {@link fire} is GM-gated.
     *
     * If a subscription with the same `(uuid, actionName)` already exists, its fields
     * are replaced.
     *
     * @param sub - The subscription to register or overwrite.
     */
    subscribe(sub: SohlSubscription): void {
        this.subs.set(this.key(sub.uuid, sub.actionName), { ...sub });
    }

    /**
     * Convenience: schedule a one-shot dispatch when world time reaches
     * `fireAt`. Equivalent to subscribing to `updateWorldTime` with
     * `oneShot: true`.
     *
     * Recurring schedules are the consumer's responsibility: the handler
     * advances the document's persisted anchor and its `finalize()` re-registers
     * the next occurrence (see the class overview).
     *
     * @param uuid - The document to dispatch to when the time is reached.
     * @param actionName - The subscription actionName passed to the handler.
     * @param fireAt - The world time at or after which to fire.
     * @param payload - Optional payload forwarded to the handler.
     * @param sceneUuid - Optional scene the schedule is bound to (issue #590);
     *   offered only while that scene is active. Omit for a world-wide schedule.
     */
    scheduleAt(
        uuid: string,
        actionName: string,
        fireAt: number,
        payload?: Record<string, unknown>,
        sceneUuid?: string,
    ): void {
        this.subscribe({
            uuid,
            actionName,
            triggerName: "updateWorldTime",
            fireAt,
            payload,
            sceneUuid,
            oneShot: true,
        });
    }

    /**
     * Remove a subscription. Runs on all clients; safe when absent.
     *
     * @param uuid - The subscribed document's UUID.
     * @param actionName - The subscription actionName to remove.
     */
    unsubscribe(uuid: string, actionName: string): void {
        this.subs.delete(this.key(uuid, actionName));
    }

    /**
     * The scheduled world time a `(uuid, actionName)` subscription will fire at, or
     * `undefined` when there is no such subscription (or it carries no `fireAt`).
     * Answers on any client for documents that client can see.
     *
     * @param uuid - The subscribed document's UUID.
     * @param actionName - The subscription actionName.
     * @returns The absolute world-time `fireAt`, or `undefined`.
     */
    nextFireTime(uuid: string, actionName: string): number | undefined {
        return this.subs.get(this.key(uuid, actionName))?.fireAt;
    }

    /**
     * Seconds from the current world time until a `(uuid, actionName)` subscription
     * fires: positive for the future, negative for the past, `0` for now.
     * `undefined` when the subscription is absent or has no `fireAt`.
     *
     * @param uuid - The subscribed document's UUID.
     * @param actionName - The subscription actionName.
     * @returns Signed seconds until fire, or `undefined`.
     */
    timeUntil(uuid: string, actionName: string): number | undefined {
        const at = this.nextFireTime(uuid, actionName);
        return at === undefined ? undefined : at - fvttWorldTime();
    }

    /**
     * Whether a `(uuid, actionName)` subscription is currently registered.
     *
     * @param uuid - The subscribed document's UUID.
     * @param actionName - The subscription actionName.
     * @returns True when a subscription exists for the pair.
     */
    isScheduled(uuid: string, actionName: string): boolean {
        return this.subs.has(this.key(uuid, actionName));
    }

    /**
     * Fire a trigger. Dispatches each matching subscription once, from a
     * snapshot taken at the start of the call. Active-GM only.
     *
     * For `updateWorldTime`, only *due* subscriptions (`fireAt` undefined or
     * `<= worldTime`) match, and they dispatch in ascending `fireAt` order. For
     * all other triggers, every matching subscription dispatches once in
     * insertion order. Subscriptions added by a handler mid-dispatch are not
     * re-fired within this call.
     *
     * @param ctx - The trigger context describing the event being fired.
     */
    async fire(ctx: SohlTriggerContext): Promise<void> {
        if (!fvttIsActiveGM()) return;

        const depth = (this.depthByTrigger.get(ctx.name) ?? 0) + 1;
        if (depth > MAX_TRIGGER_DEPTH) {
            console.error(
                `SoHL | Reentrant fire("${ctx.name}") exceeded depth ${MAX_TRIGGER_DEPTH}; aborting to prevent infinite loop.`,
            );
            return;
        }
        this.depthByTrigger.set(ctx.name, depth);

        try {
            const isWorldTime = ctx.name === "updateWorldTime";
            const worldTime =
                isWorldTime ?
                    (ctx as { worldTime: number }).worldTime
                :   undefined;

            // Snapshot matching subscriptions before dispatching. No cascade:
            // anything a handler adds is seen only by the next fire() call.
            const matching: SohlSubscription[] = [];
            for (const sub of this.subs.values()) {
                if (sub.triggerName !== ctx.name) continue;
                if (
                    isWorldTime &&
                    sub.fireAt !== undefined &&
                    sub.fireAt > (worldTime as number)
                ) {
                    continue;
                }
                matching.push(sub);
            }
            if (isWorldTime) {
                matching.sort(
                    (a, b) =>
                        (a.fireAt ?? Number.POSITIVE_INFINITY) -
                        (b.fireAt ?? Number.POSITIVE_INFINITY),
                );
            }

            for (const sub of matching) {
                if (sub.predicate) {
                    let pass = false;
                    try {
                        pass = !!sub.predicate.evaluate({
                            ...(ctx as unknown as Record<string, unknown>),
                            // The subscription's own document, so a predicate can
                            // compare the trigger to itself (e.g. "my own turn").
                            subscriberUuid: sub.uuid,
                        });
                    } catch (err) {
                        console.error(
                            `SoHL | Predicate threw for subscription "${sub.actionName}" on ${sub.uuid}:`,
                            err,
                        );
                        continue;
                    }
                    if (!pass) continue;
                }
                // Scene gate (issue #590): a scene-bound subscription is offered
                // only while its scene is the active scene. When its scene is
                // inactive, skip it **without consuming** — it is neither
                // dispatched nor deleted (the one-shot deletion is below), so it
                // stays armed and due and surfaces on the first fire once its
                // scene becomes active (see the `updateScene` flush hook).
                if (sub.sceneUuid && fvttActiveSceneUuid() !== sub.sceneUuid) {
                    continue;
                }
                if (sub.oneShot)
                    this.subs.delete(this.key(sub.uuid, sub.actionName));
                await this.dispatchOne(sub, ctx);
            }
        } finally {
            if (depth <= 1) this.depthByTrigger.delete(ctx.name);
            else this.depthByTrigger.set(ctx.name, depth - 1);
        }
    }

    /**
     * Dispatch a matched subscription by **offering** its action (consent, issue
     * #579) — delegating to {@link offer}. Time-scheduled reminders dedupe by
     * `(uuid, actionName, fireAt)` so the same due occurrence is offered once,
     * not on every world-time advance while it sits unperformed; a non-time
     * (event-driven) trigger offers on every fire. The subscription's `payload`
     * is folded into the offered context so it is revived as the action's scope.
     *
     * @param sub - The subscription to offer.
     * @param ctx - The trigger context, carried into the button's scope.
     */
    private async dispatchOne(
        sub: SohlSubscription,
        ctx: SohlTriggerContext,
    ): Promise<void> {
        // Only time-scheduled reminders dedupe; an event-driven trigger (combat,
        // a region enter) is a distinct occurrence each fire and offers again.
        const dedupeAt =
            sub.triggerName === "updateWorldTime" ?
                (sub.fireAt ?? 0)
            :   undefined;
        await this.offer(
            sub.uuid,
            sub.actionName,
            { ...ctx, payload: sub.payload },
            { dedupeAt },
        );
    }

    /**
     * Resolve `uuid` and **offer** `actionName` on its logic — post an
     * owner-gated `[Perform]` reminder card rather than performing the action.
     * The single consent primitive (issue #579): the queue *reminds*; the human
     * *performs*. The card's button is addressed to `uuid` (an item, actor, or
     * any document with a `logic.speaker`), so the owner's click runs the *same*
     * action on that document's logic. Errors are logged and swallowed so one
     * failure cannot abort a batch.
     *
     * Reused by `dispatchOne` (time/combat subscriptions) and by the
     * scene-region bridge (issue #593), which offers a region-authored action to
     * the entering token's actor.
     *
     * @param uuid - The document whose logic runs the action on `[Perform]`.
     * @param actionName - The action shortcode to offer.
     * @param ctx - The trigger context revived as the action's scope on click.
     *   Its `payload.visibility === "gm"` whispers the reminder to the GM.
     * @param options - Offer options.
     * @param options.dedupeAt - Offers a given `(uuid, actionName, dedupeAt)`
     *   occurrence once (time-scheduled reminders); omit to offer every call.
     */
    async offer(
        uuid: string,
        actionName: string,
        ctx: SohlTriggerContext,
        options?: { dedupeAt?: number },
    ): Promise<void> {
        try {
            const doc = await fvttResolveUuidAsync(uuid);
            const logic = (doc as { logic?: any } | null)?.logic;
            const speaker = logic?.speaker;
            if (!speaker || typeof speaker.toChat !== "function") {
                console.warn(
                    `SoHL | Cannot post a reminder for "${actionName}" on ${uuid} (no speaker).`,
                );
                return;
            }
            if (options?.dedupeAt !== undefined) {
                const key = this.key(uuid, actionName);
                if (this.offered.get(key) === options.dedupeAt) return;
                this.offered.set(key, options.dedupeAt);
            }

            const effectLabel = sohl.i18n.localize(
                `SOHL.Reminder.effect.${actionName}`,
            );
            const actorName = (speaker as { name?: string }).name ?? "";
            // A `visibility: "gm"` payload posts the reminder as a GM whisper
            // (e.g. a world-host bandit check — no metagame leak to players);
            // otherwise it is public and gated to the document's owner.
            const visibility = (ctx.payload as { visibility?: string })
                ?.visibility;
            const chatOptions =
                visibility === "gm" ? { rollMode: "gmroll" } : undefined;
            await speaker.toChat(
                toFilePath(REMINDER_CARD_TEMPLATE),
                {
                    effectLabel,
                    actorName,
                    body: sohl.i18n.localize("SOHL.Reminder.body"),
                    performLabel: sohl.i18n.localize("SOHL.Reminder.perform"),
                    actionName,
                    handlerUuid: uuid,
                    // The trigger context (with any payload) — revived as the
                    // action's scope when the owner clicks [Perform].
                    scopeData: defaultToJSON(ctx),
                },
                chatOptions,
            );
        } catch (err) {
            console.error(
                `SoHL | Error offering "${actionName}" on trigger "${ctx.name}" for ${uuid}:`,
                err,
            );
        }
    }

    /** Number of subscriptions currently in the queue. */
    get size(): number {
        return this.subs.size;
    }

    /**
     * Sorted snapshot of subscriptions for debugging. Sorted by
     * `(triggerName, fireAt, actionName)` for stable inspection.
     *
     * @returns A copied, stably-sorted array of the current subscriptions.
     */
    debug(): SohlSubscription[] {
        return Array.from(this.subs.values())
            .map((s) => ({ ...s }))
            .sort((a, b) => {
                if (a.triggerName !== b.triggerName)
                    return a.triggerName.localeCompare(b.triggerName);
                const af = a.fireAt ?? Number.POSITIVE_INFINITY;
                const bf = b.fireAt ?? Number.POSITIVE_INFINITY;
                if (af !== bf) return af - bf;
                return a.actionName.localeCompare(b.actionName);
            });
    }

    /** Remove all subscriptions. */
    clear(): void {
        this.subs.clear();
    }
}
