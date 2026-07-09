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
 * Gear state controls on the Being Gear tab (#294).
 *
 * Per-row toggles drive a gear item's state: **carried** (`isCarried`),
 * **worn/equipped** (`isEquipped`, armor), and **held** (grip with a
 * hold-capable body part, via `GearLogic.holdItem`/`releaseItem`). Held weapons
 * feed the strike-mode sections; worn armor feeds the body-location totals.
 */
describe("gear state controls", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

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

    it("toggles carried, worn, and held from the Gear tab", () => {
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
                        held: A.items.get(wid).logic.heldBy.length,
                        worn: A.items.get(aid).system.isEquipped,
                        carried: A.items.get(wid).system.isCarried,
                    };
                };

                cy.foundry(state).should((s) => {
                    expect(s.held).to.equal(0);
                    expect(s.worn).to.be.false;
                    expect(s.carried).to.be.true; // gear defaults to carried
                });

                // Hold the weapon → a hold-capable body part grips it.
                cy.foundry((win) => click(win, actor.id, wid, "toggleHeld"));
                cy.wait(400);
                cy.foundry(state).should((s) =>
                    expect(s.held, "weapon held").to.be.at.least(1),
                );

                // Release it again.
                cy.foundry((win) => click(win, actor.id, wid, "toggleHeld"));
                cy.wait(400);
                cy.foundry(state).should((s) =>
                    expect(s.held, "weapon released").to.equal(0),
                );

                // Wear the armor.
                cy.foundry((win) =>
                    click(win, actor.id, aid, "toggleEquipped"),
                );
                cy.wait(400);
                cy.foundry(state).should(
                    (s) => expect(s.worn, "armor worn").to.be.true,
                );

                // Stop carrying the weapon.
                cy.foundry((win) => click(win, actor.id, wid, "toggleCarried"));
                cy.wait(400);
                cy.foundry(state).should(
                    (s) => expect(s.carried, "weapon not carried").to.be.false,
                );
            });
        });
    });
});
