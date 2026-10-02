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
 * **Shield Mod** — the defence a held shield confers on its wielder, as the
 * pure, Foundry-free half of the rule.
 *
 * A shield's `shieldMod` trait is a **wielder-level** bonus, not a property of
 * the strike mode carrying it. It reaches:
 *
 * - **every Block the wielder makes**, including one made with the weapon in the
 *   other hand;
 * - the wielder's **Dodge**, which is a skill of their own and belongs to no
 *   weapon;
 * - a **Press**, which is a manoeuvre rather than a strike.
 *
 * Two consequences of it being the wielder's bonus rather than the shield's:
 *
 * - **Highest, never summed.** A shield on each arm grants the better of the
 *   two.
 * - **It must be held.** A slung or stowed shield grants nothing, so the
 *   document layer filters by grip before asking for a value here.
 *
 * A non-zero `shieldMod` is also what **identifies** a shield: there is no
 * shield subtype, and the trait marks an item made to be worn on the arm. That
 * is what {@link isShieldStrikeMode} answers, and it is the same test the
 * off-side exemption wants.
 */

import type { CombatModifier } from "@src/entity/modifier/CombatModifier";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

/** Delta abbreviation identifying a held shield's contribution to a defence. */
export const SHIELD_DEFENSE_ABBREV = "Shld";

/** Localization key naming the held shield's contribution in a breakdown. */
export const SHIELD_DEFENSE_LABEL = "SOHL.INFO.ShieldMod";

/**
 * A strike mode's Shield Mod.
 *
 * Every strike mode in content authors the trait, nearly all of them as `0`, so
 * a value is meaningful only when it is a positive number; anything else reads
 * as "not a shield".
 *
 * @param sm - The strike mode to read.
 * @returns The Shield Mod, or `0` when the mode is not a shield's.
 */
export function shieldModOf(sm: StrikeModeBase): number {
    const value = sm?.traits?.shieldMod;
    return typeof value === "number" && value > 0 ? value : 0;
}

/**
 * Whether a strike mode belongs to a **shield**.
 *
 * @param sm - The strike mode to test.
 * @returns `true` when the mode carries a non-zero Shield Mod.
 */
export function isShieldStrikeMode(sm: StrikeModeBase): boolean {
    return shieldModOf(sm) > 0;
}

/**
 * The Shield Mod a wielder benefits from, given the strike modes of the shields
 * they have in hand: the **highest**, since two shields grant the better rather
 * than their total.
 *
 * @param modes - Strike modes of every item the wielder is holding.
 * @returns The best Shield Mod among them, or `0` when none is a shield's.
 */
export function bestShieldMod(modes: readonly StrikeModeBase[]): number {
    return modes.reduce((best, sm) => Math.max(best, shieldModOf(sm)), 0);
}

/**
 * Fold a held shield's Shield Mod into a defence modifier as a **named delta**,
 * so the roll's breakdown says where the bonus came from.
 *
 * Re-applying replaces the existing delta rather than stacking it, so the caller
 * may run in a repeated lifecycle phase; a `value` of `0` removes it, which is
 * what stowing the shield does.
 *
 * @param mod - The attack or defence modifier to adjust, in place.
 * @param value - The best held Shield Mod, from {@link bestShieldMod}.
 */
export function applyShieldDefenseBonus(mod: CombatModifier, value: number): void {
    const existing = mod.deltas.findIndex(
        (d: { abbrev: string }) => d.abbrev === SHIELD_DEFENSE_ABBREV,
    );
    if (existing >= 0) mod.deltas.splice(existing, 1);
    if (value > 0) mod.add(SHIELD_DEFENSE_LABEL, SHIELD_DEFENSE_ABBREV, value);
}
