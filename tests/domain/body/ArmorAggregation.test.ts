/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    aggregateArmor,
    type ArmorLayer,
} from "@src/entity/body/armor-aggregation";

const SKULL_LOC = {
    shortcode: "skull",
    name: "Skull",
    bleedingSusceptibility: "medium",
    amputability: "none",
    shockValue: 5,
    probWeight: 10,
    protectionBase: { blunt: 1, edged: 1, piercing: 1, fire: 0 },
};

const CHEST_LOC = {
    shortcode: "chest",
    name: "Chest",
    bleedingSusceptibility: "low",
    amputability: "none",
    shockValue: 4,
    probWeight: 20,
    protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
};

const SAMPLE_DATA: BodyStructure.Data = {
    parts: [
        {
            shortcode: "head",
            roles: [],
            canHoldItem: false,
            heldItemId: null,
            probWeight: 15,
            locations: [SKULL_LOC],
        },
        {
            shortcode: "thorax",
            roles: [],
            canHoldItem: false,
            heldItemId: null,
            probWeight: 30,
            locations: [CHEST_LOC],
        },
    ],
    adjacent: [["head", "thorax"]],
} as any;

const MOCK_LINEAGE_LOGIC = {
    kind: "lineage",
    actor: null,
    data: { bodyStructure: SAMPLE_DATA },
} as any;

function makeBody(): BodyStructure {
    return new BodyStructure(SAMPLE_DATA, { parent: MOCK_LINEAGE_LOGIC });
}

function loc(body: BodyStructure, code: string) {
    return body.getAllLocations().find((l) => l.shortcode === code)!;
}

const mail = (locations: {
    flexible?: string[];
    rigid?: string[];
}): ArmorLayer => ({
    material: "Mail",
    protection: { blunt: 2, edged: 4, piercing: 3, fire: 0 },
    flexibleLocations: locations.flexible ?? [],
    rigidLocations: locations.rigid ?? [],
});

const cloth = (locations: {
    flexible?: string[];
    rigid?: string[];
}): ArmorLayer => ({
    material: "Cloth",
    protection: { blunt: 1, edged: 1, piercing: 1, fire: 1 },
    flexibleLocations: locations.flexible ?? [],
    rigidLocations: locations.rigid ?? [],
});

describe("aggregateArmor", () => {
    it("sums protection from a single covering armor onto the location", () => {
        const body = makeBody();
        aggregateArmor(body, [mail({ flexible: ["chest"] })]);
        const chest = loc(body, "chest");
        expect(chest.armorProtection).toEqual({
            blunt: 2,
            edged: 4,
            piercing: 3,
            fire: 0,
        });
    });

    it("sums protection from multiple layers and joins materials in order", () => {
        const body = makeBody();
        aggregateArmor(body, [
            cloth({ flexible: ["chest"] }),
            mail({ flexible: ["chest"] }),
        ]);
        const chest = loc(body, "chest");
        expect(chest.armorProtection).toEqual({
            blunt: 3,
            edged: 5,
            piercing: 4,
            fire: 1,
        });
        expect(chest.armorType).toBe("Cloth, Mail");
    });

    it("marks a location rigid only when covered by rigid armor", () => {
        const body = makeBody();
        aggregateArmor(body, [
            cloth({ flexible: ["chest"] }),
            mail({ rigid: ["skull"] }),
        ]);
        expect(loc(body, "chest").isRigid).toBe(false);
        expect(loc(body, "skull").isRigid).toBe(true);
    });

    it("leaves natural protectionBase untouched (armor is tracked separately)", () => {
        const body = makeBody();
        aggregateArmor(body, [mail({ flexible: ["skull"] })]);
        const skull = loc(body, "skull");
        expect(skull.protectionBase.edged.effective).toBe(1); // natural unchanged
        expect(skull.armorProtection.edged).toBe(4); // armor on top
    });

    it("does not double-count an armor that lists a location in both flex and rigid", () => {
        const body = makeBody();
        aggregateArmor(body, [mail({ flexible: ["chest"], rigid: ["chest"] })]);
        const chest = loc(body, "chest");
        expect(chest.armorProtection.edged).toBe(4); // counted once
        expect(chest.isRigid).toBe(true);
        expect(chest.armorType).toBe("Mail"); // material listed once
    });

    it("ignores coverage of unknown location shortcodes", () => {
        const body = makeBody();
        expect(() =>
            aggregateArmor(body, [mail({ flexible: ["nonexistent"] })]),
        ).not.toThrow();
        expect(loc(body, "chest").armorProtection.edged).toBe(0);
    });

    it("resets prior aggregation state when run again", () => {
        const body = makeBody();
        aggregateArmor(body, [mail({ rigid: ["chest"] })]);
        aggregateArmor(body, []); // second pass, no armor
        const chest = loc(body, "chest");
        expect(chest.armorProtection).toEqual({
            blunt: 0,
            edged: 0,
            piercing: 0,
            fire: 0,
        });
        expect(chest.isRigid).toBe(false);
        expect(chest.armorType).toBe("");
    });
});
