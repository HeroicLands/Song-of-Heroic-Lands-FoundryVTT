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
 * The **Impact Tactical Advantage value** — what one Tactical Advantage spent
 * on Impact is worth behind a given strike.
 *
 * A combatant who wins an exchange by two or more Victory Stars earns Tactical
 * Advantages (Attack Resolution rules). One spent on **Impact** adds this
 * mode's value to the blow:
 *
 * > impact bonus = (Tactical Advantages spent on Impact) × (Impact TA value)
 *
 * The value belongs to the **aspect**, not to the attack, so one entry in
 * {@link IMPACT_TA_DEFAULT} retunes every weapon of that aspect at once:
 *
 * | Aspect   | Value |
 * | -------- | ----- |
 * | Blunt    | 3     |
 * | Edged    | 5     |
 * | Piercing | 4     |
 * | Fire     | 2     |
 *
 * A strike mode's `impTA` trait **replaces** that default rather than adding to
 * it: a cut authored at `impTA: 6` is worth 6 per Tactical Advantage instead of
 * edged's 5.
 *
 * **Nothing here spends a Tactical Advantage.** The system states the count and
 * the value and does the arithmetic when a player asks for it; which advantages
 * are spent, and on what, is the player's decision and the referee's award. So
 * {@link impactTacticalAdvantageBonus} takes the number spent as an argument and
 * answers `0` for none.
 */

import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { IMPACT_ASPECT, isImpactAspect, type ImpactAspect } from "@src/utils/constants";

/**
 * What one Tactical Advantage spent on Impact is worth, by the struck aspect.
 *
 * Keyed by {@link sohl.utils.IMPACT_ASPECT}, so the value is a property of the
 * aspect: changing an entry retunes every strike mode of that aspect that states
 * no override of its own.
 */
export const IMPACT_TA_DEFAULT: Record<ImpactAspect, number> = {
    [IMPACT_ASPECT.BLUNT]: 3,
    [IMPACT_ASPECT.EDGED]: 5,
    [IMPACT_ASPECT.PIERCING]: 4,
    [IMPACT_ASPECT.FIRE]: 2,
};

/** Delta abbreviation identifying an Impact Tactical Advantage contribution. */
export const IMPACT_TA_ABBREV = "ImpTA";

/**
 * What one Tactical Advantage spent on Impact is worth behind a strike mode:
 * its `impTA` trait where it states one, else the default for its aspect.
 *
 * The trait is authored as `0` on every mode that states no override, so a `0`
 * reads as "unset" and defers to the aspect — treating it as a real value would
 * erase every default in content.
 *
 * @param sm - The strike mode delivering the blow.
 * @returns The value per Tactical Advantage, or `undefined` when the mode's
 *   aspect carries none.
 */
export function impactTacticalAdvantageValue(sm: StrikeModeBase): number | undefined {
    const override = sm.traits?.impTA;
    if (typeof override === "number" && override !== 0) return override;
    const aspect = sm.impact?.aspectType;
    return isImpactAspect(aspect) ? IMPACT_TA_DEFAULT[aspect] : undefined;
}

/**
 * The impact a stated number of Impact Tactical Advantages adds to a strike.
 *
 * A spend of none — the only state the system assumes — is worth nothing, and a
 * fractional count floors, since advantages are spent whole.
 *
 * @param sm - The strike mode delivering the blow.
 * @param spent - How many Tactical Advantages the player is spending on Impact.
 * @returns The impact to add, `0` when nothing is spent or the aspect carries no
 *   value.
 */
export function impactTacticalAdvantageBonus(sm: StrikeModeBase, spent: number): number {
    const count = Math.floor(spent);
    if (!(count > 0)) return 0;
    return count * (impactTacticalAdvantageValue(sm) ?? 0);
}
