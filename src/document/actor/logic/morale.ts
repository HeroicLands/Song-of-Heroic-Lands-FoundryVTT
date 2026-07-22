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
 * Morale-test model (#559) — the pure, Foundry-free core of the **Morale Test**
 * (a test of the **Initiative** skill), the **Rally Test**, and the **Reaction
 * Test**.
 *
 * The Morale Test maps to a {@link sohl.utils.MORALE_LEVEL} state — **Brave** /
 * **Steady** / **Withdrawing** / **Routed** / **Catatonic** — recorded, like fear,
 * as its own `morale`-subtype trauma; when several failure sources are present,
 * only the **most severe** affects the victim. A **Rally Test** (a leader's
 * Command/Initiative test) steadies Routed and Withdrawing allies; a **Reaction
 * Test** (Initiative) lets a shaken combatant shake off the state. See the Morale
 * rules (`assets/content/Rules/Morale.md`).
 *
 * This module is only the rule mapping and effect predicates; the Foundry-touching
 * rolls, trauma creation, PSY gain, and the Rally offer cards live on
 * {@link BeingLogic}.
 */

import {
    CRITICAL_SUCCESS,
    MARGINAL_SUCCESS,
    MARGINAL_FAILURE,
    MORALE_LEVEL,
    MoraleLevelLabels,
} from "@src/utils/constants";

/**
 * The **+20** bonus a **Brave** (Critical Success) result grants to all Morale
 * and Fear tests — shared with fear's Brave bonus (Morale rules — CS/Brave).
 */
export const MORALE_BRAVE_BONUS = 20;

/** How long (seconds) the {@link MORALE_BRAVE_BONUS} lasts — five minutes. */
export const MORALE_BRAVE_DURATION = 300;

/** Localization key for each {@link sohl.utils.MORALE_LEVEL}, indexed by value. */
const MORALE_LABEL_KEY_BY_LEVEL: Record<number, string> = Object.fromEntries(
    Object.entries(MORALE_LEVEL).map(([k, v]) => [
        v as number,
        MoraleLevelLabels[k as keyof typeof MoraleLevelLabels],
    ]),
);

/**
 * Map a **Morale Test** result to a {@link sohl.utils.MORALE_LEVEL} (Morale
 * rules): `CS → Brave`, `MS → Steady`, `MF → Withdrawing`, and a critical failure
 * splits by least-significant digit — **CF0** (last digit 0) is the more severe
 * **Catatonic**, **CF5** (last digit 5) the less severe **Routed**.
 *
 * @param normSuccessLevel - The Morale-test result (CF −1 … CS 2).
 * @param lastDigit - The ones digit of the d100 roll (distinguishes CF0 from CF5).
 * @returns The resulting morale level.
 */
export function moraleStateFromTest(
    normSuccessLevel: number,
    lastDigit: number,
): number {
    if (normSuccessLevel >= CRITICAL_SUCCESS) return MORALE_LEVEL.BRAVE;
    if (normSuccessLevel === MARGINAL_SUCCESS) return MORALE_LEVEL.STEADY;
    if (normSuccessLevel === MARGINAL_FAILURE) return MORALE_LEVEL.WITHDRAWING;
    // Critical failure — CF0 (last digit 0) is Catatonic, CF5 (5) Routed.
    return lastDigit === 0 ? MORALE_LEVEL.CATATONIC : MORALE_LEVEL.ROUTED;
}

/**
 * The Psyche Stress Levels a morale state grants (Morale rules): **Catatonic +2**,
 * **Routed +1**, none for the milder states.
 *
 * @param level - A {@link sohl.utils.MORALE_LEVEL}.
 * @returns The PSY gain.
 */
export function moralePsyGain(level: number): number {
    if (level >= MORALE_LEVEL.CATATONIC) return 2;
    if (level === MORALE_LEVEL.ROUTED) return 1;
    return 0;
}

/**
 * The most severe (highest) morale level among `levels`, or `NONE` when empty —
 * "only the most severe state affects the victim" (Morale rules).
 *
 * @param levels - The morale levels of every active morale-failure source.
 * @returns The most severe morale level.
 */
export function mostSevereMorale(levels: readonly number[]): number {
    return levels.reduce<number>((m, l) => Math.max(m, l), MORALE_LEVEL.NONE);
}

/**
 * Whether a morale level is a **recorded shaken state** (Withdrawing or worse) —
 * the states that become a `morale`-subtype trauma. Brave and Steady are not
 * recorded.
 *
 * @param level - A {@link sohl.utils.MORALE_LEVEL}.
 * @returns `true` for Withdrawing, Routed, or Catatonic.
 */
export function isShakenMorale(level: number): boolean {
    return level >= MORALE_LEVEL.WITHDRAWING;
}

/**
 * Whether the victim is **unable to act or defend** (Catatonic) — the morale
 * analogue of {@link sohl.document.actor.logic.fearHelpless} (Morale rules —
 * CF0/Catatonic).
 *
 * @param level - A {@link sohl.utils.MORALE_LEVEL}.
 * @returns `true` when Catatonic.
 */
export function moraleHelpless(level: number): boolean {
    return level >= MORALE_LEVEL.CATATONIC;
}

/**
 * Whether the victim **flees** the source at full Move (Routed) on the next turn
 * (Morale rules — CF5/Routed).
 *
 * @param level - A {@link sohl.utils.MORALE_LEVEL}.
 * @returns `true` when Routed.
 */
export function moraleRouts(level: number): boolean {
    return level === MORALE_LEVEL.ROUTED;
}

/**
 * Whether the victim **withdraws** — retreating at half Move or more each turn
 * (Morale rules — MF/Withdrawing).
 *
 * @param level - A {@link sohl.utils.MORALE_LEVEL}.
 * @returns `true` when Withdrawing.
 */
export function moraleWithdraws(level: number): boolean {
    return level === MORALE_LEVEL.WITHDRAWING;
}

/**
 * The morale state a **Reaction Test** produces from a shaken `current` state on
 * success (Morale/Shock rules): a Catatonic victim improves to **Routed**; any
 * other shaken victim snaps back to **Steady**. On failure the state persists
 * (`current` unchanged).
 *
 * @param current - The victim's current morale level.
 * @param isSuccess - Whether the Reaction Test succeeded.
 * @returns The resulting morale level.
 */
export function reactionOutcome(current: number, isSuccess: boolean): number {
    if (!isSuccess) return current;
    if (current >= MORALE_LEVEL.CATATONIC) return MORALE_LEVEL.ROUTED;
    return MORALE_LEVEL.STEADY;
}

/**
 * The outcome of a **Rally Test** (Morale rules — Rally Test): a leader's
 * Command/Initiative test that steadies Routed and Withdrawing allies.
 *
 * - `steady` (CS) — allies become Steady immediately.
 * - `reaction` (MS) — allies make a Reaction Test at the end of their next turn.
 * - `unresponsive` (CF/MF) — no response; the leader may make no further Rally
 *   Test for `lockout` seconds (five minutes on CF, one minute on MF).
 */
export type RallyOutcome =
    | { kind: "steady" }
    | { kind: "reaction" }
    | { kind: "unresponsive"; lockout: number };

/** How long (seconds) a Critical-Failure Rally locks out further Rally Tests. */
export const RALLY_LOCKOUT_LONG = 300;

/** How long (seconds) a Marginal-Failure Rally locks out further Rally Tests. */
export const RALLY_LOCKOUT_SHORT = 60;

/**
 * Resolve a **Rally Test** result to its {@link RallyOutcome}.
 *
 * @param normSuccessLevel - The Rally-test result (CF −1 … CS 2).
 * @returns The rally outcome.
 */
export function rallyOutcome(normSuccessLevel: number): RallyOutcome {
    if (normSuccessLevel >= CRITICAL_SUCCESS) return { kind: "steady" };
    if (normSuccessLevel === MARGINAL_SUCCESS) return { kind: "reaction" };
    if (normSuccessLevel === MARGINAL_FAILURE) {
        return { kind: "unresponsive", lockout: RALLY_LOCKOUT_SHORT };
    }
    return { kind: "unresponsive", lockout: RALLY_LOCKOUT_LONG };
}

/**
 * The localization key for a {@link sohl.utils.MORALE_LEVEL}, or `""` for an
 * unknown level.
 *
 * @param level - A morale level.
 * @returns The localization key.
 */
export function moraleLevelLabelKey(level: number): string {
    return MORALE_LABEL_KEY_BY_LEVEL[level] ?? "";
}
