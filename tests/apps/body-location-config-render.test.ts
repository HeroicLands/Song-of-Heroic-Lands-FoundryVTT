/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real BodyLocationConfig editor template in Node and assert the
 * emitted HTML — the identity header, the owning-part dropdown (#982) pre-selected
 * to the location's `bodyPartCode`, the tier selects pre-selected to the
 * location's current values, the four protectionBase inputs, the mishap
 * checkboxes, and no Save button. Mirrors what
 * `BodyLocationConfig._prepareContext` hands the template.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { buildRefOptions } from "@src/document/item/logic/refOptions";
import { blankBodyLocation } from "@src/entity/body/blankBodyLocation";
import {
    AMPUTABILITY,
    AmputabilityChoices,
    BLEEDING_SUSCEPTIBILITY,
    BleedingSusceptibilityChoices,
} from "@src/utils/constants";

const TEMPLATE = "systems/sohl/templates/apps/body-location-config.hbs";

/** The body's parts, as `BodyLocationConfig._prepareContext` maps them. */
const PARTS = [
    { shortcode: "head", name: "Head" },
    { shortcode: "thorax", name: "Thorax" },
];

/** Build the render context exactly as BodyLocationConfig._prepareContext does. */
function context(name = "Skull", shortcode = "skull") {
    const loc = {
        ...blankBodyLocation(name, shortcode),
        bodyPartCode: "head",
        bleedingSusceptibility: BLEEDING_SUSCEPTIBILITY.HIGH,
        amputability: AMPUTABILITY.LOW,
        shockValue: 5,
        probWeight: 2,
        protectionBase: { blunt: 4, edged: 3, piercing: 2, fire: 1 },
    };
    return {
        loc,
        shortcode,
        bodyPartCodeOptions: buildRefOptions(PARTS, loc.bodyPartCode),
        bleedingOptions: Object.entries(BleedingSusceptibilityChoices).map(([value, label]) => ({
            value,
            label,
            selected: value === loc.bleedingSusceptibility,
        })),
        amputabilityOptions: Object.entries(AmputabilityChoices).map(([value, label]) => ({
            value,
            label,
            selected: value === loc.amputability,
        })),
    };
}

describe("body-location-config template", () => {
    it("renders an identity header: name and unique shortcode", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toContain("body-location-config__header");
        expect(html).toMatch(/class="body-location-config__name"[^>]*>\s*<input[^>]*name="name"/);
        expect(html).toMatch(/name="shortcode"[^>]*value="skull"/);
    });

    it("renders the owning-part dropdown pre-selected to bodyPartCode (#982)", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toMatch(/<select[^>]*name="bodyPartCode"/);
        // Both parts are offered; the location's current part is selected.
        expect(html).toMatch(/<option value="head"[^>]*selected[^>]*>\s*Head\s*<\/option>/);
        expect(html).toMatch(/<option value="thorax"(?![^>]*selected)[^>]*>\s*Thorax\s*<\/option>/);
    });

    it("flags a dangling bodyPartCode as an unresolved option, never blanked (#982)", () => {
        const ctx = context();
        ctx.loc.bodyPartCode = "gone";
        ctx.bodyPartCodeOptions = buildRefOptions(PARTS, "gone");
        const html = renderTemplateReal(TEMPLATE, ctx);
        expect(html).toMatch(
            /<option value="gone"[^>]*selected[^>]*>\s*gone \(unresolved\)\s*<\/option>/,
        );
    });

    it("has no Save button (the editor auto-saves)", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).not.toContain('type="submit"');
        expect(html).not.toContain("<button");
    });

    it("pre-selects the tier selects to the location's current values", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toMatch(/<select[^>]*name="bleedingSusceptibility"/);
        expect(html).toMatch(/<option value="high"[^>]*selected[^>]*>/);
        expect(html).toMatch(/<select[^>]*name="amputability"/);
        expect(html).toMatch(/<option value="low"[^>]*selected[^>]*>/);
    });

    it("binds the four protectionBase inputs and the shock/weight fields", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toMatch(/name="protectionBase\.blunt"[^>]*value="4"/);
        expect(html).toMatch(/name="protectionBase\.edged"[^>]*value="3"/);
        expect(html).toMatch(/name="protectionBase\.piercing"[^>]*value="2"/);
        expect(html).toMatch(/name="protectionBase\.fire"[^>]*value="1"/);
        expect(html).toMatch(/name="shockValue"[^>]*value="5"/);
        expect(html).toMatch(/name="probWeight"[^>]*value="2"/);
    });

    it("renders the mishap checkboxes, checked to match the location", () => {
        const html = renderTemplateReal(TEMPLATE, {
            ...context(),
            loc: {
                ...blankBodyLocation("Skull", "skull"),
                isStumble: true,
            },
        });
        expect(html).toMatch(/name="isStumble"[^>]*checked/);
        expect(html).not.toMatch(/name="isFumble"[^>]*checked/);
    });
});
