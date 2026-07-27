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
 * longer be referenced.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const SKILL_PROPS = "systems/sohl/templates/item/skill-properties.hbs";

function render(subType: string): string {
    return renderTemplateReal(SKILL_PROPS, {
        tab: { active: true, group: "sheet" },
        system: {
            skillBaseFormula: "@str",
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
