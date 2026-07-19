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
 * Being sheet header — health bar (#463).
 *
 * Health is a token-bar-shaped `{ value, max }` on `actor.system.health` (max a
 * fixed 100), derived every preparation and never persisted; the qualitative
 * band comes from `logic.healthBand`. The header bar shows `value / max` as a
 * percentage. The derivation math is unit-tested; here we prove a real being
 * renders a non-zero bar and that adding an injury reduces the reported health.
 */
describe("Being sheet header: health bar (#463)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    /** The first body part (with a location) of the actor's body. */
    function firstPartLocation(win, actorId) {
        const parts =
            win.game.actors.get(actorId).logic.body?.structure?.parts ?? [];
        for (const p of parts) {
            if (p.locations?.length)
                return { location: p.locations[0].shortcode };
        }
        return null;
    }

    /** The being's derived health `{ value, max, band }`. */
    function health(win, actorId) {
        const actor = win.game.actors.get(actorId);
        return {
            value: actor.system.health?.value ?? 0,
            max: actor.system.health?.max ?? 0,
            band: actor.logic?.healthBand,
        };
    }

    it("shows a full, Excellent bar for a healthy being (max always 100)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => health(win, actor.id)).should((h) => {
                expect(h.max, "max is a fixed 100").to.eq(100);
                expect(h.value, "value 100 when uninjured").to.eq(100);
                expect(h.band, "Excellent band").to.eq("Excellent");
            });
            cy.openSheet(actor);
            cy.get(".sheet-header__health-label")
                .invoke("text")
                .should("match", /Health:\s*Excellent/);
            cy.get(".sheet-header__health-fill").should(($el) => {
                expect($el[0].style.width).to.eq("100%");
            });
        });
    });

    it("reduces reported health when an injury is added", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => health(win, actor.id)).then((before) => {
                cy.foundry((win) => firstPartLocation(win, actor.id)).then(
                    (pl) => {
                        expect(pl, "body has a location").to.not.be.null;
                        cy.createItemOn(actor, "trauma", {
                            name: "Deep Gash",
                            system: {
                                subType: "physical",
                                bodyLocationCode: pl.location,
                                levelBase: 3, // S3 — serious
                                healingRateBase: 4,
                            },
                        });
                        cy.prepare(actor);
                        cy.foundry((win) => health(win, actor.id)).should(
                            (h) => {
                                expect(
                                    h.value,
                                    "value drops after injury",
                                ).to.be.lessThan(before.value);
                            },
                        );
                    },
                );
            });
        });
    });
});
