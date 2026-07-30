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
 * Being Gear tab display (#302): gear listed under On Body and under each
 * container as its own section, with the Type / Qty / Weight / Qual / Dur / Notes
 * columns.
 *
 * On Body shows the being's overall load — total carried-gear weight and the
 * resulting encumbrance (`actor.logic.encumbrance.effective` for the active
 * medium). Basic Folk's terrestrial profile encumbrance is `floor(wt / 4)`, so
 * 10 lb carried reads "Carried: 10 lb · Enc 2". Containers show their own
 * used/max capacity.
 */
describe("Being Gear tab: display (#302)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("On Body section: columns and a carried-weight / encumbrance readout", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "miscgear", {
                name: "Heavy Rock",
                system: {
                    quantity: 2,
                    weightBase: 5,
                    qualityBase: 0,
                    durabilityBase: 8,
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("gear");
            cy.get('section.tab[data-tab="gear"]').within(() => {
                cy.contains(".section-legend__name", "On Body");
                // Heavy Rock: 5 lb × 2 = 10 lb carried → floor(10 / 4) = Enc 2.
                cy.contains(".section-legend__meta", "Carried: 10 lb");
                cy.contains(".section-legend__meta", "Enc 2");
                cy.contains(".item", "Heavy Rock").within(() => {
                    cy.contains(".ledger__cell", "Misc Gear"); // type label
                    cy.contains(".ledger__cell", "2"); // quantity
                    cy.contains(".ledger__cell", "+0"); // quality
                    cy.contains(".ledger__cell", "8"); // durability
                });
            });
        });
    });

    it("a container is its own section with used/max capacity and nested items", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "containergear", {
                name: "Field Backpack",
                system: { maxCapacityBase: 30 },
            }).then((bag) => {
                cy.createItemOn(actor, "miscgear", {
                    name: "Rations",
                    system: { quantity: 3, weightBase: 2, containerId: bag.id },
                });
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("gear");
                cy.get(
                    `section.tab[data-tab="gear"] [data-container-id="${bag.id}"]`,
                ).within(() => {
                    cy.contains(".section-legend__name", "Field Backpack");
                    cy.contains(".section-legend__meta", "/30"); // container maxCapacity
                    cy.contains(".item", "Rations"); // nested content
                });
            });
        });
    });
});
