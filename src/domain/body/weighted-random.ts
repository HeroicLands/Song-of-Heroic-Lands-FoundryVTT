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

/**
 * Select a random item from an array, weighted by each item's `probWeight`
 * property. Items with higher weights are proportionally more likely to
 * be selected.
 *
 * @throws {Error} If the array is empty or all weights are zero.
 */
export function weightedRandom<T extends { probWeight: number }>(
    items: T[],
): T {
    const totalWeight = items.reduce((sum, item) => sum + item.probWeight, 0);
    if (totalWeight <= 0 || items.length === 0) {
        throw new Error("Cannot select from empty array or zero total weight");
    }
    let roll = Math.random() * totalWeight;
    for (const item of items) {
        roll -= item.probWeight;
        if (roll <= 0) return item;
    }
    return items[items.length - 1];
}
