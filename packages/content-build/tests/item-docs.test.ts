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
// Imported by relative path, not the `@src` alias, because the pack-build
// scripts live outside that tree.
import {
    hasDocEntry,
    itemDocEntryId,
    itemDocPointer,
    ITEM_TYPES,
} from "../engine/item-docs.mjs";
import { splitPages, buildPages, journalPageId } from "../engine/journals.mjs";

const ITEM_ID = "xPisQgs7pKDaYaKs";
const FOUNDRY_ID = /^[A-Za-z0-9]{16}$/;

describe("itemDocEntryId (the JournalEntry an item's prose moves to)", () => {
    it("derives a legal Foundry id from the item's own id", () => {
        expect(itemDocEntryId(ITEM_ID)).toMatch(FOUNDRY_ID);
    });

    it("is deterministic, so the items and journals passes agree", () => {
        expect(itemDocEntryId(ITEM_ID)).toBe(itemDocEntryId(ITEM_ID));
    });

    it("differs per item, and from the item's own id", () => {
        expect(itemDocEntryId(ITEM_ID)).not.toBe(
            itemDocEntryId("aaaaaaaaaaaaaaa1"),
        );
        expect(itemDocEntryId(ITEM_ID)).not.toBe(ITEM_ID);
    });
});

/** The pointer the items pass writes for a note, derived exactly as it does. */
function pointerFor(itemId: string, name: string, markdown: string): string {
    const [lead] = splitPages(markdown, name);
    return itemDocPointer(
        "sohl",
        itemId,
        name,
        journalPageId(itemDocEntryId(itemId), lead, 0),
    );
}

describe("itemDocPointer (the description an item carries instead of prose)", () => {
    it("addresses the entry's first page", () => {
        const entryId = itemDocEntryId(ITEM_ID);
        const pages = buildPages(
            splitPages("body", "Dehydrated"),
            entryId,
            "Dehydrated",
        );
        expect(pointerFor(ITEM_ID, "Dehydrated", "body")).toBe(
            `@UUID[Compendium.sohl.journals.JournalEntry.${entryId}.JournalEntryPage.${pages[0]._id}]{Dehydrated}`,
        );
    });

    it("points at the first page when the note splits into several", () => {
        const markdown = "# One\n\nfirst\n\n# Two\n\nsecond";
        const entryId = itemDocEntryId(ITEM_ID);
        const pages = buildPages(
            splitPages(markdown, "Weaponcraft"),
            entryId,
            "Weaponcraft",
        );
        expect(pages).toHaveLength(2);
        expect(pointerFor(ITEM_ID, "Weaponcraft", markdown)).toContain(
            `JournalEntryPage.${pages[0]._id}`,
        );
    });

    it("names the link after the item, so a broken pointer still says what it is", () => {
        expect(pointerFor(ITEM_ID, "Dehydrated", "body")).toMatch(
            /\{Dehydrated\}$/,
        );
    });
});

describe("splitPages lead-page naming", () => {
    it("names an item's unheaded prose after the item, not 'Introduction'", () => {
        const [page] = splitPages("plain prose, no headings", "Dehydrated");
        expect(page.name).toBe("Dehydrated");
    });

    it("still calls a journal note's lead page 'Introduction'", () => {
        const [page] = splitPages("intro\n\n# First\n\nbody");
        expect(page.name).toBe("Introduction");
    });
});

describe("hasDocEntry (whose prose becomes a JournalEntry of its own)", () => {
    it("accepts every item type", () => {
        for (const type of ITEM_TYPES) expect(hasDocEntry(type)).toBe(true);
    });

    it("accepts a macro — its body documents the script it also compiles", () => {
        expect(hasDocEntry("macro")).toBe(true);
    });

    it("rejects the types that are one document each", () => {
        for (const type of ["doc", "character", "creature"]) {
            expect(hasDocEntry(type), type).toBe(false);
        }
    });
});
