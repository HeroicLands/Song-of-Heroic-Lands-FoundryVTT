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
 * pure `outOfTurnAttackReason` helper): a headless Cypress run has no canvas, so
 * `getActiveCombat()` (`game.combat`) is `undefined` and the gate always reports
 * "no active combat turn". That is enough to prove the gate is wired and blocks,
 * but not to exercise the in-turn *pass* — which is also blocked by the stubbed
 * attack-start flow (#177). See the skipped RED case at the end.
 */

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
            cy.createCombatWith(this.tokens).then((combat) => {
                cy.foundry((win) =>
                    driveStart(win, combatantOf(win, combat.id, this.a.id)),
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
