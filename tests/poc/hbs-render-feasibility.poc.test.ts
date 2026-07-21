/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * FEASIBILITY POC (chore/test-handlebars-helpers): can we render real SoHL
 * templates in Node and review the HTML for correctness? Renders two real chat
 * cards (which use only trivial Foundry logic helpers) and demonstrates the
 * `formGroup` placeholder stub for the sheet path.
 */

import { describe, it, expect } from "vitest";
import Handlebars from "handlebars";
import {
    renderTemplateReal,
    registerTestHbsHelpers,
} from "@tests/mocks/hbs-helpers";

describe("POC: render real chat cards in Node (no Foundry)", () => {
    it("renders shock-card.hbs — a `gt` conditional and data bind resolve", () => {
        const html = renderTemplateReal(
            "systems/sohl/templates/chat/shock-card.hbs",
            {
                title: "Shock Test",
                shockText: "Incapacitated",
                finalShockIndex: 7,
                origShockIndex: 5,
                shockML: 40,
            },
        );
        expect(html).toContain("Shock Test");
        expect(html).toContain("Incapacitated");
        // The template rendered as real HTML (not an empty stub).
        expect(html.length).toBeGreaterThan(50);
    });

    it("renders attack-result-card.hbs — `or`, `gt`, and `toJSON` all resolve", () => {
        const html = renderTemplateReal(
            "systems/sohl/templates/chat/attack-result-card.hbs",
            {
                title: "Attack Result",
                attacker: "Aldric",
                defender: "Bandit",
                resultDesc: "A telling blow",
                outnumbered: true,
                numAtkTA: 2,
            },
        );
        expect(html).toContain("Attack Result");
        expect(html).toContain("A telling blow");
    });
});

describe("POC: dialogs render through the same shims as cards", () => {
    it("renders injury-dialog.hbs — real <option> lists from selectOptions + a plain input", () => {
        const html = renderTemplateReal(
            "systems/sohl/templates/dialog/injury-dialog.hbs",
            {
                hitLocations: [
                    { code: "th", name: "Thorax" },
                    { code: "hd", name: "Head" },
                ],
                location: "th",
                aspect: "",
                aspectChoices: ["blunt", "edged", "piercing"],
                armorReduction: 0,
            },
        );
        // selectOptions built the real option list (the dialog's actual content).
        expect(html).toContain('<option value="th" selected>Thorax</option>');
        expect(html).toContain('<option value="hd">Head</option>');
        // the aspect <select> options rendered too, and plain inputs survive.
        expect(html).toContain('name="aspect"');
        expect(html).toContain('name="armorReduction"');
    });
});

describe("POC: the sheet path — formGroup placeholder stub", () => {
    it("surfaces the field name + value + disabled binding for assertions", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(
            `{{formGroup fields.origin value=source.origin name="system.origin" disabled=true}}`,
        );
        const html = tpl({
            fields: { origin: { fieldPath: "system.origin" } },
            source: { origin: "a wound" },
        });
        // Not Foundry's exact form markup — but every binding a unit test needs.
        expect(html).toContain('data-helper="formGroup"');
        expect(html).toContain('data-field="system.origin"');
        expect(html).toContain('data-value="a wound"');
        expect(html).toContain("data-disabled");
    });

    it("localize resolves against the real lang/en.json", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(`{{localize "SOHL.Clear"}}`);
        // Whatever en.json says for the key — proving real labels render.
        expect(tpl({})).not.toBe("");
    });
});
