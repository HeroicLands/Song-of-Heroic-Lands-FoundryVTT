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
 * Being Trauma tab — Afflictions section (#309): afflictions grouped by subtype
 * with Level / HR / Source / Notes, a custom-create control (data-type=affliction),
 * and a per-row context menu. (The Trauma tab has no search filter — #312.
 * Created / Course-Test / Recovery-Test timers are deferred — they depend on the
 * affliction course/recovery mechanics #65/#67/#68.)
 */
describe("Being Trauma tab: Afflictions section (#309)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("lists an affliction grouped by subtype with level and healing rate", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", {
                name: "Deep Fatigue",
                system: {
                    subType: "fatigue",
                    levelBase: 2,
                    healingRateBase: 4,
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            cy.get('section.tab[data-tab="trauma"] .afflictions-list')
                .contains(".item", "Deep Fatigue")
                .within(() => {
                    cy.contains(".list__detail", "2"); // level
                    cy.contains(".list__detail", "4"); // healing rate
                });
        });
    });

    it("offers create (data-type=affliction) and a row context menu, but no search filter", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", {
                name: "Numbing Cold",
                system: {
                    subType: "privation",
                    levelBase: 1,
                    healingRateBase: 3,
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            cy.get(
                'section.tab[data-tab="trauma"] .search-control.item-create[data-type="affliction"]',
            ).should("exist");
            cy.get(
                'section.tab[data-tab="trauma"] .afflictions-list .item .item-contextmenu',
            ).should("exist");
            // The Trauma tab is not searchable (#312).
            cy.get(
                'section.tab[data-tab="trauma"] input[name="search-afflictions"]',
            ).should("not.exist");
        });
    });
});
