/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Trauma properties sheet template in Node and assert the
 * emitted binding placeholders. Covers #926: a document's sub-type is fixed at
 * creation, so the Trauma Properties tab must NOT render an editable
 * `system.subType` control. The sub-type is presented read-only in the sheet
 * header (via the localized `typeLabel`); this template only edits the mutable
 * trauma fields. (Supersedes #754, which localized the now-removed dropdown's
 * choice labels.)
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { traumaSheetFields } from "@src/document/item/logic/trauma-sheet-view";

const TRAUMA_PROPS = "systems/sohl/templates/item/trauma-properties.hbs";

const fieldStub = (name: string) => ({ fieldPath: `system.${name}` });

function render(subType: string): string {
    return renderTemplateReal(TRAUMA_PROPS, {
        tab: { active: true, group: "sheet" },
        // The per-sub-type field-visibility flags the sheet computes (#939).
        ...traumaSheetFields(subType),
        categoryChoices: {},
        nextTestDisplay: "—",
        system: {
            subType,
            levelBase: 0,
            healingRateBase: 0,
            category: "",
            notes: "",
            aspect: "edged",
            bodyLocationCode: "",
            contractDate: null,
            treatmentDate: null,
            bloodLossAdvanceDurationBase: null,
            healingCheckDurationFormula: "",
            healingCheckDurationBase: 0,
            courseDurationFormula: "",
            courseDurationBase: 0,
            infectable: false,
            permanentImpairmentEligible: false,
        },
        fields: {
            subType: fieldStub("subType"),
            levelBase: fieldStub("levelBase"),
            healingRateBase: fieldStub("healingRateBase"),
            aspect: fieldStub("aspect"),
            bodyLocationCode: fieldStub("bodyLocationCode"),
            bloodLossAdvanceDurationBase: fieldStub(
                "bloodLossAdvanceDurationBase",
            ),
            healingCheckDurationFormula: fieldStub(
                "healingCheckDurationFormula",
            ),
            healingCheckDurationBase: fieldStub("healingCheckDurationBase"),
            courseDurationFormula: fieldStub("courseDurationFormula"),
            courseDurationBase: fieldStub("courseDurationBase"),
            infectable: fieldStub("infectable"),
            permanentImpairmentEligible: fieldStub(
                "permanentImpairmentEligible",
            ),
        },
    });
}

describe("trauma properties sheet template (#926)", () => {
    it("does NOT render an editable sub-type control", () => {
        // Sub-type is immutable after creation, so the Properties tab must not
        // bind an editable control to system.subType (the header shows it
        // read-only via typeLabel).
        const html = render("injury");
        expect(html).not.toContain('data-field="system.subType"');
        expect(html).not.toContain('name="system.subType"');
    });

    it("still renders the mutable trauma fields", () => {
        const html = render("injury");
        expect(html).toContain('data-field="system.levelBase"');
        expect(html).toContain('data-field="system.healingRateBase"');
    });

    // #927: the Physical fieldset (aspect / body location / blood-loss) is gated
    // on the sub-type. The physical-harm sub-type is `injury` (there is no
    // `physical` value in TRAUMA_SUBTYPE), so the gate must render for `injury`.
    it("renders the Physical fieldset for the injury sub-type", () => {
        const html = render("injury");
        expect(html).toContain('data-field="system.aspect"');
        expect(html).toContain('data-field="system.bodyLocationCode"');
        expect(html).toContain(
            'data-field="system.bloodLossAdvanceDurationBase"',
        );
    });

    it("does NOT render the Physical fieldset for a non-injury sub-type", () => {
        const html = render("psycond");
        expect(html).not.toContain('data-field="system.aspect"');
        expect(html).not.toContain('data-field="system.bodyLocationCode"');
    });
});

describe("trauma properties sheet — per-sub-type fields (#939)", () => {
    it("injury: infection flags, heal duration, treatment date, next heal test", () => {
        const html = render("injury");
        expect(html).toContain('data-field="system.infectable"');
        expect(html).toContain(
            'data-field="system.permanentImpairmentEligible"',
        );
        expect(html).toContain(
            'data-field="system.healingCheckDurationFormula"',
        );
        expect(html).toContain('data-field="system.contractDate"');
        expect(html).toContain('data-field="system.treatmentDate"');
        expect(html).toContain("Next Heal Test");
        // No course-check fields on an injury.
        expect(html).not.toContain('data-field="system.courseDurationFormula"');
    });

    it("shock: healing rate + course duration + next course test, no level", () => {
        const html = render("shock");
        expect(html).toContain('data-field="system.healingRateBase"');
        expect(html).toContain('data-field="system.courseDurationFormula"');
        expect(html).toContain('data-field="system.courseDurationBase"');
        expect(html).toContain("Next Course Test");
        expect(html).not.toContain('data-field="system.levelBase"');
        expect(html).not.toContain(
            'data-field="system.healingCheckDurationFormula"',
        );
    });

    it("fatigue: category select + level + notes, no healing rate or next test", () => {
        const html = render("fatigue");
        expect(html).toContain('name="system.category"');
        expect(html).toContain('data-field="system.levelBase"');
        expect(html).toContain('name="system.notes"');
        expect(html).not.toContain('data-field="system.healingRateBase"');
        expect(html).not.toContain("data-trauma-next-test");
    });

    it("pall: level + next pall recovery, no category / notes", () => {
        const html = render("pall");
        expect(html).toContain('data-field="system.levelBase"');
        expect(html).toContain("Next Pall Recovery");
        expect(html).not.toContain('name="system.category"');
        expect(html).not.toContain('name="system.notes"');
    });
});
