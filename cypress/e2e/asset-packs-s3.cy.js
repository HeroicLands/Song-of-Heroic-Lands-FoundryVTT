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
 * Asset packs against an S3 folder. Needs an S3-compatible server at
 * `s3Endpoint` holding the bucket `s3Bucket`, readable anonymously with CORS
 * open, and the test Foundry configured with `cypress/s3/aws-e2e.json` as its
 * `awsConfig`. Selected with `SOHL_E2E_S3=1`.
 */

import { RUN_TAG, tagName } from "../support/factories/ids.js";
import { toRealm } from "../support/resolve.js";
import {
    A,
    INSTALL,
    ap,
    interceptShippedPack,
    resetAssetPacks,
    svg,
    uploadPack,
    uploadText,
} from "../support/asset-packs.js";

const ENDPOINT = Cypress.expose("s3Endpoint");
const BUCKET = Cypress.expose("s3Bucket");
const KEY = `${RUN_TAG}/one`;
const FOLDER_URL = `${ENDPOINT}/${BUCKET}/${KEY}/`;
const SRC = `sohl-e2e-assetpacks/${RUN_TAG}/src`;

const PACK_ONE = {
    [A.wolf]: { target: "icons/e2ewolf.svg", label: "s3 wolf" },
    [A.map]: { target: "images/e2emap.svg", label: "s3 map" },
    [A.ruin]: { target: "images/e2eruin.svg", label: "s3 ruin" },
    [A.ghost]: { target: "icons/e2eghost.svg", label: "s3 ghost" },
};

const flag = (assets) => ({ sohl: { assets } });

/** Find the open folder picker. */
const openPicker = (win) =>
    [...win.foundry.applications.instances.values()].find(
        (a) => a.constructor.name === "FilePicker" && a.rendered,
    );

describe("asset packs (S3 storage)", () => {
    const ids = {};
    let packUrl;

    before(() => {
        cy.login().then(() => cy.cleanupWorld());
        cy.foundry(async (win) => {
            packUrl = await uploadPack(win, SRC, "one.json", "E2E S3", PACK_ONE);
            return null;
        });
    });

    beforeEach(() => interceptShippedPack());

    after(() => {
        cy.cleanupWorld();
        cy.foundry(async (win) => {
            await win.game.journal.get(ids.journal)?.delete();
            await win.game.settings.set("sohl", "imageLocations", {});
            return null;
        });
    });

    it("has an S3 storage the test Foundry recognises", () => {
        cy.foundry((win) => ({
            match: !!win.foundry.applications.apps.FilePicker.implementation.matchS3URL(FOLDER_URL),
            buckets: win.game.data.files.s3?.buckets ?? null,
        })).then(({ match }) => expect(match, `${FOLDER_URL} is an S3 URL`).to.equal(true));
    });

    it("downloads into an S3 prefix chosen in the folder picker and repoints references", () => {
        resetAssetPacks();
        cy.foundry(async (win) => {
            const stand = `${INSTALL}icons/missing.svg`;
            const actor = await win.Actor.create(
                toRealm(win, {
                    name: tagName("wolf"),
                    type: "being",
                    img: stand,
                    flags: flag({ img: A.wolf }),
                }),
            );
            ids.actor = actor.id;
            const journal = await win.JournalEntry.create(
                toRealm(win, {
                    name: tagName("atlas"),
                    pages: [
                        {
                            name: "maps",
                            type: "text",
                            text: {
                                content:
                                    `<p><img src="${INSTALL}images/missing.svg" data-asset="${A.map}"></p>` +
                                    `<p><img src="${INSTALL}images/missing.svg" data-asset="${A.ruin}"></p>`,
                            },
                        },
                    ],
                }),
            );
            ids.journal = journal.id;
            await ap(win).addAssetPackFromUrl("sohl", packUrl);
            win.__fix = ap(win).runFix();
            return null;
        });
        cy.window({ timeout: 12000 }).should((win) => {
            const picker = openPicker(win);
            expect(picker?.element?.querySelector('input[name="file"]')).to.exist;
            // The listing has loaded, so its filter has run before the picker re-renders.
            expect(picker.result, "picker listing").to.exist;
        });
        cy.foundry(async (win) => {
            const picker = openPicker(win);
            expect(picker.sources.s3, "the picker offers S3").to.exist;
            picker.activeSource = "s3";
            picker.sources.s3.bucket = BUCKET;
            picker.sources.s3.target = KEY;
            await picker.render();
            return null;
        });
        cy.window({ timeout: 12000 }).should((win) => {
            const picker = openPicker(win);
            expect(picker.activeSource).to.equal("s3");
            expect(picker.element?.querySelector('input[name="file"]')).to.exist;
        });
        cy.foundry((win) => {
            const picker = openPicker(win);
            picker.element.querySelector('input[name="file"]').value = KEY;
            picker.element.querySelector('button[type="submit"]').click();
            return null;
        });
        cy.submitDialog("yes");
        cy.foundry((win) => win.__fix).then((report) => {
            expect(report.errors).to.deep.equal([]);
            expect(report.downloaded).to.equal(4);
            expect(report.changed).to.be.greaterThan(0);
        });
        cy.foundry((win) => {
            const page = win.game.journal.get(ids.journal).pages.contents[0];
            const doc = new win.DOMParser().parseFromString(page.text.content, "text/html");
            return {
                actorImg: win.game.actors.get(ids.actor).img,
                pageSrcs: [...doc.querySelectorAll("img")].map((i) => i.getAttribute("src")),
                folder: win.game.settings.get("sohl", "imageLocations").sohl.assetPacks[0].folder,
            };
        }).then((r) => {
            expect(r.folder).to.equal(FOLDER_URL);
            expect(r.actorImg).to.equal(`${FOLDER_URL}icons/e2ewolf.svg`);
            expect(r.pageSrcs).to.deep.equal([
                `${FOLDER_URL}images/e2emap.svg`,
                `${FOLDER_URL}images/e2eruin.svg`,
            ]);
        });
        // Read through the browser, which resolves `*.localhost` to loopback.
        cy.foundry((win) =>
            win
                .fetch(`${FOLDER_URL}icons/e2ewolf.svg`, { cache: "no-store" })
                .then((r) => r.text()),
        ).should("contain", "s3 wolf");
        // The browser renders the bucket's file.
        cy.foundry(
            (win) =>
                new Promise((resolve) => {
                    const img = new win.Image();
                    img.onload = () => resolve(img.naturalWidth);
                    img.onerror = () => resolve(0);
                    img.src = win.game.actors.get(ids.actor).img;
                }),
        ).should("be.greaterThan", 0);
    });

    it("a second Fix downloads nothing", () => {
        cy.foundry((win) =>
            ap(win).runFix({
                chooseFolder: async (_p, pack) => pack.folder,
                confirmOverwrite: async () => true,
            }),
        ).then((report) => {
            expect(report.downloaded).to.equal(0);
            expect(report.present).to.equal(4);
            expect(report.changed).to.equal(0);
        });
    });

    it("fetches a changed file again", () => {
        const text = svg("s3 wolf, longer");
        cy.foundry(async (win) => {
            await uploadText(win, `${SRC}/one`, "e2ewolf.svg", text, "image/svg+xml");
            const pack = await (await win.fetch(`${SRC}/one.json`, { cache: "no-store" })).json();
            pack.assets.find((a) => a.address === A.wolf).size = new Blob([text]).size;
            await uploadText(win, SRC, "one.json", JSON.stringify(pack), "application/json");
            await ap(win).addAssetPackFromUrl("sohl", packUrl);
            return ap(win).runFix({
                chooseFolder: async (_p, p) => p.folder,
                confirmOverwrite: async () => true,
            });
        }).then((report) => {
            expect(report.downloaded).to.equal(1);
            expect(report.present).to.equal(3);
        });
        cy.foundry((win) =>
            win
                .fetch(`${FOLDER_URL}icons/e2ewolf.svg`, { cache: "no-store" })
                .then((r) => r.text()),
        ).should("contain", "s3 wolf, longer");
    });
});
