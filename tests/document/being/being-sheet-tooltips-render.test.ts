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
import {
    TRAUMA_SUBTYPE_COLUMNS,
    traumaLedgerCols,
    mysticalAbilityColumns,
    mysticalAbilityLedgerCols,
} from "@src/document/actor/logic/being-sheet-view";
import { MYSTICALABILITY_SUBTYPE } from "@src/utils/constants";

const MYSTERIES = "systems/sohl/templates/actor/being/mysteries.hbs";
const PROFILE = "systems/sohl/templates/actor/being/profile.hbs";
const TRAUMA = "systems/sohl/templates/actor/being/trauma.hbs";
const GEAR = "systems/sohl/templates/actor/parts/gear.hbs";
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
                draw: { effective: 3, deltaLabel: "DRW STR +1" },
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

    // #773 — the missile header had a spurious "Pull" column with no backing
    // data on MissileStrikeMode, so its cell was pointed at `draw` as a
    // placeholder, duplicating the Draw column's value and tooltip.
    it("has no spurious Pull column in the missile header", () => {
        const html = renderTemplateReal(COMBAT, { missileStrikeModes });
        expect(html).not.toContain('data-tooltip="Pull Strength"');
    });

    it("renders the missile draw value and tooltip exactly once per row", () => {
        const html = renderTemplateReal(COMBAT, { missileStrikeModes });
        const drawTooltips = html.match(/data-tooltip="DRW STR \+1"/g) ?? [];
        expect(drawTooltips).toHaveLength(1);
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

describe("skills.hbs Level column", () => {
    const row = (over = {}) => ({
        id: "s1",
        uuid: "Item.s1",
        name: "Climbing",
        img: "icons/skill.svg",
        level: 4,
        levelDisabled: false,
        sb: 5,
        sbValid: true,
        ml: 40,
        index: 4,
        eml: 42,
        fate: 50,
        emlDeltaLabel: "",
        fateDeltaLabel: "",
        disabled: false,
        canImprove: false,
        improveFlag: false,
        notes: "",
        ...over,
    });
    const groups = (skill: Record<string, unknown>) => [
        { subType: "social", label: "Social", skills: [skill] },
    ];

    it("renders the numeric level right after the name", () => {
        const html = renderTemplateReal(SKILLS, {
            skillGroups: groups(row({ level: 4, levelDisabled: false })),
        });
        // The Level cell follows the name cell in document order.
        const nameIdx = html.indexOf('class="ledger__name"');
        const levelIdx = html.indexOf(">4<", nameIdx);
        expect(nameIdx).toBeGreaterThanOrEqual(0);
        expect(levelIdx).toBeGreaterThan(nameIdx);
    });

    it("renders an ✕ (fa-xmark) when the level is disabled", () => {
        const html = renderTemplateReal(SKILLS, {
            skillGroups: groups(row({ level: 0, levelDisabled: true })),
        });
        expect(html).toContain("fa-xmark");
    });
});

// A value-modifier stub as the templates see it off `item.logic.<field>`.
const vm = (deltaLabel: string, effective = 1) => ({
    disabled: "",
    effective,
    deltaLabel,
});

describe("mysteries.hbs value tooltips (#769)", () => {
    const charges = { value: vm("", 3), max: vm("", 0) };
    const context = {
        mysterySections: [
            {
                label: "Spirit",
                items: [
                    {
                        id: "m1",
                        name: "Second Sight",
                        img: "icons/m.svg",
                        system: { notes: "" },
                        logic: { level: vm("Base +2"), charges },
                    },
                ],
            },
        ],
        abilitySections: [
            {
                subType: MYSTICALABILITY_SUBTYPE.SPIRITPOWER,
                label: "Spirit",
                columns: mysticalAbilityColumns(
                    MYSTICALABILITY_SUBTYPE.SPIRITPOWER,
                ),
                ledgerCols: mysticalAbilityLedgerCols(
                    mysticalAbilityColumns(MYSTICALABILITY_SUBTYPE.SPIRITPOWER),
                ),
                items: [
                    {
                        id: "a1",
                        name: "Spirit",
                        img: "icons/a.svg",
                        system: { notes: "", improveFlag: false },
                        logic: {
                            assocRef: { name: "Spellcraft" },
                            level: vm("LVL Base +1"),
                            masteryLevel: vm("ML Base +30", 30),
                            charges,
                            isDisabled: false,
                        },
                    },
                ],
            },
        ],
    };

    it("binds the mystical-ability ML cell tooltip to its deltaLabel", () => {
        const html = renderTemplateReal(MYSTERIES, context);
        expect(html).toContain('data-tooltip="ML Base +30"');
        expect(html).toContain('data-tooltip="LVL Base +1"');
        expect(html).toContain('data-tooltip="Base +2"'); // mystery level
    });

    it("positions the ML tooltip above the row (direction UP)", () => {
        const html = renderTemplateReal(MYSTERIES, context);
        const cell = (html.match(
            /<div\b[^>]*\bdata-tooltip="ML Base \+30"[^>]*>/,
        ) ?? [])[0];
        expect(cell).toContain('data-tooltip-direction="UP"');
    });
});

describe("profile.hbs attribute tooltips (#769)", () => {
    const context = {
        attributes: [
            {
                id: "at1",
                uuid: "Item.at1",
                name: "Strength",
                score: 14,
                descriptor: "Strong",
                tl: 45,
                scoreDeltaLabel: "Base +14",
                tlDeltaLabel: "Base +45",
            },
        ],
    };

    it("binds the attribute score and TL tooltips to their deltaLabels", () => {
        const html = renderTemplateReal(PROFILE, context);
        expect(html).toContain('data-tooltip="Base +14"');
        expect(html).toContain('data-tooltip="Base +45"');
        expect(html).toContain('data-tooltip-direction="UP"');
    });
});

describe("trauma.hbs value tooltips (#769)", () => {
    const context = {
        injurySections: [
            {
                subType: "injury",
                label: "Injury",
                columns: TRAUMA_SUBTYPE_COLUMNS["injury"],
                ledgerCols: traumaLedgerCols(TRAUMA_SUBTYPE_COLUMNS["injury"]),
                injuries: [
                    {
                        id: "t1",
                        name: "Gash",
                        img: "icons/t.svg",
                        healed: false,
                        level: 2,
                        severity: "S2",
                        severityDeltaLabel: "Base +2",
                        healingRate: 6,
                        healingRateDisabled: false,
                        healingRateDeltaLabel: "Base +6",
                        isTreated: false,
                        isBleeding: false,
                        aspect: "Edged",
                        area: "Torso",
                        categoryDisplay: "",
                        nextTest: "—",
                        notes: "",
                    },
                ],
            },
        ],
        afflictionGroups: [
            {
                subType: "fatigue",
                label: "Fatigue",
                afflictions: [
                    {
                        id: "af1",
                        name: "Weary",
                        img: "icons/a.svg",
                        level: "Weary",
                        levelDeltaLabel: "Base +3",
                        healingRate: 4,
                        healingRateDisabled: false,
                        healingRateDeltaLabel: "Base +4",
                        source: "Cold",
                        notes: "",
                    },
                ],
            },
        ],
    };

    it("binds the trauma and affliction value tooltips to their deltaLabels", () => {
        const html = renderTemplateReal(TRAUMA, context);
        expect(html).toContain('data-tooltip="Base +2"'); // severity
        expect(html).toContain('data-tooltip="Base +6"'); // trauma healing rate
        expect(html).toContain('data-tooltip="Base +3"'); // affliction level
        expect(html).toContain('data-tooltip="Base +4"'); // affliction healing
        expect(html).toContain('data-tooltip-direction="UP"');
    });
});

describe("gear.hbs value tooltips (#769)", () => {
    const context = {
        onBody: {
            capacity: { used: 3, max: 100 },
            items: [
                {
                    id: "g1",
                    name: "Sword",
                    img: "icons/g.svg",
                    typeLabel: "Weapon",
                    quantity: 1,
                    weight: 3,
                    quality: "+2",
                    durability: 15,
                    weightDeltaLabel: "Base +3",
                    qualityDeltaLabel: "Base +2",
                    durabilityDeltaLabel: "Base +15",
                    notes: "",
                },
            ],
        },
    };

    it("binds the weight/quality/durability tooltips to their deltaLabels", () => {
        const html = renderTemplateReal(GEAR, context);
        expect(html).toContain('data-tooltip="Base +3"');
        expect(html).toContain('data-tooltip="Base +2"');
        expect(html).toContain('data-tooltip="Base +15"');
        expect(html).toContain('data-tooltip-direction="UP"');
    });
});
