/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Compendium-import commands. Standard Foundry path: `pack.getDocument(id)` →
 * `toObject()` → `Actor.create` / `Item.create`. `toObject()` carries embedded
 * items, so importing Basic Folk yields a fully-populated being.
 */

import { tagName } from "../factories/ids.js";
import { BASIC_FOLK } from "../factories/basicFolk.js";

/**
 * Import an actor from a compendium pack into the world.
 *
 * @param {string} [packId] - pack id (default `sohl.actors`).
 * @param {string} [docId]  - document id (default Basic Folk).
 * @param {object} [opts]   - `{ tag }`: when `false`, do NOT run-tag the name
 *   (use to exercise `_preCreate` duplicate-renaming; the spec must clean up).
 * @returns the created Actor document.
 */
Cypress.Commands.add(
    "importActor",
    (packId = BASIC_FOLK.pack, docId = BASIC_FOLK.id, opts = {}) =>
        cy.foundry(async (win) => {
            const pack = win.game.packs.get(packId);
            if (!pack) throw new Error(`No compendium pack '${packId}'`);
            const src = await pack.getDocument(docId);
            if (!src) throw new Error(`No document '${docId}' in '${packId}'`);
            const data = src.toObject();
            if (opts.tag !== false) data.name = tagName(data.name);
            return win.Actor.create(data);
        }),
);

/**
 * Import an item from a compendium pack. Optionally attach it to an actor.
 *
 * @param {string} packId - pack id (e.g. `sohl.items`).
 * @param {string} docId  - item document id.
 * @param {object} [opts] - `{ actor }`: when set, create the item embedded on
 *   that actor (doc or id) instead of at world level.
 * @returns the created Item document.
 */
Cypress.Commands.add("importItem", (packId, docId, opts = {}) =>
    cy.foundry(async (win) => {
        const pack = win.game.packs.get(packId);
        if (!pack) throw new Error(`No compendium pack '${packId}'`);
        const src = await pack.getDocument(docId);
        if (!src) throw new Error(`No document '${docId}' in '${packId}'`);
        const data = src.toObject();
        if (opts.actor) {
            const a = win.game.actors.get(opts.actor?.id ?? opts.actor);
            const [created] = await a.createEmbeddedDocuments("Item", [data]);
            return created;
        }
        data.name = tagName(data.name);
        return win.Item.create(data);
    }),
);

/**
 * Find a compendium item id by a predicate over its index entries (name/type).
 * Yields the first matching index entry (`{ _id, name, type }`) or `undefined`.
 *
 * @param {string} packId
 * @param {(entry: object) => boolean} predicate
 */
Cypress.Commands.add("findPackEntry", (packId, predicate) =>
    cy.foundry(async (win) => {
        const pack = win.game.packs.get(packId);
        if (!pack) throw new Error(`No compendium pack '${packId}'`);
        const index = await pack.getIndex();
        return index.find(predicate) ?? null;
    }),
);
