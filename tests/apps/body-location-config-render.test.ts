/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real BodyLocationConfig editor template in Node and assert the
 * emitted HTML — the identity header with its owning-part label, the tier
 * selects pre-selected to the location's current values, the four
 * protectionBase inputs, the mishap checkboxes, and no Save button. Mirrors what
 * `BodyLocationConfig._prepareContext` hands the template.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { blankBodyLocation } from "@src/entity/body/blankBodyLocation";
import {
    AMPUTABILITY,
    AmputabilityChoices,
    BLEEDING_SUSCEPTIBILITY,
    BleedingSusceptibilityChoices,
} from "@src/utils/constants";

const TEMPLATE = "systems/sohl/templates/apps/body-location-config.hbs";

/** Build the render context exactly as BodyLocationConfig._prepareContext does. */
function context(name = "Skull", shortcode = "skull") {
    const loc = {
        ...blankBodyLocation(name, shortcode),
        bleedingSusceptibility: BLEEDING_SUSCEPTIBILITY.HIGH,
        amputability: AMPUTABILITY.LOW,
        shockValue: 5,
        probWeight: 2,
        protectionBase: { blunt: 4, edged: 3, piercing: 2, fire: 1 },
    };
    return {
        loc,
        shortcode,
        partLabel: "Head",
        bleedingOptions: Object.entries(BleedingSusceptibilityChoices).map(
            ([value, label]) => ({
                value,
                label,
                selected: value === loc.bleedingSusceptibility,
            }),
        ),
        amputabilityOptions: Object.entries(AmputabilityChoices).map(
            ([value, label]) => ({
                value,
                label,
                selected: value === loc.amputability,
            }),
        ),
    };
}

describe("body-location-config template", () => {
    it("renders an identity header: name, unique shortcode, owning-part label", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toContain("body-location-config__header");
        expect(html).toMatch(
            /class="body-location-config__name"[^>]*>\s*<input[^>]*name="name"/,
        );
        expect(html).toMatch(/name="shortcode"[^>]*value="skull"/);
        expect(html).toMatch(
            /class="body-location-config__part"[^>]*>\s*Head\s*<\/div>/,
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
