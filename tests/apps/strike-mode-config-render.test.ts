/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real StrikeModeConfig editor template in Node and assert the
 * emitted HTML — the melee/missile discriminated union renders the right
 * fields and binds the current values. Mirrors what
 * `StrikeModeConfig._prepareContext` hands the template.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { blankStrikeMode } from "@src/entity/strikemode/blankStrikeMode";
import {
    ImpactAspectChoices,
    STRIKE_MODE_TYPE,
    type StrikeModeType,
} from "@src/utils/constants";

const TEMPLATE = "systems/sohl/templates/apps/strike-mode-config.hbs";

/** Build the render context exactly as StrikeModeConfig._prepareContext does. */
function context(
    type: StrikeModeType,
    name = "Cut",
    { shortcode = "cut", isMulti = true } = {},
) {
    const sm = blankStrikeMode(type, name) as any;
    return {
        sm,
        smType: type,
        typeLabel: type === STRIKE_MODE_TYPE.MELEE ? "Melee" : "Missile",
        shortcode,
        isMulti,
        isMelee: type === STRIKE_MODE_TYPE.MELEE,
        isMissile: type === STRIKE_MODE_TYPE.MISSILE,
        // The scatter is always presented as a Zone Die.
        spreadLabel: "Zone Die",
        aspectOptions: Object.entries(ImpactAspectChoices).map(
            ([value, label]) => ({
                value,
                label,
                selected: value === sm.impactBase.aspect,
            }),
        ),
    };
}

describe("strike-mode-config template", () => {
    it("renders an item-sheet-style identity header: large name, small shortcode, read-only type label", () => {
        const html = renderTemplateReal(
            TEMPLATE,
            context("melee", "Cut", { shortcode: "cut", isMulti: true }),
        );
        expect(html).toContain("strike-mode-config__header");
        // The stacked identity structure, mirroring the item-sheet header.
        expect(html).toMatch(
            /class="strike-mode-config__name"[^>]*>\s*<input[^>]*name="name"/,
        );
        expect(html).toMatch(
            /<input[^>]*class="strike-mode-config__shortcode"[^>]*name="shortcode"/,
        );
        // Type is a read-only label, not an editable control.
        expect(html).toMatch(
            /class="strike-mode-config__type"[^>]*>\s*Melee\s*<\/div>/,
        );
        expect(html).not.toContain('name="type"');
        expect(html).toMatch(/name="shortcode"[^>]*value="cut"/);
        expect(html).not.toMatch(/name="shortcode"[^>]*readonly/);
    });

    it("renders the shortcode read-only for a single-mode item (combat technique)", () => {
        const html = renderTemplateReal(
            TEMPLATE,
            context("melee", "Thrust", { shortcode: "single", isMulti: false }),
        );
        expect(html).toMatch(/name="shortcode"[^>]*readonly/);
    });

    it("has no Save button (the editor auto-saves)", () => {
        const html = renderTemplateReal(TEMPLATE, context("melee", "Cut"));
        expect(html).not.toContain('type="submit"');
        expect(html).not.toContain("<button");
    });

    it("uses the requested field labels (Associated Skill, Modifier, Num Dice, Zone Die)", () => {
        const html = renderTemplateReal(TEMPLATE, context("melee", "Cut"));
        expect(html).toContain("Associated Skill");
        expect(html).not.toContain("Governing Skill Override");
        expect(html).toContain("Num Dice");
        // Attack-section modifier label is just "Modifier".
        expect(html).toMatch(/<span>Modifier<\/span>/);
        // The scatter is always presented as a Zone Die (#828).
        expect(html).toContain("<span>Zone Die</span>");
        expect(html).not.toContain("<span>Spread</span>");
    });

    it("renders melee fields (length, defense) and binds the name", () => {
        const html = renderTemplateReal(TEMPLATE, context("melee", "Cut"));
        expect(html).toContain('name="name"');
        expect(html).toContain('value="Cut"');
        expect(html).toContain('name="lengthBase"');
        expect(html).toContain('name="defense.block.modifier"');
        expect(html).toContain('name="defense.counterstrike.modifier"');
        // missile-only fields absent
        expect(html).not.toContain('name="projectileType"');
        expect(html).not.toContain('name="baseRangeBase"');
        // aspect select rendered from the choices
        expect(html).toContain('name="impactBase.aspect"');
    });

    it("renders missile fields (projectile, range, draw) and no melee defense", () => {
        const html = renderTemplateReal(TEMPLATE, context("missile", "Shoot"));
        expect(html).toMatch(
            /class="strike-mode-config__type"[^>]*>\s*Missile\s*<\/div>/,
        );
        expect(html).toContain('name="projectileType"');
        expect(html).toContain('name="baseRangeBase"');
        expect(html).toContain('name="drawBase"');
        expect(html).toContain('name="maxVolleyMult"');
        // no melee-only fields
        expect(html).not.toContain('name="lengthBase"');
        expect(html).not.toContain('name="defense.block.modifier"');
    });
});
