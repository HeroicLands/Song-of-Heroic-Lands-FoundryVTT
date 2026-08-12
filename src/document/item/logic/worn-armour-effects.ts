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
 * The two things worn armour does to its wearer beyond protecting them: it can
 * obstruct the senses, and a harness of small arm pieces encumbers once enough
 * of them are worn together.
 *
 * Both are properties of the *set* of worn articles rather than of any one of
 * them, so both are computed here from plain numbers and kept out of the
 * articles themselves. Pure and Foundry-free.
 */

/** Shortcode of the Perception attribute. */
export const PERCEPTION_SHORTCODE = "per";

/** Arm articles worn together before the harness costs anything. */
export const ARM_HARNESS_THRESHOLD = 3;

/** What a harness of arm articles costs once the threshold is reached. */
export const ARM_HARNESS_ENCUMBRANCE = 5;

/**
 * The perception penalty a wearer actually suffers, given every worn article's
 * penalty.
 *
 * The **worst** applies, never the sum: a great helm subsumes what a mail cowl
 * does to sight and hearing rather than compounding it, and a wearer cannot be
 * blinded twice over. This matches how impaired body parts penalize a test —
 * see {@link sohl.entity.modifier.MasteryLevelModifier.successTest}, where the
 * worst of the role and limb penalties applies rather than their total.
 *
 * @param penalties - Each worn article's penalty, as a non-positive number.
 * @returns The single penalty to apply, or 0 when nothing obstructs.
 */
export function worstPerceptionPenalty(penalties: number[]): number {
    return penalties.length ? Math.min(0, ...penalties) : 0;
}

/**
 * Whether a perception penalty bears on a test of the given skill.
 *
 * It applies to whatever is *built on* Perception, read off the skill's parsed
 * basis, so a formula that merely adjusts its result by Perception is
 * unaffected — the same reading used for the Aura → no-Fate rule.
 *
 * @param skillBaseAttrs - Attribute shortcodes the skill's base is built from.
 * @returns `true` when the penalty applies.
 */
export function perceptionPenaltyApplies(skillBaseAttrs: string[]): boolean {
    return skillBaseAttrs.includes(PERCEPTION_SHORTCODE);
}

/**
 * What a set of worn arm articles costs in encumbrance.
 *
 * A spaulder or a pair of vambraces costs nothing on its own; it is wearing
 * **three or more** of them that costs 5 — and 5 however many beyond three are
 * worn, because the cost is the harness getting in the way of the arms, not the
 * pieces adding up.
 *
 * This cannot be expressed as a per-article value: a sum lands on the right
 * answer only at exactly three, charging a lone spaulder a third of the cost
 * and a full harness half as much again.
 *
 * @param armArticlesWorn - How many arm articles are worn.
 * @returns The encumbrance the harness adds.
 */
export function armHarnessEncumbrance(armArticlesWorn: number): number {
    return armArticlesWorn >= ARM_HARNESS_THRESHOLD ?
            ARM_HARNESS_ENCUMBRANCE
        :   0;
}
