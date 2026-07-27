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

const COMBAT = "systems/sohl/templates/actor/being/combat.hbs";
const SKILLS = "systems/sohl/templates/actor/being/skills.hbs";

// A single melee strike-mode row whose four value modifiers each carry a
// distinct `deltaLabel` so the rendered tooltips are unambiguous.
const meleeStrikeModes = [
    {
        weapon: { name: "Dagger", id: "w1" },
        strikeModes: [
            {
                name: "Thrust",
                shortcode: "thst",
                heft: { effective: 0 },
                reach: { effective: 1 },
                spread: { effective: 2 },
                impact: {
                    disabled: "",
                    label: "5",
                    deltaLabel: "IMP STR +2",
                },
                attack: {
                    disabled: "",
                    effective: 45,
                    deltaLabel: "ATK STR +2",
                },
                defense: {
                    block: {
                        disabled: "",
                        effective: 40,
                        deltaLabel: "BLK +1",
                    },
                    counterstrike: {
                        disabled: "",
                        effective: 42,
                        deltaLabel: "CX +3",
                    },
                },
            },
        ],
    },
];

const missileStrikeModes = [
    {
        weapon: { name: "Bow", id: "w2" },
        strikeModes: [
            {
                name: "Shoot",
                shortcode: "shot",
                draw: { effective: 3 },
                baseRange: { effective: 30 },
                maxVolleyMult: 2,
                impact: {
                    disabled: "",
                    label: "6",
                    deltaLabel: "IMP DEX +1",
                },
                attack: {
                    disabled: "",
                    effective: 50,
                    deltaLabel: "ATK DEX +1",
                },
            },
        ],
    },
];

describe("combat.hbs strike-mode value tooltips (#769)", () => {
    it("binds each melee value cell's tooltip to the modifier deltaLabel", () => {
        const html = renderTemplateReal(COMBAT, { meleeStrikeModes });
        expect(html).toContain('data-tooltip="IMP STR +2"');
        expect(html).toContain('data-tooltip="ATK STR +2"');
        expect(html).toContain('data-tooltip="BLK +1"');
        expect(html).toContain('data-tooltip="CX +3"');
    });

    it("positions the melee value tooltips above the row (direction UP)", () => {
        const html = renderTemplateReal(COMBAT, { meleeStrikeModes });
        // Every value cell that carries a tooltip also declares UP so the
        // tooltip renders above the row rather than overlapping it (#769).
        const cells = html.match(/<div\b[^>]*\bdata-tooltip=[^>]*>/g) ?? [];
        const valueCells = cells.filter((c) => c.includes("rollStrikeMode"));
        expect(valueCells.length).toBeGreaterThan(0);
        for (const cell of valueCells) {
            expect(cell).toContain('data-tooltip-direction="UP"');
        }
    });

    it("binds each missile value cell's tooltip to the modifier deltaLabel", () => {
        const html = renderTemplateReal(COMBAT, { missileStrikeModes });
        expect(html).toContain('data-tooltip="IMP DEX +1"');
        expect(html).toContain('data-tooltip="ATK DEX +1"');
    });
});

describe("skills.hbs EML/Fate value tooltips (#769)", () => {
    const skillGroups = [
        {
            subType: "social",
            label: "Social",
            skills: [
                {
                    id: "s1",
                    uuid: "Item.s1",
                    name: "Climbing",
                    img: "icons/skill.svg",
                    sb: 5,
                    ml: 40,
                    index: 4,
                    eml: 42,
                    fate: 50,
                    emlDeltaLabel: "STR +2, ARM ×2",
                    fateDeltaLabel: "FATE +5",
                    disabled: false,
                    canImprove: false,
                    improveFlag: false,
                    notes: "",
                },
            ],
        },
    ];

    it("binds the EML and Fate cell tooltips to the modifier deltaLabel", () => {
        const html = renderTemplateReal(SKILLS, { skillGroups });
        expect(html).toContain('data-tooltip="STR +2, ARM ×2"');
        expect(html).toContain('data-tooltip="FATE +5"');
    });

    it("positions the EML and Fate tooltips above the row (direction UP)", () => {
        const html = renderTemplateReal(SKILLS, { skillGroups });
        const cells = html.match(/<div\b[^>]*\bdata-tooltip=[^>]*>/g) ?? [];
        const valueCells = cells.filter(
            (c) => c.includes("successTest") || c.includes("fateTest"),
        );
        expect(valueCells.length).toBe(2);
        for (const cell of valueCells) {
            expect(cell).toContain('data-tooltip-direction="UP"');
        }
    });
});
