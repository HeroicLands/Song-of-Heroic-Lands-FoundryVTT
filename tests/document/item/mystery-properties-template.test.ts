/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Mystery properties sheet template in Node and assert the
 * emitted binding placeholders. Covers #808: the phantom "Affected Skills"
 * array editor bound to a nonexistent `system.skills` field must be gone,
 * replaced by the single-skill control bound to the existing
 * `system.assocSkillCode` field. Also covers #815: the phantom
 * `system.domainCode` control (no such schema field) must be gone.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const MYSTERY_PROPS = "systems/sohl/templates/item/mystery-properties.hbs";

function render(assocSkillCode: string | null = null): string {
    return renderTemplateReal(MYSTERY_PROPS, {
        tab: { active: true, group: "sheet" },
        system: {
            subType: "grace",
            domainCode: "arcane",
            assocSkillCode,
            levelBase: 3,
            charges: { usesCharges: false, value: null, max: null },
        },
        fields: {
            // Provided so that any surviving domainCode control would bind and
            // render — proving the phantom control is gone by its absence.
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

describe("mystery properties sheet template (#808)", () => {
    it("no longer references the phantom system.skills array field", () => {
        const html = render();
        // The Affected-Skills array editor was bound to a field the schema
        // never defined, so it always rendered empty and could not persist.
        expect(html).not.toContain("system.skills");
        expect(html).not.toContain('data-array="system.skills"');
        expect(html).not.toContain("Affected Skills");
    });

    it("no longer references the phantom system.domainCode field (#815)", () => {
        const html = render();
        // MysteryDataModel defines no domainCode field; the Domain-registry
        // integration is incomplete, so this control could never bind.
        expect(html).not.toContain("system.domainCode");
        expect(html).not.toContain('data-field="system.domainCode"');
    });

    it("renders the associated-skill control bound to system.assocSkillCode", () => {
        const html = render("dodge");
        expect(html).toContain('data-field="system.assocSkillCode"');
        expect(html).toContain('data-value="dodge"');
    });

    it("still renders the charges controls", () => {
        const html = render();
        expect(html).toContain('data-field="system.charges.max"');
    });
});
