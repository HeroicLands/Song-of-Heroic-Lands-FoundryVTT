/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Mystical Ability properties sheet template in Node and assert
 * the emitted binding placeholders. Covers #815: the phantom
 * `system.domainCode` control (no such schema field — the Domain-registry
 * integration is incomplete) and the phantom `system.isImprovable` control (a
 * mis-named duplicate of the existing `improveFlag`) must both be gone, while
 * the real `system.improveFlag` control still renders. Also covers #973: the
 * dead `system.skillBaseFormula` control (a Mystical Ability has no Skill Base —
 * its rolled value derives from `masteryLevelBase`) must be gone too.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const MYSTABL_PROPS =
    "systems/sohl/templates/item/mysticalability-properties.hbs";

function render(): string {
    return renderTemplateReal(MYSTABL_PROPS, {
        tab: { active: true, group: "sheet" },
        system: {
            skillBaseFormula: "@str",
            masteryLevelBase: 0,
            improveFlag: false,
            // Provided so any surviving phantom control would bind and render —
            // proving the controls are gone by their absence from the output.
            isImprovable: true,
            domainCode: "arcane",
            assocSkillCode: "dodge",
            levelBase: 3,
            charges: { usesCharges: false, value: null, max: null },
        },
        fields: {
            skillBaseFormula: { fieldPath: "system.skillBaseFormula" },
            masteryLevelBase: { fieldPath: "system.masteryLevelBase" },
            improveFlag: { fieldPath: "system.improveFlag" },
            isImprovable: { fieldPath: "system.isImprovable" },
            domainCode: { fieldPath: "system.domainCode" },
            assocSkillCode: { fieldPath: "system.assocSkillCode" },
            levelBase: { fieldPath: "system.levelBase" },
            charges: {
                fields: {
                    usesCharges: { fieldPath: "system.charges.usesCharges" },
                    value: { fieldPath: "system.charges.value" },
                    max: { fieldPath: "system.charges.max" },
                },
            },
        },
    });
}

describe("mystical ability properties sheet template (#815)", () => {
    it("no longer references the phantom system.domainCode field", () => {
        const html = render();
        expect(html).not.toContain("system.domainCode");
        expect(html).not.toContain('data-field="system.domainCode"');
    });

    it("no longer references the phantom system.isImprovable field", () => {
        const html = render();
        expect(html).not.toContain("system.isImprovable");
        expect(html).not.toContain('data-field="system.isImprovable"');
    });

    it("no longer references the dead system.skillBaseFormula field (#973)", () => {
        const html = render();
        expect(html).not.toContain("system.skillBaseFormula");
        expect(html).not.toContain('data-field="system.skillBaseFormula"');
    });

    it("still renders the real improveFlag control", () => {
        const html = render();
        expect(html).toContain('data-field="system.improveFlag"');
    });

    it("renders the associated-skill control bound to system.assocSkillCode", () => {
        const html = render();
        expect(html).toContain('data-field="system.assocSkillCode"');
        expect(html).toContain('data-value="dodge"');
    });

    it("still renders the charges controls", () => {
        const html = render();
        expect(html).toContain('data-field="system.charges.max"');
    });
});
