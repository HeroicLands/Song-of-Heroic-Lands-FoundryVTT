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
 * Combat commands. Combats are unnamed/ephemeral — `cleanupWorld` sweeps them
 * wholesale, so they need no run-tag. `createCombatWith` builds a combat over a
 * set of tokens and (by default) starts it, seeding combatant groups via the
 * system's `_onCreateDescendantDocuments` hook.
 */

import { resolveDoc, toRealm } from "../resolve.js";

/**
 * Create a combat containing the given tokens and start it.
 *
 * @param {object[]} tokens - TokenDocuments (as yielded by `placeAdjacentTokens`).
 * @param {object} [opts] - `{ start, sceneless }`: set `start: false` to create
 *   without starting; set `sceneless: true` to leave the combat unbound to a
 *   scene (see below).
 * @returns the Combat document.
 */
Cypress.Commands.add("createCombatWith", (tokens, opts = {}) =>
    cy.foundry(async (win) => {
        const first = tokens[0];
        const sceneId = first.parent?.id ?? first.sceneId ?? win.canvas?.scene?.id;
        // `active: true` makes it the viewed combat so the CombatTracker has a
        // current combat to render (else core throws "'turn' in undefined").
        //
        // `sceneless` exists for specs that must read the ambient `game.combat`
        // (what `getActiveCombat()` resolves). Core falls back to
        // `combats.find(c => c.isActive)`, and `Combat#isActive` is
        // `this.scene.isView && this.active` for a scene-bound combat — so it
        // additionally requires this combat's scene to be the *viewed* one.
        // Headless only the auto-viewed scene has `_view` set, so a spec that
        // creates its own scene gets `isActive === false` and a null
        // `game.combat` as soon as another scene holds the view. Leaving the
        // combat unbound makes `isActive` just `this.active`, which is
        // canvas-independent and order-independent. Combatants still carry
        // their own `sceneId`, so token resolution is unaffected.
        const combat = await win.Combat.create(
            toRealm(win, {
                scene: opts.sceneless ? null : sceneId,
                active: true,
            }),
        );
        const combatantData = tokens.map((t) => ({
            // The combatant data model is registered under the default `base`
            // type, so no explicit type is needed — `system.logic` is present.
            tokenId: t.id,
            sceneId: t.parent?.id ?? t.sceneId ?? sceneId,
            actorId: t.actorId ?? t.actor?.id,
            hidden: false,
        }));
        await combat.createEmbeddedDocuments(
            "Combatant",
            combatantData.map((d) => toRealm(win, d)),
        );
        if (opts.start !== false) await combat.startCombat();
        return combat;
    }),
);

/** Advance to the next turn. Yields the Combat document. */
Cypress.Commands.add("advanceTurn", (combat) =>
    cy.foundry(async (win) => {
        const c = resolveDoc(win, combat);
        await c.nextTurn();
        return c;
    }),
);

/** Advance to the next round. Yields the Combat document. */
Cypress.Commands.add("advanceRound", (combat) =>
    cy.foundry(async (win) => {
        const c = resolveDoc(win, combat);
        await c.nextRound();
        return c;
    }),
);
