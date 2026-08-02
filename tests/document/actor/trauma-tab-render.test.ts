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

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { buildInjurySections } from "@src/document/actor/logic/being-sheet-view";
import { TRAUMA_SUBTYPE } from "@src/utils/constants";

const TEMPLATE = "systems/sohl/templates/actor/being/trauma.hbs";

/** One TraumaLike input; overrides fill the sub-type-specific fields (#939). */
function traumaLike(over: Record<string, unknown> = {}) {
    return {
        id: "t1",
        uuid: "Item.t1",
        name: "Sample",
        img: "icons/x.svg",
        subType: TRAUMA_SUBTYPE.INJURY as string | undefined,
        level: 2,
        severityDeltaLabel: "",
        healingRate: 5,
        healingRateDisabled: false,
        healingRateDeltaLabel: "",
        isTreated: false,
        isBleeding: false,
        aspect: "edged",
        area: "Left Forearm" as string | undefined,
        categoryDisplay: "",
        nextTest: "—",
        notes: "",
        ...over,
    };
}

/** Render the Trauma tab from injury sections built for the given traumas. */
function render(traumas: ReturnType<typeof traumaLike>[]) {
    const sections = buildInjurySections(
        traumas,
        Object.values(TRAUMA_SUBTYPE),
        (s) => s, // subtype label = key (readable enough for assertions)
        (a) => a, // aspect label passthrough
    );
    return renderTemplateReal(TEMPLATE, {
        injurySections: sections,
        afflictionGroups: [],
    });
}

describe("Being Trauma tab — per-sub-type columns (#939)", () => {
    it("renders an Injury with Sev / HR / Area / Next Heal Test, not Aspect / Bld", () => {
        const html = render([
            traumaLike({
                subType: TRAUMA_SUBTYPE.INJURY,
                name: "Gash",
                level: 3,
                nextTest: "in 4 days",
            }),
        ]);
        expect(html).toContain(">Sev<");
        expect(html).toContain(">HR<");
        expect(html).toContain(">Area<");
        expect(html).toContain("Next Heal Test");
        // Severity band + area + next-test values render.
        expect(html).toContain("S3");
        expect(html).toContain("Left Forearm");
        expect(html).toContain("in 4 days");
        // Injury no longer carries Aspect or Bleeding columns on the sheet.
        expect(html).not.toContain(">Aspect<");
        expect(html).not.toContain(">Bld<");
    });

    it("renders a Fatigue with Category / FL / Notes only", () => {
        const html = render([
            traumaLike({
                subType: TRAUMA_SUBTYPE.FATIGUE,
                name: "Winded",
                level: 4,
                categoryDisplay: "Weariness",
                notes: "short of breath",
            }),
        ]);
        expect(html).toContain(">Category<");
        expect(html).toContain(">FL<");
        expect(html).toContain(">Notes<");
        expect(html).toContain("Weariness");
        expect(html).toContain("short of breath");
        // FL renders the numeric level (4), not a severity band (would be "G4").
        expect(html.replace(/\s+/g, " ")).toContain('UP">4</div>');
        expect(html).not.toContain("G4");
        expect(html).not.toContain(">Sev<");
        expect(html).not.toContain(">Area<");
    });

    it("renders Shock/Coma with HR / Next Course Test", () => {
        const html = render([
            traumaLike({
                subType: TRAUMA_SUBTYPE.SHOCK,
                name: "Extended Shock",
                nextTest: "in 4 hours",
            }),
        ]);
        expect(html).toContain(">HR<");
        expect(html).toContain("Next Course Test");
        expect(html).toContain("in 4 hours");
        expect(html).not.toContain(">Sev<");
    });

    it("shows the FL header tooltip spelling out the abbreviation", () => {
        const html = render([
            traumaLike({ subType: TRAUMA_SUBTYPE.FATIGUE, level: 1 }),
        ]);
        expect(html).toContain('data-tooltip="Fatigue Level"');
    });

    it("omits a sub-type section that has no traumas", () => {
        const html = render([traumaLike({ subType: TRAUMA_SUBTYPE.INJURY })]);
        // Only the Injury section renders; no Pall/Fatigue headers appear.
        expect(html).not.toContain("Next Pall Recovery");
        expect(html).not.toContain(">FL<");
    });
});
