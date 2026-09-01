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
 * with Name / Category / Level / HR / Next Heal Test columns (#943 — the former
 * Source column is now the explicit Category column, and a calendar-formatted
 * Next Heal Test replaces Notes), a custom-create control (data-type=affliction),
 * and a per-row context menu. (The Trauma tab has no search filter — #312.)
 */
describe("Being Trauma tab: Afflictions section (#309)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.closeAllSheets().then(() => cy.cleanupWorld()));
    Cypress.on("uncaught:exception", () => false);

    it("lists an affliction grouped by subtype with level and healing rate", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", {
                name: "Wasting Fever",
                system: {
                    // fatigue moved to TRAUMA_SUBTYPE (#565); afflictions are
                    // other / disease / poisontoxin / maladiction (#1003).
                    subType: "disease",
                    levelBase: 2,
                    healingRateBase: 4,
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            cy.get('section.tab[data-tab="trauma"] .afflictions-list')
                .contains(".item", "Wasting Fever")
                .within(() => {
                    cy.contains(".ledger__cell", "2"); // level
                    cy.contains(".ledger__cell", "4"); // healing rate
                });
        });
    });

    it("renders the Category, Level, HR and Next Heal Test columns (#943)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", {
                name: "Marsh Ague",
                system: {
                    subType: "disease",
                    category: "Swamp Miasma",
                    levelBase: 3,
                    healingRateBase: 4,
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            // The ledger header carries the redesigned columns.
            cy.get('section.tab[data-tab="trauma"] .afflictions-list .ledger__head')
                .first()
                .within(() => {
                    cy.contains("div", "Category");
                    cy.contains("div", "Next Heal Test");
                });
            // The Category cell surfaces the affliction's `category` field.
            cy.get('section.tab[data-tab="trauma"] .afflictions-list')
                .contains(".item", "Marsh Ague")
                .contains(".ledger__cell", "Swamp Miasma");
        });
    });

    it("offers create (data-type=affliction) and a row context menu, but no search filter", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", {
                name: "Numbing Cold",
                system: {
                    // privation was removed in the #565 subtype reorg; "other" is
                    // the catch-all affliction subtype.
                    subType: "other",
                    levelBase: 1,
                    healingRateBase: 3,
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            cy.get('section.tab[data-tab="trauma"] .item-create[data-type="affliction"]').should(
                "exist",
            );
            cy.get(
                'section.tab[data-tab="trauma"] .afflictions-list .item .item-contextmenu',
            ).should("exist");
            // The Trauma tab is not searchable (#312).
            cy.get('section.tab[data-tab="trauma"] input[name="search-afflictions"]').should(
                "not.exist",
            );
        });
    });

    it("renders a maladiction (supernatural) affliction with its subtype label (#1003)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", {
                name: "Withering Curse",
                system: {
                    // maladiction: the supernatural affliction subtype added in
                    // #1003 (curse/hex/divine blight).
                    subType: "maladiction",
                    levelBase: 2,
                    healingRateBase: 3,
                },
            });
            cy.prepare(actor);
            // The stored subtype round-trips through the schema.
            cy.foundry((win) => {
                const item = win.game.actors
                    .get(actor.id)
                    .items.find((i) => i.name === "Withering Curse");
                return item?.system.subType;
            }).should("eq", "maladiction");
            cy.openSheet(actor);
            cy.switchTab("trauma");
            // The affliction renders on the Trauma tab under its localized label.
            cy.get('section.tab[data-tab="trauma"] .afflictions-list')
                .should("contain", "Withering Curse")
                .and("contain", "Maladiction");
        });
    });
});
