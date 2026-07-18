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

/**
 * Foundry-free scheduling primitives shared by timed document processes
 * (injury healing / blood-loss, affliction phase progression).
 *
 * These are the single definition of "when does the next occurrence fire" and
 * "which occurrences elapsed during a time advance". A consumer's `finalize()`
 * arms the queue with {@link deriveNext}, and its `handleSohlEvent` catches up
 * over {@link elapsedCheckpoints}.
 *
 * @module scheduling
 */

/**
 * The world-time of the next occurrence of a recurring process.
 *
 * The next occurrence is derived from the persisted **anchor** (the world-time
 * of the last applied occurrence, or the onset seed) plus the effective
 * interval — never from the live clock, so it is deterministic and every client
 * reconstructs the same value.
 *
 * @param anchor - World-time of the last applied occurrence (or the onset seed).
 * @param interval - Effective seconds between occurrences.
 * @returns The next occurrence's world-time.
 */
export function deriveNext(anchor: number, interval: number): number {
    return anchor + interval;
}

/**
 * The world-times of every occurrence that elapsed in the half-open interval
 * `(lastAnchor, worldTime]`, spaced by `interval`, in chronological order.
 *
 * This is the catch-up set a handler resolves when world time advances (each in
 * sequence, since occurrences are stateful). Returns an empty array when nothing
 * is due, or when `interval <= 0` — a guard against a non-advancing loop from
 * degenerate data.
 *
 * @param lastAnchor - World-time of the last applied occurrence.
 * @param worldTime - The new world-time being advanced to.
 * @param interval - Effective seconds between occurrences.
 * @returns Ascending world-times of the elapsed occurrences (possibly empty).
 */
export function elapsedCheckpoints(
    lastAnchor: number,
    worldTime: number,
    interval: number,
): number[] {
    const out: number[] = [];
    if (!(interval > 0)) return out;
    for (let t = lastAnchor + interval; t <= worldTime; t += interval) {
        out.push(t);
    }
    return out;
}
