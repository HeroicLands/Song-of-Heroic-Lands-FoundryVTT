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
 * @param {object} [opts] - `{ start }`: set `false` to create without starting.
 * @returns the Combat document.
 */
Cypress.Commands.add("createCombatWith", (tokens, opts = {}) =>
    cy.foundry(async (win) => {
        const first = tokens[0];
        const sceneId =
            first.parent?.id ?? first.sceneId ?? win.canvas?.scene?.id;
        // `active: true` makes it the viewed combat so the CombatTracker has a
        // current combat to render (else core throws "'turn' in undefined").
        const combat = await win.Combat.create(
            toRealm(win, { scene: sceneId, active: true }),
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
