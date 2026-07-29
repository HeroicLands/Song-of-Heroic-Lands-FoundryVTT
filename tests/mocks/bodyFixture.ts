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
 * Builders for {@link sohl.entity.body.BodyStructure} test data in the flat
 * three-array shape (#780). Suites that need a body compose one from these
 * rather than hand-rolling nested literals, so a schema change lands in one
 * place.
 */

import { brandLogic } from "@tests/mocks/brandLogic";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import type { BodyZone } from "@src/entity/body/BodyZone";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyLocation } from "@src/entity/body/BodyLocation";

/**
 * Build a persisted zone.
 * @param shortcode - Unique zone code.
 * @param probWeight - Zone weight (how many zone numbers it claims).
 * @param overrides - Extra persisted fields to merge.
 * @returns Persisted zone data.
 */
export function zoneData(
    shortcode: string,
    probWeight: number,
    overrides: Partial<BodyZone.Data> = {},
): BodyZone.Data {
    return { shortcode, name: shortcode, probWeight, ...overrides };
}

/**
 * Build a persisted body part.
 * @param shortcode - Unique part code.
 * @param bodyZoneCode - Shortcode of the owning zone.
 * @param combatArea - Target area, doubling as the part's selection weight.
 * @param overrides - Extra persisted fields to merge.
 * @returns Persisted part data.
 */
export function partData(
    shortcode: string,
    bodyZoneCode: string,
    combatArea: number,
    overrides: Partial<BodyPart.Data> = {},
): BodyPart.Data {
    return {
        shortcode,
        name: shortcode,
        bodyZoneCode,
        roles: [],
        canHoldItem: false,
        heldItemId: null,
        combatArea,
        ...overrides,
    };
}

/**
 * Build a persisted hit location.
 * @param shortcode - Unique location code (unique body-wide).
 * @param bodyPartCode - Shortcode of the owning part.
 * @param probWeight - Selection weight within its part.
 * @param overrides - Extra persisted fields to merge.
 * @returns Persisted location data.
 */
export function locationData(
    shortcode: string,
    bodyPartCode: string,
    probWeight: number,
    overrides: Partial<BodyLocation.Data> = {},
): BodyLocation.Data {
    return {
        shortcode,
        name: shortcode,
        bodyPartCode,
        bleedingSusceptibility: "none",
        amputability: "none",
        shockValue: 0,
        probWeight,
        protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
        ...overrides,
    };
}

/**
 * A two-zone sample body: a `head` zone holding the `head` part (locations
 * `skull` / `face`), and a `body` zone holding the `thorax` part (location
 * `chest`). Zone weights are 1 and 2, so zone numbers run 1 and 2–3.
 *
 * @returns A fresh copy of the sample structure data.
 */
export function sampleBodyData(): BodyStructure.Data {
    return {
        zones: [zoneData("headzone", 1), zoneData("bodyzone", 2)],
        parts: [
            partData("head", "headzone", 15),
            partData("thorax", "bodyzone", 30),
        ],
        locations: [
            locationData("skull", "head", 10, {
                bleedingSusceptibility: "medium",
                shockValue: 3,
                protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
            }),
            locationData("face", "head", 5, { shockValue: 2 }),
            locationData("chest", "thorax", 20, {
                bleedingSusceptibility: "low",
                shockValue: 4,
                protectionBase: { blunt: 2, edged: 1, piercing: 1, fire: 0 },
            }),
        ],
    };
}

/**
 * Build the parent-logic options a body entity is constructed with, wiring the
 * canonical persisted data the update helpers read back.
 *
 * @param data - The persisted structure the parent logic reports.
 * @param actor - Optional mock actor (for held-item resolution).
 * @returns Construction options for {@link BodyStructure}.
 */
export function bodyOptions(
    data: BodyStructure.Data,
    actor: unknown = null,
): any {
    return {
        parent: brandLogic({
            kind: "corpus",
            actor,
            data: { body: { structure: data } },
        }),
    };
}

/**
 * Construct a live {@link BodyStructure} over the given persisted data.
 *
 * @param data - The persisted structure (defaults to {@link sampleBodyData}).
 * @param actor - Optional mock actor (for held-item resolution).
 * @returns The constructed structure entity.
 */
export function makeBody(
    data: BodyStructure.Data = sampleBodyData(),
    actor: unknown = null,
): BodyStructure {
    return new BodyStructure(data, bodyOptions(data, actor));
}
