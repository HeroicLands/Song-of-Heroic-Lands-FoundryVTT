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
 * Gear state controls (#294).
 *
 * - **Gear tab** per-row toggles: **carried** (`isCarried`) and **worn**
 *   (`isWorn`, armor-only).
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
            // The Manuscript redesign (#782/#798) rebuilt gear rows as
            // `div.ledger__row` (was `li.item`), so match by `data-item-id`
            // tag-agnostically rather than qualifying on `li`.
            const el = win.game.actors
                .get(actorId)
                .sheet.element.querySelector(
                    `[data-item-id="${itemId}"] [data-action="${action}"]`,
                );
            expect(el, `${action} control on ${itemId}`).to.exist;
            el.click();
            return null;
        }

        it("toggles carried and worn from the Gear tab", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "weapongear", { name: "Sword" }).then((w) =>
                    cy.wrap(w.id).as("wid"),
                );
                cy.createItemOn(actor, "armorgear", { name: "Mail" }).then((a) =>
                    cy.wrap(a.id).as("aid"),
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
                            worn: A.items.get(aid).system.isWorn,
                            carried: A.items.get(wid).system.isCarried,
                        };
                    };

                    cy.foundry(state).should((s) => {
                        expect(s.worn).to.be.false;
                        expect(s.carried).to.be.true; // gear defaults to carried
                    });

                    cy.foundry((win) => click(win, actor.id, aid, "toggleWorn"));
                    cy.wait(400);
                    cy.foundry(state).should((s) => expect(s.worn, "armor worn").to.be.true);

                    cy.foundry((win) => click(win, actor.id, wid, "toggleCarried"));
                    cy.wait(400);
                    cy.foundry(state).should(
                        (s) => expect(s.carried, "weapon not carried").to.be.false,
                    );
                });
            });
        });
    });

    describe("carried gate (#1097)", () => {
        /** Read the gate-relevant state of an armor item. */
        function armorState(win, actorId, itemId) {
            const item = win.game.actors.get(actorId).items.get(itemId);
            return {
                carried: item.system.isCarried,
                worn: item.system.isWorn,
            };
        }

        it("refuses toggleWorn while the armor is not carried, and allows it once carried", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "armorgear", {
                    name: "Stowed Mail",
                    system: { isCarried: false, isWorn: false },
                }).then((a) => cy.wrap(a.id).as("aid"));
                cy.then(function () {
                    const aid = this.aid;
                    cy.prepare(actor);

                    // Uncarried: the action is refused, not merely hidden.
                    cy.foundry((win) =>
                        win.game.actors
                            .get(actor.id)
                            .items.get(aid)
                            .logic.executeAction("toggleWorn")
                            .then(() => armorState(win, actor.id, aid)),
                    ).should((s) => {
                        expect(s.carried, "still uncarried").to.be.false;
                        expect(s.worn, "worn refused while uncarried").to.be.false;
                    });

                    // Toggle Carried is never gated — it is the way back.
                    cy.foundry((win) =>
                        win.game.actors
                            .get(actor.id)
                            .items.get(aid)
                            .logic.executeAction("toggleCarried")
                            .then(() => armorState(win, actor.id, aid)),
                    ).should((s) => expect(s.carried, "picked back up").to.be.true);

                    // Carried: the same action now performs.
                    cy.foundry((win) =>
                        win.game.actors
                            .get(actor.id)
                            .items.get(aid)
                            .logic.executeAction("toggleWorn")
                            .then(() => armorState(win, actor.id, aid)),
                    ).should((s) => expect(s.worn, "worn once carried").to.be.true);
                });
            });
        });

        it("clears the worn state when worn armor is set down", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "armorgear", {
                    name: "Worn Mail",
                    system: { isCarried: true, isWorn: true },
                }).then((a) => cy.wrap(a.id).as("aid"));
                cy.then(function () {
                    const aid = this.aid;
                    cy.prepare(actor);
                    cy.foundry((win) =>
                        win.game.actors
                            .get(actor.id)
                            .items.get(aid)
                            .logic.executeAction("toggleCarried")
                            .then(() => armorState(win, actor.id, aid)),
                    ).should((s) => {
                        expect(s.carried, "set down").to.be.false;
                        expect(s.worn, "worn cleared on stow").to.be.false;
                    });
                });
            });
        });

        it("drops gated actions from the Actions context menu while uncarried", () => {
            cy.importActor().then((actor) => {
                cy.createItemOn(actor, "armorgear", {
                    name: "Cart Mail",
                    system: { isCarried: false },
                }).then((a) => cy.wrap(a.id).as("aid"));
                cy.then(function () {
                    const aid = this.aid;
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("gear");
                    cy.wait(400);
                    cy.foundry((win) => {
                        const row = win.game.actors
                            .get(actor.id)
                            .sheet.element.querySelector(`[data-item-id="${aid}"]`);
                        const logic = win.game.actors.get(actor.id).items.get(aid).logic;
                        const shown = logic
                            .getContextOptions()
                            .filter((e) => e.condition(row))
                            .map((e) => e.id);
                        return {
                            shown,
                            wornDisabled: !!row?.querySelector(
                                '[data-action="toggleWorn"][disabled]',
                            ),
                        };
                    }).should((r) => {
                        expect(
                            r.shown.join("|"),
                            "toggleWorn hidden while uncarried",
                        ).to.not.contain("toggleWorn");
                        expect(r.wornDisabled, "worn control disabled").to.be.true;
                    });
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
                cy.createItemOn(actor, "weapongear", { name: "Sword" }).then((w) =>
                    cy.wrap(w.id).as("wid"),
                );
                cy.then(function () {
                    const wid = this.wid;
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.wait(400);
                    const held = (win) =>
                        win.game.actors.get(actor.id).items.get(wid).logic.heldBy.length;

                    // At least one hold-capable limb dropdown exists.
                    cy.foundry((win) => pick(win, actor.id, 0, wid)).should((r) =>
                        expect(r.limbCount, "limb dropdowns").to.be.at.least(1),
                    );
                    cy.wait(400);
                    cy.foundry(held).should((n) => expect(n, "weapon held").to.be.at.least(1));

                    // Blank the same limb → released.
                    cy.foundry((win) => pick(win, actor.id, 0, ""));
                    cy.wait(400);
                    cy.foundry(held).should((n) => expect(n, "weapon released").to.equal(0));
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
                                win.game.actors.get(actor.id).items.get(wid).logic.heldBy.length,
                        ).should((held) => expect(held, "held by both limbs").to.equal(2));
                    });
                });
            });
        });
    });
});
