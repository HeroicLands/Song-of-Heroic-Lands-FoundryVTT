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
 * Scene and token commands. Scenes are vanilla `Scene.create`; tokens are placed
 * via `actor.getTokenDocument(...)` then created on the scene. Adjacency uses the
 * scene's grid size (place the second token one cell east of the first).
 */

import { tagName } from "../factories/ids.js";
import { resolveDoc, toRealm } from "../resolve.js";

/** Create a gridded scene (name auto-tagged). Yields the Scene document. */
Cypress.Commands.add("createScene", (overrides = {}) => {
    const { name, grid, ...rest } = overrides;
    const data = {
        name: tagName(name ?? "scene"),
        width: 2000,
        height: 2000,
        // 1 = CONST.GRID_TYPES.SQUARE
        grid: { type: 1, size: 100, ...(grid ?? {}) },
        ...rest,
    };
    return cy.foundry((win) => win.Scene.create(toRealm(win, data)));
});

/** Place one token for `actor` on `scene` at `(x, y)`. Yields the TokenDocument. */
async function placeOne(win, scene, actor, x, y) {
    const s = resolveDoc(win, scene);
    const a = resolveDoc(win, actor);
    const td = await a.getTokenDocument(toRealm(win, { x, y }), { parent: s });
    const [created] = await td.constructor.createDocuments([td.toObject()], {
        parent: s,
    });
    return created;
}

/** Place a single token. `pos` defaults to `(200, 200)`. */
Cypress.Commands.add("placeToken", (scene, actor, pos = {}) =>
    cy.foundry((win) =>
        placeOne(win, scene, actor, pos.x ?? 200, pos.y ?? 200),
    ),
);

/**
 * Place two tokens one grid cell apart (4-neighbour adjacent). Yields the pair
 * `[tokenA, tokenB]`.
 */
Cypress.Commands.add(
    "placeAdjacentTokens",
    (scene, actorA, actorB, opts = {}) =>
        cy.foundry(async (win) => {
            const s = resolveDoc(win, scene);
            const size = s.grid?.size ?? 100;
            const x = opts.x ?? size * 2;
            const y = opts.y ?? size * 2;
            const t1 = await placeOne(win, scene, actorA, x, y);
            const t2 = await placeOne(win, scene, actorB, x + size, y);
            return [t1, t2];
        }),
);
