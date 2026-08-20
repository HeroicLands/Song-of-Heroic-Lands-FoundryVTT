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
 * Which pack a note's document lands in, when a document type has more than
 * one (#1566).
 *
 * A repository used to be able to ship exactly one pack per document type: the
 * pipeline ran one compile pass per type and routed every note of that type
 * into that pass's pack. Editorial grouping of same-type documents into
 * separate compendiums is ordinary Foundry practice — "Core Spells" and
 * "Expanded Spells" are two Item packs — and `sohl-kethira-basic` shipped
 * three. Collapsing them is a breaking change for every existing world,
 * because a compendium UUID carries its pack name
 * (`Compendium.<pkg>.characteristics.Item.<id>`).
 *
 * **A note declares its pack; the configuration declares the default.** The
 * routing key is one frontmatter field, `pack:`, naming a pack from the
 * configured list — declarative and inspectable, so a maintainer reads where a
 * note lands rather than tracing a predicate. Its `type:` still selects the
 * *compiler*; the declaration selects *which pack of that type* receives the
 * document, and the two are orthogonal.
 *
 * The rules, in full:
 *
 * - A note that declares nothing lands in the **default** pack of its document
 *   type. A type with exactly one pack is that type's default implicitly, which
 *   is what keeps every existing one-pack-per-type configuration — and every
 *   note in it — behaving identically.
 * - A type with several packs designates its default with `default: true`.
 *   Where none does, a declaration is **mandatory** for every note of that type:
 *   an undeclared note routes nowhere and fails the build.
 * - A declared name that no pack answers to — or that names a pack holding
 *   another document type, or a companion pack, which no note may address —
 *   fails the build, naming the note and what it asked for. A silent fall-back
 *   to the default would be #1502 in a new costume.
 * - A note's **derived** documents are routed by the default of *their* type,
 *   not by the note's declaration: an item note's prose compiles into a
 *   JournalEntry, and `pack:` names where the *item* goes.
 *
 * @module
 */

import { packForType } from "./ids.mjs";
import { packConfig } from "./pack-config.mjs";

/**
 * A note that cannot be routed to a pack. Thrown rather than returned so no
 * caller can carry on with a plausible-looking default.
 */
export class PackRoutingError extends Error {
    /** @param {string} message */
    constructor(message) {
        super(message);
        this.name = "PackRoutingError";
    }
}

/**
 * The frontmatter field a note declares its pack in.
 *
 * Deliberately close to `package:` and deliberately not the same word: a note's
 * `package:` says which *distribution* owns it, `pack:` which *compendium*
 * receives its document.
 */
export const PACK_FIELD = "pack";

/**
 * Build the router for one configured pack list.
 *
 * Pure — it reads the list and nothing else, so a consumer's routing can be
 * tested without a content tree or a config file on disk.
 *
 * @param {readonly object[]} packs - The resolved `packs` list from
 *   `defineConfig`.
 * @returns {{resolve: (fm: object, docType: string) => string,
 *   resolveOrNull: (fm: object, docType: string) => string|undefined,
 *   packsOfType: (docType: string) => string[],
 *   defaultOf: (docType: string) => string|undefined}} The router.
 */
export function createPackRouter(packs) {
    /** Routable packs — a companion is written by its parent's pass. */
    const byName = new Map();
    /** Companion names, so addressing one can be refused by name. */
    const companions = new Set();
    /** @type {Map<string, string[]>} */
    const byType = new Map();
    /** @type {Map<string, string>} */
    const defaults = new Map();

    for (const pack of packs ?? []) {
        byName.set(pack.name, pack);
        const names = byType.get(pack.type) ?? [];
        names.push(pack.name);
        byType.set(pack.type, names);
        if (pack.default) defaults.set(pack.type, pack.name);
        for (const companion of pack.companions ?? []) {
            companions.add(companion.name);
        }
    }
    // A type with exactly one pack needs no `default: true` to have one: the
    // single-pack layout is the common case, and requiring the flag there would
    // make every existing configuration invalid for no gain.
    for (const [type, names] of byType) {
        if (names.length === 1) defaults.set(type, names[0]);
    }

    /** @param {object} fm */
    const noteLabel = (fm) =>
        fm?.name?.full ?? fm?.shortcode ?? fm?.id ?? "a note";

    /**
     * The pack one pass should write this note's document to.
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} docType - The document type the calling pass writes.
     * @returns {string} The pack name.
     * @throws {PackRoutingError} When the note routes nowhere.
     */
    function resolve(fm, docType) {
        const declared = fm?.[PACK_FIELD];
        // The declaration names where the note's *own* document goes. A pass
        // writing a document derived from it — an item's prose becoming a
        // JournalEntry — is not what the author was addressing.
        const ownDocType = packForType(fm?.type).docType;

        if (declared != null && declared !== "" && docType === ownDocType) {
            if (companions.has(declared)) {
                throw new PackRoutingError(
                    `${noteLabel(fm)} declares \`pack: ${declared}\`, which is a ` +
                        `companion pack. A companion is written by another pack's ` +
                        `pass, so no note may be routed into one.`,
                );
            }
            const pack = byName.get(declared);
            if (!pack) {
                throw new PackRoutingError(
                    `${noteLabel(fm)} declares \`pack: ${declared}\`, which no ` +
                        `configured pack answers to. Declare it in ` +
                        `content-build.config.mjs, or correct the note. ` +
                        `Packs of type ${docType}: ` +
                        `${(byType.get(docType) ?? []).join(", ") || "(none)"}.`,
                );
            }
            if (pack.type !== docType) {
                throw new PackRoutingError(
                    `${noteLabel(fm)} is a ${docType} but declares ` +
                        `\`pack: ${declared}\`, which holds ${pack.type} ` +
                        `documents. A note's \`pack:\` names a pack of its own ` +
                        `document type.`,
                );
            }
            return declared;
        }

        const fallback = defaults.get(docType);
        if (!fallback) {
            const candidates = byType.get(docType) ?? [];
            throw new PackRoutingError(
                candidates.length ?
                    `${noteLabel(fm)} declares no \`pack:\`, and no ${docType} ` +
                        `pack is marked \`default: true\` — so it routes ` +
                        `nowhere. Mark one of ${candidates.join(", ")} as the ` +
                        `default, or declare the pack on the note.`
                :   `${noteLabel(fm)} compiles into a ${docType}, but no pack ` +
                        `of that type is configured.`,
            );
        }
        return fallback;
    }

    return {
        resolve,

        /**
         * {@link resolve} for a caller that must not fail the build — the link
         * index, which addresses every note it can and leaves the compilers to
         * report the ones it cannot.
         *
         * @param {object} fm - The note's frontmatter.
         * @param {string} docType - The document type being addressed.
         * @returns {string|undefined} The pack name, or `undefined`.
         */
        resolveOrNull(fm, docType) {
            try {
                return resolve(fm, docType);
            } catch {
                return undefined;
            }
        },

        /**
         * Every routable pack of a document type, in configured order.
         *
         * @param {string} docType - The Foundry document type.
         * @returns {string[]} The pack names.
         */
        packsOfType(docType) {
            return [...(byType.get(docType) ?? [])];
        },

        /**
         * The pack of a type that receives notes declaring none.
         *
         * @param {string} docType - The Foundry document type.
         * @returns {string|undefined} The pack name, or `undefined` when the
         *   type has several packs and none is marked default.
         */
        defaultOf(docType) {
            return defaults.get(docType);
        },
    };
}

const routers = new WeakMap();

/**
 * The router for a resolved configuration, built once per configuration.
 *
 * @param {object} config - A configuration from `defineConfig`.
 * @returns {ReturnType<typeof createPackRouter>} Its router.
 */
export function routerFor(config) {
    let router = routers.get(config);
    if (!router) {
        router = createPackRouter(config.packs);
        routers.set(config, router);
    }
    return router;
}

/**
 * The consuming repository's own router — what every module that emits a UUID
 * asks where a note's document lives.
 */
export const packRouter = routerFor(packConfig);
