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
 * The **draft outline**: a document whose `system.isDraft` is set carries an
 * amber ring on its image wherever it is listed. Three places, and only a
 * running client proves any of them — the sheet header renders the class from
 * its own template, while the sidebar directory and the compendium browser are
 * Foundry's applications, marked after render by the system's hook.
 *
 * The last case is the one a unit test cannot reach at all: a compendium lists
 * *index entries*, not documents, so the flag is only there because the system
 * asks for it in the pack index.
 */

import { toRealm } from "../support/resolve.js";
import { itemFactory } from "../support/factories/itemFactory.js";

const MARK = "sohl-draft";

/** The throwaway world pack this spec builds, and tears down, for the browser case. */
const PACK_LABEL = "E2E Draft Pack";
const PACK_ID = "world.e2e-draft-pack";

/**
 * Emulate an OS dark scheme, which is what `light-dark()` resolves against, so
 * the ring's colour in each theme is read rather than assumed.
 */
function emulateScheme(value) {
    return cy.wrap(null, { log: false }).then(() =>
        Cypress.automation("remote:debugger:protocol", {
            command: "Emulation.setEmulatedMedia",
            params: { features: value ? [{ name: "prefers-color-scheme", value }] : [] },
        }),
    );
}

/** Read an element's computed outline, so the ring is asserted and not just the class. */
function outlineOf(win, el) {
    const style = win.getComputedStyle(el);
    return {
        width: style.outlineWidth,
        style: style.outlineStyle,
        color: style.outlineColor,
    };
}

describe("the draft outline", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("outlines the image on a draft item's own sheet", () => {
        cy.createWorldItem("skill", { system: { isDraft: true } }).then((item) => {
            cy.openSheet(item);
            cy.foundry((win) => {
                const img = win.game.items.get(item.id).sheet.element.querySelector("img.item-img");
                return { marked: img.classList.contains(MARK), ...outlineOf(win, img) };
            }).then((seen) => {
                expect(seen.marked, "sheet image carries the mark").to.be.true;
                expect(seen.style, "outline style").to.eq("solid");
                expect(seen.width, "outline width").to.eq("2px");
            });
        });
    });

    it("leaves a settled item's sheet image unchanged", () => {
        cy.createWorldItem("skill").then((item) => {
            cy.openSheet(item);
            cy.foundry((win) => {
                const img = win.game.items.get(item.id).sheet.element.querySelector("img.item-img");
                return { marked: img.classList.contains(MARK), ...outlineOf(win, img) };
            }).then((seen) => {
                expect(seen.marked, "sheet image carries no mark").to.be.false;
                expect(seen.style, "no outline drawn").to.eq("none");
            });
        });
    });

    it("outlines a draft actor's portrait on its sheet", () => {
        cy.createActor("being", { system: { isDraft: true } }).then((actor) => {
            cy.openSheet(actor);
            cy.foundry((win) => {
                const img = win.game.actors
                    .get(actor.id)
                    .sheet.element.querySelector("img.sheet-header__portrait");
                return { marked: img.classList.contains(MARK), ...outlineOf(win, img) };
            }).then((seen) => {
                expect(seen.marked, "portrait carries the mark").to.be.true;
                expect(seen.style, "outline style").to.eq("solid");
            });
        });
    });

    it("outlines a draft item in the sidebar directory, and only that one", () => {
        cy.createWorldItem("skill", { system: { isDraft: true } }).then((draft) => {
            cy.createWorldItem("skill").then((settled) => {
                cy.foundry(async (win) => {
                    await win.ui.items.render({ force: true });
                    const row = (id) =>
                        win.ui.items.element.querySelector(
                            `li.directory-item[data-entry-id="${id}"] img`,
                        );
                    const draftImg = row(draft.id);
                    const settledImg = row(settled.id);
                    return {
                        draftMarked: draftImg?.classList.contains(MARK),
                        settledMarked: settledImg?.classList.contains(MARK),
                        draftOutline: draftImg ? outlineOf(win, draftImg) : null,
                    };
                }).then((seen) => {
                    expect(seen.draftMarked, "draft row is marked").to.be.true;
                    expect(seen.settledMarked, "settled row is not").to.be.false;
                    expect(seen.draftOutline.style, "outline style").to.eq("solid");
                    expect(seen.draftOutline.width, "outline width").to.eq("2px");
                });
            });
        });
    });

    it("drops the mark from a directory row when the flag is cleared", () => {
        cy.createWorldItem("skill", { system: { isDraft: true } }).then((item) => {
            cy.foundry(async (win) => {
                const doc = win.game.items.get(item.id);
                await win.ui.items.render({ force: true });
                await doc.update(toRealm(win, { "system.isDraft": false }));
                await win.ui.items.render({ force: true });
                await new Promise((r) => setTimeout(r, 250));
                const img = win.ui.items.element.querySelector(
                    `li.directory-item[data-entry-id="${item.id}"] img`,
                );
                return img?.classList.contains(MARK);
            }).should("eq", false);
        });
    });

    it("draws the light amber in a light scheme and the bright one in dark", () => {
        // Both values are the draft amber this system already uses for a link
        // into an unwritten note: #805500 reaches 4.6:1 against the light
        // sidebar's parchment and 5.8:1 on a light sheet, #f2b950 11.2:1 and
        // 9.8:1 against their dark counterparts.
        cy.createWorldItem("skill", { system: { isDraft: true } }).then((item) => {
            cy.openSheet(item);
            emulateScheme("light");
            cy.foundry((win) => {
                const img = win.game.items.get(item.id).sheet.element.querySelector("img.item-img");
                return outlineOf(win, img).color;
            }).should("eq", "rgb(128, 85, 0)");
            emulateScheme("dark");
            cy.foundry((win) => {
                const img = win.game.items.get(item.id).sheet.element.querySelector("img.item-img");
                return outlineOf(win, img).color;
            }).should("eq", "rgb(242, 185, 80)");
            emulateScheme(null);
        });
    });

    it("outlines a draft entry in a compendium browser", () => {
        // A compendium lists index entries, so this only works because the
        // system adds `system.isDraft` to the pack index at init.
        cy.foundry(async (win) => {
            // A previous run that died mid-test can leave the pack behind, and
            // creating a pack whose name is taken is refused.
            await win.game.packs.get(PACK_ID)?.deleteCompendium();
            const pack = await win.CompendiumCollection.createCompendium(
                toRealm(win, { label: PACK_LABEL, type: "Item" }),
            );
            const [draft] = await win.Item.createDocuments(
                toRealm(win, [
                    itemFactory("skill", { name: "Unfinished", system: { isDraft: true } }),
                ]),
                toRealm(win, { pack: pack.collection }),
            );
            const [settled] = await win.Item.createDocuments(
                toRealm(win, [itemFactory("skill", { name: "Finished" })]),
                toRealm(win, { pack: pack.collection }),
            );
            await pack.render(true);
            await new Promise((r) => setTimeout(r, 600));
            const app = Array.from(pack.apps).find((a) => a.element);
            const row = (id) =>
                app.element.querySelector(`li.directory-item[data-entry-id="${id}"] img`);
            const draftImg = row(draft.id);
            const settledImg = row(settled.id);
            const seen = {
                indexedFlag: pack.index.get(draft.id)?.system?.isDraft ?? null,
                draftMarked: draftImg?.classList.contains(MARK) ?? null,
                settledMarked: settledImg?.classList.contains(MARK) ?? null,
                draftOutline: draftImg ? outlineOf(win, draftImg) : null,
            };
            await pack.deleteCompendium();
            return seen;
        }).then((seen) => {
            expect(seen.indexedFlag, "the pack index carries system.isDraft").to.be.true;
            expect(seen.draftMarked, "draft entry is marked").to.be.true;
            expect(seen.settledMarked, "settled entry is not").to.be.false;
            expect(seen.draftOutline.style, "outline style").to.eq("solid");
            expect(seen.draftOutline.width, "outline width").to.eq("2px");
        });
    });
});
