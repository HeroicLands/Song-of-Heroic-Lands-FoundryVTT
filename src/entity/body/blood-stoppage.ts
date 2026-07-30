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
 * Blood Stoppage (#547) — the pure, Foundry-free outcome of a **Blood Stoppage
 * Test** (a Physician skill test on a bleeding injury).
 *
 * A physician may answer a bleeder's request and roll a Blood Stoppage Test; the
 * result (Bleeding rules, `assets/content/Rules/Bleeding.md`) is relayed back to
 * the bleeding injury: `CF` continues, `MF` continues with **+10** to the next
 * test, `MS` stops the bleeding after the next Blood Loss Advance, and `CS` stops
 * it immediately. If no physician accepts by the end of the round, the Blood Loss
 * Advance proceeds as though the Stoppage Test were a Critical Failure — the
 * auto-resolve fallback already delivered by #487.
 */

import {
    CRITICAL_SUCCESS,
    MARGINAL_SUCCESS,
    MARGINAL_FAILURE,
} from "@src/utils/constants";

/** The **+10** bonus a Marginal-Failure stoppage grants to the next test. */
export const BLOOD_STOPPAGE_NEXT_BONUS = 10;

/** How a Blood Stoppage Test result affects the bleeder. */
export type BloodStoppageKind =
    /** CF — bleeding continues. */
    | "continue"
    /** MF — bleeding continues; +10 to the next Blood Stoppage Test. */
    | "continuePlusNext"
    /** MS — bleeding stops after the next Blood Loss Advance Test. */
    | "stopAfterNext"
    /** CS — bleeding stops immediately. */
    | "stopImmediately";

/** The resolved outcome of a Blood Stoppage Test. */
export interface BloodStoppageOutcome {
    /** What happens to the bleeder. */
    kind: BloodStoppageKind;
    /** The bonus applied to the next Blood Stoppage Test (10 on MF, else 0). */
    nextBonus: number;
}

/**
 * Resolve a **Blood Stoppage Test** result to its {@link BloodStoppageOutcome}
 * (Bleeding rules — Blood Stoppage Test).
 *
 * @param normSuccessLevel - The Physician-test result (CF −1 … CS 2).
 * @returns The stoppage outcome.
 */
export function bloodStoppageOutcome(
    normSuccessLevel: number,
): BloodStoppageOutcome {
    if (normSuccessLevel >= CRITICAL_SUCCESS) {
        return { kind: "stopImmediately", nextBonus: 0 };
    }
    if (normSuccessLevel === MARGINAL_SUCCESS) {
        return { kind: "stopAfterNext", nextBonus: 0 };
    }
    if (normSuccessLevel === MARGINAL_FAILURE) {
        return {
            kind: "continuePlusNext",
            nextBonus: BLOOD_STOPPAGE_NEXT_BONUS,
        };
    }
    return { kind: "continue", nextBonus: 0 };
}
