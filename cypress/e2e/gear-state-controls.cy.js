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
 * Gear state controls (#294).
 *
 * - **Gear tab** per-row toggles: **carried** (`isCarried`) and **worn**
 *   (`isEquipped`, armor).
 * - **Combat tab** Held Items section: one dropdown per hold-capable limb,
 *   listing the actor's holdable gear (weapons + misc gear not in a container).
 *   Selecting an item sets that limb's `heldItemId`; a two-handed weapon is held
 *   by selecting it in both limbs.
 */
describe("gear state controls", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    describe("Gear tab: carried / worn toggles", () => {
        /** Click a row control (by `data-action`) on the open sheet. */
        function click(win, actorId, itemId, action) {
            const el = win.game.actors
                .get(actorId)
                .sheet.element.querySelector(
                    `li[data-item-id="${itemId}"] [data-action="${action}"]`,
                );
            expect(el, `${action} control on ${itemId}`).to.exist;
            el.click();
            return null;
        }

        it("toggles carried and worn from the Gear tab", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "weapongear", { name: "Sword" }).then(
                    (w) => cy.wrap(w.id).as("wid"),
                );
                cy.createItemOn(actor, "armorgear", { name: "Mail" }).then(
                    (a) => cy.wrap(a.id).as("aid"),
                );
                cy.then(function () {
                    const { wid, aid } = this;
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("gear");
                    cy.wait(400);

                    const state = (win) => {
                        const A = win.game.actors.get(actor.id);
                        return {
                            worn: A.items.get(aid).system.isEquipped,
                            carried: A.items.get(wid).system.isCarried,
                        };
                    };

                    cy.foundry(state).should((s) => {
                        expect(s.worn).to.be.false;
                        expect(s.carried).to.be.true; // gear defaults to carried
                    });

                    cy.foundry((win) =>
                        click(win, actor.id, aid, "toggleEquipped"),
                    );
                    cy.wait(400);
                    cy.foundry(state).should(
                        (s) => expect(s.worn, "armor worn").to.be.true,
                    );

                    cy.foundry((win) =>
                        click(win, actor.id, wid, "toggleCarried"),
                    );
                    cy.wait(400);
                    cy.foundry(state).should(
                        (s) =>
                            expect(s.carried, "weapon not carried").to.be.false,
                    );
                });
            });
        });
    });

    describe("Combat tab: Held Items dropdowns", () => {
        /** Set a limb dropdown (nth `select.held-item-select`) to an item id. */
        function pick(win, actorId, nth, itemId) {
            const selects = win.game.actors
                .get(actorId)
                .sheet.element.querySelectorAll(
                    'section[data-tab="combat"] select.held-item-select',
                );
            const sel = selects[nth];
            expect(sel, `limb dropdown #${nth}`).to.exist;
            sel.value = itemId;
            sel.dispatchEvent(new win.Event("change", { bubbles: true }));
            return { limbCount: selects.length };
        }

        it("selecting a weapon in a limb dropdown holds it; blank releases it", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "weapongear", { name: "Sword" }).then(
                    (w) => cy.wrap(w.id).as("wid"),
                );
                cy.then(function () {
                    const wid = this.wid;
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.wait(400);
                    const held = (win) =>
                        win.game.actors.get(actor.id).items.get(wid).logic
                            .heldBy.length;

                    // At least one hold-capable limb dropdown exists.
                    cy.foundry((win) => pick(win, actor.id, 0, wid)).should(
                        (r) =>
                            expect(
                                r.limbCount,
                                "limb dropdowns",
                            ).to.be.at.least(1),
                    );
                    cy.wait(400);
                    cy.foundry(held).should((n) =>
                        expect(n, "weapon held").to.be.at.least(1),
                    );

                    // Blank the same limb → released.
                    cy.foundry((win) => pick(win, actor.id, 0, ""));
                    cy.wait(400);
                    cy.foundry(held).should((n) =>
                        expect(n, "weapon released").to.equal(0),
                    );
                });
            });
        });

        it("holds a weapon in two limbs (two-handed)", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "weapongear", {
                    name: "Greatsword",
                }).then((w) => cy.wrap(w.id).as("wid"));
                cy.then(function () {
                    const wid = this.wid;
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.wait(400);
                    cy.foundry((win) => {
                        const n = win.game.actors
                            .get(actor.id)
                            .sheet.element.querySelectorAll(
                                'section[data-tab="combat"] select.held-item-select',
                            ).length;
                        // Only meaningful with >= 2 limbs (Basic Folk has two arms).
                        return n;
                    }).then((n) => {
                        if (n < 2) return; // skip on single-limb bodies
                        cy.foundry((win) => pick(win, actor.id, 0, wid));
                        cy.wait(300);
                        cy.foundry((win) => pick(win, actor.id, 1, wid));
                        cy.wait(400);
                        cy.foundry(
                            (win) =>
                                win.game.actors.get(actor.id).items.get(wid)
                                    .logic.heldBy.length,
                        ).should((held) =>
                            expect(held, "held by both limbs").to.equal(2),
                        );
                    });
                });
            });
        });
    });
});
