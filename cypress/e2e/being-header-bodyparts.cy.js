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
 * Being sheet header — body-part impairment grid (#464).
 *
 * Each body part in the header grid is colored by its derived impairment status
 * (none/minor/major/unusable), taken from the worst injury across its hit
 * locations. The derivation math is unit-tested; here we prove it flows through a
 * real body + trauma items to the rendered grid cell's `data-status`.
 */
describe("Being sheet header: body-part impairment grid (#464)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    /** The first body part (with a location) of the actor's body. */
    function firstPartLocation(win, actorId) {
        const actor = win.game.actors.get(actorId);
        const parts = actor.logic.body?.structure?.parts ?? [];
        for (const p of parts) {
            if (p.locations?.length) {
                return {
                    part: p.shortcode,
                    location: p.locations[0].shortcode,
                };
            }
        }
        return null;
    }

    it("shows every part 'none' for an uninjured being", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.get(".sheet-header__location").should(
                "have.length.greaterThan",
                0,
            );
            cy.get('.sheet-header__location:not([data-status="none"])').should(
                "not.exist",
            );
        });
    });

    it("colors a part 'unusable' when one of its locations takes a grievous injury", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => firstPartLocation(win, actor.id)).then((pl) => {
                expect(pl, "body has a part with a location").to.not.be.null;
                cy.createItemOn(actor, "trauma", {
                    name: "Cleft Skull",
                    system: {
                        subType: "physical",
                        bodyLocationCode: pl.location,
                        levelBase: 4, // G4 — grievous → unusable
                        healingRateBase: 4,
                    },
                });
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.get(
                    `.sheet-header__location[data-shortcode="${pl.part}"]`,
                ).should("have.attr", "data-status", "unusable");
            });
        });
    });

    it("colors a part 'minor' for a slow-healing minor injury (M1, HR ≤ 5)", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => firstPartLocation(win, actor.id)).then((pl) => {
                cy.createItemOn(actor, "trauma", {
                    name: "Bruise",
                    system: {
                        subType: "physical",
                        bodyLocationCode: pl.location,
                        levelBase: 1, // M1 — minor
                        healingRateBase: 5, // slow-healing → impairs
                    },
                });
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.get(
                    `.sheet-header__location[data-shortcode="${pl.part}"]`,
                ).should("have.attr", "data-status", "minor");
            });
        });
    });

    it("colors a part by its manually-set permanent impairment (datamodel field)", () => {
        cy.importActor().then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                // Full-array write: set the first part's permanent impairment.
                const parts = a.system.toObject().body.structure.parts;
                parts[0].permanentImpairment = -10;
                await a.update(
                    win.JSON.parse(
                        JSON.stringify({
                            "system.body.structure.parts": parts,
                        }),
                    ),
                );
                return parts[0].shortcode;
            }).then((shortcode) => {
                cy.prepare(actor);
                cy.openSheet(actor);
                // Permanent −10 with no injury → major.
                cy.get(
                    `.sheet-header__location[data-shortcode="${shortcode}"]`,
                ).should("have.attr", "data-status", "major");
            });
        });
    });
});
