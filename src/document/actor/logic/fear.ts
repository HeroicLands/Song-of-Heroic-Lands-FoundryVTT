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
 * Fear-test model (#558) — the pure, Foundry-free core of the **Fear Test**
 * (a test against **Will**) and its states.
 *
 * A traumatic fear source demands a Fear Test; the result maps to a
 * {@link sohl.utils.FEAR_CATEGORY} state — **Brave** / **Steady** / **Afraid** /
 * **Terrified** / **Catatonic** — that drives combat and movement effects and any
 * Psyche Stress ([Psychological Condition](https://kb.heroiclands.org/dev/reference/randomness/))
 * gain. Each fear source is recorded as its own **`fear`-subtype trauma** (its
 * `category` is the {@link sohl.utils.FEAR_CATEGORY}); when several are present,
 * only the **most severe (most-failed)** state affects the victim. See the Fear
 * rules (`assets/content/Rules/Fear.md`).
 *
 * This module is only the rule mapping and effect predicates; the Foundry-touching
 * roll, trauma creation, and PSY gain live on {@link BeingLogic}.
 */

import {
    CRITICAL_SUCCESS,
    MARGINAL_SUCCESS,
    MARGINAL_FAILURE,
    FEAR_CATEGORY,
    FearCategories,
    FearCategoryChoices,
    type FearCategory,
} from "@src/utils/constants";

/**
 * Severity rank of each fear category — its index in the ascending-severity
 * {@link sohl.utils.FearCategories} list (`none` 0 … `catatonic` 5). Ranking lets
 * "the most severe state wins" and the `>=` gates work on the string categories.
 */
const FEAR_RANK: Record<string, number> = Object.fromEntries(
    FearCategories.map((v, i) => [v, i]),
);

/**
 * The severity rank of a {@link sohl.utils.FEAR_CATEGORY} (an unknown value ranks
 * as `NONE`).
 *
 * @param category - A fear category.
 * @returns Its 0-based severity rank.
 */
function fearRank(category: FearCategory): number {
    return FEAR_RANK[category] ?? 0;
}

/**
 * The localization key for a {@link sohl.utils.FEAR_CATEGORY}, or `""` for an
 * unknown category.
 *
 * @param category - A fear category.
 * @returns The localization key.
 */
export function fearCategoryLabelKey(category: FearCategory): string {
    return FearCategoryChoices[category] ?? "";
}

/**
 * The **+20** bonus a **Brave** (Critical Success) result grants to all Fear and
 * Morale tests (Fear rules — CS/Brave).
 */
export const FEAR_BRAVE_BONUS = 20;

/** How long (seconds) the {@link FEAR_BRAVE_BONUS} lasts — five minutes. */
export const FEAR_BRAVE_DURATION = 300;

/**
 * How long (seconds) a **Terrified** victim must stay clear of the source before
 * becoming Steady — ten minutes (Fear rules — CF5/Terrified).
 */
export const FEAR_TERRIFIED_CLEAR = 600;

/**
 * How long (seconds) an **Afraid** victim must stay clear of the source before
 * becoming Steady — one minute (Fear rules — MF/Afraid).
 */
export const FEAR_AFRAID_CLEAR = 60;

/**
 * Map a **Fear Test** result to a {@link sohl.utils.FEAR_CATEGORY} (Fear rules):
 * `CS → Brave`, `MS → Steady`, `MF → Afraid`, and a critical failure splits by
 * least-significant digit — **CF0** (last digit 0) is the more severe
 * **Catatonic**, **CF5** (last digit 5) the less severe **Terrified**.
 *
 * @param normSuccessLevel - The Fear-test result (CF −1 … CS 2).
 * @param lastDigit - The ones digit of the d100 roll (distinguishes CF0 from CF5).
 * @returns The resulting fear level.
 */
export function fearStateFromTest(
    normSuccessLevel: number,
    lastDigit: number,
): FearCategory {
    if (normSuccessLevel >= CRITICAL_SUCCESS) return FEAR_CATEGORY.BRAVE;
    if (normSuccessLevel === MARGINAL_SUCCESS) return FEAR_CATEGORY.STEADY;
    if (normSuccessLevel === MARGINAL_FAILURE) return FEAR_CATEGORY.AFRAID;
    // Critical failure — CF0 (last digit 0) is Catatonic, CF5 (5) Terrified.
    return lastDigit === 0 ? FEAR_CATEGORY.CATATONIC : FEAR_CATEGORY.TERRIFIED;
}

/**
 * The Psyche Stress Levels a fear state grants (Fear rules): **Catatonic +2**,
 * **Terrified +1**, none for the milder states.
 *
 * @param category - A {@link sohl.utils.FEAR_CATEGORY}.
 * @returns The PSY gain.
 */
export function fearPsyGain(category: FearCategory): number {
    if (fearRank(category) >= fearRank(FEAR_CATEGORY.CATATONIC)) return 2;
    if (category === FEAR_CATEGORY.TERRIFIED) return 1;
    return 0;
}

/**
 * The most severe (highest-ranked) fear category among `categories`, or `NONE`
 * when empty — "when several fear sources are present, only the most severe state
 * affects the victim" (Fear rules).
 *
 * @param categories - The fear categories of every active fear source.
 * @returns The most severe fear category.
 */
export function mostSevereFear(
    categories: readonly FearCategory[],
): FearCategory {
    return categories.reduce<FearCategory>(
        (m, c) => (fearRank(c) > fearRank(m) ? c : m),
        FEAR_CATEGORY.NONE,
    );
}

/**
 * Whether a fear category is a **recorded harmful state** (Afraid or worse) — the
 * states that become a `fear`-subtype trauma. Brave and Steady are not recorded.
 *
 * @param category - A {@link sohl.utils.FEAR_CATEGORY}.
 * @returns `true` for Afraid, Terrified, or Catatonic.
 */
export function isFearfulState(category: FearCategory): boolean {
    return fearRank(category) >= fearRank(FEAR_CATEGORY.AFRAID);
}

/**
 * Whether the victim may respond in combat **only with Block or Dodge** — true
 * while **Afraid** or **Terrified** (a Catatonic victim is {@link fearHelpless},
 * a stronger condition).
 *
 * @param category - A {@link sohl.utils.FEAR_CATEGORY}.
 * @returns `true` when defense is restricted to Block/Dodge.
 */
export function fearDefenseRestricted(category: FearCategory): boolean {
    return (
        category === FEAR_CATEGORY.AFRAID ||
        category === FEAR_CATEGORY.TERRIFIED
    );
}

/**
 * Whether the victim is **Helpless** (melee attackers score a Critical Success
 * Ignore) — true only while **Catatonic** (Fear rules — CF0/Catatonic).
 *
 * @param category - A {@link sohl.utils.FEAR_CATEGORY}.
 * @returns `true` when Catatonic.
 */
export function fearHelpless(category: FearCategory): boolean {
    return fearRank(category) >= fearRank(FEAR_CATEGORY.CATATONIC);
}

/**
 * Whether the victim **must flee** the source at full Move on the next turn —
 * true while **Afraid** or **Terrified** (Fear rules).
 *
 * @param category - A {@link sohl.utils.FEAR_CATEGORY}.
 * @returns `true` when the victim must flee.
 */
export function fearMustFlee(category: FearCategory): boolean {
    return (
        category === FEAR_CATEGORY.AFRAID ||
        category === FEAR_CATEGORY.TERRIFIED
    );
}

/**
 * How long (seconds) the victim must stay **clear of the source** before becoming
 * Steady, or `undefined` when the state has no clear-of-source timer (Fear rules):
 * Terrified ten minutes, Afraid one minute.
 *
 * @param category - A {@link sohl.utils.FEAR_CATEGORY}.
 * @returns The clear duration in seconds, or `undefined`.
 */
export function fearClearDuration(category: FearCategory): number | undefined {
    if (category === FEAR_CATEGORY.TERRIFIED) return FEAR_TERRIFIED_CLEAR;
    if (category === FEAR_CATEGORY.AFRAID) return FEAR_AFRAID_CLEAR;
    return undefined;
}
