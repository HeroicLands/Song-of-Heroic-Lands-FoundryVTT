/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Skill properties sheet template in Node and assert the
 * emitted binding placeholders. Covers #709: the Combat Category control
 * (`system.combatCategory`) must render only when `subType === "combat"`, and
 * the removed phantom fields (`weaponGroup` / `baseSkill` / `domain`) must no
 * longer be referenced. Also covers #713: the Impaired By Roles array
 * (`system.impairedByRoles`) must render with add/delete controls, at parity
 * with the Attribute sheet.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const SKILL_PROPS = "systems/sohl/templates/item/skill-properties.hbs";

function render(subType: string, impairedByRoles: string[] = []): string {
    return renderTemplateReal(SKILL_PROPS, {
        tab: { active: true, group: "sheet" },
        impairedByRoles,
        system: {
            skillBaseFormula: "sb(attr.str)",
            masteryLevelBase: 0,
            improveFlag: false,
            subType,
            combatCategory: "melee",
        },
        fields: {
            skillBaseFormula: { fieldPath: "system.skillBaseFormula" },
            masteryLevelBase: { fieldPath: "system.masteryLevelBase" },
            improveFlag: { fieldPath: "system.improveFlag" },
            combatCategory: { fieldPath: "system.combatCategory" },
        },
    });
}

describe("skill properties sheet template (#709)", () => {
    it("renders the Combat Category control bound to system.combatCategory when subType is combat", () => {
        const html = render("combat");
        expect(html).toContain('data-field="system.combatCategory"');
        expect(html).toContain('data-value="melee"');
    });

    it("localizes the Combat Category choice labels (#751)", () => {
        // The choices map uses i18n keys as labels; without localize=true the
        // select renders "SOHL.Skill.Combat.melee" instead of "Melee".
        const html = render("combat");
        const control = html.slice(
            html.indexOf('data-field="system.combatCategory"'),
        );
        expect(control).toContain("data-localize");
    });

    it("omits the Combat Category control for non-combat subtypes", () => {
        const html = render("social");
        expect(html).not.toContain('data-field="system.combatCategory"');
    });

    it("no longer references the removed phantom fields", () => {
        const html = render("combat");
        // These were dead references to fields absent from the schema.
        expect(html).not.toContain("weaponGroup");
        expect(html).not.toContain("system.baseSkill");
        expect(html).not.toContain("system.domain");
    });
});

describe("skill properties sheet — Impaired By Roles (#713)", () => {
    it("renders the Impaired By Roles list with an Add control wired to the array editor", () => {
        const html = render("social");
        expect(html).toContain("Impaired By Roles");
        // Wired via ApplicationV2's delegated data-action dispatch (#734).
        expect(html).toContain('data-action="addArrayItem"');
        expect(html).toContain('data-array="system.impairedByRoles"');
    });

    it("renders a row per role with a delete control carrying its value", () => {
        const html = render("social", ["vital", "manipulator"]);
        expect(html).toContain('data-action="deleteArrayItem"');
        expect(html).toContain(
            'data-array="system.impairedByRoles" data-value="vital"',
        );
        expect(html).toContain(
            'data-array="system.impairedByRoles" data-value="manipulator"',
        );
    });

    it("renders an empty-state placeholder row when no roles are set", () => {
        const html = render("social", []);
        // No delete control is emitted for the empty state.
        expect(html).not.toContain(
            'data-array="system.impairedByRoles" data-value=',
        );
        // The Add control is still present so a role can be added.
        expect(html).toContain('data-action="addArrayItem"');
    });
});
