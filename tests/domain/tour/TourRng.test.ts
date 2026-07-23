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

import { describe, it, expect } from "vitest";
import { seedRngForTour } from "@src/entity/tour/TourRng";
import { createRng } from "@src/entity/random/createRng";

/** Draw `n` die(6) values from an Rng into an array. */
function draw(rng: ReturnType<typeof createRng>, n: number): number[] {
    return Array.from({ length: n }, () => rng.die(6));
}

describe("seedRngForTour — the driven-tour seeded-RNG lease", () => {
    it("makes rolls reproducible across runs for the same seed", () => {
        const a = createRng();
        const b = createRng();
        // Diverge the two streams first, so reproducibility is due to the seed,
        // not to two fresh generators happening to start alike.
        draw(a, 3);
        draw(b, 7);

        seedRngForTour(a, "combat-tour");
        seedRngForTour(b, "combat-tour");
        expect(draw(a, 10)).toEqual(draw(b, 10));
    });

    it("seeds the passed generator in place (the shared stream, not a copy)", () => {
        const rng = createRng();
        const lease = seedRngForTour(rng, "seed-x");

        // A second generator seeded identically predicts what `rng` now yields.
        const predictor = createRng();
        seedRngForTour(predictor, "seed-x");
        expect(rng.die(20)).toBe(predictor.die(20));
        lease.restore();
    });

    it("restore returns the generator to its exact pre-seed stream position", () => {
        const rng = createRng();
        draw(rng, 5); // advance to an arbitrary position

        // What the un-seeded stream WOULD produce next, captured by snapshot.
        const snapshot = rng.getState();
        const expectedContinuation = draw(rng, 6);
        rng.setState(snapshot); // rewind to reuse the same generator instance

        const lease = seedRngForTour(rng, "tour");
        draw(rng, 4); // seeded rolls consumed during the "tour"
        lease.restore();

        // After restore the game continues the exact stream it would have had.
        expect(draw(rng, 6)).toEqual(expectedContinuation);
    });

    it("restore is fire-once and idempotent (redundant exit hooks are safe)", () => {
        const rng = createRng();
        const snapshot = rng.getState();
        // Capture the deterministic un-seeded stream from the snapshot: the first
        // three values are what the game sees right after restore; the next three
        // are what it continues with. Comparing against the real `nextThree` is a
        // deterministic check — unlike a `.not.toEqual(firstThree)`, which would
        // false-fail ~1/216 of the time when the stream coincidentally repeats.
        const firstThree = draw(rng, 3);
        const nextThree = draw(rng, 3);
        rng.setState(snapshot);

        const lease = seedRngForTour(rng, "tour");
        expect(lease.restored).toBe(false);
        draw(rng, 2);
        lease.restore();
        expect(lease.restored).toBe(true);
        // Draw between the redundant restores — a second restore must NOT rewind
        // over these, or it would resurrect the seeded state.
        const afterFirst = draw(rng, 3);
        lease.restore();
        lease.restore();
        // The first restore rewound to the snapshot, so `afterFirst` already IS
        // the un-seeded continuation; the redundant restores changed nothing, so
        // the stream advances to `nextThree` rather than rewinding to `firstThree`.
        expect(afterFirst).toEqual(firstThree);
        expect(draw(rng, 3)).toEqual(nextThree);
    });

    it("simulates the exit-path matrix: any single exit hook restores exactly once", () => {
        // Model each SohlTour exit path as an independent caller of the same
        // lease.restore; the fire-once guarantee means whichever fires (and any
        // redundant others) leaves the RNG back to normal.
        for (const exitPath of [
            "complete",
            "abort",
            "escape",
            "navigate",
            "error",
        ]) {
            const rng = createRng();
            const snapshot = rng.getState();
            const expectedContinuation = draw(rng, 4);
            rng.setState(snapshot);

            const lease = seedRngForTour(rng, `tour-${exitPath}`);
            draw(rng, 5); // scripted tour rolls
            lease.restore(); // the exit path fires the finally-style hook
            lease.restore(); // a redundant belt-and-suspenders hook also fires

            expect(lease.restored, exitPath).toBe(true);
            expect(draw(rng, 4), exitPath).toEqual(expectedContinuation);
        }
    });
});
