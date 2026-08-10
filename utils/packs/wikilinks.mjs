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
 * Wikilink resolution for the pack compilers.
 *
 * Content notes link to one another with wikilinks rather than file paths:
 *
 *   `[[TLD/shortcode|Text]]`   a document in that top-level content directory
 *   `[[Text]]`                 an alias unique within the source's own TLD
 *   `[[TLD/shortcode#slug|T]]` a section (see below)
 *   `[[#slug|Text]]`           a section of the source note itself
 *
 * At compile time each becomes a Foundry UUID enricher, routed to the pack that
 * the target's TLD compiles into (see {@link PACK_BY_TLD}):
 *
 *   `@UUID[Compendium.sohl.items.Item.<id>]{Text}`
 *   `@UUID[Compendium.sohl.journals.JournalEntry.<id>.JournalEntryPage.<anchorId>]{Text}`
 *
 * Section links address a **JournalEntryPage**, because Foundry UUIDs cannot
 * target a position inside a page. A heading carrying `{#slug}` therefore starts
 * its own page, whose id is {@link anchorPageId} — derived from the note id and
 * the slug so that the link and the page agree without any shared state.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable.
 */

import crypto from "crypto";

/**
 * Top-level content directory → the compendium UUID prefix its documents
 * compile into. A TLD absent from this map cannot be linked to.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const PACK_BY_TLD = Object.freeze({
    Afflictions: "Compendium.sohl.items.Item",
    Armor: "Compendium.sohl.items.Item",
    Attributes: "Compendium.sohl.items.Item",
    Characters: "Compendium.sohl.actors.Actor",
    Creatures: "Compendium.sohl.actors.Actor",
    Macros: "Compendium.sohl.macros.Macro",
    Misc_Gear: "Compendium.sohl.items.Item",
    Mysteries: "Compendium.sohl.items.Item",
    Mystical_Abilities: "Compendium.sohl.items.Item",
    Projectiles: "Compendium.sohl.items.Item",
    Rules: "Compendium.sohl.journals.JournalEntry",
    Skills: "Compendium.sohl.items.Item",
    Trauma: "Compendium.sohl.items.Item",
    User_Guide: "Compendium.sohl.journals.JournalEntry",
    Weapons: "Compendium.sohl.items.Item",
});

const norm = (s) => String(s).toLowerCase().trim();

/**
 * The deterministic JournalEntryPage id for one anchor: SHA-256 of
 * `"<noteId>-<anchorSlug>"`, base64-encoded, reduced to the 16 alphanumeric
 * characters a Foundry id allows.
 *
 * Base64's `+`, `/`, and `=` are **not** legal in a Foundry document id
 * (`/^[A-Za-z0-9]{16}$/`), so they are dropped before the first 16 characters
 * are taken — the value stays a pure function of its two inputs, which is what
 * lets the link and the page be computed independently.
 *
 * @param {string} noteId - The owning JournalEntry's `_id`.
 * @param {string} anchorSlug - The slug declared by `{#slug}` on the heading.
 * @returns {string} A 16-character alphanumeric id.
 */
export function anchorPageId(noteId, anchorSlug) {
    return crypto
        .createHash("sha256")
        .update(`${noteId}-${anchorSlug}`)
        .digest("base64")
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 16);
}

/**
 * Builds the link-resolution tables for a content tree.
 *
 * @param {Array<{tld: string, id: string, shortcode?: string|null,
 *   aliases?: string[], name?: string}>} docs - One entry per content note.
 * @returns {{byShortcode: Map<string, object>, byAlias: Map<string, object|null>}}
 *   `byAlias` holds `null` where a TLD-scoped alias is claimed by more than one
 *   document, which makes the bare `[[Text]]` form unusable for it.
 */
export function buildWikilinkIndex(docs) {
    const byShortcode = new Map();
    const byAlias = new Map();
    for (const d of docs) {
        if (!d.id) continue;
        if (d.shortcode) byShortcode.set(`${d.tld}/${norm(d.shortcode)}`, d);
        for (const a of d.aliases ?? []) {
            const key = `${d.tld}|${norm(a)}`;
            // Second claimant poisons the alias: it can no longer be resolved.
            byAlias.set(key, byAlias.has(key) && byAlias.get(key) !== d ? null : d);
        }
    }
    return { byShortcode, byAlias };
}

/** Matches a whole wikilink, capturing its inner text. */
const WIKILINK = /\[\[([^\]\n]+)\]\]/g;

/**
 * Rewrites every wikilink in a markdown body as a Foundry UUID enricher.
 *
 * A link that cannot be resolved is left exactly as it was and reported in
 * `unresolved`, so a content gap degrades to visible literal text rather than
 * a broken link or a failed build.
 *
 * @param {string} markdown - The note body (frontmatter already stripped).
 * @param {object} ctx
 * @param {string} ctx.tld - The source note's top-level content directory.
 * @param {string} ctx.id - The source note's document id.
 * @param {{byShortcode: Map, byAlias: Map}} ctx.index - From {@link buildWikilinkIndex}.
 * @returns {{markdown: string, unresolved: Array<{link: string, target: string,
 *   reason: "unknown"|"ambiguous"|"unmapped-tld"}>}}
 */
export function convertWikilinks(markdown, { tld, id, index }) {
    const unresolved = [];

    const out = String(markdown).replace(WIKILINK, (all, rawInner) => {
        // A pipe inside a table cell is escaped as `\|`; undo that first.
        const inner = rawInner.replace(/\\\|/g, "|");
        const bar = inner.indexOf("|");
        let target = (bar === -1 ? inner : inner.slice(0, bar)).trim();
        let text = (bar === -1 ? inner : inner.slice(bar + 1)).trim();

        // Split off a section slug.
        let slug = null;
        const hash = target.indexOf("#");
        if (hash === 0) {
            slug = target.slice(1).trim();
            target = "";
        } else if (hash > 0) {
            slug = target.slice(hash + 1).trim();
            target = target.slice(0, hash).trim();
        }

        // Resolve the document: same-page (empty target), TLD/shortcode, or alias.
        let doc;
        if (target === "" && slug) {
            doc = { tld, id };
        } else {
            const slash = target.lastIndexOf("/");
            if (slash !== -1) {
                const targetTld = target.slice(0, slash);
                if (!PACK_BY_TLD[targetTld]) {
                    unresolved.push({ link: all, target, reason: "unmapped-tld" });
                    return all;
                }
                doc = index.byShortcode.get(
                    `${targetTld}/${norm(target.slice(slash + 1))}`,
                );
            } else {
                const hit = index.byAlias.get(`${tld}|${norm(target)}`);
                if (hit === null) {
                    unresolved.push({ link: all, target, reason: "ambiguous" });
                    return all;
                }
                doc = hit;
            }
        }
        if (!doc) {
            unresolved.push({ link: all, target, reason: "unknown" });
            return all;
        }

        const pack = PACK_BY_TLD[doc.tld];
        if (!pack) {
            unresolved.push({ link: all, target, reason: "unmapped-tld" });
            return all;
        }
        if (!text) text = doc.name ?? target;

        const uuid = slug
            ? `${pack}.${doc.id}.JournalEntryPage.${anchorPageId(doc.id, slug)}`
            : `${pack}.${doc.id}`;
        return `@UUID[${uuid}]{${text}}`;
    });

    return { markdown: out, unresolved };
}
