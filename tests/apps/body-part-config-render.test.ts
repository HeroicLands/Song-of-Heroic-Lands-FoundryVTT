/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real BodyPartConfig editor template in Node and assert the emitted
 * HTML — the identity header, the roles multi-select with the current roles
 * pre-selected, the general/flags fields bound to the part, and no Save button.
 * Mirrors what `BodyPartConfig._prepareContext` hands the template.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { buildRefOptions } from "@src/document/item/logic/refOptions";
import { blankBodyPart } from "@src/entity/body/blankBodyPart";
import { BODY_ROLE, BodyRoleChoices } from "@src/utils/constants";

const TEMPLATE = "systems/sohl/templates/apps/body-part-config.hbs";

/** The body's zones, as `BodyPartConfig._prepareContext` maps them. */
const ZONES = [
    { shortcode: "manipzone", name: "Manipulator Zone" },
    { shortcode: "locozone", name: "Locomotor Zone" },
];

/** Build the render context exactly as BodyPartConfig._prepareContext does. */
function context(
    name = "Left Arm",
    shortcode = "larm",
    roles: string[] = [BODY_ROLE.MANIPULATOR, BODY_ROLE.LOCOMOTOR],
    bodyZoneCode = "manipzone",
) {
    const part = {
        ...blankBodyPart(name, shortcode),
        roles,
        probWeight: 3,
        bodyZoneCode,
    };
    return {
        part,
        shortcode,
        bodyZoneCodeOptions: buildRefOptions(ZONES, bodyZoneCode),
        roleOptions: Object.entries(BodyRoleChoices).map(([value, label]) => ({
            value,
            label,
            selected: roles.includes(value),
        })),
    };
}

describe("body-part-config template", () => {
    it("renders an identity header: large name and small unique shortcode", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toContain("body-part-config__header");
        expect(html).toMatch(
            /class="body-part-config__name"[^>]*>\s*<input[^>]*name="name"/,
        );
        expect(html).toMatch(
            /<input[^>]*class="body-part-config__shortcode"[^>]*name="shortcode"/,
        );
        expect(html).toMatch(/name="shortcode"[^>]*value="larm"/);
        expect(html).toContain('value="Left Arm"');
    });

    it("has no Save button (the editor auto-saves)", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).not.toContain('type="submit"');
        expect(html).not.toContain("<button");
    });

    it("renders the zone dropdown pre-selected to bodyZoneCode (#982)", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toMatch(/<select[^>]*name="bodyZoneCode"/);
        expect(html).toMatch(
            /<option value="manipzone"[^>]*selected[^>]*>\s*Manipulator Zone\s*<\/option>/,
        );
        expect(html).toMatch(
            /<option value="locozone"(?![^>]*selected)[^>]*>\s*Locomotor Zone\s*<\/option>/,
        );
    });

    it("flags a dangling bodyZoneCode as an unresolved option, never blanked (#982)", () => {
        const html = renderTemplateReal(
            TEMPLATE,
            context("Left Arm", "larm", [], "gone"),
        );
        expect(html).toMatch(
            /<option value="gone"[^>]*selected[^>]*>\s*gone \(unresolved\)\s*<\/option>/,
        );
    });

    it("renders the roles multi-select with the part's current roles pre-selected", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toMatch(/<select[^>]*name="roles"[^>]*multiple/);
        // Selected roles carry `selected`; unselected do not.
        expect(html).toMatch(/<option value="manipulator"[^>]*selected[^>]*>/);
        expect(html).toMatch(/<option value="locomotor"[^>]*selected[^>]*>/);
        expect(html).toMatch(/<option value="vital"(?![^>]*selected)[^>]*>/);
    });

    it("binds the general and flag fields to the part", () => {
        const html = renderTemplateReal(TEMPLATE, context());
        expect(html).toMatch(/name="probWeight"[^>]*value="3"/);
        expect(html).toContain('name="permanentImpairment"');
        expect(html).toContain('name="canHoldItem"');
        expect(html).toContain('name="permanentlyUnusable"');
    });

    it("checks the boolean flags that are set on the part", () => {
        const html = renderTemplateReal(TEMPLATE, {
            ...context(),
            part: { ...blankBodyPart("Left Arm", "larm"), canHoldItem: true },
        });
        expect(html).toMatch(/name="canHoldItem"[^>]*checked/);
        expect(html).not.toMatch(/name="permanentlyUnusable"[^>]*checked/);
    });
});
