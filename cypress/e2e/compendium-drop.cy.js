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
 * Drag-and-drop an Item onto a Being (#341). A compendium or world item dropped
 * on the actor sheet is created as an embedded clone; a second lineage is
 * refused (singleton).
 */
describe("drop item onto actor", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    /** Simulate dropping the item at `uuid` onto the actor's open sheet. */
    function drop(win, actorId, uuid) {
        const sheet = win.game.actors.get(actorId).sheet;
        const dt = new win.DataTransfer();
        dt.setData("text/plain", JSON.stringify({ type: "Item", uuid }));
        const ev = new win.DragEvent("drop", { dataTransfer: dt });
        return Cypress.Promise.resolve(sheet._onDrop(ev)).then(() => null);
    }

    it("clones a world item onto the actor", () => {
        cy.importActor().then((actor) => {
            cy.createWorldItem("skill", { name: "Dropped Skill" }).then(
                (wi) => {
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.wait(300);
                    cy.foundry((win) => {
                        win.__before = win.game.actors.get(actor.id).items.size;
                        win.__wname = wi.name; // createWorldItem tags the name
                        win.__wid = wi.id;
                        return drop(win, actor.id, wi.uuid);
                    });
                    cy.wait(400);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const made = a.items.find(
                            (i) => i.name === win.__wname,
                        );
                        return {
                            grew: a.items.size === win.__before + 1,
                            cloned: !!made && made.id !== win.__wid,
                        };
                    }).should((r) => {
                        expect(r.grew, "actor gained an item").to.be.true;
                        expect(r.cloned, "embedded clone (new id)").to.be.true;
                    });
                },
            );
        });
    });

    it("clones a compendium item onto the actor", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.wait(300);
            cy.foundry((win) => {
                const pack = [...win.game.packs].find(
                    (p) => p.documentName === "Item",
                );
                if (!pack) return { skip: true };
                return Cypress.Promise.resolve(pack.getDocuments()).then(
                    (docs) => {
                        win.__cuuid = docs[0].uuid;
                        win.__cname = docs[0].name;
                        win.__before = win.game.actors.get(actor.id).items.size;
                        return drop(win, actor.id, docs[0].uuid);
                    },
                );
            });
            cy.wait(400);
            cy.foundry((win) => ({
                grew:
                    win.game.actors.get(actor.id).items.size ===
                    win.__before + 1,
                cname: win.__cname,
            })).should((r) => {
                expect(r.grew, `compendium item "${r.cname}" cloned`).to.be
                    .true;
            });
        });
    });

    it("cy.getFromCompendium + cy.dropOnActor place authored content on an actor", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.wait(300);
            // Discover a real (non-lineage) compendium item to avoid a brittle
            // hardcoded shortcode.
            cy.foundry(async (win) => {
                const pack = [...win.game.packs].find(
                    (p) => p.documentName === "Item",
                );
                const index = await pack.getIndex({
                    fields: ["system.shortcode"],
                });
                const entry = index.find(
                    (e) => e.type !== "lineage" && e.system?.shortcode,
                );
                return {
                    pack: pack.collection,
                    type: entry.type,
                    sc: entry.system.shortcode,
                };
            }).then((ref) => {
                cy.getFromCompendium(ref.pack, ref.type, ref.sc).then((src) => {
                    expect(src, "compendium doc resolved").to.exist;
                    cy.dropOnActor(actor, src).then((embedded) => {
                        expect(embedded, "embedded clone yielded").to.exist;
                        cy.foundry((win) => ({
                            onActor: !!win.game.actors
                                .get(actor.id)
                                .items.get(embedded.id),
                            type: embedded.type,
                            sc: embedded.system?.shortcode,
                        })).should((r) => {
                            expect(r.onActor, "clone on the actor").to.be.true;
                            expect(r.type).to.equal(ref.type);
                            expect(r.sc).to.equal(ref.sc);
                        });
                    });
                });
            });
        });
    });

    it("refuses a second lineage but allows the first", () => {
        cy.createWorldItem("lineage", { name: "Dropped Lineage" }).then(
            (li) => {
                // Bare being (no lineage) → accepted
                cy.createActor("being", { name: "Bare" }).then((bare) => {
                    cy.prepare(bare);
                    cy.openSheet(bare);
                    cy.wait(300);
                    cy.foundry((win) => drop(win, bare.id, li.uuid));
                    cy.wait(400);
                    cy.foundry((win) => ({
                        n: win.game.actors.get(bare.id).itemTypes.lineage
                            .length,
                    })).should((r) =>
                        expect(r.n, "first lineage accepted").to.equal(1),
                    );
                });
                // Basic Folk (already has a lineage) → refused
                cy.importActor().then((actor) => {
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.wait(300);
                    cy.foundry((win) => {
                        win.__before = win.game.actors.get(
                            actor.id,
                        ).itemTypes.lineage.length;
                        return drop(win, actor.id, li.uuid);
                    });
                    cy.wait(400);
                    cy.foundry((win) => ({
                        before: win.__before,
                        after: win.game.actors.get(actor.id).itemTypes.lineage
                            .length,
                    })).should((r) => {
                        expect(r.before).to.equal(1);
                        expect(r.after, "second lineage refused").to.equal(1);
                    });
                });
            },
        );
    });
});
