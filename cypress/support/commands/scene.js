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

/**
 * Place one token for `actor` on `scene` at `(x, y)`. Yields the TokenDocument.
 *
 * The token is **linked** (`actorLink: true`), so its combatant's `.actor` is the
 * world actor a spec has already prepared — not an unprepared synthetic (delta)
 * actor. An unlinked token's synthetic actor is only prepared as a side-effect of
 * the canvas token draw, which is racy/broken headless (suppressed by
 * `guardHeadlessTokenDraw` in `cy.login`); reading actor-derived combatant state
 * (`computedMove`, `reach`) off it then yields `null` (#611). Linking makes those
 * reads deterministic and canvas-independent. No spec relies on unlinked
 * token-actor semantics.
 */
async function placeOne(win, scene, actor, x, y) {
    const s = resolveDoc(win, scene);
    const a = resolveDoc(win, actor);
    const td = await a.getTokenDocument(
        toRealm(win, { x, y, actorLink: true }),
        {
            parent: s,
        },
    );
    const obj = td.toObject();
    obj.actorLink = true;
    const [created] = await td.constructor.createDocuments([obj], {
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
