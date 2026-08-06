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
 * Automated-combat start: target resolution (#1079).
 *
 * The combat tracker's **Automated Combat** entry builds its action context
 * with a speaker only (`SohlLogic.getContextOptions` supplies no `target`), so
 * `startAutomatedAttack` used to abort at once with "… automated attack
 * requires a target combatant" no matter what the player had targeted — the
 * whole flow was unreachable from the UI.
 *
 * This spec drives the deployed logic exactly as the tracker entry does — a
 * context carrying **no** target — with the opponent's token targeted, and
 * asserts the attack gets past target resolution. Two distinct regressions are
 * covered:
 *
 * 1. the target falls back to `fvttGetTargetedTokens()` (the same seam opposed
 *    tests use), so the "requires a target combatant" abort no longer fires; and
 * 2. the resolved target is handed to the attack dialog as the **defender**.
 *    `commonAttack` used to derive the defender from
 *    `context.scope.attackResult` — present only on the counterstrike path — so
 *    a start attack aborted a step later with "requires a valid defender
 *    combatant".
 *
 * Where it stops instead: these bare Beings carry no weapon, so strike-mode
 * selection finds nothing usable — "no usable strike mode". That is the step
 * *after* target and defender resolution, which is the point. Producing an
 * actual attack card needs a canvas and remains RED under #177 (see
 * `combat-automated.cy.js`).
 */

import { toRealm } from "../support/resolve";

/** The combatant of `actorId` in `combatId`. */
function combatantOf(win, combatId, actorId) {
    return win.game.combats
        .get(combatId)
        .combatants.find((c) => c.actorId === actorId);
}

/**
 * Drive `startAutomatedAttack` with a **targetless** context — exactly what the
 * combat tracker's context-menu entry builds. Stubbing `sohl.log.uiWarn`
 * collects the warnings (and dodges the #267 logger recursion).
 *
 * @returns `{ result, warnings }` — `result` is `null` when the call aborted.
 */
async function driveTargetlessStart(win, combatant) {
    const warnings = [];
    const origWarn = win.sohl.log.uiWarn;
    win.sohl.log.uiWarn = (m) => warnings.push(String(m));
    let result;
    try {
        // No `target` key at all: the fallback must supply it.
        result = await combatant.logic.startAutomatedAttack({ scope: {} });
    } finally {
        win.sohl.log.uiWarn = origWarn;
    }
    return { result: result ?? null, warnings: warnings.join(" ") };
}

describe("automated combat start: target resolution (#1079)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // The known logger recursion (#267) turns a stray `uiWarn` into a stack
    // overflow; don't let an unrelated background warning fail the assertions.
    Cypress.on("uncaught:exception", () => false);

    it("resolves the user's targeted token, and still refuses with nothing targeted", () => {
        cy.createActor("being", { name: "attacker" }).as("a");
        cy.createActor("being", { name: "defender" }).as("b");
        cy.createScene({ name: "arena" }).as("scene");
        cy.then(function () {
            cy.prepare(this.a);
            cy.prepare(this.b);
            cy.placeAdjacentTokens(this.scene, this.a, this.b).as("tokens");
        });
        cy.then(function () {
            const attackerId = this.a.id;
            const defenderId = this.b.id;
            cy.createCombatWith(this.tokens).then((combat) => {
                // It must be the attacker's turn — the turn gate runs first and
                // would otherwise short-circuit before target resolution. Both
                // halves below share this one combat: `getActiveCombat()` reads
                // the *viewed* combat, which resolves inconsistently headless
                // (#638/#644), so a second combat would be order-dependent.
                cy.foundry(async (win) => {
                    const c = win.game.combats.get(combat.id);
                    const idx = c.turns.findIndex(
                        (t) => t.actorId === attackerId,
                    );
                    if (idx >= 0) await c.update(toRealm(win, { turn: idx }));
                    return c.combatant?.actorId ?? null;
                }).should("eq", attackerId);

                // Target the defender's token, as a player would before
                // choosing Automated Combat. `game.user.targets` holds
                // *placeable* Tokens; the placeable is undrawn headless, so the
                // range read falls back to the TokenDocument's own center.
                cy.foundry((win) => {
                    const t = combatantOf(win, combat.id, defenderId).token;
                    win.game.user.targets.clear();
                    win.game.user.targets.add(t.object ?? { document: t });
                    return win.game.user.targets.size;
                }).should("eq", 1);

                cy.foundry((win) =>
                    driveTargetlessStart(
                        win,
                        combatantOf(win, combat.id, attackerId),
                    ),
                ).should((r) => {
                    expect(
                        r.warnings,
                        "the targetless-context abort is gone (#1079)",
                    ).to.not.match(/requires a target combatant/i);
                    expect(
                        r.warnings,
                        "the resolved target is used as the defender (#1079)",
                    ).to.not.match(/valid defender combatant/i);
                    expect(
                        r.warnings,
                        "reaches strike-mode selection (the post-target step)",
                    ).to.match(/no usable strike mode/i);
                });

                // …and with nothing targeted there is no target to fall back
                // to, so the attack still refuses rather than guessing one.
                cy.foundry((win) => {
                    win.game.user.targets.clear();
                    return win.game.user.targets.size;
                }).should("eq", 0);

                cy.foundry((win) =>
                    driveTargetlessStart(
                        win,
                        combatantOf(win, combat.id, attackerId),
                    ),
                ).should((r) => {
                    expect(r.result, "aborts (returns undefined)").to.be.null;
                    expect(r.warnings, "asks for a target").to.match(
                        /requires a target combatant/i,
                    );
                });
            });
        });
    });
});
