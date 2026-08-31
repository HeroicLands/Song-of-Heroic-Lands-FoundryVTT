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

import { describe, it, expect } from "vitest";
import { armorFacingFor, type ArmorLayer } from "@src/entity/body/armor-aggregation";
import { ARMOR_FACING } from "@src/utils/constants";

/** A cloak: shoulders and arms all round, torso and legs from behind only. */
function cloak(): ArmorLayer {
    return {
        material: "Cloth",
        protection: { blunt: 4, edged: 8, piercing: 5, fire: 5 },
        flexibleLocations: ["lshldloc", "rshldloc", "thrxloc", "abdmnloc", "plvisloc"],
        rigidLocations: [],
        facing: [
            { location: "thrxloc", side: ARMOR_FACING.BACK },
            { location: "abdmnloc", side: ARMOR_FACING.BACK },
            { location: "plvisloc", side: ARMOR_FACING.BACK },
        ],
    };
}

/** A breastplate: the mirror case — front only. */
function breastplate(): ArmorLayer {
    return {
        material: "Plate",
        protection: { blunt: 9, edged: 11, piercing: 10, fire: 7 },
        flexibleLocations: [],
        rigidLocations: ["thrxloc", "abdmnloc"],
        facing: [
            { location: "thrxloc", side: ARMOR_FACING.FRONT },
            { location: "abdmnloc", side: ARMOR_FACING.FRONT },
        ],
    };
}

describe("armorFacingFor", () => {
    it("reports ALL for a location with no facing entry", () => {
        expect(armorFacingFor(cloak(), "lshldloc")).toBe(ARMOR_FACING.ALL);
    });

    it("reports BACK for a cloak's torso", () => {
        expect(armorFacingFor(cloak(), "thrxloc")).toBe(ARMOR_FACING.BACK);
        expect(armorFacingFor(cloak(), "plvisloc")).toBe(ARMOR_FACING.BACK);
    });

    it("reports FRONT for a breastplate's torso", () => {
        expect(armorFacingFor(breastplate(), "thrxloc")).toBe(ARMOR_FACING.FRONT);
    });

    it("reports ALL for a layer with no facing data at all", () => {
        const plain: ArmorLayer = {
            material: "Mail",
            protection: { blunt: 6, edged: 9, piercing: 7, fire: 5 },
            flexibleLocations: ["thrxloc"],
            rigidLocations: [],
        };
        expect(armorFacingFor(plain, "thrxloc")).toBe(ARMOR_FACING.ALL);
    });

    it("reports ALL for a location the layer does not cover", () => {
        // Facing describes covered locations; an uncovered one is not
        // "protected from all sides", but the helper answers about the
        // entry, and absence of an entry is ALL. Callers gate on coverage.
        expect(armorFacingFor(cloak(), "skullloc")).toBe(ARMOR_FACING.ALL);
    });
});
