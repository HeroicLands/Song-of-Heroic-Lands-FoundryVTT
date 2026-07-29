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

const bodyZones = [
    {
        shortcode: "headzone",
        index: 0,
        label: "Head Zone",
        zoneRange: "1\u20133",
        parts: [
            {
                shortcode: "head",
                index: 0,
                label: "Head",
                locations: [
                    {
                        shortcode: "skull",
                        name: "Skull",
                        layers: "",
                        blunt: 3,
                        edged: 3,
                        piercing: 3,
                        fire: 0,
                        shock: 5,
                        impair: 0,
                    },
                ],
            },
        ],
    },
];

describe("combat.hbs Body Structure add / drag controls (#720/#780)", () => {
    it("renders the + Add controls and draggable rows for an editor", () => {
        const html = renderTemplateReal(COMBAT, {
            structure: true,
            canEditBody: true,
            bodyZones,
        });
        // Add controls: one on the structure header (zone), one per zone
        // header (part), one per part header (location).
        expect(html).toContain('data-action="addBodyZone"');
        expect(html).toContain('data-action="addBodyPart"');
        expect(html).toContain('data-action="addBodyLocation"');
        // Rows are draggable and addressable by shortcode (matches #742's tree).
        expect(html).toContain('draggable="true"');
        expect(html).toContain('data-zone-shortcode="headzone"');
        expect(html).toContain('data-part-shortcode="head"');
        expect(html).toContain('data-location-shortcode="skull"');
        // The Edit/Delete ⋮ menus (from #742) still render, now at all three tiers.
        expect(html).toContain("bodyzone-contextmenu");
        expect(html).toContain("bodypart-contextmenu");
        expect(html).toContain("bodylocation-contextmenu");
    });

    it("renders the zone tier with its label and rolled number range", () => {
        const html = renderTemplateReal(COMBAT, {
            structure: true,
            canEditBody: false,
            bodyZones,
        });
        expect(html).toContain("Head Zone");
        expect(html).toContain("1\u20133");
    });

    it("omits the add controls and draggable for a non-owner", () => {
        const html = renderTemplateReal(COMBAT, {
            structure: true,
            canEditBody: false,
            bodyZones,
        });
        expect(html).not.toContain('data-action="addBodyZone"');
        expect(html).not.toContain('data-action="addBodyPart"');
        expect(html).not.toContain('data-action="addBodyLocation"');
        expect(html).not.toContain('draggable="true"');
        // ...but the read-only tree still renders.
        expect(html).toContain("Skull");
    });
});
