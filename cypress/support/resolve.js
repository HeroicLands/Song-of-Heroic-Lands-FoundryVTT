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
 * Resolve a live Foundry document from a doc reference, an id string, or a
 * `{ id }` / `{ uuid }` shape. Commands accept whichever a spec has on hand
 * (usually the doc yielded by a prior `cy.create*`), and re-resolve against the
 * live collections so a value read after a re-prepare is never stale.
 *
 * @param {Window} win - the game client window.
 * @param {object|string} ref - a document, its id, or `{id}`/`{uuid}`.
 * @returns the live document, or `undefined`.
 */
export function resolveDoc(win, ref) {
    if (ref && typeof ref === "object" && ref.documentName) {
        // Already a live document — prefer a fresh lookup by uuid when available.
        return (ref.uuid && win.fromUuidSync?.(ref.uuid)) || ref;
    }
    const id = ref?.id ?? ref;
    if (typeof id === "string") {
        return (
            win.game.actors.get(id) ??
            win.game.items.get(id) ??
            win.game.scenes.get(id) ??
            win.game.combats.get(id) ??
            (ref?.uuid ? win.fromUuidSync?.(ref.uuid) : undefined)
        );
    }
    return undefined;
}

/**
 * Re-create a data payload as plain objects in the AUT (game client) realm.
 *
 * Object literals built in the Cypress support bundle belong to a different JS
 * realm than the game window, so `Object.getPrototypeOf(x) !== win.Object.prototype`.
 * Foundry's `getType` identifies a plain object by that prototype identity, so it
 * rejects cross-realm objects ("must be constructed with a DataModel or Object") —
 * and `foundry.utils.deepClone` early-returns them unchanged, so it can't fix it.
 * A JSON round-trip through the AUT's own `JSON.parse` produces objects with the
 * AUT's prototypes, which Foundry accepts. Payloads from `doc.toObject()` are
 * already AUT-realm and need no cloning; our factory payloads are JSON-safe.
 *
 * @param {Window} win
 * @param {object} data
 */
export const toRealm = (win, data) => win.JSON.parse(JSON.stringify(data));
