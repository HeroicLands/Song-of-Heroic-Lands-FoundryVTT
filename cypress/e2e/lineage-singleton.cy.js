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
 * Lineage singleton (#338): a Being may embed at most one lineage. The hard
 * data-layer guard covers every path (not just the sheet UI) — direct
 * `createEmbeddedDocuments` is refused when one exists, and an actor created with
 * multiple lineages is reduced to one.
 */
describe("lineage singleton", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    it("refuses a second lineage via createEmbeddedDocuments", () => {
        cy.createWorldItem("lineage", { name: "Src Lineage" }).then((li) => {
            cy.importActor().then((actor) => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const src = win.fromUuidSync(li.uuid).toObject();
                    delete src._id;
                    const before = a.itemTypes.lineage.length;
                    return a
                        .createEmbeddedDocuments("Item", [src])
                        .then(() => ({
                            before,
                            after: a.itemTypes.lineage.length,
                        }))
                        .catch(() => ({
                            before,
                            after: a.itemTypes.lineage.length,
                        }));
                }).should((r) => {
                    expect(r.before, "Basic Folk starts with one").to.equal(1);
                    expect(r.after, "second lineage refused").to.equal(1);
                });
            });
        });
    });

    it("accepts the first lineage on a bare being", () => {
        cy.createWorldItem("lineage", { name: "Src Lineage" }).then((li) => {
            cy.createActor("being", { name: "Bare" }).then((bare) => {
                cy.prepare(bare);
                cy.foundry((win) => {
                    const a = win.game.actors.get(bare.id);
                    const src = win.fromUuidSync(li.uuid).toObject();
                    delete src._id;
                    return a
                        .createEmbeddedDocuments("Item", [src])
                        .then(() => ({ n: a.itemTypes.lineage.length }));
                }).should((r) =>
                    expect(r.n, "first lineage accepted").to.equal(1),
                );
            });
        });
    });

    it("dedupes an actor created with two lineages to one", () => {
        cy.createWorldItem("lineage", { name: "Src Lineage" }).then((li) => {
            cy.foundry((win) => {
                const src = win.fromUuidSync(li.uuid).toObject();
                delete src._id;
                return src;
            }).then((srcData) => {
                cy.createActor("being", {
                    name: "Two Lineages",
                    items: [srcData, srcData],
                }).then((actor) => {
                    // The extra lineage is pruned in `_onCreate` (async, after the
                    // actor + its items exist); give the delete time to settle.
                    cy.wait(1200);
                    cy.foundry((win) => ({
                        n: win.game.actors.get(actor.id).itemTypes.lineage
                            .length,
                    })).then((r) =>
                        expect(r.n, "deduped to one lineage").to.equal(1),
                    );
                });
            });
        });
    });
});
