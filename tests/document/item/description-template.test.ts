/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the real item Description tab template in Node and assert the emitted
 * HTML. Covers #1357: a description that is only a link is a **pointer**, and
 * the tab must show what it points at — read-only, with an edit control that
 * reveals the editor — while an ordinary description still gets the editor
 * directly.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const DESCRIPTION = "systems/sohl/templates/item/parts/description.hbs";

function render(context: Record<string, unknown>): string {
    return renderTemplateReal(DESCRIPTION, {
        tab: { active: true, group: "sheet" },
        document: { uuid: "Item.abc123" },
        system: { docHtml: "" },
        ...context,
    });
}

describe("item description tab template (#1357)", () => {
    it("shows the resolved target read-only when the description is a pointer", () => {
        const html = render({
            descriptionIsPointer: true,
            descriptionEditing: false,
            descriptionHtml: "<p>The smith's own account of the craft.</p>",
            system: { docHtml: "@UUID[JournalEntry.j1.JournalEntryPage.p1]" },
        });

        expect(html).toContain("The smith's own account of the craft.");
        // Read-only: the editor is not rendered at all, so nothing invites an
        // edit the author did not ask for.
        expect(html).not.toContain("<prose-mirror");
        expect(html).toContain('data-action="toggleDescriptionEdit"');
    });

    it("renders the target's markup as HTML, not as escaped text", () => {
        const html = render({
            descriptionIsPointer: true,
            descriptionEditing: false,
            descriptionHtml:
                '<p>See <a class="content-link" data-uuid="Item.x">Weaponcraft</a>.</p>',
        });

        // Links inside the target stay live links, so a reader can still open
        // the page itself.
        expect(html).toContain('<a class="content-link" data-uuid="Item.x">');
        expect(html).not.toContain("&lt;a class");
    });

    it("reveals the editor, holding the link, when editing a pointer", () => {
        const html = render({
            descriptionIsPointer: true,
            descriptionEditing: true,
            descriptionHtml: "",
            system: { docHtml: "@UUID[JournalEntry.j1.JournalEntryPage.p1]" },
        });

        expect(html).toContain('<prose-mirror name="system.docHtml"');
        expect(html).toContain('value="@UUID[JournalEntry.j1.JournalEntryPage.p1]"');
        // The control stays, so the reader view is one click back.
        expect(html).toContain('data-action="toggleDescriptionEdit"');
    });

    it("gives an ordinary description the editor directly, with no toggle", () => {
        const html = render({
            descriptionIsPointer: false,
            descriptionEditing: true,
            descriptionHtml: "",
            system: { docHtml: "<p>A wide flat blade.</p>" },
        });

        expect(html).toContain('<prose-mirror name="system.docHtml"');
        expect(html).not.toContain("toggleDescriptionEdit");
    });

    it("binds the editor to the document being edited", () => {
        const html = render({
            descriptionIsPointer: false,
            descriptionEditing: true,
            document: { uuid: "Actor.a1.Item.i1" },
        });
        expect(html).toContain('data-document-uuid="Actor.a1.Item.i1"');
    });
});
