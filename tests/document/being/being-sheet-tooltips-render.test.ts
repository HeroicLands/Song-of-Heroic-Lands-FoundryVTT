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
// distinct abbrev (`.shortcode`) so the rendered tooltips are unambiguous.
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
                    shortcode: "IMP STR +2",
                },
                attack: {
                    disabled: "",
                    effective: 45,
                    shortcode: "ATK STR +2",
                },
                defense: {
                    block: { disabled: "", effective: 40, shortcode: "BLK +1" },
                    counterstrike: {
                        disabled: "",
                        effective: 42,
                        shortcode: "CX +3",
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
                    shortcode: "IMP DEX +1",
                },
                attack: {
                    disabled: "",
                    effective: 50,
                    shortcode: "ATK DEX +1",
                },
            },
        ],
    },
];

describe("combat.hbs strike-mode value tooltips (#769)", () => {
    it("binds each melee value cell's tooltip to the modifier abbrev", () => {
        const html = renderTemplateReal(COMBAT, { meleeStrikeModes });
        expect(html).toContain('data-tooltip="IMP STR +2"');
        expect(html).toContain('data-tooltip="ATK STR +2"');
        expect(html).toContain('data-tooltip="BLK +1"');
        expect(html).toContain('data-tooltip="CX +3"');
    });

    it("binds each missile value cell's tooltip to the modifier abbrev", () => {
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
                    emlAbbrev: "STR +2, ARM ×2",
                    fateAbbrev: "FATE +5",
                    disabled: false,
                    canImprove: false,
                    improveFlag: false,
                    notes: "",
                },
            ],
        },
    ];

    it("binds the EML and Fate cell tooltips to the modifier abbrev", () => {
        const html = renderTemplateReal(SKILLS, { skillGroups });
        expect(html).toContain('data-tooltip="STR +2, ARM ×2"');
        expect(html).toContain('data-tooltip="FATE +5"');
    });
});
