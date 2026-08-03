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
 * Render the real item property templates in Node (no Foundry) and assert the
 * HTML the shortcode-reference field widget (#974) emits: a `<select>` of
 * candidate items when the item is embedded on an actor, and the free-text
 * fallback otherwise. Uses the shared render harness ({@link renderTemplateReal}),
 * which registers the `shortcodeRefField` partial via `registerPureHandlebarsHelpers`.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const ITEM = "systems/sohl/templates/item";
const APPS = "systems/sohl/templates/apps";

/** Options as a sheet would build them, including a dangling flagged entry. */
const SKILL_OPTIONS = [
    { value: "acr", label: "Acrobatics" },
    { value: "clm", label: "Climbing" },
    { value: "ghost", label: "ghost (unresolved)", unresolved: true },
];

describe("shortcode-ref field — skill parentSkillCode", () => {
    it("renders a <select> of the actor's skills when embedded", () => {
        const html = renderTemplateReal(`${ITEM}/skill-properties.hbs`, {
            embedded: true,
            parentSkillCodeOptions: SKILL_OPTIONS,
            system: { parentSkillCode: "ghost", subType: "craft" },
            fields: {},
            tab: {},
        });
        expect(html).toContain('<select name="system.parentSkillCode"');
        expect(html).toContain('<option value="acr"');
        expect(html).toContain("Acrobatics");
        // The stored-but-unmatched shortcode is preserved, selected, and flagged.
        expect(html).toContain("selected>ghost (unresolved)</option>");
        // A blank "(none)" option lets the author clear the reference.
        expect(html).toContain('<option value="">None</option>');
    });

    it("falls back to the free-text formGroup off-actor", () => {
        const html = renderTemplateReal(`${ITEM}/skill-properties.hbs`, {
            embedded: false,
            parentSkillCodeOptions: [],
            system: { parentSkillCode: "acr", subType: "craft" },
            fields: {
                parentSkillCode: { fieldPath: "system.parentSkillCode" },
            },
            tab: {},
        });
        expect(html).not.toContain('<select name="system.parentSkillCode"');
        expect(html).toContain('data-field="system.parentSkillCode"');
    });
});

describe("shortcode-ref field — mystery assocSkillCode", () => {
    it("renders a <select> of the actor's skills when embedded", () => {
        const html = renderTemplateReal(`${ITEM}/mystery-properties.hbs`, {
            embedded: true,
            assocSkillCodeOptions: SKILL_OPTIONS,
            system: { assocSkillCode: "acr" },
            fields: {},
            tab: {},
        });
        expect(html).toContain('<select name="system.assocSkillCode"');
        expect(html).toContain("selected>Acrobatics</option>");
    });
});

describe("shortcode-ref field — strike-mode assocSkillCode (no DataModel field)", () => {
    it("renders a <select> when the weapon/technique is embedded", () => {
        const html = renderTemplateReal(`${APPS}/strike-mode-config.hbs`, {
            embedded: true,
            assocSkillCodeOptions: SKILL_OPTIONS,
            sm: { assocSkillCode: "clm", type: "melee" },
            isMelee: true,
        });
        expect(html).toContain('<select name="assocSkillCode"');
        expect(html).toContain("selected>Climbing</option>");
    });

    it("falls back to a plain text input off-actor", () => {
        const html = renderTemplateReal(`${APPS}/strike-mode-config.hbs`, {
            embedded: false,
            assocSkillCodeOptions: [],
            sm: { assocSkillCode: "clm", type: "melee" },
            isMelee: true,
        });
        expect(html).not.toContain('<select name="assocSkillCode"');
        expect(html).toContain('<input type="text" name="assocSkillCode"');
        expect(html).toContain('value="clm"');
    });
});
