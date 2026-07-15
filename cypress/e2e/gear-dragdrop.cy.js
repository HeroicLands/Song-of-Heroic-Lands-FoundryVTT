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
 * Being Gear tab drag-and-drop (#491 → #492/#493/#494): gear can be dragged into
 * a container (sets `system.containerId`), back to On Body (clears it), and
 * reordered by dropping onto another item (updates the core `sort`). The drop is
 * driven as a real DOM `drop` event on the live sheet element (in the game realm)
 * so the actual `_onDropItem` / `_onDropGearOnActor` / `_planGearSort` path runs —
 * not a direct handler call.
 */
describe("Being Gear tab: drag-and-drop (#491)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    /**
     * Dispatch a real `drop` of the source item onto the element matched by
     * `targetSelector` within the actor's open sheet, then poll (in-realm) until
     * `read(item)` satisfies `done` or a timeout. Yields the final read value.
     */
    function dropGear(actorId, sourceItemId, targetSelector, read, done) {
        return cy.foundry(async (win) => {
            const actor = win.game.actors.get(actorId);
            const root = actor.sheet.element;
            const source = actor.items.get(sourceItemId);
            const dt = new win.DataTransfer();
            dt.setData(
                "text/plain",
                JSON.stringify({ type: "Item", uuid: source.uuid }),
            );
            const target = root.querySelector(targetSelector);
            if (!target)
                throw new Error(`drop target not found: ${targetSelector}`);
            target.dispatchEvent(
                new win.DragEvent("drop", {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dt,
                }),
            );
            // The drop handler updates asynchronously; poll for it to settle.
            for (let i = 0; i < 100; i++) {
                const v = read(actor.items.get(sourceItemId));
                if (done(v)) return v;
                await new Promise((r) => setTimeout(r, 20));
            }
            return read(actor.items.get(sourceItemId));
        });
    }

    it("drops a loose item into a container (sets containerId)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "containergear", {
                name: "Drop Sack",
                system: { maxCapacityBase: 30 },
            }).then((bag) => {
                cy.createItemOn(actor, "miscgear", {
                    name: "Loose Stone",
                    system: { weightBase: 1 },
                }).then((stone) => {
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("gear");
                    dropGear(
                        actor.id,
                        stone.id,
                        `[data-container-id="${bag.id}"]`,
                        (it) => it.system.containerId,
                        (v) => v === bag.id,
                    ).should("eq", bag.id);
                });
            });
        });
    });

    it("drops an item out of a container back to On Body (clears containerId)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "containergear", {
                name: "Home Sack",
                system: { maxCapacityBase: 30 },
            }).then((bag) => {
                cy.createItemOn(actor, "miscgear", {
                    name: "Packed Stone",
                    system: { weightBase: 1, containerId: bag.id },
                }).then((stone) => {
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("gear");
                    dropGear(
                        actor.id,
                        stone.id,
                        ".gear-list:not([data-container-id])",
                        (it) => it.system.containerId ?? null,
                        (v) => v == null,
                    ).should((v) => expect(v == null).to.be.true);
                });
            });
        });
    });

    it("reorders On Body gear by dropping one item onto another (updates sort)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "miscgear", {
                name: "Sort Alpha",
                system: { weightBase: 1 },
            }).then((alpha) => {
                cy.createItemOn(actor, "miscgear", {
                    name: "Sort Bravo",
                    system: { weightBase: 1 },
                }).then((bravo) => {
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("gear");
                    // Capture Alpha's sort (after the sheet is up) then reorder.
                    cy.foundry(
                        (win) =>
                            win.game.actors.get(actor.id).items.get(alpha.id)
                                .sort,
                    ).then((sortBefore) => {
                        dropGear(
                            actor.id,
                            alpha.id,
                            `[data-item-id="${bravo.id}"]`,
                            (it) => it.sort,
                            (v) => v !== sortBefore,
                        ).should((v) => expect(v).to.not.eq(sortBefore));
                    });
                });
            });
        });
    });
});
