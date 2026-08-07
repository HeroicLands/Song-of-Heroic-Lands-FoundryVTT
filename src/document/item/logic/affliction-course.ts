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

import { MARGINAL_SUCCESS } from "@src/utils/constants";
import { SHOCK_STATE, type ShockState } from "@src/document/actor/logic/shock";

/**
 * The Healing Rate at which an affliction is **defeated** — the body has beaten
 * it and its course ends.
 */
export const COURSE_DEFEATED_HR = 6;

/**
 * The host's reaction to an affliction's current Healing Rate, as a plain,
 * Foundry-free description. The caller applies it.
 */
export interface CourseOutcome {
    /** Whether the ailment is defeated (Healing Rate at or above {@link COURSE_DEFEATED_HR}). */
    defeated: boolean;
    /** Levels of Weakness Fatigue the host suffers; `0` for none. */
    fatigueLevels: number;
    /** Shock state imposed on the host, or `undefined` when none. */
    shockState: ShockState | undefined;
}

/**
 * The change to an affliction's Healing Rate from one **Course Test**, by
 * normalized success level: CF −2, MF −1, MS +1, CS +2.
 *
 * A failure (below {@link MARGINAL_SUCCESS}) worsens the rate by one more than
 * its level's distance from marginal, and a success improves it by its level.
 *
 * @param successLevel - The normalized success level (−1 CF … 2 CS).
 * @returns The signed change to apply to the Healing Rate.
 */
export function courseHrDelta(successLevel: number): number {
    return successLevel < MARGINAL_SUCCESS ? successLevel - 1 : successLevel;
}

/**
 * The host's **Reaction** to an affliction's Healing Rate after a Course Test.
 *
 * Healing Rate 6+ defeats the ailment outright. Below that the affliction saps
 * the host: HR 5 costs 5 levels of Weakness Fatigue and HR 4 costs 10, while
 * HR 3 / 2 / 1 add Stunned / Incapacitated / Unconscious shock on top of those
 * 10 levels. A Healing Rate of 0 or less is death, which carries no fatigue of
 * its own.
 *
 * Pure and Foundry-free — the caller applies the described outcome.
 *
 * @param hr - The affliction's Healing Rate after the Course Test.
 * @returns The reaction to apply to the host.
 */
export function courseOutcomeFor(hr: number): CourseOutcome {
    if (hr >= COURSE_DEFEATED_HR) {
        return { defeated: true, fatigueLevels: 0, shockState: undefined };
    }
    if (hr <= 0) {
        return {
            defeated: false,
            fatigueLevels: 0,
            shockState: SHOCK_STATE.DEAD,
        };
    }
    if (hr === 5) {
        return { defeated: false, fatigueLevels: 5, shockState: undefined };
    }
    if (hr === 4) {
        return { defeated: false, fatigueLevels: 10, shockState: undefined };
    }
    const shockState =
        hr === 3 ? SHOCK_STATE.STUNNED
        : hr === 2 ? SHOCK_STATE.INCAPACITATED
        : SHOCK_STATE.UNCONSCIOUS;
    return { defeated: false, fatigueLevels: 10, shockState };
}
