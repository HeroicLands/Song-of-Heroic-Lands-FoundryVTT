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

import { AMPUTABILITY, BLEEDING_SUSCEPTIBILITY } from "@src/utils/constants";
import type { BodyLocation } from "@src/entity/body/BodyLocation";

/**
 * Build a blank, schema-valid body location.
 *
 * Every field is seeded to the same default the corresponding DataModel schema
 * field (`BeingDataModel` `body.structure.locations[]`) initializes to, so the
 * returned object round-trips a Foundry `update()` into the structure's flat
 * `locations` array without validation churn. Kept Foundry-free so the
 * {@link sohl.entity.body.BodyLocation} editor can seed a valid blank without a
 * live DataModel.
 *
 * @param name - The display name for the new location (defaults to `"Location"`).
 * @param shortcode - The location's shortcode (defaults to blank; assigned by
 *   the caller's add flow).
 * @param bodyPartCode - Shortcode of the owning part (defaults to blank; stamped
 *   by {@link sohl.entity.body.BodyPart.addLocationUpdate}).
 * @returns A fully-populated {@link BodyLocation.Data} with default values.
 */
export function blankBodyLocation(
    name: string = "Location",
    shortcode: string = "",
    bodyPartCode: string = "",
): BodyLocation.Data {
    return {
        shortcode,
        name,
        bodyPartCode,
        bleedingSusceptibility: BLEEDING_SUSCEPTIBILITY.NONE,
        amputability: AMPUTABILITY.NONE,
        isStumble: false,
        isFumble: false,
        shockValue: 0,
        probWeight: 0,
        protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
    };
}
