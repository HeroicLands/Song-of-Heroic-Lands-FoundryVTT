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
    fvttIsCurrentUserGM,
    fvttResolveUuidAsync,
} from "@src/core/FoundryHelpers";
import type { SohlTriggerContext } from "@src/core/SohlEventTrigger";

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
     * the subscription fires only when `ctx.worldTime >= fireAt`. Also
     * controls dispatch order during a cascading `updateWorldTime` fire,
     * and serves as the reference point for the same-tick loop guard in
     * {@link SohlEventQueue.scheduleAt}.
     */
    fireAt?: number;
    /**
     * Optional predicate. If present, the subscription fires only when
     * the predicate returns truthy for the trigger context. Predicates
     * that throw are caught and logged; the dispatch is skipped but the
     * subscription is preserved.
     */
    predicate?: (ctx: SohlTriggerContext) => boolean;
    /** Optional context data passed through to the document handler. */
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
 * via `registerSohlTrigger`). When a trigger fires, matching
 * subscriptions dispatch to their owning documents via
 * `handleSohlEvent(kind, context, payload)`.
 *
 * Time scheduling is one trigger among many: a `scheduleAt(uuid, kind,
 * fireAt, payload)` call creates a one-shot subscription on
 * `updateWorldTime` that fires when world time reaches `fireAt`.
 *
 * ## Identity and overwrite semantics
 *
 * Each subscription is uniquely identified by `(uuid, kind)`. Re-subscribing
 * with the same identity **overwrites** the previous entry — `triggerName`,
 * `fireAt`, `predicate`, `payload`, and `oneShot` are all replaced. This
 * means documents re-register their subscriptions on every preparation
 * cycle and only the most recent registration matters.
 *
 * ## GM gating
 *
 * - `subscribe` / `unsubscribe`: any GM (active or not).
 * - `fire`: active GM only.
 * - Non-GM clients keep an empty in-memory queue; all writes and dispatches
 *   are no-ops.
 *
 * ## Cascading dispatch on `updateWorldTime`
 *
 * `updateWorldTime` is special because it represents the passage of time.
 * If world time jumps from T0 to T0+60d and an injury subscription at
 * T0+5d schedules its successor at `prevFireAt + 5d`, all 12 intermediate
 * dispatches must complete within the single `fire(...)` call. The
 * algorithm:
 *
 * ```
 * loop {
 *     candidates = subscriptions where
 *         triggerName == "updateWorldTime"
 *         AND not already dispatched in this fire() call
 *         AND (fireAt is undefined OR fireAt <= worldTime)
 *         AND predicate(ctx) is truthy
 *     if candidates is empty: break
 *     next = candidate with smallest fireAt (undefined sorts last)
 *     mark dispatched; remove if oneShot
 *     dispatch handler
 * }
 * ```
 *
 * A handler's `scheduleAt(uuid, kind, fireAt)` during dispatch creates a
 * new subscription that the next loop iteration sees. If `fireAt` is at
 * or before `worldTime`, it fires in the same call; if later, it waits
 * for the next `updateWorldTime` invocation.
 *
 * Non-time triggers dispatch each matching subscription **once** per
 * `fire(...)` call. Subscriptions added by handlers during a non-time
 * dispatch do not fire until the next `fire(...)` invocation.
 *
 * ## Loop protection
 *
 * Two layers:
 *
 * 1. **Same-tick guard:** during `updateWorldTime` dispatch the queue
 *    tracks `_processingFireAt`. A `scheduleAt(uuid, kind, fireAt)` call
 *    with `fireAt <= _processingFireAt` is discarded with a warning —
 *    handlers re-arming at the same scheduled time are the canonical
 *    infinite-loop case. `fireAt > _processingFireAt` (cascading) is
 *    allowed.
 * 2. **Depth counter:** re-entrant `fire(...)` for the same trigger name
 *    is capped at {@link MAX_TRIGGER_DEPTH}. Beyond that, the call is
 *    aborted with an error.
 *
 * ## Predicate error policy
 *
 * Predicates that throw are caught and logged; that dispatch is skipped;
 * the subscription is not removed. Predicates may legitimately fail on
 * stale data (e.g., resolving an effect that was just deleted) and one
 * bad tick should not permanently disarm a healing check.
 *
 * ## Typical usage
 *
 * ```typescript
 * // Schedule the next healing check
 * sohl.events.scheduleAt(
 *     injury.uuid,
 *     "healingTest",
 *     game.time.worldTime + healingInterval,
 *     { level: injury.system.levelBase },
 * );
 *
 * // Subscribe to combat start
 * sohl.events.subscribe({
 *     uuid: actor.uuid,
 *     kind: "berserkerCheck",
 *     triggerName: "combatStart",
 * });
 *
 * // In the document subclass:
 * async handleSohlEvent(kind, context, payload) {
 *     switch (kind) {
 *         case "healingTest":
 *             await this.update({ "system.levelBase": newLevel });
 *             // re-preparation will re-arm via scheduleAt in finalize()
 *             break;
 *     }
 * }
 * ```
 */
export class SohlEventQueue {
    private _subs: Map<string, SohlSubscription> = new Map();

    /** During an updateWorldTime dispatch, the fireAt of the current event. */
    private _processingFireAt: number | null = null;

    /** Per-trigger reentrancy depth for the loop-protection backstop. */
    private _depthByTrigger: Map<string, number> = new Map();

    private _key(uuid: string, kind: string): string {
        return `${uuid}::${kind}`;
    }

    /**
     * Register or overwrite a subscription. No-op on non-GM clients.
     *
     * If a subscription with the same `(uuid, kind)` already exists, its
     * fields are silently replaced. Loop protection: if called during a
     * `updateWorldTime` dispatch with a `fireAt` at or before the
     * currently-dispatching event's fireAt, the call is discarded and a
     * warning is logged.
     */
    subscribe(sub: SohlSubscription): void {
        if (!fvttIsCurrentUserGM()) return;
        if (
            this._processingFireAt !== null &&
            sub.fireAt !== undefined &&
            sub.fireAt <= this._processingFireAt
        ) {
            console.warn(
                `SoHL | Subscription "${sub.kind}" for ${sub.uuid} subscribed with fireAt ${sub.fireAt} <= current processing fireAt ${this._processingFireAt}; discarding to prevent infinite loop.`,
            );
            return;
        }
        this._subs.set(this._key(sub.uuid, sub.kind), { ...sub });
    }

    /**
     * Convenience: schedule a one-shot dispatch when world time reaches
     * `fireAt`. Equivalent to subscribing to `updateWorldTime` with
     * `oneShot: true` and a `>=` predicate.
     *
     * The handler is responsible for calling `scheduleAt` again if a
     * recurring schedule is desired.
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

    /** Remove a subscription. No-op on non-GM and when absent. */
    unsubscribe(uuid: string, kind: string): void {
        if (!fvttIsCurrentUserGM()) return;
        this._subs.delete(this._key(uuid, kind));
    }

    /**
     * Fire a trigger. Walks matching subscriptions and dispatches them.
     * Active-GM only.
     *
     * For `updateWorldTime`, uses a cascading loop so that handlers may
     * schedule successors that fire within the same call. For all other
     * triggers, dispatches each matching subscription once.
     */
    async fire(ctx: SohlTriggerContext): Promise<void> {
        if (!fvttIsActiveGM()) return;

        const depth = (this._depthByTrigger.get(ctx.name) ?? 0) + 1;
        if (depth > MAX_TRIGGER_DEPTH) {
            console.error(
                `SoHL | Reentrant fire("${ctx.name}") exceeded depth ${MAX_TRIGGER_DEPTH}; aborting to prevent infinite loop.`,
            );
            return;
        }
        this._depthByTrigger.set(ctx.name, depth);

        try {
            if (ctx.name === "updateWorldTime") {
                await this._fireWorldTime(ctx as any);
            } else {
                await this._fireDiscrete(ctx);
            }
        } finally {
            if (depth <= 1) this._depthByTrigger.delete(ctx.name);
            else this._depthByTrigger.set(ctx.name, depth - 1);
        }
    }

    private async _fireWorldTime(ctx: {
        name: "updateWorldTime";
        worldTime: number;
        dt: number;
        options?: object;
        userId?: string;
    }): Promise<void> {
        // Track dispatched by reference so that a oneShot subscription
        // removing itself and the handler re-subscribing with the same
        // (uuid, kind) yields a fresh object that can dispatch again in
        // the same cascade — that's exactly how recurring schedules work.
        const dispatched = new WeakSet<SohlSubscription>();
        const worldTime = ctx.worldTime;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let next: SohlSubscription | undefined;
            let nextKey: string | undefined;
            let nextFireAt = Number.POSITIVE_INFINITY;

            for (const [key, sub] of this._subs) {
                if (sub.triggerName !== "updateWorldTime") continue;
                if (dispatched.has(sub)) continue;
                if (sub.fireAt !== undefined && sub.fireAt > worldTime)
                    continue;
                if (sub.predicate) {
                    let pass = false;
                    try {
                        pass = !!sub.predicate(ctx);
                    } catch (err) {
                        console.error(
                            `SoHL | Predicate threw for subscription "${sub.kind}" on ${sub.uuid}:`,
                            err,
                        );
                        dispatched.add(sub);
                        continue;
                    }
                    if (!pass) {
                        dispatched.add(sub);
                        continue;
                    }
                }

                const at = sub.fireAt ?? Number.POSITIVE_INFINITY;
                if (at < nextFireAt) {
                    nextFireAt = at;
                    next = sub;
                    nextKey = key;
                }
            }

            if (!next || !nextKey) break;

            dispatched.add(next);
            if (next.oneShot) this._subs.delete(nextKey);

            this._processingFireAt = next.fireAt ?? null;
            try {
                await this._dispatchOne(next, ctx);
            } finally {
                this._processingFireAt = null;
            }
        }
    }

    private async _fireDiscrete(ctx: SohlTriggerContext): Promise<void> {
        // Snapshot matching subscriptions at start; non-time triggers do
        // not cascade. Subscriptions added mid-dispatch wait for the next
        // fire(...) invocation.
        const snapshot: SohlSubscription[] = [];
        for (const sub of this._subs.values()) {
            if (sub.triggerName === ctx.name) snapshot.push(sub);
        }

        for (const sub of snapshot) {
            if (sub.predicate) {
                let pass = false;
                try {
                    pass = !!sub.predicate(ctx);
                } catch (err) {
                    console.error(
                        `SoHL | Predicate threw for subscription "${sub.kind}" on ${sub.uuid}:`,
                        err,
                    );
                    continue;
                }
                if (!pass) continue;
            }
            if (sub.oneShot) this._subs.delete(this._key(sub.uuid, sub.kind));
            await this._dispatchOne(sub, ctx);
        }
    }

    private async _dispatchOne(
        sub: SohlSubscription,
        ctx: SohlTriggerContext,
    ): Promise<void> {
        try {
            const doc = await fvttResolveUuidAsync(sub.uuid);
            if (!doc) return;
            if (typeof doc.handleSohlEvent !== "function") {
                console.warn(
                    `SoHL | Document ${sub.uuid} does not implement handleSohlEvent; discarding "${sub.kind}" on trigger "${ctx.name}".`,
                );
                return;
            }
            await doc.handleSohlEvent(sub.kind, ctx, sub.payload);
        } catch (err) {
            console.error(
                `SoHL | Error dispatching "${sub.kind}" on trigger "${ctx.name}" for ${sub.uuid}:`,
                err,
            );
        }
    }

    /** Number of subscriptions currently in the queue. */
    get size(): number {
        return this._subs.size;
    }

    /**
     * Sorted snapshot of subscriptions for debugging. Sorted by
     * `(triggerName, fireAt, kind)` for stable inspection.
     */
    debug(): SohlSubscription[] {
        return Array.from(this._subs.values())
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
        this._subs.clear();
    }
}
