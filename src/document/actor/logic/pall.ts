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
 * The Pall (#561) — the pure, Foundry-free core of the forces of death that assail
 * **Spirit**. Covers **Pall Strength (PAL)** and its falloff, **resisting the
 * Pall** (a Spirit test with a Pall Depth penalty and its states), the **Pall
 * Cloud** (Pall Stress Level penalties), and **Pall recovery**. See the Pall rules
 * (`assets/content/Rules/The_Pall.md`).
 *
 * The Pall Cloud is recorded as a `pall`-subtype trauma whose `levelBase` is the
 * accrued **Pall Stress Levels (PSL)**. This module is only the rule math and
 * state mapping; the Foundry-touching rolls, trauma creation, and the "Face the
 * Pall" offer live on {@link BeingLogic} / {@link TraumaLogic}.
 */

import {
    CRITICAL_SUCCESS,
    MARGINAL_SUCCESS,
    MARGINAL_FAILURE,
} from "@src/utils/constants";

/** The Pall Depth penalty is **5 × total PAL** (Pall rules — Resisting the Pall). */
export const PALL_DEPTH_PER_PAL = 5;

/**
 * The **Pall Depth penalty** applied to a Spirit test — `5 × totalPal` (never
 * negative).
 *
 * @param totalPal - The total Pall Strength affecting the character.
 * @returns The (non-negative) penalty magnitude.
 */
export function pallDepthPenalty(totalPal: number): number {
    return PALL_DEPTH_PER_PAL * Math.max(0, totalPal);
}

/**
 * A light condition's reduction to Pall Strength (Pall rules — Pall Strength):
 * natural daylight lowers PAL by 2, twilight by 1; firelight/indoors at night has
 * no effect.
 */
export const PALL_LIGHT_REDUCTION = {
    /** Indoors or firelight at night — no reduction. */
    NONE: 0,
    /** Twilight — reduces PAL by 1. */
    TWILIGHT: 1,
    /** Natural daylight — reduces PAL by 2. */
    DAYLIGHT: 2,
} as const;

/**
 * The effective **Pall Strength** at a distance (Pall rules — Pall Strength): the
 * source PAL, minus 1 per 5 feet (or fraction), minus a light reduction; never
 * negative (below zero the Pall has no effect).
 *
 * @param pal - The source's Pall Strength.
 * @param distanceFt - Distance from the source, in feet.
 * @param lightReduction - A {@link PALL_LIGHT_REDUCTION} value (default none).
 * @returns The effective Pall Strength at that distance.
 */
export function pallStrengthAt(
    pal: number,
    distanceFt: number,
    lightReduction = 0,
): number {
    const distanceReduction = Math.ceil(Math.max(0, distanceFt) / 5);
    return Math.max(0, pal - distanceReduction - lightReduction);
}

/**
 * The states of a **Resist the Pall** test, ascending in severity — Immune,
 * Resist, Disturbed, Terrified, Catatonic.
 */
export const PALL_STATE = {
    /** Immune to all Pall sources for ten minutes (CS). */
    IMMUNE: 0,
    /** Immune to all Pall sources for one round (MS). */
    RESIST: 1,
    /** Disturbed — must move out of the effect (MF). */
    DISTURBED: 2,
    /** Terrified — flees the source; no Counterstrike (CF5). */
    TERRIFIED: 3,
    /** Catatonic — unaware and unable to act (CF0). */
    CATATONIC: 4,
} as const;

/**
 * Map a **Resist the Pall** result to a {@link PALL_STATE} (Pall rules): `CS →
 * Immune`, `MS → Resist`, `MF → Disturbed`, and the critical-failure split —
 * **CF0** (last digit 0) is Catatonic, **CF5** (5) Terrified.
 *
 * @param normSuccessLevel - The Spirit-test result (CF −1 … CS 2).
 * @param lastDigit - The ones digit of the d100 roll.
 * @returns The resulting Pall state.
 */
export function pallResistState(
    normSuccessLevel: number,
    lastDigit: number,
): number {
    if (normSuccessLevel >= CRITICAL_SUCCESS) return PALL_STATE.IMMUNE;
    if (normSuccessLevel === MARGINAL_SUCCESS) return PALL_STATE.RESIST;
    if (normSuccessLevel === MARGINAL_FAILURE) return PALL_STATE.DISTURBED;
    return lastDigit === 0 ? PALL_STATE.CATATONIC : PALL_STATE.TERRIFIED;
}

/**
 * The Pall Stress Levels gained on a failed Resist the Pall test (Pall rules):
 * **Catatonic +3**, **Terrified +2**, **Disturbed +1**, none on a success.
 *
 * @param state - A {@link PALL_STATE}.
 * @returns The Pall Stress Levels gained.
 */
export function pallStressGain(state: number): number {
    if (state >= PALL_STATE.CATATONIC) return 3;
    if (state === PALL_STATE.TERRIFIED) return 2;
    if (state === PALL_STATE.DISTURBED) return 1;
    return 0;
}

/**
 * Whether a Pall state is a **failure** (Disturbed or worse) that accrues Pall
 * Stress Levels.
 *
 * @param state - A {@link PALL_STATE}.
 * @returns `true` for Disturbed, Terrified, or Catatonic.
 */
export function isPallFailure(state: number): boolean {
    return state >= PALL_STATE.DISTURBED;
}

/** The **Pall Cloud** penalties from accrued Pall Stress Levels (Pall rules). */
export interface PallCloudPenalties {
    /** PSL × 5 to vision-based Perception tests. */
    perception: number;
    /** PSL × 5 to Agility tests. */
    agility: number;
    /** PSL × 10 to Dodge. */
    dodge: number;
    /** PSL × 10 to Move. */
    move: number;
    /** PSL × 10 to Stealth. */
    stealth: number;
}

/**
 * The **Pall Cloud** penalties for a given Pall Stress Level count (Pall rules —
 * The Pall Cloud): `PSL × 5` to vision Perception and Agility, `PSL × 10` to Dodge,
 * Move, and Stealth.
 *
 * @param psl - The accrued Pall Stress Levels.
 * @returns The penalty magnitudes.
 */
export function pallCloudPenalties(psl: number): PallCloudPenalties {
    const p = Math.max(0, psl);
    return {
        perception: p * 5,
        agility: p * 5,
        dodge: p * 10,
        move: p * 10,
        stealth: p * 10,
    };
}

/**
 * The outcome of a **Pall recovery** test (Pall rules — Pall Recovery): `CS −2
 * PSL`, `MS −1 PSL`, `MF` **Unconscious** (no change; the character falls until
 * PSL reach 0), and `CF` **Face the Pall**.
 */
export interface PallRecoveryOutcome {
    /** `recover` (MS/CS), `unconscious` (MF), or `face` (CF). */
    kind: "recover" | "unconscious" | "face";
    /** Change to Pall Stress Levels (negative recovers). */
    pslDelta: number;
    /** On a Critical Success, whether it was a "clean" CS (converts permanence). */
    criticalSuccess: boolean;
}

/**
 * Resolve a **Pall recovery** test result to its outcome.
 *
 * @param normSuccessLevel - The Will-test result (CF −1 … CS 2).
 * @returns The recovery outcome.
 */
export function pallRecoveryOutcome(
    normSuccessLevel: number,
): PallRecoveryOutcome {
    if (normSuccessLevel >= CRITICAL_SUCCESS) {
        return { kind: "recover", pslDelta: -2, criticalSuccess: true };
    }
    if (normSuccessLevel === MARGINAL_SUCCESS) {
        return { kind: "recover", pslDelta: -1, criticalSuccess: false };
    }
    if (normSuccessLevel === MARGINAL_FAILURE) {
        return { kind: "unconscious", pslDelta: 0, criticalSuccess: false };
    }
    return { kind: "face", pslDelta: 0, criticalSuccess: false };
}

/**
 * The Pall recovery cadence — **every d6 days** (Pall rules — Pall Recovery). A
 * dice formula in seconds.
 */
export const PALL_RECOVERY_INTERVAL_FORMULA = "1d6 * 86400";

/**
 * The three fates of **Facing the Pall** (Pall rules — Facing the Pall) — always
 * the victim's own choice.
 */
export const PALL_FATE = {
    /** The soul is imprisoned; the body persists as an undead Nightwight. */
    EMBRACE: "embrace",
    /** The soul unanchors into a Shade; the body a mindless Helthraal. */
    VACATE: "vacate",
    /** The soul departs to the afterlife (True Death). */
    TRUE_DEATH: "truedeath",
} as const;
