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
 *   `[[Text]]`                  an alias unique within the source's own type
 *   `[[type/shortcode#slug|T]]` a section (see below)
 *   `[[#slug|Text]]`            a section of the source note itself
 *   `[[doctype/shortcode|T]]`   an item's *documentation* (see below)
 *
 * The qualifier is the note's **type**, which with its shortcode is the system's
 * logical identity: `(type, shortcode)` is unique by rule (see the Shortcode
 * Integrity doc). It is deliberately not the note's directory — shortcodes are
 * unique per type, not per directory, so a directory qualifier would add nothing
 * to the address while breaking every inbound link the moment a note is refiled.
 *
 * The bare form is the same address with the qualifier left implicit: it resolves
 * against the aliases of the source's **own type**, so a `doc` reaches any other
 * `doc` by name wherever it is filed. Nothing narrower is consulted — a note's
 * directory and its `category` play no part in resolution. Where two notes of a
 * type legitimately share a name (a rules page and a user-guide page both called
 * "Gear"), the bare form is ambiguous and resolves to neither; the author writes
 * the full `[[type/shortcode|Text]]` form instead.
 *
 * At compile time each becomes a Foundry UUID enricher, routed to the pack that
 * the target's type compiles into (see {@link packForType}):
 *
 *   `@UUID[Compendium.sohl.items.Item.<id>]{Text}`
 *   `@UUID[Compendium.sohl.journals.JournalEntry.<id>.JournalEntryPage.<anchorId>]{Text}`
 *
 * **Every address is computed once, when the target is indexed** — see
 * {@link buildWikilinkIndex} — and a link is resolved by looking that value up.
 * Nothing here concatenates a prefix at the point of use (#1498).
 *
 * Section links address a **JournalEntryPage**, because Foundry UUIDs cannot
 * target a position inside a page. A heading carrying `{#slug}` therefore starts
 * its own page, whose id is {@link anchorPageId} — derived from the note id and
 * the slug so that the link and the page agree without any shared state.
 *
 * **An anchor on an Item, an Actor or a Macro is a no-op** and is dropped. What
 * such a link does is open that document's **sheet** — not its documentation —
 * and a sheet has no sections to address. Only a JournalEntry link opens a
 * journal, at its first page or at the page an anchor names. An item's pages are
 * reached through its `doc<type>` counterpart, below.
 *
 * **Items and their documentation are two documents.** An item note compiles
 * into an item — and, separately, its prose compiles into a JournalEntry in the
 * journals pack (see {@link sohl.utils.packs.itemDocEntryId}). `skill/wpnc`
 * addresses the skill; the **virtual qualifier** `docskill/wpnc` addresses that
 * skill's documentation, and `docskill/wpnc#crafting` a page within it. Every
 * item type has a `doc<type>` counterpart, formed by prefix and never
 * enumerated; see {@link resolveItemDocType}. Without it a section link to an
 * item note produced a UUID against the *items* pack, which cannot hold a
 * JournalEntryPage, and dead-ended (#1362).
 *
 * **The two builds read the qualifier differently, by design.** In Foundry the
 * item and its documentation are separate documents in separate packs, so the
 * two qualifiers resolve to two different UUIDs. On the knowledgebase the item
 * note renders as a single page which *is* its documentation, so `doc<type>` and
 * `<type>` are aliases for the same URL and an anchor on either is an ordinary
 * in-page anchor. One authored link, correct in both.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable.
 */

import crypto from "crypto";

import {
    compendiumUuid,
    ITEM_PACK,
    packForType,
    pageUuid,
    PACK_BY_TYPE,
} from "./ids.mjs";
import { itemDocEntryId } from "./item-docs.mjs";

export { ITEM_PACK, PACK_BY_TYPE, packForType };

/**
 * The qualifier prefix that addresses an item's **documentation** rather than
 * the item: `docskill/wpnc` is the JournalEntry that `skill/wpnc`'s prose
 * compiled into. See {@link resolveItemDocType}.
 */
const ITEM_DOC_PREFIX = "doc";

const norm = (s) => String(s).toLowerCase().trim();

/**
 * Reads a qualifier as the **virtual `doc<type>`** form, or reports that it is
 * not one.
 *
 * An item and its documentation are two documents in two packs, so they need
 * two addresses (#1362). `skill/wpnc` is the item; `docskill/wpnc` is the
 * JournalEntry its prose compiled into. The virtual form exists only for types
 * that actually produce an item doc — which is exactly the types that compile
 * into the items pack, so there is no second list to keep in step (#1276).
 *
 * A **real** type of the same name always wins: the virtual reading is only
 * consulted for a qualifier no authored note claims.
 *
 * @param {string} qualifier - The already-normalised text before the `/`.
 * @param {Set<string>} types - Every type the content tree contains.
 * @returns {string|null} The underlying item type, or `null` when the qualifier
 *   is not a virtual one.
 */
export function resolveItemDocType(qualifier, types) {
    if (types.has(qualifier)) return null; // a real type owns its own name
    if (!qualifier.startsWith(ITEM_DOC_PREFIX)) return null;
    const base = qualifier.slice(ITEM_DOC_PREFIX.length);
    if (!base || !types.has(base)) return null;
    return packForType(base).pack === ITEM_PACK.pack ? base : null;
}

/**
 * Read a link target as a **qualified** `type-shortcode` reference, or report
 * that it is a bare alias instead.
 *
 * Two separators are accepted, and they are **not** interchangeable in how
 * confidently they mark a target as qualified:
 *
 * - **`type-shortcode`** — the canonical form (#1398). Obsidian reads `/` inside
 *   a wikilink as a *path* and resolves it against the vault's folders, so a
 *   slash-qualified link is a broken link in the editor where the content is now
 *   authored. A hyphen qualifies **only when what precedes it is a known type**:
 *   note names contain hyphens too (`Grukar-ahk`), and those must keep resolving
 *   as aliases. The split is at the **first** hyphen, so a shortcode may itself
 *   contain one (`trauma-self-pro` → `trauma` + `self-pro`).
 * - **`type/shortcode`** — the legacy form, still resolved so that a link
 *   written before the vault migrated does not silently die. A slash is
 *   *unconditionally* a qualifier: nothing else uses one, so an unknown type
 *   before it is an error rather than an invitation to try the alias index. The
 *   split is at the **last** slash, as it always was.
 *
 * A leading **package** segment is optional and outermost: `sohl-skill-lang` is
 * `skill-lang` in the `sohl` package. It is read only when `packages` is given
 * and names the segment, and only when the remainder is itself a valid address,
 * so a note called "Grukar-ahk" stays an alias (#1499).
 *
 * @param {string} target - The link target, anchor already removed.
 * @param {Set<string>} types - Every type the content tree contains.
 * @param {Set<string>} [packages] - Every package an address may name. Omitted
 *   by callers that resolve within one package, where the form cannot occur.
 * @returns {{type: string, shortcode: string, itemDoc: boolean,
 *   package?: string, reason?: undefined} | {reason: "unknown-type"} | null}
 *   The resolved qualifier; a `reason` when the target is definitely qualified
 *   but names no known type; or `null` when it is a bare alias.
 */
export function readQualifier(target, types, packages) {
    // A leading **package** segment is the optional outermost qualifier:
    // `sohl-skill-lang` is `skill-lang` in the `sohl` package. It is stripped
    // here so everything below reads the same `type`/`shortcode` it always did,
    // and it is recognised only when what precedes the hyphen is a package this
    // build knows *and* the remainder is itself a valid address — so a note
    // named "Sohl-something" is still an alias (#1499).
    if (packages?.size) {
        const hyphen = target.indexOf("-");
        if (hyphen > 0) {
            const pkg = norm(target.slice(0, hyphen));
            if (packages.has(pkg)) {
                const rest = readQualifier(target.slice(hyphen + 1), types);
                if (rest && !rest.reason) return { ...rest, package: pkg };
            }
        }
    }

    const slash = target.lastIndexOf("/");
    if (slash > 0) {
        const read = readTypeAndCode(
            target.slice(0, slash),
            target.slice(slash + 1),
            types,
        );
        // A slash means qualified whether or not the type is real.
        return read ?? { reason: "unknown-type" };
    }

    const hyphen = target.indexOf("-");
    if (hyphen > 0) {
        // A hyphen qualifies only on a known type; otherwise it is part of a name.
        return readTypeAndCode(
            target.slice(0, hyphen),
            target.slice(hyphen + 1),
            types,
        );
    }
    return null;
}

/**
 * Resolve a qualifier/shortcode pair, honouring the virtual `doc<type>` form.
 *
 * @param {string} rawType
 * @param {string} rawCode
 * @param {Set<string>} types
 * @returns {{type: string, shortcode: string, itemDoc: boolean} | null}
 *   `null` when the qualifier names no known type, or the shortcode is empty.
 */
function readTypeAndCode(rawType, rawCode, types) {
    const shortcode = norm(rawCode);
    if (!shortcode) return null;

    let type = norm(rawType);
    const base = resolveItemDocType(type, types);
    if (base) return { type: base, shortcode, itemDoc: true };
    if (!types.has(type)) return null;
    return { type, shortcode, itemDoc: false };
}

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
 * @param {Array<{type: string, id: string, shortcode?: string|null,
 *   aliases?: string[], name?: string}>} docs - One entry per content note.
 * @returns {{byShortcode: Map<string, object>, byAlias: Map<string, object|null>,
 *   types: Set<string>}} `byAlias` holds `null` where a type-scoped alias is
 *   claimed by more than one document, which makes the bare `[[Text]]` form
 *   unusable for it. `types` is every type the tree actually contains, so a
 *   qualifier naming no real type can be told apart from a missing target.
 */
export function buildWikilinkIndex(docs, packageId) {
    if (!packageId) {
        throw new Error(
            "buildWikilinkIndex: packageId is required — it is the first " +
                "segment of every emitted UUID, and defaulting it is how links " +
                "came to address the wrong package (#1498).",
        );
    }

    const byShortcode = new Map();
    const byAlias = new Map();
    const types = new Set();

    // Each note's address is computed once, here, and every reference to it is
    // that stored value. Nothing downstream assembles a UUID from parts, so a
    // link and its target cannot disagree about where the document lives.
    const uuidByDoc = new Map();

    for (const d of docs) {
        if (!d.id || !d.type) continue;
        types.add(norm(d.type));

        uuidByDoc.set(d, {
            uuid: compendiumUuid(packageId, d.type, d.id),
            // An item's prose compiles into a separate JournalEntry, addressed
            // by the virtual `doc<type>` qualifier. Its id is derived from the
            // item's, so its address is knowable here too.
            docUuid: compendiumUuid(packageId, "doc", itemDocEntryId(d.id)),
        });

        if (d.shortcode) byShortcode.set(`${norm(d.type)}/${norm(d.shortcode)}`, d);
        for (const a of d.aliases ?? []) {
            const key = `${norm(d.type)}|${norm(a)}`;
            // Second claimant poisons the alias: it can no longer be resolved.
            byAlias.set(key, byAlias.has(key) && byAlias.get(key) !== d ? null : d);
        }
    }
    return { byShortcode, byAlias, types, uuidByDoc, packageId };
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
 * @param {string} ctx.type - The source note's `type`, which scopes a bare `[[Text]]`.
 * @param {string} ctx.id - The source note's document id.
 * @param {{byShortcode: Map, byAlias: Map, types: Set}} ctx.index - From
 *   {@link buildWikilinkIndex}.
 * @returns {{markdown: string, unresolved: Array<{link: string, target: string,
 *   reason: "unknown"|"ambiguous"|"unknown-type"}>}}
 */
export function convertWikilinks(markdown, { type, id, index }) {
    const unresolved = [];

    const out = String(markdown).replace(WIKILINK, (all, rawInner) => {
        // A pipe inside a table cell is escaped as `\|`; undo that first.
        const inner = rawInner.replace(/\\\|/g, "|");
        const bar = inner.indexOf("|");
        let target = (bar === -1 ? inner : inner.slice(0, bar)).trim();
        const labelled = bar !== -1;
        let text = (labelled ? inner.slice(bar + 1) : inner).trim();

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

        // Resolve the document: same-page (empty target), type-shortcode, or alias.
        let doc;
        // Set when the qualifier was the virtual `doc<type>` form, so the UUID
        // is built against the item doc entry rather than the item itself.
        let itemDoc = false;
        // Set when the target was read as `type-shortcode` — an address rather
        // than prose, which decides what an unlabelled link shows (#1409).
        let addressed = false;
        if (target === "" && slug) {
            doc = { type, id };
        } else {
            const qualified = readQualifier(target, index.types);
            if (qualified?.reason) {
                unresolved.push({ link: all, target, reason: qualified.reason });
                return all;
            }
            if (qualified) {
                addressed = true;
                itemDoc = qualified.itemDoc;
                doc = index.byShortcode.get(
                    `${qualified.type}/${qualified.shortcode}`,
                );
            } else {
                const hit = index.byAlias.get(`${norm(type)}|${norm(target)}`);
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

        // With no explicit label, a *qualified* target has no prose to show — a
        // shortcode is an address, not display text — so the document's own name
        // stands in (#1409). A bare `[[Text]]` is already the prose the author
        // wrote, and substituting the canonical name there would rewrite the
        // sentence ("worsens the [[Shock State]]" must not render as "Shock").
        // The knowledgebase build reads the same authored link the same way.
        if (!text || (!labelled && addressed)) text = doc.name ?? target;

        // Both addresses were computed when the target was indexed. An item
        // doc lives in the journals pack under its own derived entry id, and
        // its pages hash against *that* id — not the item's.
        //
        // The one target with no index entry is the note itself: a `[[#slug]]`
        // self-link is resolved from the source's own type and id, which the
        // caller supplied, so it is addressed the same way here.
        const addresses = index.uuidByDoc.get(doc) ?? {
            uuid: compendiumUuid(index.packageId, doc.type, doc.id),
            docUuid: compendiumUuid(
                index.packageId,
                "doc",
                itemDocEntryId(doc.id),
            ),
        };
        const entryUuid = itemDoc ? addresses.docUuid : addresses.uuid;
        const entryId = itemDoc ? itemDocEntryId(doc.id) : doc.id;
        const isJournal = itemDoc || packForType(doc.type).pack === "journals";
        // A JournalEntry link opens a journal — at its first page, or at the
        // page an anchor names. An Item or Actor link opens that document's
        // *sheet*, which has no sections, so the anchor has nothing to address
        // and is dropped. Forging a JournalEntryPage id onto a document that
        // can never hold one is what made such links dead-end (#1362); an
        // item's pages are addressed through its `doc<type>` counterpart.
        const uuid =
            slug && isJournal
                ? pageUuid(entryUuid, anchorPageId(entryId, slug))
                : entryUuid;
        return `@UUID[${uuid}]{${text}}`;
    });

    return { markdown: out, unresolved };
}
