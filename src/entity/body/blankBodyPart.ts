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

import type { BodyPart } from "@src/entity/body/BodyPart";

/**
 * Build a blank, schema-valid body part with no locations.
 *
 * Every field is seeded to the same default the corresponding DataModel schema
 * field (`BeingDataModel` `body.structure.parts[]`) initializes to, so the
 * returned object round-trips a Foundry `update()` into the structure's `parts`
 * array without validation churn. Kept Foundry-free so the
 * {@link sohl.entity.body.BodyPart} editor can seed a valid blank without a live
 * DataModel.
 *
 * @param name - The display name for the new part (defaults to `"Body Part"`).
 * @param shortcode - The part's shortcode (defaults to blank; assigned by the
 *   caller's add flow).
 * @returns A fully-populated {@link BodyPart.Data} with default values and an
 *   empty `locations` array.
 */
export function blankBodyPart(
    name: string = "Body Part",
    shortcode: string = "",
): BodyPart.Data {
    return {
        shortcode,
        name,
        roles: [],
        favoredFlag: false,
        canHoldItem: false,
        heldItemId: null,
        permanentImpairment: 0,
        permanentlyUnusable: false,
        // The persisted "area / random-selection weight" field; the entity's
        // `probWeight` modifier is derived from this, not persisted directly.
        combatArea: 0,
        locations: [],
    };
}
