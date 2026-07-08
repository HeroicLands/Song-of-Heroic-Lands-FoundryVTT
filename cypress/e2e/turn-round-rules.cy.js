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
 * Turn / round rules — action and movement budgets.
 *
 * Combat turns and rounds advance (covered by `combat-setup.cy.js`), but the
 * per-turn/round *rules* are not consumed: `didAction` and the movement budget
 * are never reset or enforced when turns/rounds change — the `updateWorldTime` /
 * combat-turn events fire, but no rule reacts to them. RED against #185.
 */

describe("turn / round rules", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // RED — blocked by #185: `didAction` / move budget are never reset or
    // enforced across turns/rounds. The events fire (advanceTurn / advanceRound
    // work) but no rule consumes them. Un-skip and assert that a combatant's
    // `didAction` clears at the start of its turn and the move budget resets each
    // round once the rules are implemented.
    it.skip("didAction resets at the start of a combatant's turn (#185)", () => {});
    it.skip("the movement budget resets each round (#185)", () => {});
    it.skip("acting past the movement budget is prevented (#185)", () => {});
});
