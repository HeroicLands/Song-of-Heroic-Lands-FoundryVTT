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

import { CRITICAL_FAILURE, MARGINAL_SUCCESS } from "@src/utils/constants";

/** Seconds in a day — onset is authored in days but persisted in seconds. */
export const SECONDS_PER_DAY = 86400;

/**
 * The Contagion Test target: **Contagion Index × Endurance**. The roll is a d100
 * roll-under, and *failing* it means the affliction is contracted — so a lower
 * Contagion Index yields a lower (easier-to-fail) target and is more contagious.
 *
 * @param contagionIndex - The affliction's Contagion Index (CI).
 * @param enduranceScore - The being's Endurance attribute score.
 * @returns The success-test target; never negative, always an integer.
 */
export function contagionTarget(
    contagionIndex: number,
    enduranceScore: number,
): number {
    const target = contagionIndex * enduranceScore;
    return Number.isFinite(target) ? Math.max(0, Math.round(target)) : 0;
}

/**
 * Whether a Contagion Test result means the character caught the affliction —
 * true on either failure level, false on either success.
 *
 * @param successLevel - The normalized success level (−1 CF … 2 CS).
 * @returns `true` when the affliction is contracted.
 */
export function isContracted(successLevel: number): boolean {
    return successLevel < MARGINAL_SUCCESS;
}

/**
 * Days between contracting an affliction and its onset, from the Contagion Test
 * result and a roll of the affliction's `onsetFormula`.
 *
 * A **critical failure** means the affliction takes hold twice as fast: half the
 * rolled duration, rounded **down**. A **marginal failure** uses the rolled
 * duration as-is. `0` days means onset is immediate.
 *
 * @param successLevel - The normalized success level of the Contagion Test.
 * @param rolledDays - The rolled `onsetFormula` result, in days.
 * @returns Days until onset, or `undefined` when the affliction was avoided.
 */
export function onsetDaysFor(
    successLevel: number,
    rolledDays: number,
): number | undefined {
    if (!isContracted(successLevel)) return undefined;
    const days =
        successLevel <= CRITICAL_FAILURE ?
            Math.floor(rolledDays / 2)
        :   Math.trunc(rolledDays);
    return Math.max(0, days);
}
