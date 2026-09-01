/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Armor Gear properties sheet template in Node and assert the
 * emitted binding placeholders. Covers #1133: the four `system.protectionBase.*`
 * aspects and `system.encumbrance` feed play directly (armor protection folded
 * onto every covered body location, and the wearer's encumbrance) but had no
 * editor at all, so armor built on the sheet always protected for 0/0/0/0.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const ARMOR_PROPS = "systems/sohl/templates/item/armorgear-properties.hbs";

const ASPECTS = ["blunt", "edged", "piercing", "fire"] as const;

/** Build the sheet render context the way `ArmorGearSheet` does. */
function render(
    overrides: {
        protectionBase?: Record<string, number>;
        encumbrance?: number;
    } = {},
): string {
    const protectionBase = overrides.protectionBase ?? {
        blunt: 4,
        edged: 5,
        piercing: 3,
        fire: 2,
    };
    const encumbrance = overrides.encumbrance ?? 6;
    return renderTemplateReal(ARMOR_PROPS, {
        tab: { active: true, group: "sheet" },
        system: {
            quantity: 1,
            weightBase: 10,
            valueBase: 50,
            isCarried: true,
            isWorn: true,
            qualityBase: 0,
            durabilityBase: 8,
            material: "steel",
            locations: { flexible: [], rigid: [] },
            protectionBase,
            encumbrance,
            sharedWithCohortIds: [],
        },
        locations: { flexible: [], rigid: [] },
        cohortChoices: {},
        fields: {
            quantity: { fieldPath: "system.quantity" },
            weightBase: { fieldPath: "system.weightBase" },
            valueBase: { fieldPath: "system.valueBase" },
            isCarried: { fieldPath: "system.isCarried" },
            isWorn: { fieldPath: "system.isWorn" },
            qualityBase: { fieldPath: "system.qualityBase" },
            durabilityBase: { fieldPath: "system.durabilityBase" },
            material: { fieldPath: "system.material" },
            sharedWithCohortIds: { fieldPath: "system.sharedWithCohortIds" },
            encumbrance: { fieldPath: "system.encumbrance" },
            protectionBase: {
                fields: Object.fromEntries(
                    ASPECTS.map((a) => [a, { fieldPath: `system.protectionBase.${a}` }]),
                ),
            },
        },
    });
}

describe("armor gear properties sheet template (#1133)", () => {
    it.each(ASPECTS)("renders a %s protection input bound to system.protectionBase", (aspect) => {
        const html = render();
        expect(html).toContain(`data-field="system.protectionBase.${aspect}"`);
    });

    it("binds each protection input to its stored value", () => {
        const html = render({
            protectionBase: { blunt: 4, edged: 5, piercing: 3, fire: 2 },
        });
        for (const [aspect, value] of [
            ["blunt", 4],
            ["edged", 5],
            ["piercing", 3],
            ["fire", 2],
        ] as const) {
            // The placeholder surfaces field + value together only when the
            // binding is correct, so match the pair rather than either alone.
            expect(html).toContain(
                `data-field="system.protectionBase.${aspect}" data-value="${value}"`,
            );
        }
    });

    it("renders an encumbrance input bound to system.encumbrance", () => {
        const html = render({ encumbrance: 6 });
        expect(html).toContain('data-field="system.encumbrance" data-value="6"');
    });

    it("labels the protection section so the controls are findable", () => {
        const html = render();
        expect(html).toContain("Protection");
    });
});
