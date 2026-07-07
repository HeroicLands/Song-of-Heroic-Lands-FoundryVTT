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
 * Document create/query/cleanup commands driving the live Foundry runtime.
 *
 * THE LOAD-BEARING PATTERN: Foundry document APIs return native Promises. To keep
 * the Cypress command queue synchronized, every call is wrapped as
 * `cy.wrap(Cypress.Promise.resolve(nativePromise))` — NEVER an `async` `.then`
 * callback, whose returned Promise the queue does not await (it silently races).
 * `cy.foundry(fn)` centralizes the wrap; all other commands build on it.
 */

import { tagName, isE2EArtifact } from "../factories/ids.js";
import { actorFactory } from "../factories/actorFactory.js";
import { itemFactory } from "../factories/itemFactory.js";
import { toRealm } from "../resolve.js";

/** Resolve an actor from a doc, id string, or Cypress alias value. */
function actorRef(win, actor) {
    return win.game.actors.get(actor?.id ?? actor);
}

/**
 * Run `fn(win)` against the live game client and yield its resolved value through
 * the command queue. `fn` may be sync or async; either way the result is awaited.
 *
 * @param {(win: Window) => any | Promise<any>} fn
 */
Cypress.Commands.add("foundry", (fn) =>
    cy
        .window({ log: false })
        .then((win) =>
            cy.wrap(Cypress.Promise.resolve(fn(win)), { log: false }),
        ),
);

/**
 * Create a world actor. `overrides` merge into the factory default for `kind`;
 * the name is auto-tagged for `cleanupWorld`. Yields the created Actor document.
 */
Cypress.Commands.add("createActor", (kind = "being", overrides = {}) => {
    const data = actorFactory(kind, overrides);
    data.name = tagName(data.name);
    return cy.foundry((win) => win.Actor.create(toRealm(win, data)));
});

/** Create a world (unowned) item; name auto-tagged. Yields the Item document. */
Cypress.Commands.add("createWorldItem", (kind = "skill", overrides = {}) => {
    const data = itemFactory(kind, overrides);
    data.name = tagName(data.name);
    return cy.foundry((win) => win.Item.create(toRealm(win, data)));
});

/**
 * Create a single embedded item on `actor` (a doc or id). Embedded items are not
 * tagged — they cascade-delete with their owning actor. Yields the Item document.
 */
Cypress.Commands.add("createItemOn", (actor, kind, overrides = {}) => {
    const data = itemFactory(kind, overrides);
    return cy.foundry(async (win) => {
        const a = actorRef(win, actor);
        const [created] = await a.createEmbeddedDocuments("Item", [
            toRealm(win, data),
        ]);
        return created;
    });
});

/**
 * Create several embedded items on `actor`. `items` is an array of
 * `{ kind, name?, system? }`. Yields the array of created Item documents.
 */
Cypress.Commands.add("createItemsOn", (actor, items) => {
    const datas = items.map((it) => itemFactory(it.kind, it));
    return cy.foundry(async (win) => {
        const a = actorRef(win, actor);
        return a.createEmbeddedDocuments(
            "Item",
            datas.map((d) => toRealm(win, d)),
        );
    });
});

/**
 * Delete this run's world artifacts: tagged actors/items/scenes (actor-delete
 * cascades embedded items) plus all combats/messages (ephemeral, unnamed — swept
 * wholesale in the disposable E2E world). Safe to call when nothing matches.
 */
Cypress.Commands.add("cleanupWorld", () =>
    cy.foundry(async (win) => {
        const g = win.game;
        const taggedIds = (coll) =>
            coll.filter((d) => isE2EArtifact(d)).map((d) => d.id);

        const actorIds = taggedIds(g.actors);
        if (actorIds.length) await win.Actor.deleteDocuments(actorIds);

        const itemIds = taggedIds(g.items);
        if (itemIds.length) await win.Item.deleteDocuments(itemIds);

        const sceneIds = taggedIds(g.scenes);
        if (sceneIds.length) await win.Scene.deleteDocuments(sceneIds);

        if (g.combats.size)
            await win.Combat.deleteDocuments(g.combats.map((c) => c.id));
        if (g.messages.size)
            await win.ChatMessage.deleteDocuments(g.messages.map((m) => m.id));

        return true;
    }),
);
