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
 * Per-creature injury scaling via the body's `bodyScale` factor (#468).
 *
 * The `bodyScaleBase` datamodel field (on the actor's inline body,
 * `system.body`) flows through `BodyLogic` into a scaled `injuryTable`, exposed
 * on the body and its structure — so an absolute impact reads size-correct on
 * any creature. The scaling math is unit-tested; here we prove the datamodel
 * field drives the derived table end to end.
 */
describe("injury body-scale (#468)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    /** Set the actor's body `bodyScaleBase`, then read the derived tables. */
    function scaledTables(win, actorId, bodyScaleBase) {
        const a = win.game.actors.get(actorId);
        return a
            .update(
                win.JSON.parse(
                    JSON.stringify({
                        "system.body.bodyScaleBase": bodyScaleBase,
                    }),
                ),
            )
            .then(() => ({
                bodyScale: a.logic.body.bodyScale.effective,
                injuryTable: a.logic.body.injuryTable,
                structureTable: a.logic.body.structure.injuryTable,
            }));
    }

    it("a human body (default 1.0) carries the master thresholds", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return {
                    scale: a.logic.body.bodyScale.effective,
                    table: a.logic.body.injuryTable,
                };
            }).should((r) => {
                expect(r.scale).to.eq(1);
                expect(r.table).to.deep.eq([1, 5, 10, 15, 20]);
            });
        });
    });

    it("scales the injury table by a frail creature's bodyScale (0.27)", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => scaledTables(win, actor.id, 0.27)).should(
                (r) => {
                    expect(r.bodyScale).to.eq(0.27);
                    const expected = [1, 5, 10, 15, 20].map((t) => t * 0.27);
                    expect(r.injuryTable).to.deep.eq(expected);
                    expect(r.structureTable).to.deep.eq(expected);
                },
            );
        });
    });
});
