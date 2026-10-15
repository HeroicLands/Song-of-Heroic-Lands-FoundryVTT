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
 * The staged system's own shipped pack: `asset-sets/default.json` is found,
 * compiled documents carry their addresses, and a document imported from the
 * compendium points at shipped files that exist. Fix at Default changes none of
 * them.
 */

import { tagName } from "../support/factories/ids.js";
import { toRealm } from "../support/resolve.js";

const JOURNAL_ID = "da819734d9127a24";

describe("asset packs (shipped pack)", () => {
    const ids = {};

    before(() => cy.login().then(() => cy.cleanupWorld()));

    after(() => {
        cy.cleanupWorld();
        cy.foundry(async (win) => {
            await win.game.journal.get(ids.journal)?.delete();
            await win.game.settings.set("sohl", "imageLocations", {});
            return null;
        });
    });

    it("finds the system's shipped pack", () => {
        cy.foundry(async (win) => {
            const pkgs = await win.sohl.apps.foundry.discoverContentPackages();
            return pkgs.map((p) => ({
                pkg: p.pkg,
                root: p.installRoot,
                count: p.shipped.assets.length,
                standIns: p.shipped.assets
                    .filter((a) => /-none-(icon|image)-missing$/.test(a.address))
                    .map((a) => a.target),
            }));
        }).then((pkgs) => {
            const sohl = pkgs.find((p) => p.pkg === "sohl");
            expect(sohl.root).to.equal("systems/sohl/");
            expect(sohl.count).to.be.greaterThan(100);
            expect(sohl.standIns).to.have.members(["icons/missing.svg", "images/missing.svg"]);
        });
    });

    it("imports compendium documents carrying their addresses and pointing at shipped files", () => {
        cy.foundry(async (win) => {
            await win.sohl.apps.foundry.refreshImportLocations();
            const items = win.game.packs.get("sohl.items");
            const index = await items.getIndex();
            const entry = index.find((e) => e.name === "Torch");
            const item = await win.game.items.importFromCompendium(
                items,
                entry._id,
                toRealm(win, { name: tagName("Torch") }),
            );
            ids.item = item.id;
            const journal = await win.game.journal.importFromCompendium(
                win.game.packs.get("sohl.journals"),
                JOURNAL_ID,
                toRealm(win, { name: tagName("Cobra") }),
            );
            ids.journal = journal.id;
            const html = journal.pages.contents.map((p) => p.text?.content ?? "").join("");
            const img = new win.DOMParser()
                .parseFromString(html, "text/html")
                .querySelector("img[data-asset]");
            return {
                itemImg: item.img,
                itemFlag: item.flags.sohl?.assets?.img,
                journalSrc: img?.getAttribute("src"),
                journalAsset: img?.getAttribute("data-asset"),
            };
        }).then((r) => {
            expect(r.itemFlag).to.match(/^sohl-none-icon-/);
            expect(r.itemImg).to.match(/^systems\/sohl\/icons\/[^/]+$/);
            expect(r.journalAsset).to.equal("sohl-none-image-cobra");
            expect(r.journalSrc).to.equal("systems/sohl/images/cobra.webp");
            cy.request({ url: `/${r.itemImg}`, method: "HEAD" })
                .its("status")
                .should("eq", 200);
            cy.request({ url: `/${r.journalSrc}`, method: "HEAD" })
                .its("status")
                .should("eq", 200);
        });
    });

    it("Fix at Default leaves shipped references unchanged", () => {
        cy.foundry(async (win) => {
            await win.game.settings.set("sohl", "imageLocations", {});
            const before = win.game.items.get(ids.item).img;
            const report = await win.sohl.apps.foundry.runFix({
                chooseFolder: async () => {
                    throw new Error("Default asks for no folder");
                },
                confirmOverwrite: async () => false,
            });
            return { before, after: win.game.items.get(ids.item).img, report };
        }).then(({ before, after, report }) => {
            expect(after).to.equal(before);
            expect(report.downloaded).to.equal(0);
            expect(report.changed).to.equal(0);
            expect(report.current).to.be.greaterThan(1);
        });
    });
});
