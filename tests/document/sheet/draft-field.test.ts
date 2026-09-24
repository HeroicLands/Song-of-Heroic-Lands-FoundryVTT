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

/**
 * The **draft checkbox** — the referee's own mark on their own material, bound
 * to `system.isDraft` and rendered in the identity block of every Actor and
 * Item sheet header.
 *
 * These render the real `.hbs` and assert the emitted HTML, because what
 * matters is the **binding**: the field path Foundry submits, and the checked
 * state each value produces. A checkbox reads its value from the `checked`
 * attribute rather than from `value`, so both states are asserted.
 */
const ITEM_HEADER = "systems/sohl/templates/item/parts/header.hbs";
const VEHICLE_HEADER = "systems/sohl/templates/actor/vehicle/header.hbs";
const COHORT_HEADER = "systems/sohl/templates/actor/cohort/header.hbs";
const STRUCTURE_HEADER = "systems/sohl/templates/actor/structure/header.hbs";
const BEING_HEADER = "systems/sohl/templates/actor/being/header.hbs";

const ITEM_CONTEXT = {
    itemName: "Broadsword",
    itemImg: "icons/svg/sword.svg",
    typeLabel: "Weapon",
    logic: { data: { shortcode: "brdswd" } },
};

const ACTOR_CONTEXT = {
    actorName: "Cart",
    typeLabel: "Vehicle",
    document: { system: { shortcode: "cart" } },
};

const BEING_CONTEXT = {
    actorName: "Aldric",
    actorImg: "icons/svg/mystery-man.svg",
    typeLabel: "Being",
    document: { system: { shortcode: "aldric" } },
    healthPct: 100,
    healthBandLabel: "SOHL.Being.HealthBand.unhurt",
    statusEffects: [],
    bodyParts: [],
};

/**
 * Extract the draft checkbox's `<input>` tag from rendered header HTML, so an
 * assertion reads the one element rather than the whole document — attribute
 * order inside the tag is the template's business, not the test's.
 */
function draftInput(html: string): string {
    const match = /<input[^>]*name="system\.isDraft"[^>]*>/.exec(html);
    expect(match, "no control bound to system.isDraft was rendered").not.toBeNull();
    return match![0];
}

describe("the draft control binds system.isDraft", () => {
    it("renders a checkbox bound to system.isDraft on the item header", () => {
        const html = renderTemplateReal(ITEM_HEADER, { ...ITEM_CONTEXT, isDraft: false });
        const input = draftInput(html);
        expect(input).toContain('type="checkbox"');
    });

    it("renders the box checked when the document is a draft", () => {
        expect(
            draftInput(renderTemplateReal(ITEM_HEADER, { ...ITEM_CONTEXT, isDraft: true })),
        ).toContain("checked");
    });

    it("renders the box clear when the document is not a draft", () => {
        expect(
            draftInput(renderTemplateReal(ITEM_HEADER, { ...ITEM_CONTEXT, isDraft: false })),
        ).not.toContain("checked");
    });

    it("renders the control for every viewer, not only a GM", () => {
        // The archetype marker beside it is GM-only; this one is not. A draft
        // mark follows the sheet's own editability, which Foundry enforces by
        // disabling the sheet's form controls for a viewer who may not edit.
        const html = renderTemplateReal(ITEM_HEADER, {
            ...ITEM_CONTEXT,
            canMarkArchetype: false,
            isDraft: true,
        });
        expect(html).toContain('name="system.isDraft"');
        expect(html).not.toContain("system.templatePriority");
    });

    it("carries the localized label rather than a raw key", () => {
        const html = renderTemplateReal(ITEM_HEADER, { ...ITEM_CONTEXT, isDraft: false });
        expect(html).toContain("Draft");
        expect(html).not.toContain("SOHL.Draft.label");
        expect(html).not.toContain("SOHL.Draft.hint");
    });

    it.each([
        ["vehicle", VEHICLE_HEADER, ACTOR_CONTEXT],
        ["cohort", COHORT_HEADER, ACTOR_CONTEXT],
        ["structure", STRUCTURE_HEADER, ACTOR_CONTEXT],
        ["being", BEING_HEADER, BEING_CONTEXT],
    ])("renders the same control on the %s header", (_type, template, context) => {
        const input = draftInput(renderTemplateReal(template, { ...context, isDraft: true }));
        expect(input).toContain('type="checkbox"');
        expect(input).toContain("checked");
    });

    it("marks the being header's control too, though its identity is read-only", () => {
        // A being edits its name, shortcode and archetype through the identity
        // dialog behind the pencil. The draft mark is not an identity edit: it
        // is state a referee reads at a glance and flips in place, like the
        // status pills in the same row.
        expect(
            draftInput(renderTemplateReal(BEING_HEADER, { ...BEING_CONTEXT, isDraft: false })),
        ).not.toContain("checked");
    });
});
