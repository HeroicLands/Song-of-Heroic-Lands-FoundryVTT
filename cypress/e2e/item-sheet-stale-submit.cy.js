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

// #822 — the item sheets share the Being sheet's #817 stale-submit condition.
// Every SoHL sheet uses `submitOnChange`, and Foundry still allows a submit
// while a sheet is CLOSING. An item sheet renders `<prose-mirror
// name="system.notes">`, which commits on teardown, so closing an item sheet
// whose item was just deleted dispatched a submit against a document no longer
// in its collection, and the base `_processSubmitData` threw "Document creation
// from _<ItemSheet> is not supported." The guard now lives in the shared
// `SheetMixin`, so both the actor and item sheet families skip a stale submit
// silently while a live edit still persists. This mirrors the #817 being-sheet
// test for both a world item and an actor-embedded item (whose deletion
// cascades from its owning actor).
describe("item sheet — stale submit after delete (#822)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("skips a stale form submit after a world item is deleted, not error", () => {
        cy.createWorldItem("miscgear", { name: "StaleSubmit822" }).then(
            (item) => {
                cy.foundry(async (win) => {
                    const doc = win.game.items.get(item._id);
                    const sheet = doc.sheet;
                    await sheet.render(true);
                    const form = sheet.form;

                    // Live: an edit against the still-collected item persists.
                    let liveThrew = false;
                    try {
                        await sheet._processSubmitData(
                            new win.Event("submit"),
                            form,
                            win.structuredClone({
                                "system.notes": "<p>alive</p>",
                            }),
                            win.structuredClone({}),
                        );
                    } catch {
                        liveThrew = true;
                    }
                    const persisted = doc.system.notes;

                    // Delete the item (it leaves game.items) with the sheet
                    // still referencing it, then submit again — the stale case.
                    await doc.delete();
                    let staleThrew = false;
                    try {
                        await sheet._processSubmitData(
                            new win.Event("submit"),
                            form,
                            win.structuredClone({
                                "system.notes": "<p>gone</p>",
                            }),
                            win.structuredClone({}),
                        );
                    } catch {
                        staleThrew = true;
                    }
                    return {
                        liveThrew,
                        persisted,
                        staleThrew,
                        stillPresent: win.game.items.has(item._id),
                    };
                }).then((r) => {
                    expect(r.liveThrew, "live submit throws").to.eq(false);
                    expect(r.persisted, "live edit persisted").to.contain(
                        "alive",
                    );
                    expect(r.stillPresent, "item deleted").to.eq(false);
                    expect(r.staleThrew, "stale submit throws").to.eq(false);
                });
            },
        );
    });

    it("skips a stale form submit after an embedded item's actor is deleted, not error", () => {
        cy.createActor("being", { name: "StaleSubmit822Owner" }).then(
            (actor) => {
                cy.createItemOn(actor, "miscgear", {
                    name: "EmbeddedStale822",
                }).then((item) => {
                    cy.foundry(async (win) => {
                        const owner = win.game.actors.get(actor._id);
                        const doc = owner.items.get(item._id);
                        const sheet = doc.sheet;
                        await sheet.render(true);
                        const form = sheet.form;

                        // Live: an edit against the still-embedded item persists.
                        let liveThrew = false;
                        try {
                            await sheet._processSubmitData(
                                new win.Event("submit"),
                                form,
                                win.structuredClone({
                                    "system.notes": "<p>alive</p>",
                                }),
                                win.structuredClone({}),
                            );
                        } catch {
                            liveThrew = true;
                        }
                        const persisted = doc.system.notes;

                        // Delete the OWNING ACTOR — the embedded item cascades
                        // out of its collection while its sheet is still open.
                        await owner.delete();
                        let staleThrew = false;
                        try {
                            await sheet._processSubmitData(
                                new win.Event("submit"),
                                form,
                                win.structuredClone({
                                    "system.notes": "<p>gone</p>",
                                }),
                                win.structuredClone({}),
                            );
                        } catch {
                            staleThrew = true;
                        }
                        return {
                            liveThrew,
                            persisted,
                            staleThrew,
                            ownerPresent: win.game.actors.has(actor._id),
                        };
                    }).then((r) => {
                        expect(r.liveThrew, "live submit throws").to.eq(false);
                        expect(r.persisted, "live edit persisted").to.contain(
                            "alive",
                        );
                        expect(r.ownerPresent, "owning actor deleted").to.eq(
                            false,
                        );
                        expect(r.staleThrew, "stale submit throws").to.eq(
                            false,
                        );
                    });
                });
            },
        );
    });
});
