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
 * Gear → encumbrance interaction, verified end-to-end on a live being:
 *
 * - **#1009** Worn armor weight is *excluded* from the being's carried weight
 *   (and therefore encumbrance) — a fitted harness rides the body. The same
 *   armor carried but **not** worn counts its full weight like any other cargo.
 * - **#1010** An armor's or weapon's optional per-item *encumbrance value* is
 *   added to the being's encumbrance while the item is in use (armor worn, a
 *   weapon carried), on top of the weight-derived base.
 *
 * Assertions are deltas (worn vs. not-worn, carried vs. not) so they hold
 * regardless of the Basic Folk baseline load, and the weight/encumbrance
 * dimensions are isolated per test.
 */

/** The being's carried-weight total for the active medium. */
function carriedWeight(win, actorId) {
    return win.game.actors.get(actorId).logic.carriedWeight.effective;
}

/** The being's encumbrance for the active medium. */
function encumbrance(win, actorId) {
    return win.game.actors.get(actorId).logic.encumbrance.effective;
}

/** Set an item field directly (realm-safe), then re-prepare and read back. */
function setField(win, actorId, itemId, patch) {
    return win.game.actors
        .get(actorId)
        .items.get(itemId)
        .update(win.JSON.parse(JSON.stringify(patch)))
        .then(() => true);
}

describe("gear → encumbrance (#1009, #1010)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("worn armor weight is excluded from carried weight; carried-not-worn counts (#1009)", () => {
        cy.importActor().then((actor) => {
            // Armor carried but not worn to start; 12 lb of raw weight.
            cy.createItemOn(actor, "armorgear", {
                name: "Heavy Hauberk",
                system: { weightBase: 12, isCarried: true, isWorn: false },
            }).then((armor) => {
                cy.prepare(actor);
                cy.foundry((win) => carriedWeight(win, actor.id)).then(
                    (notWornWeight) => {
                        // Don it: its 12 lb should drop out of carried weight.
                        cy.foundry((win) =>
                            setField(win, actor.id, armor.id, {
                                "system.isWorn": true,
                            }),
                        );
                        cy.prepare(actor);
                        cy.foundry((win) =>
                            carriedWeight(win, actor.id),
                        ).should((wornWeight) => {
                            expect(notWornWeight - wornWeight).to.eq(12);
                        });
                    },
                );
            });
        });
    });

    it("a worn armor's encumbrance value is added to encumbrance (#1010)", () => {
        cy.importActor().then((actor) => {
            // Weightless so wearing does not change the weight-derived base;
            // only the encumbrance value (5) should move the total.
            cy.createItemOn(actor, "armorgear", {
                name: "Awkward Cuirass",
                system: {
                    weightBase: 0,
                    encumbrance: 5,
                    isCarried: true,
                    isWorn: false,
                },
            }).then((armor) => {
                cy.prepare(actor);
                cy.foundry((win) => encumbrance(win, actor.id)).then(
                    (notWornEnc) => {
                        cy.foundry((win) =>
                            setField(win, actor.id, armor.id, {
                                "system.isWorn": true,
                            }),
                        );
                        cy.prepare(actor);
                        cy.foundry((win) => encumbrance(win, actor.id)).should(
                            (wornEnc) => {
                                expect(wornEnc - notWornEnc).to.eq(5);
                            },
                        );
                    },
                );
            });
        });
    });

    it("a carried weapon's encumbrance value is added to encumbrance (#1010)", () => {
        cy.importActor().then((actor) => {
            // Weightless weapon with no strike modes (avoids #246) so only its
            // encumbrance value (3) contributes; toggle isCarried to see it move.
            cy.createItemOn(actor, "weapongear", {
                name: "Unwieldy Pike",
                system: {
                    weightBase: 0,
                    encumbranceBase: 3,
                    isCarried: false,
                    strikeModes: [],
                },
            }).then((weapon) => {
                cy.prepare(actor);
                cy.foundry((win) => encumbrance(win, actor.id)).then(
                    (uncarriedEnc) => {
                        cy.foundry((win) =>
                            setField(win, actor.id, weapon.id, {
                                "system.isCarried": true,
                            }),
                        );
                        cy.prepare(actor);
                        cy.foundry((win) => encumbrance(win, actor.id)).should(
                            (carriedEnc) => {
                                expect(carriedEnc - uncarriedEnc).to.eq(3);
                            },
                        );
                    },
                );
            });
        });
    });
});
