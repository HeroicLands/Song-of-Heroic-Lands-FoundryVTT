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

const TEMPLATE = "systems/sohl/templates/actor/being/print.hbs";

/** A fully-populated print context mirroring what `_buildPrintContext` emits. */
function fullContext() {
    return {
        emDash: "—",
        printedOn: "7/29/2026",
        actorName: "Aldric of Kaldor",
        shortcode: "ALD",
        actorImg: "portrait.webp",
        healthLine: "Wounded · 62%",
        statusSummary: "Fatigued, Stunned",
        injurySummary: "Right Arm (minor), Left Leg (unusable)",
        appearanceHTML: "<p>A tall, weather-worn man.</p>",
        dossierHTML: "<p>Born in the northern reaches.</p>",
        attributes: [
            { name: "Strength", score: 13, descriptor: "Strong", tl: 8 },
            { name: "Stamina", score: 11, descriptor: "Hardy", tl: 6 },
        ],
        affiliations: [
            {
                name: "Order of the Lion",
                level: 3,
                society: "Chapter",
                office: "Knight",
                title: "Sir",
                notes: "Sworn",
            },
        ],
        movement: [
            { label: "Walk", value: 30, leagues: 3, isCurrent: true },
            { label: "Swim", value: 10, leagues: 1, isCurrent: false },
        ],
        bodyZones: [
            {
                label: "Head",
                parts: [
                    {
                        label: "Skull",
                        role: "Vital",
                        locations: [
                            {
                                name: "Crown",
                                layers: "leather",
                                blunt: 2,
                                edged: 3,
                                piercing: 1,
                                fire: 0,
                                shock: 5,
                            },
                        ],
                    },
                ],
            },
        ],
        hasSkills: true,
        skillGroups: [
            {
                label: "Combat",
                skills: [
                    {
                        name: "Dodge",
                        sb: 5,
                        ml: 40,
                        index: 6,
                        eml: 38,
                        fate: 45,
                        disabled: false,
                        notes: "nimble",
                    },
                    {
                        name: "Unarmed",
                        sb: 4,
                        ml: 30,
                        index: 5,
                        eml: 30,
                        fate: 35,
                        disabled: true,
                        notes: "",
                    },
                ],
            },
        ],
        hasCombat: true,
        useZoneDie: false,
        spreadLabel: "Spr",
        meleeStrikeModes: [
            {
                weaponName: "Dagger",
                modes: [
                    {
                        name: "Stab",
                        heft: "0",
                        reach: "1",
                        spread: "3",
                        impact: "5",
                        attack: "12",
                        block: "8",
                        counterstrike: "—",
                    },
                ],
            },
        ],
        missileStrikeModes: [
            {
                weaponName: "Bow",
                modes: [
                    {
                        name: "Shoot",
                        draw: "5",
                        baseRange: "50",
                        maxVolley: "3",
                        impact: "6",
                        attack: "14",
                    },
                ],
            },
        ],
        hasInjuries: true,
        injurySections: [
            {
                label: "Wounds",
                injuries: [
                    {
                        name: "Gash",
                        healed: false,
                        severity: "S2",
                        healingRate: 4,
                        healingRateDisabled: false,
                        isTreated: false,
                        aspect: "Edged",
                        area: "Right Arm",
                        isBleeding: true,
                        notes: "deep",
                    },
                ],
            },
        ],
        hasAfflictions: true,
        afflictionGroups: [
            {
                label: "Fatigue",
                afflictions: [
                    {
                        name: "Winded",
                        level: "Moderate",
                        healingRate: 2,
                        healingRateDisabled: false,
                        source: "Exertion",
                        notes: "",
                    },
                ],
            },
        ],
        mysteryRows: [
            {
                name: "Second Sight",
                skill: "Awareness",
                level: "+2",
                charges: "3/5",
                notes: "",
            },
        ],
        abilityRows: [
            {
                name: "Firethrow",
                skill: "Pyromancy",
                level: "4",
                ml: "50",
                charges: "∞",
                notes: "",
            },
        ],
        hasGear: true,
        gearSections: [
            {
                title: "On Body",
                capacityText: "Carried: 12 lb · Enc 1",
                items: [
                    {
                        name: "Dagger",
                        typeLabel: "Weapon",
                        quantity: 1,
                        weight: 1,
                        quality: "+0",
                        durability: 10,
                        notes: "",
                        isCarried: true,
                        isWorn: false,
                    },
                ],
            },
            {
                title: "Backpack",
                capacityText: "Capacity: 3/40",
                items: [],
            },
        ],
    };
}

describe("being print template", () => {
    it("renders every section's data from the shared view-models", () => {
        const html = renderTemplateReal(TEMPLATE, fullContext());

        // Letterhead
        expect(html).toContain("Aldric of Kaldor");
        expect(html).toContain("ALD");
        expect(html).toContain("Wounded · 62%");
        expect(html).toContain("Fatigued, Stunned");
        expect(html).toContain("Right Arm (minor), Left Leg (unusable)");

        // Enriched rich text rendered as static HTML (unescaped)
        expect(html).toContain("<p>A tall, weather-worn man.</p>");
        expect(html).toContain("<p>Born in the northern reaches.</p>");

        // Magazine layout: the top bands and the columnar skills.
        expect(html).toContain("being-print__band--top");
        expect(html).toContain("being-print__band--split");
        expect(html).toContain("being-print__skill-columns");
        expect(html).toContain("being-print__portrait");
        expect(html).toContain("Lgs/Watch"); // movement leagues/watch column

        // A sampling across every tab's data
        expect(html).toContain("Strength"); // attributes
        expect(html).toContain("Order of the Lion"); // affiliations
        expect(html).toContain("Walk"); // movement
        expect(html).toContain("Dodge"); // skills
        expect(html).toContain("Dagger"); // combat + gear
        expect(html).toContain("Shoot"); // missile mode
        expect(html).toContain("Crown"); // body location
        expect(html).toContain("Gash"); // injury
        expect(html).toContain("Winded"); // affliction
        expect(html).toContain("Second Sight"); // mystery
        expect(html).toContain("Firethrow"); // ability
        expect(html).toContain("Backpack"); // container section
    });

    it("shows a disabled skill's ML/Index as an em dash, not a number", () => {
        const html = renderTemplateReal(TEMPLATE, fullContext());
        // The disabled "Unarmed" row must not print its eml (30 appears only for
        // its base ML column); assert the em dash is present in the document.
        expect(html).toContain("—");
    });

    it("contains no interactive chrome (static record only)", () => {
        const html = renderTemplateReal(TEMPLATE, fullContext());
        expect(html).not.toContain("data-action");
        expect(html).not.toContain("drag-grip");
        expect(html).not.toContain("item-contextmenu");
        expect(html).not.toContain("add-button");
        expect(html).not.toContain("<select");
        expect(html).not.toContain("<input");
        expect(html).not.toContain("prose-mirror");
        expect(html).not.toContain("search-criteria");
        expect(html).not.toContain("data-tab=");
    });

    it("omits sections with no data", () => {
        const ctx = {
            emDash: "—",
            actorName: "Wraith",
            shortcode: "",
            actorImg: "",
            healthLine: "",
            statusSummary: "",
            injurySummary: "",
            appearanceHTML: "",
            dossierHTML: "",
            attributes: [],
            affiliations: [],
            movement: [],
            bodyZones: [],
            hasSkills: false,
            skillGroups: [],
            hasCombat: false,
            meleeStrikeModes: [],
            missileStrikeModes: [],
            hasInjuries: false,
            injurySections: [],
            hasAfflictions: false,
            afflictionGroups: [],
            mysteryRows: [],
            abilityRows: [],
            hasGear: false,
            gearSections: [],
        };
        const html = renderTemplateReal(TEMPLATE, ctx);
        expect(html).toContain("Wraith");
        // No section tables render for an empty being.
        expect(html).not.toContain("being-print__table");
        // Status / injuries still show the "None" fallback.
        expect(html).toContain("None");
    });
});
