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
 * The seeded-roll lifecycle for a **driven** tour — the Foundry-free half of the
 * `SohlTour` deterministic-RNG capability (#624).
 *
 * A driven tour (the Automated Combat tour) is railroaded: it performs a fixed
 * sequence of actions whose scripted rolls must come out the same every run. To
 * make that so it seeds the process-wide {@link sohl.entity.random.Rng}
 * ({@link sohl.random}) at tour start — but a seeded shared stream is *dangerous*
 * left in place: it would make the user's real game return identical dice until
 * reload. So the seed comes as a **lease** whose {@link RngLease.restore | restore}
 * puts the exact pre-tour stream position back, and which the tour is obliged to
 * invoke on *every* exit path.
 *
 * This module owns only the pure seed/snapshot/restore mechanics against an
 * {@link sohl.entity.random.Rng}; the Foundry-coupled `SohlTour` owns *when*
 * restore fires (completion, abort, Escape, navigation, mid-step error). Keeping
 * the mechanics here lets the reproducibility and the fire-once guarantee be
 * unit-tested without a running Foundry (`tests/domain/tour/TourRng.test.ts`).
 */

import type { Rng } from "@src/entity/random/Rng";

/**
 * A one-shot handle over a seeded {@link sohl.entity.random.Rng} stream. Created
 * by {@link seedRngForTour}, which has already snapshotted the pre-seed state and
 * applied the seed; the sole obligation is to call {@link restore} — from *any*
 * tour-exit path — to return the stream to normal. {@link restore} is
 * **fire-once and idempotent**, so wiring it into several redundant exit hooks
 * (the safety net the tour needs) is safe: the second and later calls no-op.
 */
export interface RngLease {
    /** Whether {@link restore} has already run (the stream is back to normal). */
    readonly restored: boolean;

    /**
     * Restore the generator to the exact state it held before the tour seeded it,
     * so the game continues the stream it would have produced had the tour never
     * run. Safe to call any number of times from any exit path — only the first
     * call has an effect.
     */
    restore(): void;
}

/**
 * Seed an {@link sohl.entity.random.Rng} for the duration of a driven tour and
 * return the {@link RngLease} that restores it.
 *
 * The pre-seed state is snapshotted **before** the seed is applied, so
 * {@link RngLease.restore} rewinds to the precise stream position the game was at
 * — not a fresh entropy seed — leaving no observable perturbation once the tour
 * ends. This is deliberately a *lease*: the restore closure is created at the same
 * moment as the seed so the caller can register it as a `finally`-style hook that
 * cannot be skipped.
 *
 * @param rng - The generator to seed (typically the {@link sohl.random} singleton).
 * @param seed - The seed applied for the tour — a string, a number, or state words.
 * @returns A fire-once {@link RngLease} whose `restore()` returns `rng` to normal.
 */
export function seedRngForTour(
    rng: Rng,
    seed: string | number | number[],
): RngLease {
    const snapshot = rng.getState();
    rng.seed(seed);
    let done = false;
    return {
        get restored(): boolean {
            return done;
        },
        restore(): void {
            if (done) return;
            done = true;
            rng.setState(snapshot);
        },
    };
}
