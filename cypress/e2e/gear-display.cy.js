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
 * Being Gear tab display (#302): gear listed under On Body and under each
 * container as its own section, each with a Capacity (used/max) readout and the
 * Type / Qty / Weight / Qual / Dur / Notes columns.
 *
 * The On Body capacity max is the being's derived carry weight
 * (BeingLogic.maxCarryWeight = maxCarryWeight(moveBase, encumbranceRate)). The
 * compendium lineage `moveBase` is empty pending #362, so the test seeds it.
 */
describe("Being Gear tab: display (#302)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("On Body section: columns and a carry-capacity readout", () => {
        cy.importActor().then((actor) => {
            // Seed the lineage's base move so carry capacity computes (#362).
            cy.foundry((win) => {
                const lin = win.game.actors.get(actor.id).itemTypes.lineage[0];
                return lin
                    .update(
                        win.JSON.parse(
                            JSON.stringify({
                                "system.moveBase.terrestrial": 50,
                                "system.encumbranceRate": 4,
                            }),
                        ),
                    )
                    .then(() => null);
            });
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
                cy.contains(".list__name", "On Body");
                // moveBase 50, encRate 4 → maxCarryWeight = 4*(45+1)-1 = 183.
                cy.contains(".list__capacity", "/183");
                cy.contains(".item", "Heavy Rock").within(() => {
                    cy.contains(".list__detail", "Misc Gear"); // type label
                    cy.contains(".list__detail", "2"); // quantity
                    cy.contains(".list__detail", "+0"); // quality
                    cy.contains(".list__detail", "8"); // durability
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
                    cy.contains(".list__name", "Field Backpack");
                    cy.contains(".list__capacity", "/30"); // container maxCapacity
                    cy.contains(".item", "Rations"); // nested content
                });
            });
        });
    });
});
