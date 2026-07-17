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
 * Ensure `actor` has a skill keyed by `shortcode` at `masteryLevelBase`. Because
 * `(type, shortcode)` is a unique per-actor key, a compendium actor (Basic Folk)
 * that already owns e.g. the `melee` skill cannot receive a second — so this
 * updates the existing skill when present and creates it otherwise. Yields the
 * skill document. Use in place of `createItemOn(actor, "skill", …)` whenever the
 * target may already own that skill.
 */
Cypress.Commands.add("ensureSkillML", (actor, shortcode, masteryLevelBase) =>
    cy.foundry(async (win) => {
        const a = actorRef(win, actor);
        const existing = a.items.find(
            (i) => i.type === "skill" && i.system?.shortcode === shortcode,
        );
        if (existing) {
            await existing.update(
                toRealm(win, {
                    "system.masteryLevelBase": masteryLevelBase,
                }),
            );
            return existing;
        }
        const data = itemFactory("skill", {
            name: shortcode,
            system: { shortcode, masteryLevelBase },
        });
        const [created] = await a.createEmbeddedDocuments("Item", [
            toRealm(win, data),
        ]);
        return created;
    }),
);

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
 * Resolve a document from a compendium pack by **item type + shortcode**.
 * Shortcodes are unique within an item type (names are ambiguous), so all three
 * of pack/type/shortcode are required. Yields the live compendium document — pair
 * with {@link dropOnActor} to place authored content (armor, weapons, skills, a
 * corpus) onto a test actor instead of hand-building it.
 *
 * @param {string} packName - The compendium pack id (e.g. `"sohl.items"`).
 * @param {string} itemType - The item kind (e.g. `"weapongear"`, `"corpus"`).
 * @param {string} shortcode - The document's `system.shortcode`, unique within the type.
 * @example cy.getFromCompendium("sohl.items", "armorgear", "mail-hauberk")
 */
Cypress.Commands.add("getFromCompendium", (packName, itemType, shortcode) =>
    cy.foundry(async (win) => {
        const pack = win.game.packs.get(packName);
        if (!pack)
            throw new Error(
                `getFromCompendium: no compendium pack "${packName}"`,
            );
        const index = await pack.getIndex({ fields: ["system.shortcode"] });
        const entry = index.find(
            (e) => e.type === itemType && e.system?.shortcode === shortcode,
        );
        if (!entry)
            throw new Error(
                `getFromCompendium: no ${itemType} with shortcode "${shortcode}" in "${packName}"`,
            );
        return pack.getDocument(entry._id);
    }),
);

/**
 * Drop an item onto an actor through the actor sheet's real drop handler
 * (`_onDropItem`) — the same path a drag-drop takes, so it clones the item onto
 * the actor and honors the corpus-singleton rule. `item` may be a compendium
 * document (see {@link getFromCompendium}), a world item, or anything with a
 * `uuid`. The sheet need not be open (the handler is DOM-free).
 *
 * Yields the created embedded Item, or `null` when the drop was refused (e.g. a
 * second corpus).
 *
 * @param {object|string} actor - The target actor (doc, id, or `{id}`).
 * @param {object} doc - The document to drop (a document, or `{uuid}`).
 * @example cy.getFromCompendium("sohl.items", "weapongear", "sword-arming")
 *   .then((sword) => cy.dropOnActor(actor, sword));
 */
Cypress.Commands.add("dropOnActor", (actor, doc) =>
    cy.foundry(async (win) => {
        const a = actorRef(win, actor);
        if (!a)
            throw new Error(`dropOnActor: no actor "${actor?.id ?? actor}"`);
        // Re-resolve to a live doc in case the passed reference is stale.
        const src = (doc?.uuid && win.fromUuidSync?.(doc.uuid)) || doc;
        if (!src) throw new Error("dropOnActor: doc did not resolve");
        const beforeIds = new Set(a.items.map((i) => i.id));
        const event = new win.DragEvent("drop", {
            dataTransfer: new win.DataTransfer(),
        });
        await a.sheet._onDropItem(event, src);
        return a.items.find((i) => !beforeIds.has(i.id)) ?? null;
    }),
);

/**
 * Drop a document onto an *item's* sheet through its real drop handler — e.g.
 * placing gear into a container item. Mirrors {@link dropOnActor} for item
 * targets. Both `item` and `doc` may be documents or `{uuid}` references; the
 * sheet need not be open. Yields the (re-resolved) target item.
 *
 * @param {object} item - The target item (a document or `{uuid}`).
 * @param {object} doc - The document to drop onto it.
 * @example cy.getFromCompendium("sohl.items", "weapongear", "dagger")
 *   .then((d) => cy.dropOnItem(backpack, d));
 */
Cypress.Commands.add("dropOnItem", (item, doc) =>
    cy.foundry(async (win) => {
        const target = (item?.uuid && win.fromUuidSync?.(item.uuid)) || item;
        if (!target) throw new Error("dropOnItem: target item did not resolve");
        const src = (doc?.uuid && win.fromUuidSync?.(doc.uuid)) || doc;
        if (!src) throw new Error("dropOnItem: dropped doc did not resolve");
        const event = new win.DragEvent("drop", {
            dataTransfer: new win.DataTransfer(),
        });
        await target.sheet._onDropItem(event, src);
        return (target.uuid && win.fromUuidSync?.(target.uuid)) || target;
    }),
);

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
