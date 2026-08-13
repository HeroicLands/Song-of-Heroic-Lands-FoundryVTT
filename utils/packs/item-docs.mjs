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

/**
 * **Item docs** — an item's prose compiled as a JournalEntry, with the item
 * keeping only a pointer to it.
 *
 * An item note's body describes what the thing *is*. That is documentation, and
 * documentation belongs in the journals pack, so each item note compiles into a
 * JournalEntry and the item's `system.docHtml` becomes nothing but a `@UUID`
 * link to that entry's first page — the description-as-pointer convention
 * (#1356), which {@link sohl.utils.descriptionLinkTarget} recognises and
 * Display Description follows.
 *
 * The prose then exists once. Previously every actor carrying an item carried
 * its own copy of that item's description: 7.59 MB across the actors pack, of
 * which only 133 KB was distinct text (#1348). Nothing about actors changes —
 * they embed whatever the item carries, and what the item carries is now a link.
 *
 * **Two passes, no shared state.** The items pass writes the pointer; the
 * journals pass writes the entry it points at. Neither can see the other's
 * output, so both derive the same ids from the item note's own id — the same
 * technique {@link anchorPageId} uses to let a section link and its page agree.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable.
 */

import { makeId } from "./ids.mjs";

/** The compendium item docs compile into. */
const JOURNAL_PACK = "Compendium.sohl.journals.JournalEntry";

/**
 * Every content type that compiles into an item — and therefore into an item
 * doc. Declared here rather than in the items compiler because both passes need
 * it: the items pass to know what to compile, the journals pass to know whose
 * prose it is holding.
 *
 * @type {ReadonlySet<string>}
 */
export const ITEM_TYPES = Object.freeze(
    new Set([
        "affiliation",
        "affliction",
        "armorgear",
        "attribute",
        "concoctiongear",
        "containergear",
        "miscgear",
        "mystery",
        "mysticalability",
        "projectilegear",
        "skill",
        "trait",
        "trauma",
        "weapongear",
    ]),
);

/**
 * Whether a content note's type is one whose prose becomes an item doc.
 *
 * @param {string} type - The note's `type` frontmatter.
 * @returns {boolean} True for an item type; false for `doc`, actors, and macros.
 */
export function isItemDocType(type) {
    return ITEM_TYPES.has(String(type));
}

/**
 * The id of the JournalEntry an item's prose compiles into.
 *
 * Derived from the item's own id so that the items pass and the journals pass
 * agree on it without either reading the other's output. It is deliberately not
 * the item id itself: the two documents are distinct, live in different packs,
 * and sharing an id would make either one's UUID ambiguous to read.
 *
 * @param {string} itemId - The item note's `id` frontmatter.
 * @returns {string} A 16-character Foundry id.
 */
export function itemDocEntryId(itemId) {
    return makeId("item-doc", itemId);
}

/**
 * The description an item carries in place of its prose: a `@UUID` link to the
 * first page of its item doc, and nothing else.
 *
 * "Nothing else" is the whole convention — a description that is *only* a link
 * is a pointer, and anything alongside it would make it ordinary prose that
 * happens to contain a link, which the runtime would then show verbatim.
 *
 * @param {string} itemId - The item note's `id` frontmatter.
 * @param {string} name - The item's name, used as the link's label. It shows
 *   only if the target ever fails to resolve, where a broken link naming the
 *   item beats a bare UUID.
 * @param {string} firstPageId - The id of the entry's first page, from
 *   {@link journalPageId}.
 * @returns {string} The pointer to store in `system.docHtml`.
 */
export function itemDocPointer(itemId, name, firstPageId) {
    const entryId = itemDocEntryId(itemId);
    return `@UUID[${JOURNAL_PACK}.${entryId}.JournalEntryPage.${firstPageId}]{${name}}`;
}
