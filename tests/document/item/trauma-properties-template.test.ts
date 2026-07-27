/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real Trauma properties sheet template in Node and assert the
 * emitted binding placeholders. Covers #754: the Sub-type control
 * (`system.subType`) must pass `localize=true` so its choices map — whose
 * labels are i18n keys (`SOHL.Trauma.SubType.physical`) — renders the localized
 * label ("Injury") rather than the raw key. Parallels the Skill sheet Combat
 * Category fix (#751).
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

describe("trauma properties sheet template (#754)", () => {
    it("renders the Sub-type control bound to system.subType", () => {
        const html = render("physical");
        expect(html).toContain('data-field="system.subType"');
        expect(html).toContain('data-value="physical"');
    });

    it("localizes the Sub-type choice labels (#754)", () => {
        // The choices map uses i18n keys as labels; without localize=true the
        // select renders "SOHL.Trauma.SubType.physical" instead of "Injury".
        const html = render("physical");
        const control = html.slice(html.indexOf('data-field="system.subType"'));
        expect(control).toContain("data-localize");
    });
});
