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
 * Being Trauma tab — Traumas (injuries) section (#308): lists trauma items with
 * Sev / HR / Aspect / Area / Bld / Notes, a custom-create control
 * (data-type=trauma), and a per-row context menu. (Created / Next-Healing timers
 * are deferred — they depend on the #73 healing-test mechanic.)
 */
describe("Being Trauma tab: Traumas section (#308)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("lists a trauma with severity, healing rate, aspect, and area", () => {
        cy.importActor().then((actor) => {
            // A real body-location code from the corpus, so Area resolves.
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const loc =
                    a.itemTypes.corpus[0].logic.structure.getAllLocations()[0];
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
                        cy.contains(".list__detail", "S2"); // severity band
                        cy.contains(".list__detail", "NT6"); // not-treated + HR
                        cy.contains(".list__detail", "Blunt"); // localized aspect
                        cy.contains(".list__detail", loc.name); // area
                        cy.contains(".list__detail", "No"); // not bleeding
                    });
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
