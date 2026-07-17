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
 * Actor→actor drag semantics (#296): dropping an item that lives on another
 * actor MOVES it (created here, removed there). Non-gear moves the instance;
 * physical gear moves with quantity — a "How Many?" dialog for stacks > 1,
 * skipped for single items and shift-drag (move all).
 */
describe("actor-to-actor drag semantics", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    // Drop `src` (a live item) onto actor `destId`'s sheet, optionally shift-held.
    function drop(win, destId, src, shift = false) {
        const dest = win.game.actors.get(destId);
        const ev = new win.DragEvent("drop", { shiftKey: shift });
        return dest.sheet._onDropItem(ev, src);
    }

    it("moves a non-gear item (skill) between actors", () => {
        cy.createActor("being", { name: "A" }).then((a) => {
            cy.createActor("being", { name: "B" }).then((b) => {
                cy.createItemOn(a, "skill", { name: "Stealth" }).then(
                    (skill) => {
                        cy.foundry((win) =>
                            Cypress.Promise.resolve(
                                drop(
                                    win,
                                    b.id,
                                    win.game.actors
                                        .get(a.id)
                                        .items.get(skill.id),
                                ),
                            ).then(() => null),
                        );
                        cy.wait(400);
                        cy.foundry((win) => ({
                            srcHas: win.game.actors
                                .get(a.id)
                                .items.has(skill.id),
                            destHas: win.game.actors
                                .get(b.id)
                                .items.some((i) => i.name === "Stealth"),
                        })).should((r) => {
                            expect(r.srcHas, "removed from source").to.be.false;
                            expect(r.destHas, "created on dest").to.be.true;
                        });
                    },
                );
            });
        });
    });

    it("moves a single-quantity gear item with no dialog", () => {
        cy.createActor("being", { name: "A" }).then((a) => {
            cy.createActor("being", { name: "B" }).then((b) => {
                cy.createItemOn(a, "miscgear", {
                    name: "Torch",
                    system: { quantity: 1 },
                }).then((g) => {
                    cy.foundry((win) =>
                        Cypress.Promise.resolve(
                            drop(
                                win,
                                b.id,
                                win.game.actors.get(a.id).items.get(g.id),
                            ),
                        ).then(() => null),
                    );
                    cy.wait(400);
                    cy.foundry((win) => ({
                        srcHas: win.game.actors.get(a.id).items.has(g.id),
                        destQty: win.game.actors
                            .get(b.id)
                            .items.find((i) => i.name === "Torch")?.system
                            .quantity,
                    })).should((r) => {
                        expect(r.srcHas, "source removed").to.be.false;
                        expect(r.destQty, "whole stack moved").to.equal(1);
                    });
                });
            });
        });
    });

    it("shift-drag moves the whole stack with no dialog", () => {
        cy.createActor("being", { name: "A" }).then((a) => {
            cy.createActor("being", { name: "B" }).then((b) => {
                cy.createItemOn(a, "miscgear", {
                    name: "Arrows",
                    system: { quantity: 20 },
                }).then((g) => {
                    cy.foundry((win) =>
                        Cypress.Promise.resolve(
                            drop(
                                win,
                                b.id,
                                win.game.actors.get(a.id).items.get(g.id),
                                true,
                            ),
                        ).then(() => null),
                    );
                    cy.wait(400);
                    cy.foundry((win) => ({
                        srcHas: win.game.actors.get(a.id).items.has(g.id),
                        destQty: win.game.actors
                            .get(b.id)
                            .items.find((i) => i.name === "Arrows")?.system
                            .quantity,
                    })).should((r) => {
                        expect(r.srcHas, "source removed").to.be.false;
                        expect(r.destQty, "all 20 moved").to.equal(20);
                    });
                });
            });
        });
    });

    it("prompts How-Many for a stack, splitting the quantity", () => {
        cy.createActor("being", { name: "A" }).then((a) => {
            cy.createActor("being", { name: "B" }).then((b) => {
                cy.createItemOn(a, "miscgear", {
                    name: "Rations",
                    system: { quantity: 5 },
                }).then((g) => {
                    // Fire the drop (blocks on the dialog); don't await here.
                    cy.foundry((win) => {
                        void drop(
                            win,
                            b.id,
                            win.game.actors.get(a.id).items.get(g.id),
                        );
                        return null;
                    });
                    cy.wait(700);
                    // Enter 2 in the qty field, then confirm.
                    cy.foundry((win) => {
                        const dlg = [
                            ...win.foundry.applications.instances.values(),
                        ].find((app) => /dialog/i.test(app.constructor.name));
                        dlg.element.querySelector('input[name="qty"]').value =
                            "2";
                        return null;
                    });
                    cy.submitDialog("move");
                    cy.wait(700);
                    cy.foundry((win) => ({
                        srcQty: win.game.actors.get(a.id).items.get(g.id)
                            ?.system.quantity,
                        destQty: win.game.actors
                            .get(b.id)
                            .items.find((i) => i.name === "Rations")?.system
                            .quantity,
                    })).should((r) => {
                        expect(r.destQty, "moved 2 to dest").to.equal(2);
                        expect(r.srcQty, "source left with 3").to.equal(3);
                    });
                });
            });
        });
    });
});
