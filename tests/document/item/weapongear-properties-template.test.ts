/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Weapon Gear properties sheet template in Node and assert the
 * emitted binding placeholders. Covers #1179: the Encumbrance control bound its
 * `value=` to `system.encumbrance`, which `WeaponGearDataModel` does not define
 * (the schema field is `encumbranceBase`), so the input rendered blank and a
 * saved encumbrance never showed back on the sheet.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const WEAPON_PROPS = "systems/sohl/templates/item/weapongear-properties.hbs";

/** The gear fields the Properties tab edits, with the value each is bound to. */
const GEAR_FIELDS = [
    ["quantity", 2],
    ["weightBase", 12],
    ["valueBase", 40],
    ["qualityBase", 1],
    ["durabilityBase", 7],
    ["encumbranceBase", 3],
    ["heftBase", 5],
] as const;

/** Build the sheet render context the way `WeaponGearSheet` does. */
function render(overrides: Record<string, unknown> = {}): string {
    const system: Record<string, unknown> = {
        ...Object.fromEntries(GEAR_FIELDS),
        isCarried: true,
        sharedWithCohortIds: [],
        ...overrides,
    };
    const fieldNames = [...GEAR_FIELDS.map(([name]) => name), "isCarried", "sharedWithCohortIds"];
    return renderTemplateReal(WEAPON_PROPS, {
        tab: { active: true, group: "sheet" },
        system,
        cohortChoices: {},
        fields: Object.fromEntries(
            fieldNames.map((name) => [name, { fieldPath: `system.${name}` }]),
        ),
    });
}

describe("weapon gear properties sheet template (#1179)", () => {
    it("binds the encumbrance input to the stored system.encumbranceBase", () => {
        const html = render({ encumbranceBase: 3 });
        // The placeholder surfaces field + value together only when the binding
        // is correct, so match the pair rather than either alone.
        expect(html).toContain('data-field="system.encumbranceBase" data-value="3"');
    });

    it("does not bind any control to the nonexistent system.encumbrance", () => {
        expect(render()).not.toContain('data-field="system.encumbrance"');
    });

    it.each(GEAR_FIELDS)("binds the %s input to its stored value", (name, value) => {
        const html = render();
        expect(html).toContain(`data-field="system.${name}" data-value="${value}"`);
    });
});
