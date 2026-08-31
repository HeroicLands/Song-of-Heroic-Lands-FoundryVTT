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

import { IMPACT_ASPECT, STRIKE_MODE_TYPE, type StrikeModeType } from "@src/utils/constants";
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

/**
 * The fields common to every strike-mode type, defaulted to the same values the
 * schema (`StrikeModeBase.baseSchemaFields`) initializes. Kept Foundry-free so
 * both the "Add Strike Mode" sheet flow and the {@link sohl.entity.strikemode}
 * editor can seed a valid blank mode without a live DataModel.
 *
 * @param name - The display name for the new mode.
 * @returns The shared strike-mode fields with their schema-default values.
 */
function baseBlank(name: string): Omit<StrikeModeBase.Data, "type"> {
    return {
        // Assigned a unique value by the weapon "Add" flow; blank for a combat
        // technique's single mode.
        shortcode: "",
        name,
        minParts: 1,
        assocSkillCode: "",
        attack: { disabled: false, spread: 0, modifier: 0 },
        impactBase: {
            numDice: 0,
            die: null,
            modifier: null,
            aspect: IMPACT_ASPECT.BLUNT,
        },
        traits: {},
    };
}

/**
 * Build a blank, schema-valid strike mode of the requested type.
 *
 * Every field is seeded to the same default the corresponding DataModel schema
 * field initializes to, so the returned object round-trips a Foundry
 * `update()` into a weapon's `system.strikeModes` array or a combat technique's
 * `system.strikeMode` without validation churn. The discriminated `type` fixes
 * which subtype-specific fields are present.
 *
 * @param type - The strike-mode discriminator (`"melee"` or `"missile"`).
 * @param name - The display name for the new mode (defaults to `"Strike"`).
 * @returns A fully-populated {@link MeleeStrikeMode.Data} or
 *   {@link MissileStrikeMode.Data} with default values.
 */
export function blankStrikeMode(
    type: StrikeModeType,
    name: string = "Strike",
): MeleeStrikeMode.Data | MissileStrikeMode.Data {
    const base = baseBlank(name);
    if (type === STRIKE_MODE_TYPE.MISSILE) {
        return {
            ...base,
            type: STRIKE_MODE_TYPE.MISSILE,
            projectileType: "none",
            maxVolleyMult: 1,
            baseRangeBase: 0,
            drawBase: 0,
        };
    }
    return {
        ...base,
        type: STRIKE_MODE_TYPE.MELEE,
        lengthBase: 0,
        defense: {
            block: { disabled: false, modifier: 0, successLevelMod: 0 },
            counterstrike: { disabled: false, modifier: 0, successLevelMod: 0 },
        },
    };
}
