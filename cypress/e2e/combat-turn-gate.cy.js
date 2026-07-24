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
 * Automated-combat turn gate (#384).
 *
 * Only the current combatant may **start** an automated attack:
 * `SohlCombatantLogic.startAutomatedAttack` aborts up front via the pure
 * `outOfTurnAttackReason` helper. This spec drives the real logic against the
 * deployed FoundryHelpers shim and asserts the gate blocks end to end — the call
 * returns `undefined`, warns about the turn, and posts no attack card.
 *
 * The current-vs-other-combatant *distinction* is covered by the unit suite (the
 * pure `outOfTurnAttackReason` helper). This spec only proves the gate is wired
 * and blocks end to end, so it deterministically sets up an *out-of-turn* attack:
 * it points the combat's current turn at the **defender**, then drives the
 * attacker. The gate reads `getActiveCombat()?.combatant?.id` — i.e. the ambient
 * `game.combat`, whose resolution is viewport-dependent headless (`ui.combat.viewed`
 * when the tracker has rendered, else the first `isActive` combat; see
 * `game.combat` in core). Whichever it resolves to, the current combatant is never
 * the attacker, so the gate reports a *turn* reason — "it is not this combatant's
 * turn" (our combat) or "there is no active combat turn" (none) — and never falls
 * through to target validation. Earlier this test relied on `game.combat` being
 * `undefined` headless, which held only in isolation: once a preceding combat spec
 * rendered the tracker, `game.combat` resolved this spec's active combat with the
 * attacker current, the gate passed, and it warned about the target instead
 * (#638/#644). Pinning the turn removes that order dependence.
 *
 * The in-turn *pass* is still not e2e-reachable — the attack-start flow past the
 * gate is stubbed (#177). See the skipped RED case at the end.
 */

import { toRealm } from "../support/resolve";

/** The combatant of `actorId` in `combatId`. */
function combatantOf(win, combatId, actorId) {
    return win.game.combats
        .get(combatId)
        .combatants.find((c) => c.actorId === actorId);
}

/**
 * Drive `startAutomatedAttack` on `combatant` and capture the outcome. Stubbing
 * `sohl.log.uiWarn` collects the warnings and also dodges the #267 logger
 * recursion. Returns `{ result, warnings, posted }` where `posted` is the number
 * of chat messages created by the call (0 when the gate short-circuits).
 */
async function driveStart(win, combatant) {
    const warnings = [];
    const origWarn = win.sohl.log.uiWarn;
    win.sohl.log.uiWarn = (m) => warnings.push(String(m));
    const before = win.game.messages.size;
    let result;
    try {
        result = await combatant.logic.startAutomatedAttack({
            target: { name: "foe" },
            scope: {},
        });
    } finally {
        win.sohl.log.uiWarn = origWarn;
    }
    return {
        result: result ?? null,
        warnings: warnings.join(" "),
        posted: win.game.messages.size - before,
    };
}

describe("automated combat turn gate (#384)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // The known logger recursion (#267) turns a stray `uiWarn` into a stack
    // overflow; don't let an unrelated background warning fail the assertions.
    Cypress.on("uncaught:exception", () => false);

    it("refuses to start an automated attack when it is not the combatant's turn, and posts no card", () => {
        cy.createActor("being", { name: "attacker" }).as("a");
        cy.createActor("being", { name: "defender" }).as("b");
        cy.createScene({ name: "arena" }).as("scene");
        cy.then(function () {
            cy.placeAdjacentTokens(this.scene, this.a, this.b).as("tokens");
        });
        cy.then(function () {
            const attackerId = this.a.id;
            const defenderId = this.b.id;
            cy.createCombatWith(this.tokens).then((combat) => {
                // Deterministically make it *not* the attacker's turn: point the
                // combat's current turn at the defender. This removes the order
                // dependence on the viewport-resolved `game.combat` (#638/#644) —
                // the current combatant is never the attacker, so the gate always
                // short-circuits with a turn reason instead of falling through to
                // target validation.
                cy.foundry(async (win) => {
                    const c = win.game.combats.get(combat.id);
                    const idx = c.turns.findIndex(
                        (t) => t.actorId === defenderId,
                    );
                    if (idx >= 0) await c.update(toRealm(win, { turn: idx }));
                    return c.combatant?.actorId ?? null;
                }).should((currentActorId) => {
                    expect(
                        currentActorId,
                        "current combatant is the defender, not the attacker",
                    ).to.not.eq(attackerId);
                });
                cy.foundry((win) =>
                    driveStart(win, combatantOf(win, combat.id, attackerId)),
                ).should((r) => {
                    expect(r.result, "aborts (returns undefined)").to.be.null;
                    expect(r.warnings, "warns about the turn").to.match(
                        /turn/i,
                    );
                    expect(r.posted, "no attack card posted").to.eq(0);
                });
            });
        });
    });

    // RED — the in-turn *pass* is not e2e-reachable headless: `game.combat` needs
    // a canvas (so `getActiveCombat()` is undefined here and the gate always
    // reports "no active combat turn"), and the attack-start flow past the gate
    // is itself stubbed (#177 — `getUsableStrikeModes()` returns []). The
    // current-vs-other distinction is unit-tested via `outOfTurnAttackReason`.
    // Un-skip once #177 lands and a viewport is available.
    it.skip("the current combatant may start an automated attack (#177, needs canvas)", () => {});
});
