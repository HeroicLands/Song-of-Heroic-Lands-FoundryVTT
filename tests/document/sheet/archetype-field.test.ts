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
 * The **archetype sheet control** (issue #1780) — the point of moving the marker
 * from `flags.sohl.docArchetype` into `system.archetype`. Marking a document as
 * a Create-dialog archetype used to require exporting it, hand-editing the JSON
 * and re-importing, because Foundry ships no flag editor. A schema field can be
 * bound to an ordinary input, so it is one.
 *
 * These render the real `.hbs` and assert the emitted HTML, because what matters
 * is the **binding**: the field path Foundry will submit, and the value the
 * input carries for each of the three states.
 */
const ITEM_HEADER = "systems/sohl/templates/item/parts/header.hbs";
const ACTOR_HEADER = "systems/sohl/templates/actor/vehicle/header.hbs";

describe("the archetype control binds system.archetype (#1780)", () => {
    it("renders a number input bound to system.archetype on the item header", () => {
        const html = renderTemplateReal(ITEM_HEADER, {
            itemName: "Broadsword",
            itemImg: "icons/svg/sword.svg",
            typeLabel: "Weapon",
            logic: { data: { shortcode: "brdswd" } },
            canMarkArchetype: true,
            archetype: 1,
        });
        expect(html).toContain('name="system.archetype"');
        expect(html).toContain('type="number"');
        expect(html).toMatch(/name="system\.archetype"[^>]*value="1"/);
    });

    it("renders priority 0 as 0, never as blank — the falsy trap", () => {
        // SoHL's own archetypes ship at priority 0. A template that treated the
        // value as truthy would render an empty box, and saving the sheet would
        // then clear the marker the author never touched.
        const html = renderTemplateReal(ITEM_HEADER, {
            itemName: "Broadsword",
            logic: { data: { shortcode: "brdswd" } },
            canMarkArchetype: true,
            archetype: 0,
        });
        expect(html).toMatch(/name="system\.archetype"[^>]*value="0"/);
    });

    it("renders null as an empty box — 'not an archetype'", () => {
        const html = renderTemplateReal(ITEM_HEADER, {
            itemName: "Broadsword",
            logic: { data: { shortcode: "brdswd" } },
            canMarkArchetype: true,
            archetype: null,
        });
        // Foundry's FormDataExtended casts an empty number input back to `null`,
        // which is exactly the schema's "not an archetype" state — so clearing
        // the box is how an author un-marks an archetype.
        expect(html).toMatch(/name="system\.archetype"[^>]*value=""/);
    });

    it("omits the control entirely when the viewer may not mark archetypes", () => {
        const html = renderTemplateReal(ITEM_HEADER, {
            itemName: "Broadsword",
            logic: { data: { shortcode: "brdswd" } },
            canMarkArchetype: false,
            archetype: 1,
        });
        expect(html).not.toContain("system.archetype");
    });

    it("renders the same control on an actor header", () => {
        const html = renderTemplateReal(ACTOR_HEADER, {
            actorName: "Cart",
            typeLabel: "Vehicle",
            document: { system: { shortcode: "cart" } },
            canMarkArchetype: true,
            archetype: 2,
        });
        expect(html).toMatch(/name="system\.archetype"[^>]*value="2"/);
    });
});
