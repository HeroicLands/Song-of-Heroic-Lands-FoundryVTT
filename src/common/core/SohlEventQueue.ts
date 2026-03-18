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
    isActiveGM as fvttIsActiveGM,
    resolveUuidAsync as fvttResolveUuidAsync,
} from "@src/common/core/foundry-helpers";

/**
 * A single timed event in the queue, uniquely identified by
 * {@link uuid} + {@link kind}.
 */
export interface SohlTimedEvent {
    /** UUID of the document this event belongs to. */
    uuid: string;
    /**
     * Event kind identifier, scoped to the document.
     *
     * Examples: `"healingTest"`, `"courseTest"`, `"bleedingCheck"`.
     * A document may have at most one pending event of each kind.
     */
    kind: string;
    /** Scheduled trigger time in world seconds (same units as `game.time.worldTime`). */
    time: number;
    /** Optional plain-object context passed to the handler when the event fires. */
    payload?: Record<string, unknown>;
}

/**
 * Lightweight, in-memory timed event queue for SoHL.
 *
 * Accessible at runtime as `sohl.events`.
 *
 * ## Overview
 *
 * The event queue lets documents schedule future processing based on in-world
 * time. When world time advances (clock, combat, manual adjustment), all due
 * events are dispatched to their owning documents. The queue is a **dispatch
 * engine** — it contains no game rules. Documents implement their own logic
 * in {@link SohlItem.handleSohlEvent} or {@link SohlActor.handleSohlEvent}.
 *
 * ## Identity and Overwrite Semantics
 *
 * Each event is uniquely identified by `uuid + kind`. Registering a new
 * event with the same identity **overwrites** the previous one (time and
 * payload are replaced). This means each document can have at most one
 * pending event of a given kind, and calling `registerEvent` repeatedly
 * with unchanged values is harmless.
 *
 * ## Processing Model
 *
 * Only the **primary GM** processes events (checked via
 * `game.user.isActiveGM`). All clients maintain the queue in memory
 * (populated during document preparation), so GM handoff is seamless —
 * if the primary GM disconnects, the promoted GM already has the full queue.
 *
 * When `processDueEvents(worldTime)` is called, the queue repeatedly
 * finds and dispatches the earliest event whose time has passed. This
 * naturally handles large time jumps: if world time advances by a month
 * and an injury schedules healing checks every 5 days, each check fires
 * in sequence, and each handler may schedule the next one.
 *
 * ## Loop Protection
 *
 * During event processing, any call to `registerEvent` with a time at or
 * before the time of the event currently being processed is discarded with
 * a warning. This prevents infinite loops where a handler re-registers
 * itself at the same time.
 *
 * ## Typical Usage
 *
 * **Registering events** — typically in a Logic class's `finalize()` method:
 *
 * ```typescript
 * // Schedule the next healing check for this injury
 * const healingInterval = game.settings.get("sohl", "healingSeconds");
 * sohl.events.registerEvent(
 *     this.item.uuid,
 *     "healingTest",
 *     game.time.worldTime + healingInterval,
 *     { injuryLevel: this.data.injuryLevelBase },
 * );
 * ```
 *
 * **Handling events** — override `handleSohlEvent` on the document class:
 *
 * ```typescript
 * // In a custom SohlItem subclass or via the Logic class
 * async handleSohlEvent(kind: string, time: number, payload?: Record<string, unknown>): Promise<void> {
 *     switch (kind) {
 *         case "healingTest":
 *             // Perform healing logic, update the document
 *             await this.update({ "system.injuryLevelBase": newLevel });
 *             // The update triggers re-preparation, which calls finalize(),
 *             // which registers the next healing event automatically.
 *             break;
 *         default:
 *             console.warn(`Unhandled event kind: ${kind}`);
 *     }
 * }
 * ```
 *
 * **Cancelling events** — when the triggering condition no longer applies:
 *
 * ```typescript
 * // Injury was fully healed — no more healing checks needed
 * sohl.events.unregisterEvent(this.item.uuid, "healingTest");
 * ```
 */
export class SohlEventQueue {
    private _events: Map<string, SohlTimedEvent> = new Map();

    /**
     * The time of the event currently being processed, or `null` if idle.
     * Used internally for {@link registerEvent | loop protection}.
     */
    private _processingTime: number | null = null;

    /** Compute the unique key for an event. */
    private _key(uuid: string, kind: string): string {
        return `${uuid}::${kind}`;
    }

    /**
     * Register or overwrite a timed event.
     *
     * If an event with the same `uuid + kind` already exists, its time and
     * payload are silently replaced. This is the expected pattern — documents
     * re-register their events on every preparation cycle, and only the most
     * recent registration matters.
     *
     * **Loop protection:** If called during event processing (inside a
     * `handleSohlEvent` callback) with a `time` at or before the time of
     * the event currently being dispatched, the registration is discarded
     * and a warning is logged. This prevents infinite re-processing loops.
     *
     * @param uuid - UUID of the owning document
     * @param kind - Event kind identifier (unique per document)
     * @param time - Trigger time in world seconds
     * @param payload - Optional context data passed to the handler
     */
    registerEvent(
        uuid: string,
        kind: string,
        time: number,
        payload?: Record<string, unknown>,
    ): void {
        if (this._processingTime !== null && time <= this._processingTime) {
            console.warn(
                `SoHL | Event "${kind}" for ${uuid} registered with time ${time} <= current processing time ${this._processingTime}; discarding to prevent infinite loop.`,
            );
            return;
        }
        this._events.set(this._key(uuid, kind), {
            uuid,
            kind,
            time,
            payload,
        });
    }

    /**
     * Remove a timed event. Safe to call even if no such event exists.
     *
     * @param uuid - UUID of the owning document
     * @param kind - Event kind identifier
     */
    unregisterEvent(uuid: string, kind: string): void {
        this._events.delete(this._key(uuid, kind));
    }

    /**
     * Process all events whose scheduled time has arrived.
     *
     * Called automatically by the `updateWorldTime` hook. Should not
     * normally be called directly.
     *
     * The processing loop:
     * 1. Find the earliest queued event.
     * 2. If its time is after `worldTime`, stop.
     * 3. Remove the event from the queue.
     * 4. Resolve the document by UUID. If it no longer exists, skip silently.
     * 5. Call `doc.handleSohlEvent(kind, time, payload)`.
     * 6. Repeat from step 1 (handlers may have registered new due events).
     *
     * Only executes on the primary GM client (`game.user.isActiveGM`).
     *
     * @param worldTime - The current world time in seconds
     */
    async processDueEvents(worldTime: number): Promise<void> {
        // Defense-in-depth: only the primary GM processes events
        if (!fvttIsActiveGM()) return;

        while (true) {
            // Find the earliest event
            let earliest: SohlTimedEvent | undefined;
            for (const event of this._events.values()) {
                if (!earliest || event.time < earliest.time) {
                    earliest = event;
                }
            }

            // No events, or earliest is in the future
            if (!earliest || earliest.time > worldTime) break;

            // Remove the event before dispatching (prevents re-processing)
            this._events.delete(this._key(earliest.uuid, earliest.kind));

            // Set processing time for loop protection
            this._processingTime = earliest.time;

            try {
                // Resolve the document
                const doc = await fvttResolveUuidAsync(earliest.uuid);
                if (!doc) continue; // Document deleted — discard silently

                // Dispatch to the document
                if (typeof doc.handleSohlEvent !== "function") {
                    console.warn(
                        `SoHL | Document ${earliest.uuid} does not implement handleSohlEvent; discarding "${earliest.kind}" event.`,
                    );
                    continue;
                }

                await doc.handleSohlEvent(
                    earliest.kind,
                    earliest.time,
                    earliest.payload,
                );
            } catch (err) {
                console.error(
                    `SoHL | Error processing event "${earliest.kind}" for ${earliest.uuid}:`,
                    err,
                );
            }
        }

        this._processingTime = null;
    }

    /** Number of events currently in the queue. */
    get size(): number {
        return this._events.size;
    }

    /**
     * The scheduled time of the earliest queued event, or `undefined`
     * if the queue is empty.
     */
    get nextEventTime(): number | undefined {
        let min: number | undefined;
        for (const event of this._events.values()) {
            if (min === undefined || event.time < min) {
                min = event.time;
            }
        }
        return min;
    }

    /** Remove all events from the queue. */
    clear(): void {
        this._events.clear();
    }

    /**
     * Return a sorted snapshot of all queued events, ordered by time
     * (earliest first). Useful for debugging and inspection.
     *
     * @returns A new array of event copies, sorted by ascending time
     */
    debug(): SohlTimedEvent[] {
        return Array.from(this._events.values()).sort(
            (a, b) => a.time - b.time,
        );
    }
}
