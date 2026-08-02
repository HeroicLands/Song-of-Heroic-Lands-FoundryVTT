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
 * Being Trauma tab — Traumas (injuries) section (#308, #939): an Injury sub-type
 * lists Sev / HR / Area / Next Heal Test (Aspect and Bleeding moved to the item
 * sheet in #939), with a custom-create control (data-type=trauma) and a per-row
 * context menu.
 */
describe("Being Trauma tab: Traumas section (#308)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("lists an injury with severity, healing rate, and area (#939)", () => {
        cy.importActor().then((actor) => {
            // A real body-location code from the body, so Area resolves.
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc = a.logic.body.structure.getAllLocations()[0];
                return { code: loc.shortcode, name: loc.name };
            }).then((loc) => {
                cy.createItemOn(actor, "trauma", {
                    name: "Left Arm Crush",
                    system: {
                        levelBase: 2,
                        healingRateBase: 6,
                        aspect: "blunt",
                        bodyLocationCode: loc.code,
                        isTreated: false,
                        isBleeding: false,
                    },
                });
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("trauma");
                cy.get('section.tab[data-tab="trauma"]')
                    .contains(".item", "Left Arm Crush")
                    .within(() => {
                        cy.contains(".ledger__cell", "S2"); // severity band
                        cy.contains(".ledger__cell", "NT6"); // not-treated + HR
                        cy.contains(".ledger__cell", loc.name); // area
                    });
                // The Injury column header no longer carries Aspect or Bleeding.
                cy.get('section.tab[data-tab="trauma"] .ledger__head').within(
                    () => {
                        cy.contains("Sev");
                        cy.contains("Area");
                        cy.contains("Aspect").should("not.exist");
                        cy.contains("Bld").should("not.exist");
                    },
                );
            });
        });
    });

    it("renders a Fatigue sub-type with its own columns (Category / FL / Notes) (#939)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "trauma", {
                name: "Winded",
                system: {
                    subType: "fatigue",
                    category: "weariness",
                    levelBase: 3,
                    notes: "short of breath",
                },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            // Scope to the Fatigue ledger (the one holding "Winded"); Basic Folk
            // may carry other sub-types whose ledgers have different headers.
            cy.get('section.tab[data-tab="trauma"]')
                .contains(".ledger", "Winded")
                .within(() => {
                    // Fatigue columns: Category / FL / Notes — not Sev / Area.
                    cy.get(".ledger__head").within(() => {
                        cy.contains("Category");
                        cy.contains("FL");
                        cy.contains("Notes");
                        cy.contains("Sev").should("not.exist");
                        cy.contains("Area").should("not.exist");
                    });
                    cy.contains(".ledger__cell", "Weariness"); // localized category
                    cy.contains(".ledger__cell", "3"); // FL = level modifier
                    cy.contains(".ledger__notes", "short of breath");
                });
        });
    });

    it("offers a custom-create control (data-type=trauma) and a row context menu", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "trauma", {
                name: "Scalp Wound",
                system: { levelBase: 1, healingRateBase: 3, aspect: "edged" },
            });
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("trauma");
            cy.get(
                'section.tab[data-tab="trauma"] .item-create[data-type="trauma"]',
            ).should("exist");
            cy.get(
                'section.tab[data-tab="trauma"] .item .item-contextmenu',
            ).should("exist");
        });
    });
});
