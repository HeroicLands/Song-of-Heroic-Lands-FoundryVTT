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
 * The **Strength Impact Modifier** (#1253) — the pure, Foundry-free rule that a
 * strong combatant drives a weapon harder than a weak one.
 *
 * The rule is published as a lookup table (STR 1 → −10, rising to STR 24–25 →
 * +7, "increases by 1 every two STR above 24"). SoHL computes it instead, so it
 * extends without limit in both directions: the system carries creatures from
 * STR 1 insects to colossi well past the printed table's end, and a table would
 * simply run out.
 *
 * The closed form is two segments:
 *
 * | Strength | Modifier          | Shape                          |
 * | -------- | ----------------- | ------------------------------ |
 * | ≥ 5      | `⌊(STR − 10) / 2⌋` | +1 per two points, unbounded  |
 * | ≤ 4      | `2 × STR − 12`     | −2 per point, the steep tail  |
 *
 * Both segments reproduce every printed row exactly, and they meet cleanly at
 * the seam (STR 4 → −4, STR 5 → −3). The steep low tail is the published
 * table's own shape: below STR 5 a combatant loses ground far faster, because
 * at that point they can barely drive the weapon at all.
 *
 * **Applies to melee attacks and thrown weapons only.** Bows, crossbows and
 * slings get no benefit — their impact comes from the launcher, not the arm —
 * and a strike mode carrying the `noStrMod` trait is excluded outright.
 *
 * Two reductions ride on top, and they stack:
 *
 * - **Off-hand** — the weapon is gripped only by limbs on the combatant's
 *   non-dominant side. Dominance is read from the Left/Right Dominance
 *   characteristics; see {@link sohl.document.actor.logic.BeingLogic.dominantSide}.
 * - **Thrown** — the weapon is itself the projectile.
 */

import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { PROJECTILE_TYPE_NONE } from "@src/utils/constants";

/**
 * The Strength at and above which the modifier rises by **one per two points**.
 * Below it, the printed table falls away far more steeply.
 */
export const STRENGTH_IMPACT_LOW_TAIL = 5;

/** Reduction applied when the weapon is wielded in the off hand. */
export const OFF_HAND_IMPACT_PENALTY = -1;

/** Reduction applied when the weapon is thrown. */
export const THROWN_IMPACT_PENALTY = -1;

/** Delta abbreviation identifying the Strength contribution to an impact. */
export const STRENGTH_IMPACT_ABBREV = "StrImp";

/** Delta abbreviation identifying the off-hand reduction. */
export const OFF_HAND_IMPACT_ABBREV = "OffHnd";

/** Delta abbreviation identifying the thrown reduction. */
export const THROWN_IMPACT_ABBREV = "Thrwn";

/**
 * The Strength Impact Modifier for a given Strength score.
 *
 * Computed, not looked up, so it holds for any creature the system can
 * represent — an insect at STR 1 and a colossus at STR 100 alike.
 *
 * @param strength - The combatant's effective Strength score. A fractional
 *   score floors to the weaker band.
 * @returns The impact modifier, which may be negative.
 */
export function strengthImpactModifier(strength: number): number {
    const str = Math.floor(strength);
    return str >= STRENGTH_IMPACT_LOW_TAIL ? Math.floor((str - 10) / 2) : 2 * str - 12;
}

/**
 * Whether a strike mode receives the Strength Impact Modifier at all.
 *
 * Melee modes do; so does a thrown weapon, which is its own projectile. A
 * launcher that throws separate ammunition (bow, crossbow, sling) does not, and
 * neither does anything flagged `noStrMod`.
 *
 * @param sm - The strike mode to test.
 * @returns `true` when the modifier applies to this mode.
 */
export function strengthImpactApplies(sm: StrikeModeBase): boolean {
    if (sm.traits?.noStrMod) return false;
    return sm.isMelee || isThrownStrikeMode(sm);
}

/**
 * Whether a strike mode throws the weapon itself rather than launching separate
 * ammunition — the case that earns the Strength Impact Modifier (at −1) while
 * bows and slings earn nothing.
 *
 * @param sm - The strike mode to test.
 * @returns `true` for a missile mode whose weapon is its own projectile.
 */
export function isThrownStrikeMode(sm: StrikeModeBase): boolean {
    if (!sm.isMissile) return false;
    const projectileType = (sm as { projectileType?: string }).projectileType;
    return projectileType === PROJECTILE_TYPE_NONE;
}

/** How a strike mode is being wielded, for {@link applyStrengthImpact}. */
export interface StrengthImpactOptions {
    /** The wielder's effective Strength score. */
    strength: number;
    /** Whether the weapon is gripped only by the non-dominant side. */
    offHand?: boolean;
    /** Whether the weapon is being thrown. */
    thrown?: boolean;
}

/**
 * Fold the Strength Impact Modifier — and any off-hand and thrown reductions —
 * into a strike mode's impact, as **named deltas** so each contribution stays
 * visible in the impact breakdown rather than vanishing into the total.
 *
 * A no-op for a mode {@link strengthImpactApplies} rejects. Re-applying with the
 * same inputs replaces the existing deltas rather than stacking them, so the
 * caller may run in a repeated lifecycle phase without double-counting.
 *
 * @param sm - The strike mode whose impact is modified, in place.
 * @param options - The wielder's Strength and how the weapon is being wielded.
 */
export function applyStrengthImpact(sm: StrikeModeBase, options: StrengthImpactOptions): void {
    if (!strengthImpactApplies(sm)) return;

    const contributions: Array<[string, string, number]> = [
        [
            "SOHL.INFO.StrengthImpact",
            STRENGTH_IMPACT_ABBREV,
            strengthImpactModifier(options.strength),
        ],
        [
            "SOHL.INFO.OffHand",
            OFF_HAND_IMPACT_ABBREV,
            options.offHand ? OFF_HAND_IMPACT_PENALTY : 0,
        ],
        ["SOHL.INFO.Thrown", THROWN_IMPACT_ABBREV, options.thrown ? THROWN_IMPACT_PENALTY : 0],
    ];

    for (const [name, abbrev, value] of contributions) {
        // Drop any prior application before re-adding, so a repeated lifecycle
        // phase restates the contribution instead of stacking it.
        const existing = sm.impact.deltas.findIndex((d: { abbrev: string }) => d.abbrev === abbrev);
        if (existing >= 0) sm.impact.deltas.splice(existing, 1);
        if (value) sm.impact.add(name, abbrev, value);
    }
}
