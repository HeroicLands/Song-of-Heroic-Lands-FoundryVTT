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
 *   `[[type/shortcode|Text]]`   a document of that type
 *   `[[Text]]`                  an alias unique within the source's own section
 *   `[[type/shortcode#slug|T]]` a section (see below)
 *   `[[#slug|Text]]`            a section of the source note itself
 *
 * The qualifier is the note's **type**, which with its shortcode is the system's
 * logical identity: `(type, shortcode)` is unique by rule (see the Shortcode
 * Integrity doc). It is deliberately not the note's directory — shortcodes are
 * unique per type, not per directory, so a directory qualifier would add nothing
 * to the address while breaking every inbound link the moment a note is refiled.
 *
 * The bare form is an authoring shorthand rather than an address, and it is
 * scoped to the source's **section** — its type, except that prose pages
 * (`type: doc`) scope by `category`. That is where authoring actually guarantees
 * a unique name: every `doc` shares one type, so scoping the shorthand by type
 * would make `[[Gear]]` ambiguous between the rules page and the user-guide page
 * that both legitimately carry the name.
 *
 * At compile time each becomes a Foundry UUID enricher, routed to the pack that
 * the target's type compiles into (see {@link packForType}):
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
 * Content type → the compendium UUID prefix its documents compile into, for the
 * types that are **not** items.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const PACK_BY_TYPE = Object.freeze({
    doc: "Compendium.sohl.journals.JournalEntry",
    macro: "Compendium.sohl.macros.Macro",
    character: "Compendium.sohl.actors.Actor",
    creature: "Compendium.sohl.actors.Actor",
});

/** Where every other content type compiles: the items pack. */
export const ITEM_PACK = "Compendium.sohl.items.Item";

/**
 * The compendium a type's documents live in.
 *
 * Item types are the open set — a new one is added whenever the system grows a
 * document type — so they are the **default** rather than an enumerated list. A
 * hand-maintained list is what made an entire content directory silently
 * unlinkable once (#1276); nothing to maintain, nothing to forget.
 *
 * @param {string} type - The target note's `type`.
 * @returns {string} The compendium UUID prefix.
 */
export function packForType(type) {
    return PACK_BY_TYPE[type] ?? ITEM_PACK;
}

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
 * @param {Array<{type: string, section: string, id: string,
 *   shortcode?: string|null, aliases?: string[], name?: string}>} docs - One
 *   entry per content note.
 * @returns {{byShortcode: Map<string, object>, byAlias: Map<string, object|null>,
 *   types: Set<string>}} `byAlias` holds `null` where a section-scoped alias is
 *   claimed by more than one document, which makes the bare `[[Text]]` form
 *   unusable for it. `types` is every type the tree actually contains, so a
 *   qualifier naming no real type can be told apart from a missing target.
 */
export function buildWikilinkIndex(docs) {
    const byShortcode = new Map();
    const byAlias = new Map();
    const types = new Set();
    for (const d of docs) {
        if (!d.id || !d.type) continue;
        types.add(norm(d.type));
        if (d.shortcode) byShortcode.set(`${norm(d.type)}/${norm(d.shortcode)}`, d);
        for (const a of d.aliases ?? []) {
            const key = `${norm(d.section ?? d.type)}|${norm(a)}`;
            // Second claimant poisons the alias: it can no longer be resolved.
            byAlias.set(key, byAlias.has(key) && byAlias.get(key) !== d ? null : d);
        }
    }
    return { byShortcode, byAlias, types };
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
 * @param {string} ctx.type - The source note's `type`.
 * @param {string} ctx.section - The source note's section, which scopes a bare
 *   `[[Text]]` (its type, or its `category` when the note is a `doc`).
 * @param {string} ctx.id - The source note's document id.
 * @param {{byShortcode: Map, byAlias: Map, types: Set}} ctx.index - From
 *   {@link buildWikilinkIndex}.
 * @returns {{markdown: string, unresolved: Array<{link: string, target: string,
 *   reason: "unknown"|"ambiguous"|"unknown-type"}>}}
 */
export function convertWikilinks(markdown, { type, section, id, index }) {
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

        // Resolve the document: same-page (empty target), type/shortcode, or alias.
        let doc;
        if (target === "" && slug) {
            doc = { type, id };
        } else {
            const slash = target.lastIndexOf("/");
            if (slash !== -1) {
                const targetType = norm(target.slice(0, slash));
                if (!index.types.has(targetType)) {
                    unresolved.push({ link: all, target, reason: "unknown-type" });
                    return all;
                }
                doc = index.byShortcode.get(
                    `${targetType}/${norm(target.slice(slash + 1))}`,
                );
            } else {
                const hit = index.byAlias.get(
                    `${norm(section ?? type)}|${norm(target)}`,
                );
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

        if (!text) text = doc.name ?? target;

        const pack = packForType(doc.type);
        const uuid = slug
            ? `${pack}.${doc.id}.JournalEntryPage.${anchorPageId(doc.id, slug)}`
            : `${pack}.${doc.id}`;
        return `@UUID[${uuid}]{${text}}`;
    });

    return { markdown: out, unresolved };
}
