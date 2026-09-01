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
 * The Morale Test maps to a {@link sohl.utils.MORALE_CATEGORY} state — **Brave** /
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
    MORALE_CATEGORY,
    MoraleCategories,
    MoraleCategoryChoices,
    type MoraleCategory,
} from "@src/utils/constants";

/**
 * The **+20** bonus a **Brave** (Critical Success) result grants to all Morale
 * and Fear tests — shared with fear's Brave bonus (Morale rules — CS/Brave).
 */
export const MORALE_BRAVE_BONUS = 20;

/** How long (seconds) the {@link MORALE_BRAVE_BONUS} lasts — five minutes. */
export const MORALE_BRAVE_DURATION = 300;

/**
 * Severity rank of each morale category — its index in the ascending-severity
 * {@link sohl.utils.MoraleCategories} list (`none` 0 … `catatonic` 5). Ranking
 * lets "the most severe state wins" and the `>=` gates work on the string
 * categories.
 */
const MORALE_RANK: Record<string, number> = Object.fromEntries(
    MoraleCategories.map((v, i) => [v, i]),
);

/**
 * The severity rank of a {@link sohl.utils.MORALE_CATEGORY} (an unknown value
 * ranks as `NONE`).
 *
 * @param category - A morale category.
 * @returns Its 0-based severity rank.
 */
function moraleRank(category: MoraleCategory): number {
    return MORALE_RANK[category] ?? 0;
}

/**
 * Map a **Morale Test** result to a {@link sohl.utils.MORALE_CATEGORY} (Morale
 * rules): `CS → Brave`, `MS → Steady`, `MF → Withdrawing`, and a critical failure
 * splits by least-significant digit — **CF0** (last digit 0) is the more severe
 * **Catatonic**, **CF5** (last digit 5) the less severe **Routed**.
 *
 * @param normSuccessLevel - The Morale-test result (CF −1 … CS 2).
 * @param lastDigit - The ones digit of the d100 roll (distinguishes CF0 from CF5).
 * @returns The resulting morale level.
 */
export function moraleStateFromTest(normSuccessLevel: number, lastDigit: number): MoraleCategory {
    if (normSuccessLevel >= CRITICAL_SUCCESS) return MORALE_CATEGORY.BRAVE;
    if (normSuccessLevel === MARGINAL_SUCCESS) return MORALE_CATEGORY.STEADY;
    if (normSuccessLevel === MARGINAL_FAILURE) return MORALE_CATEGORY.WITHDRAWING;
    // Critical failure — CF0 (last digit 0) is Catatonic, CF5 (5) Routed.
    return lastDigit === 0 ? MORALE_CATEGORY.CATATONIC : MORALE_CATEGORY.ROUTED;
}

/**
 * The Psyche Stress Levels a morale state grants (Morale rules): **Catatonic +2**,
 * **Routed +1**, none for the milder states.
 *
 * @param category - A {@link sohl.utils.MORALE_CATEGORY}.
 * @returns The PSY gain.
 */
export function moralePsyGain(category: MoraleCategory): number {
    if (moraleRank(category) >= moraleRank(MORALE_CATEGORY.CATATONIC)) return 2;
    if (category === MORALE_CATEGORY.ROUTED) return 1;
    return 0;
}

/**
 * The most severe (highest-ranked) morale category among `categories`, or `NONE`
 * when empty — "only the most severe state affects the victim" (Morale rules).
 *
 * @param categories - The morale categories of every active morale-failure source.
 * @returns The most severe morale category.
 */
export function mostSevereMorale(categories: readonly MoraleCategory[]): MoraleCategory {
    return categories.reduce<MoraleCategory>(
        (m, c) => (moraleRank(c) > moraleRank(m) ? c : m),
        MORALE_CATEGORY.NONE,
    );
}

/**
 * Whether morale category `a` is **strictly more severe** than `b` (by severity
 * rank) — used to decide whether a Reaction/Rally transition should lower an
 * existing trauma toward the target state.
 *
 * @param a - The candidate more-severe category.
 * @param b - The category to compare against.
 * @returns `true` when `a` outranks `b`.
 */
export function moraleMoreSevere(a: MoraleCategory, b: MoraleCategory): boolean {
    return moraleRank(a) > moraleRank(b);
}

/**
 * Whether a morale category is a **recorded shaken state** (Withdrawing or worse)
 * — the states that become a `morale`-subtype trauma. Brave and Steady are not
 * recorded.
 *
 * @param category - A {@link sohl.utils.MORALE_CATEGORY}.
 * @returns `true` for Withdrawing, Routed, or Catatonic.
 */
export function isShakenMorale(category: MoraleCategory): boolean {
    return moraleRank(category) >= moraleRank(MORALE_CATEGORY.WITHDRAWING);
}

/**
 * Whether the victim is **unable to act or defend** (Catatonic) — the morale
 * analogue of {@link sohl.document.actor.logic.fearHelpless} (Morale rules —
 * CF0/Catatonic).
 *
 * @param category - A {@link sohl.utils.MORALE_CATEGORY}.
 * @returns `true` when Catatonic.
 */
export function moraleHelpless(category: MoraleCategory): boolean {
    return moraleRank(category) >= moraleRank(MORALE_CATEGORY.CATATONIC);
}

/**
 * Whether the victim **flees** the source at full Move (Routed) on the next turn
 * (Morale rules — CF5/Routed).
 *
 * @param category - A {@link sohl.utils.MORALE_CATEGORY}.
 * @returns `true` when Routed.
 */
export function moraleRouts(category: MoraleCategory): boolean {
    return category === MORALE_CATEGORY.ROUTED;
}

/**
 * Whether the victim **withdraws** — retreating at half Move or more each turn
 * (Morale rules — MF/Withdrawing).
 *
 * @param category - A {@link sohl.utils.MORALE_CATEGORY}.
 * @returns `true` when Withdrawing.
 */
export function moraleWithdraws(category: MoraleCategory): boolean {
    return category === MORALE_CATEGORY.WITHDRAWING;
}

/**
 * The morale state a **Reaction Test** produces from a shaken `current` state on
 * success (Morale/Shock rules): a Catatonic victim improves to **Routed**; any
 * other shaken victim snaps back to **Steady**. On failure the state persists
 * (`current` unchanged).
 *
 * @param current - The victim's current morale category.
 * @param isSuccess - Whether the Reaction Test succeeded.
 * @returns The resulting morale category.
 */
export function reactionOutcome(current: MoraleCategory, isSuccess: boolean): MoraleCategory {
    if (!isSuccess) return current;
    if (moraleRank(current) >= moraleRank(MORALE_CATEGORY.CATATONIC)) {
        return MORALE_CATEGORY.ROUTED;
    }
    return MORALE_CATEGORY.STEADY;
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
    { kind: "steady" } | { kind: "reaction" } | { kind: "unresponsive"; lockout: number };

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
 * The localization key for a {@link sohl.utils.MORALE_CATEGORY}, or `""` for an
 * unknown category.
 *
 * @param category - A morale category.
 * @returns The localization key.
 */
export function moraleCategoryLabelKey(category: MoraleCategory): string {
    return MoraleCategoryChoices[category] ?? "";
}
