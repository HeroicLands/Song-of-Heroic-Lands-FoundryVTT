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
 * The Mastery Boost table: the mastery-level increase granted by a single boost
 * applied at a given running mastery level. The bonus shrinks as mastery rises,
 * so early boosts are worth more than late ones.
 *
 * | ML range | boost |
 * | -------- | ----- |
 * | ≤ 39     | 10    |
 * | 40–44    | 9     |
 * | 45–49    | 8     |
 * | 50–59    | 7     |
 * | 60–69    | 6     |
 * | 70–79    | 5     |
 * | 80–99    | 4     |
 * | ≥ 100    | 3     |
 *
 * @param ml - The running mastery level a boost is being applied at.
 * @returns The mastery-level bonus this boost adds.
 */
export function calcMasteryBoost(ml: number): number {
    if (ml <= 39) return 10;
    else if (ml <= 44) return 9;
    else if (ml <= 49) return 8;
    else if (ml <= 59) return 7;
    else if (ml <= 69) return 6;
    else if (ml <= 79) return 5;
    else if (ml <= 99) return 4;
    else return 3;
}

/**
 * Apply `count` compounding mastery boosts to a starting mastery level, each
 * step drawing its increment from the {@link calcMasteryBoost} table evaluated
 * at the running value.
 *
 * @param startML - The mastery level to begin from.
 * @param count - How many boosts to apply; `≤ 0` returns `startML` unchanged.
 * @returns The mastery level after all boosts.
 */
export function applyMasteryBoosts(startML: number, count: number): number {
    let ml = startML;
    for (let i = 0; i < count; i++) {
        ml += calcMasteryBoost(ml);
    }
    return ml;
}

/** Inputs for {@link computeBoostContribution}. */
export interface BoostContributionInput {
    /**
     * Whether the associated skill already exists on the actor. An existing
     * skill boosts off its seeded mastery level; an absent skill spends its
     * first boost opening at Skill Base.
     */
    hasSkill: boolean;
    /**
     * The associated skill's seeded mastery-level base (before its own
     * permanent boosts and situational deltas). Required when `hasSkill`.
     */
    seedML?: number;
    /**
     * The associated skill's Skill Base. Used to open an absent skill.
     * Required when `!hasSkill`.
     */
    skillBase?: number;
    /** The Mystery's boost count (`N`). `≤ 0` contributes nothing. */
    count: number;
}

/** Result of {@link computeBoostContribution}. */
export interface BoostContribution {
    /**
     * `true` when the boost **confers** an absent skill (the working ML is the
     * level the skill is granted at); `false` when it augments an existing skill
     * (the working ML feeds {@link BoostContribution.delta}).
     */
    conferred: boolean;
    /** The mastery level after all boosts were applied. */
    workingML: number;
    /**
     * The EML contribution. For an existing skill it is the delta over the
     * seeded base (`workingML - seedML`); for a conferred skill it is the full
     * `workingML` (the skill has no prior EML). `0` when `count ≤ 0`.
     */
    delta: number;
}

/**
 * Compute a Boost Mystery's mastery-level contribution to its associated skill,
 * following the Mastery Boost algorithm:
 *
 * - **Existing skill:** all `N` boosts compound off the skill's seeded mastery
 *   level; the contribution is the resulting EML delta.
 * - **Absent skill:** the first boost opens the skill at its Skill Base and the
 *   remaining `N − 1` compound off that; the skill is conferred at the result.
 *
 * The computation is derived state — a caller re-runs it every prepare cycle and
 * contributes the result as a live delta, so the effect reverts automatically
 * when the Mystery lapses.
 *
 * @param input - See {@link BoostContributionInput}.
 * @returns The contribution; see {@link BoostContribution}.
 */
export function computeBoostContribution(
    input: BoostContributionInput,
): BoostContribution {
    const { hasSkill, count } = input;
    if (count <= 0) {
        return {
            conferred: false,
            workingML: hasSkill ? (input.seedML ?? 0) : 0,
            delta: 0,
        };
    }

    if (hasSkill) {
        const seedML = input.seedML ?? 0;
        const workingML = applyMasteryBoosts(seedML, count);
        return { conferred: false, workingML, delta: workingML - seedML };
    }

    // Absent skill: the first boost opens it at Skill Base, the rest compound.
    const skillBase = input.skillBase ?? 0;
    const workingML = applyMasteryBoosts(skillBase, count - 1);
    return { conferred: true, workingML, delta: workingML };
}
