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

import type { BodyZone } from "@src/entity/body/BodyZone";

/**
 * Build a blank, schema-valid body zone with no parts.
 *
 * Every field is seeded to the same default the corresponding DataModel schema
 * field (`BeingDataModel` `body.structure.zones[]`) initializes to, so the
 * returned object round-trips a Foundry `update()` into the structure's `zones`
 * array without validation churn. Kept Foundry-free so the
 * {@link sohl.entity.body.BodyZone} editor can seed a valid blank without a live
 * DataModel.
 *
 * The default `probWeight` of `0` makes the new zone **unrollable** until the
 * author gives it weight — a blank zone never silently steals zone numbers from
 * its neighbours.
 *
 * @param name - The display name for the new zone (defaults to `"Body Zone"`).
 * @param shortcode - The zone's shortcode (defaults to blank; assigned by the
 *   caller's add flow).
 * @returns A fully-populated {@link BodyZone.Data} with default values.
 */
export function blankBodyZone(
    name: string = "Body Zone",
    shortcode: string = "",
): BodyZone.Data {
    return {
        shortcode,
        name,
        probWeight: 0,
    };
}
