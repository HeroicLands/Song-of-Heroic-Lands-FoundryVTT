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

import { ValueModifier } from "../modifier/ValueModifier";
import type { Rng } from "@src/entity/random/Rng";
import { defaultRng } from "@src/entity/random/createRng";

/**
 * Select a random item from an array, weighted by each item's `probWeight`
 * property. Items with higher weights are proportionally more likely to
 * be selected.
 * @param items - Candidate items, each carrying a `probWeight` modifier.
 * @param rng - The random source; defaults to the shared {@link sohl.random}
 *   singleton. Inject a seeded {@link sohl.entity.random.createRng} instance to
 *   make selection reproducible (or force it deterministically end to end).
 * @returns The randomly selected item.
 * @throws {Error} If the array is empty or all weights are zero.
 */
export function weightedRandom<
    T extends {
        /** Relative selection weight (its effective value is used). */
        probWeight: ValueModifier;
    },
>(items: T[], rng: Rng = defaultRng()): T {
    const totalWeight = items.reduce(
        (sum, item) => sum + item.probWeight.effective,
        0,
    );
    if (totalWeight <= 0 || items.length === 0) {
        throw new Error("Cannot select from empty array or zero total weight");
    }
    // Continuous draw preserves fractional weights exactly (no behaviour change
    // vs. the former Math.random path); float() is uniform in [0, 1).
    let roll = rng.float() * totalWeight;
    for (const item of items) {
        roll -= item.probWeight.effective;
        if (roll <= 0) return item;
    }
    return items[items.length - 1];
}
