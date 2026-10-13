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
 * Fraction of the body each location accounts for. The full set sums to 1.0,
 * and an article's coverage is the sum of the locations it protects.
 */
export const WEIGHT: Record<string, number> = {
    skullloc: 0.04,
    neckloc: 0.02,
    lshldloc: 0.015,
    rshldloc: 0.015,
    lupaloc: 0.03,
    rupaloc: 0.03,
    lelbloc: 0.01,
    relbloc: 0.01,
    lfraloc: 0.025,
    rfraloc: 0.025,
    lhandloc: 0.025,
    rhandloc: 0.025,
    thrxloc: 0.12,
    abdmnloc: 0.12,
    plvisloc: 0.1,
    lthghloc: 0.07,
    rthghloc: 0.07,
    lkneeloc: 0.015,
    rkneeloc: 0.015,
    lcalfloc: 0.06,
    rcalfloc: 0.06,
    lfootloc: 0.035,
    rfootloc: 0.035,
};
for (const f of ["jawloc", "lcheekloc", "rcheekloc", "learloc", "rearloc", "mouthloc", "noseloc"])
    WEIGHT[f] = 0.03 / 7;

/**
 * The fraction of the body an article actually protects. A location listed in
 * `facing` is covered on one side only and counts for half its weight; a
 * location named on both sides, or not named in `facing` at all, counts in
 * full.
 */
export function coverageOf(
    flexible: string[],
    rigid: string[],
    facing: { location: string }[],
): number {
    const sides: Record<string, number> = {};
    for (const f of facing) sides[f.location] = (sides[f.location] ?? 0) + 1;
    return [...flexible, ...rigid].reduce((sum, loc) => {
        const n = sides[loc];
        const fraction = n ? Math.min(n, 2) / 2 : 1;
        return sum + (WEIGHT[loc] ?? 0) * fraction;
    }, 0);
}
