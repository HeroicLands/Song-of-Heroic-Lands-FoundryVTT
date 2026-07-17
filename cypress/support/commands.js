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
 * Log in to the seeded test world and wait until the game client is ready.
 *
 * Authenticates directly against Foundry's `/join` endpoint (the same POST the
 * join screen makes) with the seeded GM's id + known password, which sets the
 * session cookie; then loads `/game` and waits for `game.ready`. Defaults come
 * from Cypress.env (populated by cypress.config.mjs from the seed contract), so
 * a spec just calls `cy.login()`.
 *
 * @param {object} [opts]
 * @param {string} [opts.userId]   - user `_id` to log in as (default: seeded GM).
 * @param {string} [opts.password] - that user's password (default: seeded GM's).
 */
Cypress.Commands.add("login", (opts = {}) => {
    const userId = opts.userId ?? Cypress.env("gmId");
    const password = opts.password ?? Cypress.env("gmPassword");

    cy.request({
        method: "POST",
        url: "/join",
        body: { action: "join", userid: userId, password },
    }).then((res) => {
        // A successful join returns JSON `{status:"success", …}`. When the world
        // is not active Foundry answers 200 with an HTML error page instead, so
        // assert on the payload rather than the status code.
        expect(res.body, "join response").to.have.property("status", "success");
    });

    cy.visit("/game");
    cy.window({ timeout: 60000 }).its("game").its("ready").should("eq", true);
});
