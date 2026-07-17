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
 * Smoke test: the seeded world boots as GM with the SoHL system active. This is
 * the baseline that proves the whole harness (seed → serve → login) works;
 * feature specs can build on `cy.login()`.
 */
describe("SoHL E2E smoke", () => {
    it("boots the seeded world as GM with the sohl system", () => {
        cy.login();

        cy.window().its("game.world.id").should("eq", Cypress.env("worldId"));
        cy.window().its("game.system.id").should("eq", "sohl");
        cy.window().its("game.user.isGM").should("eq", true);
    });
});
