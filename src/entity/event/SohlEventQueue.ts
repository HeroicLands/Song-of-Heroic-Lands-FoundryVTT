/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
} from "@src/core/FoundryHelpers";
import type { SohlTriggerContext } from "@src/entity/event/event-trigger";
import type { SafeExpression } from "@src/entity/expr/SafeExpression";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";

/**
 * A single registered subscription, uniquely identified by `(uuid, kind)`.
 *
 * @see {@link SohlEventQueue}
 */
export interface SohlSubscription {
    /** UUID of the document this subscription belongs to. */
    uuid: string;
    /**
     * Subscription kind, scoped to {@link uuid}. A document may have at
     * most one subscription per kind; re-subscribing overwrites.
     *
     * On dispatch, `kind` is the **action shortcode** executed on the owning
     * document's logic (see {@link SohlEventQueue.fire}) — so an event can reuse
     * the same action a user could invoke manually.
     */
    kind: string;
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
     * context (`ctx` supplies the bindings — `name`, `worldTime`, `payload`, …).
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
 * dispatch by **executing the action** named by the subscription's `kind` on the
 * owning document's logic — the trigger context (with the subscription's
 * `payload`) becomes the action's scope. An event therefore reuses the very
 * same action a user could invoke manually.
 *
 * Time scheduling is one trigger among many: a `scheduleAt(uuid, kind,
 * fireAt, payload)` call creates a one-shot subscription on
 * `updateWorldTime` that fires when world time reaches `fireAt`.
 *
 * ## Identity and overwrite semantics
 *
 * Each subscription is uniquely identified by `(uuid, kind)`. Re-subscribing
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
 * {@link MAX_TRIGGER_DEPTH}; beyond that the call aborts with an error. This
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
     * Build the composite map key for a subscription.
     *
     * @param uuid - The subscribed document's UUID.
     * @param kind - The subscription kind.
     * @returns The `uuid::kind` map key.
     */
    private key(uuid: string, kind: string): string {
        return `${uuid}::${kind}`;
    }

    /**
     * Register or overwrite a subscription. Runs on **all** clients (the queue is
     * a projection of document state); only {@link fire} is GM-gated.
     *
     * If a subscription with the same `(uuid, kind)` already exists, its fields
     * are replaced.
     *
     * @param sub - The subscription to register or overwrite.
     */
    subscribe(sub: SohlSubscription): void {
        this.subs.set(this.key(sub.uuid, sub.kind), { ...sub });
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
     * @param kind - The subscription kind passed to the handler.
     * @param fireAt - The world time at or after which to fire.
     * @param payload - Optional payload forwarded to the handler.
     */
    scheduleAt(
        uuid: string,
        kind: string,
        fireAt: number,
        payload?: Record<string, unknown>,
    ): void {
        this.subscribe({
            uuid,
            kind,
            triggerName: "updateWorldTime",
            fireAt,
            payload,
            oneShot: true,
        });
    }

    /**
     * Remove a subscription. Runs on all clients; safe when absent.
     *
     * @param uuid - The subscribed document's UUID.
     * @param kind - The subscription kind to remove.
     */
    unsubscribe(uuid: string, kind: string): void {
        this.subs.delete(this.key(uuid, kind));
    }

    /**
     * The scheduled world time a `(uuid, kind)` subscription will fire at, or
     * `undefined` when there is no such subscription (or it carries no `fireAt`).
     * Answers on any client for documents that client can see.
     *
     * @param uuid - The subscribed document's UUID.
     * @param kind - The subscription kind.
     * @returns The absolute world-time `fireAt`, or `undefined`.
     */
    nextFireTime(uuid: string, kind: string): number | undefined {
        return this.subs.get(this.key(uuid, kind))?.fireAt;
    }

    /**
     * Seconds from the current world time until a `(uuid, kind)` subscription
     * fires: positive for the future, negative for the past, `0` for now.
     * `undefined` when the subscription is absent or has no `fireAt`.
     *
     * @param uuid - The subscribed document's UUID.
     * @param kind - The subscription kind.
     * @returns Signed seconds until fire, or `undefined`.
     */
    timeUntil(uuid: string, kind: string): number | undefined {
        const at = this.nextFireTime(uuid, kind);
        return at === undefined ? undefined : at - fvttWorldTime();
    }

    /**
     * Whether a `(uuid, kind)` subscription is currently registered.
     *
     * @param uuid - The subscribed document's UUID.
     * @param kind - The subscription kind.
     * @returns True when a subscription exists for the pair.
     */
    isScheduled(uuid: string, kind: string): boolean {
        return this.subs.has(this.key(uuid, kind));
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
            const worldTime = isWorldTime
                ? (ctx as { worldTime: number }).worldTime
                : undefined;

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
                        pass = !!sub.predicate.evaluate(
                            ctx as unknown as Record<string, unknown>,
                        );
                    } catch (err) {
                        console.error(
                            `SoHL | Predicate threw for subscription "${sub.kind}" on ${sub.uuid}:`,
                            err,
                        );
                        continue;
                    }
                    if (!pass) continue;
                }
                if (sub.oneShot) this.subs.delete(this.key(sub.uuid, sub.kind));
                await this.dispatchOne(sub, ctx);
            }
        } finally {
            if (depth <= 1) this.depthByTrigger.delete(ctx.name);
            else this.depthByTrigger.set(ctx.name, depth - 1);
        }
    }

    /**
     * Resolve a subscription's document and **execute the action** named by
     * `sub.kind` on its logic, logging and swallowing any errors so one failure
     * cannot abort the batch.
     *
     * The trigger context (with `sub.payload` attached as `ctx.payload`) becomes
     * the action context's `scope`, and `sub.kind` its `type` — so an event
     * dispatches through the same action a user could invoke manually.
     *
     * @param sub - The subscription to dispatch.
     * @param ctx - The trigger context, forwarded as the action's scope.
     */
    private async dispatchOne(
        sub: SohlSubscription,
        ctx: SohlTriggerContext,
    ): Promise<void> {
        try {
            const doc = await fvttResolveUuidAsync(sub.uuid);
            const logic = (doc as { logic?: any } | null)?.logic;
            if (!logic || typeof logic.executeAction !== "function") {
                console.warn(
                    `SoHL | Document ${sub.uuid} cannot execute action "${sub.kind}" on trigger "${ctx.name}".`,
                );
                return;
            }
            const speaker = logic.speaker;
            if (!speaker) {
                console.warn(
                    `SoHL | No speaker for ${sub.uuid}; cannot dispatch "${sub.kind}".`,
                );
                return;
            }
            const context = new SohlActionContext({
                speaker,
                type: sub.kind,
                scope: { ...ctx, payload: sub.payload },
            });
            await logic.executeAction(sub.kind, context);
        } catch (err) {
            console.error(
                `SoHL | Error dispatching "${sub.kind}" on trigger "${ctx.name}" for ${sub.uuid}:`,
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
     * `(triggerName, fireAt, kind)` for stable inspection.
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
                return a.kind.localeCompare(b.kind);
            });
    }

    /** Remove all subscriptions. */
    clear(): void {
        this.subs.clear();
    }
}
