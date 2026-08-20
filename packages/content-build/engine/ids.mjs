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
 * Deterministic document ids, derived by hashing rather than stored.
 *
 * Several pack-build passes must agree on an id without being able to see each
 * other's output — the items pass and the journals pass on an item doc's entry
 * id, a section link and the page it addresses on that page's id. They agree by
 * deriving the id from the same inputs, so the derivation has to be reachable
 * from every one of them.
 *
 * That is why this is its own module and not part of `helpers.mjs`: link
 * resolution needs it, and `helpers.mjs` imports the link resolver. A leaf with
 * no local imports can be depended on from anywhere without a cycle.
 */

import crypto from "crypto";

/**
 * Stable 16-char hex id derived from `${namespace}:${value}`. Use for deriving
 * page ids from heading text when no explicit id is supplied.
 *
 * @param {string} namespace - Keeps unrelated derivations from colliding.
 * @param {string} value - The input the id is a function of.
 * @returns {string} A 16-character hexadecimal Foundry id.
 */
export function makeId(namespace, value) {
    return crypto
        .createHash("sha1")
        .update(`${namespace}:${value}`)
        .digest("hex")
        .slice(0, 16);
}

/**
 * Every content type that compiles into a Foundry `Scene` — a **map note**
 * (#1525). The three differ only in derived canvas defaults, which is the map
 * compiler's business; everything else treats them alike.
 *
 * Declared in this leaf module because several passes that must not depend on
 * the map compiler need it: the pack router below, and the doc-carrying type
 * set in `item-docs.mjs` (a map note's prose becomes a JournalEntry, exactly as
 * an item's or a macro's does).
 *
 * @type {ReadonlySet<string>}
 */
export const MAP_TYPES = Object.freeze(
    new Set(["battlemap", "localmap", "regionalmap"]),
);

/**
 * Content type → the pack its documents compile into, and the document type
 * that pack holds.
 *
 * These are pack **names**, not addresses. The package that owns the pack is
 * supplied by the caller, because it is a property of the repository doing the
 * building and not of the content: the same notes compiled by a different
 * repository belong to a different package. Baking the package into these
 * values is what made every link emitted by `sohl-thalorna` address the `sohl`
 * system (#1498) — correct here only by coincidence.
 *
 * @type {Readonly<Record<string, {pack: string, docType: string}>>}
 */
export const PACK_BY_TYPE = Object.freeze({
    doc: { pack: "journals", docType: "JournalEntry" },
    macro: { pack: "macros", docType: "Macro" },
    character: { pack: "actors", docType: "Actor" },
    creature: { pack: "actors", docType: "Actor" },
    ...Object.fromEntries(
        [...MAP_TYPES].map((type) => [
            type,
            { pack: "scenes", docType: "Scene" },
        ]),
    ),
});

/** Where every other content type compiles: the items pack. */
export const ITEM_PACK = Object.freeze({ pack: "items", docType: "Item" });

/**
 * The pack a type's documents live in, in the conventional one-pack-per-type
 * layout.
 *
 * Item types are the open set — a new one is added whenever the system grows a
 * document type — so they are the **default** rather than an enumerated list. A
 * hand-maintained list is what made an entire content directory silently
 * unlinkable once (#1276); nothing to maintain, nothing to forget.
 *
 * The `docType` is the authority: it is a property of the *content type* and
 * holds however a repository names or splits its packs. The `pack` is the
 * conventional name only — a repository may rename its packs, or ship several
 * of one type (#1566), in which case the pack a particular note's document
 * lands in comes from `engine/pack-router.mjs` and is passed to
 * {@link compendiumUuid} explicitly. This module stays free of the
 * configuration so the link resolver above it can stay pure.
 *
 * @param {string} type - The target note's `type`.
 * @returns {{pack: string, docType: string}} The pack and document type.
 */
export function packForType(type) {
    return PACK_BY_TYPE[type] ?? ITEM_PACK;
}

/**
 * A document's full compendium UUID.
 *
 * This is the one place a UUID is spelled. Every link is resolved by looking up
 * an address computed here — never by concatenating a prefix at the point of
 * use, which is how the package came to be hard-coded in two separate files.
 *
 * @param {string} packageId - The Foundry package that ships the pack, e.g.
 *   `sohl`. A system id or a module id; Foundry addresses both the same way.
 * @param {string} type - The note's content `type`.
 * @param {string} id - The document's id.
 * @param {string} [packName] - The pack the document actually landed in, from
 *   the pack router. Supplied wherever the note is known, because a repository
 *   may ship several packs of one type and a UUID carries the pack name
 *   (#1566). Omitted only where there is no note to route — the conventional
 *   name from {@link packForType} then stands in.
 * @returns {string} `Compendium.<packageId>.<pack>.<DocumentType>.<id>`
 */
export function compendiumUuid(packageId, type, id, packName) {
    const { pack, docType } = packForType(type);
    return `Compendium.${packageId}.${packName || pack}.${docType}.${id}`;
}

/**
 * The UUID of a JournalEntry page.
 *
 * @param {string} entryUuid - The owning entry's UUID, from
 *   {@link compendiumUuid}.
 * @param {string} pageId - The page's id.
 * @returns {string} The page's UUID.
 */
export function pageUuid(entryUuid, pageId) {
    return `${entryUuid}.JournalEntryPage.${pageId}`;
}
