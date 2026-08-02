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

const TRAUMA_PROPS = "systems/sohl/templates/item/trauma-properties.hbs";

function render(subType: string): string {
    return renderTemplateReal(TRAUMA_PROPS, {
        tab: { active: true, group: "sheet" },
        system: {
            subType,
            levelBase: 0,
            healingRateBase: 0,
            aspect: "edged",
            bodyLocationCode: "",
            treatmentDate: null,
            bloodLossAdvanceDurationBase: null,
        },
        fields: {
            subType: { fieldPath: "system.subType" },
            levelBase: { fieldPath: "system.levelBase" },
            healingRateBase: { fieldPath: "system.healingRateBase" },
            aspect: { fieldPath: "system.aspect" },
            bodyLocationCode: { fieldPath: "system.bodyLocationCode" },
            bloodLossAdvanceDurationBase: {
                fieldPath: "system.bloodLossAdvanceDurationBase",
            },
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
