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
 * Being sheet per-tab search filters (#312).
 *
 * Each of the searchable tabs exposes a `search-criteria` input that live-filters
 * its list(s) via Foundry's `SearchFilter` → `applySearchFilter` (data-search-name
 * + `.hidden`). The filtering primitive is unit-tested; here we prove the inputs
 * are actually rendered and wired: the Profile-traits input is exercised
 * behaviorally (a query hides non-matching rows across trait groups), and the
 * Mysteries inputs are asserted present over their filter wrappers.
 *
 * Trauma tab intentionally has no search filters (injuries and afflictions).
 */
describe("Being sheet per-tab search filters (#312)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    it("live-filters traits on the Profile tab across trait groups", () => {
        cy.importActor().then((actor) => {
            // Two traits in different subtype groups so filtering must span groups.
            cy.createItemOn(actor, "trait", {
                name: "Ambidextrous",
                system: { subType: "physique" },
            });
            cy.createItemOn(actor, "trait", {
                name: "Bloodlust",
                system: { subType: "personality" },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("profile");

            const scope = 'section.tab[data-tab="profile"]';
            cy.get(`${scope} input[name="search-traits"]`)
                .should("exist")
                .type("Ambidext");

            // Non-matching row (a different group) hides; matching row stays.
            cy.get(`${scope} .traits [data-search-name="Bloodlust"]`).should(
                "have.class",
                "hidden",
            );
            cy.get(`${scope} .traits [data-search-name="Ambidextrous"]`).should(
                "not.have.class",
                "hidden",
            );

            // Clearing the query reveals every row again.
            cy.get(`${scope} input[name="search-traits"]`).clear();
            cy.get(`${scope} .traits [data-search-name="Bloodlust"]`).should(
                "not.have.class",
                "hidden",
            );
        });
    });

    it("renders the Mysteries and Mystical-abilities search inputs over their lists", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("mysteries");

            const scope = 'section.tab[data-tab="mysteries"]';
            cy.get(`${scope} input[name="search-mysteries"]`).should("exist");
            cy.get(`${scope} .mysteries-list`).should("exist");
            cy.get(`${scope} input[name="search-mysticalabilities"]`).should(
                "exist",
            );
            cy.get(`${scope} .mysticalabilities-list`).should("exist");
        });
    });

    it("has no search filter on the Trauma tab (injuries and afflictions)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            cy.get(
                'section.tab[data-tab="trauma"] input[name="search-afflictions"]',
            ).should("not.exist");
            cy.get(
                'section.tab[data-tab="trauma"] input[type="search"]',
            ).should("not.exist");
        });
    });
});
