/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render real SoHL card + dialog templates in Node (no Foundry) and assert the
 * emitted HTML — the output of the card/dialog-building actions. Uses the shared
 * render harness ({@link renderTemplateReal}), which registers the same pure
 * helpers production does (via `registerPureHandlebarsHelpers`) plus faithful
 * Foundry logic/option-list helpers and placeholder stubs for the DOM builders.
 */

import { describe, it, expect } from "vitest";
import Handlebars from "handlebars";
import {
    renderTemplateReal,
    registerTestHbsHelpers,
} from "@tests/mocks/hbs-helpers";

const CHAT = "systems/sohl/templates/chat";
const DIALOG = "systems/sohl/templates/dialog";

describe("treatment cards (TraumaLogic.requestTreatment / performTreatmentTest)", () => {
    it("treatment-request-card binds patient + wound + aspect/severity", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-request-card.hbs`, {
            patientName: "Aldric",
            woundName: "gash on the thorax",
            aspect: "edged",
            severity: 4,
        });
        expect(html).toContain("Treatment Requested");
        expect(html).toContain("Aldric");
        expect(html).toContain("gash on the thorax");
        expect(html).toContain("edged");
    });

    it("treatment-result-card shows the physician + a numeric Healing Rate", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "edged",
            severity: 4,
            treatment: "SUR",
            hr: 4,
        });
        expect(html).toContain("Brother Cede");
        expect(html).toContain("H4"); // Heal Rate H{{hr}}
        expect(html).toContain("Treatment Result");
    });

    it("treatment-result-card renders `Healed` for a heal result (the `lt hr 0` branch)", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "blunt",
            severity: 1,
            hr: -1,
        });
        expect(html).toContain("Healed");
    });
});

describe("other action cards render with their logic helpers", () => {
    it("shock-card (`gt`) binds state + index computation", () => {
        const html = renderTemplateReal(`${CHAT}/shock-card.hbs`, {
            title: "Shock Test",
            shockText: "Incapacitated",
            shockML: 40,
            finalShockIndex: 7,
            origShockIndex: 5,
        });
        expect(html).toContain("Shock Test");
        expect(html).toContain("Incapacitated");
    });

    it("attack-result-card (`or`, `gt`, `toJSON`) binds attacker/defender + result", () => {
        const html = renderTemplateReal(`${CHAT}/attack-result-card.hbs`, {
            title: "Attack Result",
            attacker: "Aldric",
            defender: "Bandit",
            resultDesc: "A telling blow",
            outnumbered: true,
        });
        expect(html).toContain("Attack Result");
        expect(html).toContain("A telling blow");
    });
});

describe("dialogs render through the same shim as cards", () => {
    it("injury-dialog builds real <option> lists (selectOptions) + plain inputs", () => {
        const html = renderTemplateReal(`${DIALOG}/injury-dialog.hbs`, {
            hitLocations: [
                { code: "th", name: "Thorax" },
                { code: "hd", name: "Head" },
            ],
            location: "th",
            aspect: "",
            aspectChoices: ["blunt", "edged", "piercing"],
            armorReduction: 0,
        });
        expect(html).toContain('<option value="th" selected>Thorax</option>');
        expect(html).toContain('<option value="hd">Head</option>');
        expect(html).toContain('name="armorReduction"');
    });

    it("treat-injury-dialog (my Healing Rate input) renders bound", () => {
        const html = renderTemplateReal(`${DIALOG}/treat-injury-dialog.hbs`, {
            healingRate: 3,
        });
        expect(html).toContain('name="healingRate"');
        expect(html).toContain('value="3"');
    });
});

describe("trauma-state-card (Fear / Morale / Pall tests, #558)", () => {
    it("shows the resulting state, a PSY gain, and effect notes", () => {
        const html = renderTemplateReal(`${CHAT}/trauma-state-card.hbs`, {
            actorId: "abc",
            actorName: "Brigga",
            title: "Fear Test",
            stateLabel: "Terrified",
            isSuccess: false,
            psyGain: 1,
            notes: [
                "May respond in combat only with Block or Dodge.",
                "Must flee the source at full Move on the next turn.",
            ],
        });
        expect(html).toContain("Fear Test");
        expect(html).toContain("Brigga");
        expect(html).toContain("Terrified");
        expect(html).toContain("failure-text");
        expect(html).toContain("Gains +1 Psyche Stress.");
        expect(html).toContain("Block or Dodge");
        expect(html).toContain("full Move");
        expect(html).toContain('data-actor-id="abc"');
    });

    it("omits the PSY line and marks a success when there is no stress gain", () => {
        const html = renderTemplateReal(`${CHAT}/trauma-state-card.hbs`, {
            actorId: "abc",
            actorName: "Brigga",
            title: "Fear Test",
            stateLabel: "Brave",
            isSuccess: true,
            psyGain: 0,
            notes: ["Brave — immune to this source."],
        });
        expect(html).toContain("Brave");
        expect(html).toContain("success-text");
        expect(html).not.toContain("Psyche Stress");
    });
});

describe("harness fidelity notes", () => {
    it("formGroup (sheet-tier) renders a binding placeholder, not Foundry markup", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(
            `{{formGroup fields.origin value=source.origin name="system.origin" disabled=true}}`,
        );
        const html = tpl({
            fields: { origin: { fieldPath: "system.origin" } },
            source: { origin: "a wound" },
        });
        expect(html).toContain('data-helper="formGroup"');
        expect(html).toContain('data-field="system.origin"');
        expect(html).toContain('data-value="a wound"');
        expect(html).toContain("data-disabled");
    });

    it("localize resolves against the real lang/en.json", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(`{{localize "SOHL.Clear"}}`);
        expect(tpl({})).not.toBe("");
    });
});
