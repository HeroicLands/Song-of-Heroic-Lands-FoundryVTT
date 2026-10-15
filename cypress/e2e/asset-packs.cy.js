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
 * Asset packs against a `data` folder: the sanitiser keeps `data-asset`, the
 * HTML rewrite under the browser's own parser, the import hook, Add new, and
 * Fix — downloading, rewriting, idempotence, re-fetching a changed file,
 * switching packs and returning to Default.
 */

import { RUN_TAG, tagName } from "../support/factories/ids.js";
import { toRealm } from "../support/resolve.js";
import {
    A,
    INSTALL,
    ap,
    fixInto,
    interceptShippedPack,
    resetAssetPacks,
    svg,
    uploadPack,
    uploadText,
} from "../support/asset-packs.js";

const ROOT = `sohl-e2e-assetpacks/${RUN_TAG}`;
const SRC = `${ROOT}/src`;
const FOLDER_A = `${ROOT}/a/`;
const FOLDER_B = `${ROOT}/b/`;

const PACK_ONE = {
    [A.wolf]: { target: "icons/e2ewolf.svg", label: "one wolf" },
    [A.map]: { target: "images/e2emap.svg", label: "one map" },
    [A.ruin]: { target: "images/e2eruin.svg", label: "one ruin" },
    [A.ghost]: { target: "icons/e2eghost.svg", label: "one ghost" },
};
const PACK_TWO = { [A.wolf]: { target: "icons/e2ewolf.svg", label: "two wolf" } };

const flag = (assets) => ({ sohl: { assets } });
const img = (src, address) => `<img src="${src}" data-asset="${address}">`;

/** Every reference the fixtures hold, read back from the world. */
function readRefs(ids) {
    return cy.foundry((win) => {
        const actor = win.game.actors.get(ids.actor);
        const item = actor.items.get(ids.embedded);
        const page = win.game.journal.get(ids.journal).pages.get(ids.page);
        const hand = win.game.items.get(ids.hand);
        const ghost = win.game.items.get(ids.ghost);
        const token = win.game.scenes.get(ids.scene).tokens.get(ids.token);
        const doc = new win.DOMParser().parseFromString(page.text.content, "text/html");
        return {
            actorImg: actor.img,
            protoSrc: actor.prototypeToken.texture.src,
            embeddedImg: item.img,
            pageImgs: [...doc.querySelectorAll("img")].map((i) => ({
                src: i.getAttribute("src"),
                asset: i.getAttribute("data-asset"),
            })),
            handImg: hand.img,
            handFlag: hand.flags?.sohl?.assets?.img ?? null,
            ghostImg: ghost.img,
            tokenSrc: token.texture.src,
            tokenFlag: token.flags?.sohl?.assets?.texture?.src ?? null,
        };
    });
}

describe("asset packs (data storage)", () => {
    const ids = {};
    let packOneUrl;
    let packTwoUrl;

    before(() => {
        cy.login().then(() => cy.cleanupWorld());
        cy.foundry(async (win) => {
            packOneUrl = await uploadPack(win, SRC, "one.json", "E2E One", PACK_ONE);
            packTwoUrl = await uploadPack(win, SRC, "two.json", "E2E Two", PACK_TWO);
            return null;
        });
    });

    beforeEach(() => interceptShippedPack());

    after(() => {
        cy.cleanupWorld();
        cy.foundry(async (win) => {
            for (const j of win.game.journal.filter((d) => d.name.startsWith(`[${RUN_TAG}]`))) {
                await j.delete();
            }
            await win.game.settings.set("sohl", "imageLocations", {});
            return null;
        });
    });

    it("keeps data-asset on an <img> through a save and a reload", () => {
        // An address of a package with no shipped pack: the import hook leaves it
        // alone, so only the sanitiser acts on it.
        const html = `<p>${img("images/a.svg", "e2eabsent-none-image-a")}</p>`;
        cy.foundry(async (win) => {
            const entry = await win.JournalEntry.create(
                toRealm(win, {
                    name: tagName("sanitiser"),
                    pages: [{ name: "p", type: "text", text: { content: html } }],
                }),
            );
            ids.sanitiser = entry.id;
            return null;
        });
        cy.login();
        cy.foundry((win) => {
            const page = win.game.journal.get(ids.sanitiser).pages.contents[0];
            return page.text.content;
        }).should("contain", 'data-asset="e2eabsent-none-image-a"');
        cy.foundry((win) =>
            win.game.journal
                .get(ids.sanitiser)
                .delete()
                .then(() => null),
        );
    });

    it("rewrites HTML with the browser's DOMParser, keeping entities and other markup", () => {
        resetAssetPacks();
        cy.foundry((win) => {
            const locations = ap(win).currentImportLocations();
            const html =
                `<p title='a "quoted" &amp; title'>Fish &amp; chips &lt;3 — ` +
                `<img alt="the &quot;old&quot; map" src="${INSTALL}images/missing.svg" data-asset="${A.map}" class=wide>` +
                `<img src=other.png alt=plain>` +
                `<img src="hand/drawn.png" data-asset="${A.ruin}">&nbsp;</p>`;
            const out = win.sohl.utils.rewriteHtmlAssets(html, locations);
            const doc = new win.DOMParser().parseFromString(out, "text/html");
            const imgs = [...doc.querySelectorAll("img")];
            return {
                out,
                text: doc.body.textContent,
                title: doc.querySelector("p").getAttribute("title"),
                first: {
                    src: imgs[0].getAttribute("src"),
                    alt: imgs[0].getAttribute("alt"),
                    cls: imgs[0].className,
                },
                second: imgs[1].outerHTML,
                third: {
                    src: imgs[2].getAttribute("src"),
                    asset: imgs[2].getAttribute("data-asset"),
                },
            };
        }).then((r) => {
            expect(r.first).to.deep.equal({
                src: `${INSTALL}images/e2emap.svg`,
                alt: 'the "old" map',
                cls: "wide",
            });
            expect(r.title).to.equal('a "quoted" & title');
            expect(r.text).to.contain("Fish & chips <3 — ");
            expect(r.second).to.equal('<img src="other.png" alt="plain">');
            expect(r.third).to.deep.equal({ src: "hand/drawn.png", asset: null });
        });
    });

    it("points documents imported under the shipped pack at the shipped files", () => {
        cy.createScene({ name: "assets" }).then((scene) => (ids.scene = scene.id));
        cy.foundry(async (win) => {
            const stand = `${INSTALL}icons/missing.svg`;
            const actor = await win.Actor.create(
                toRealm(win, {
                    name: tagName("wolf"),
                    type: "being",
                    img: stand,
                    flags: flag({ img: A.wolf }),
                    prototypeToken: {
                        texture: { src: stand },
                        flags: flag({ texture: { src: A.wolf } }),
                    },
                    items: [
                        {
                            name: "pelt",
                            type: "miscgear",
                            img: stand,
                            flags: flag({ img: A.wolf }),
                        },
                    ],
                }),
            );
            ids.actor = actor.id;
            ids.embedded = actor.items.contents[0].id;
            const journal = await win.JournalEntry.create(
                toRealm(win, {
                    name: tagName("atlas"),
                    pages: [
                        {
                            name: "maps",
                            type: "text",
                            text: {
                                content:
                                    `<p>${img(`${INSTALL}images/missing.svg`, A.map)}</p>` +
                                    `<p>${img(`${INSTALL}images/e2eruin.svg`, A.ruin)}` +
                                    `<img src="plain.png"></p>`,
                            },
                        },
                    ],
                }),
            );
            ids.journal = journal.id;
            ids.page = journal.pages.contents[0].id;
            const hand = await win.Item.create(
                toRealm(win, {
                    name: tagName("hand"),
                    type: "miscgear",
                    img: `${INSTALL}icons/e2ewolf.svg`,
                    flags: flag({ img: A.wolf }),
                }),
            );
            ids.hand = hand.id;
            const ghost = await win.Item.create(
                toRealm(win, {
                    name: tagName("ghost"),
                    type: "miscgear",
                    img: stand,
                    flags: flag({ img: A.ghost }),
                }),
            );
            ids.ghost = ghost.id;
            // A token whose image a random-image rule chose: not the address's file.
            const scene = win.game.scenes.get(ids.scene);
            const td = await actor.getTokenDocument(
                toRealm(win, { x: 100, y: 100, actorLink: false }),
                { parent: scene },
            );
            const data = td.toObject();
            data.texture.src = "icons/svg/mystery-man.svg";
            const [token] = await scene.createEmbeddedDocuments("Token", [data]);
            ids.token = token.id;
            // A person changes the hand-set item afterwards.
            await hand.update(toRealm(win, { img: "icons/svg/item-bag.svg" }));
            return null;
        });
        readRefs(ids).then((r) => {
            expect(r.actorImg).to.equal(`${INSTALL}icons/e2ewolf.svg`);
            expect(r.protoSrc).to.equal(`${INSTALL}icons/e2ewolf.svg`);
            expect(r.embeddedImg).to.equal(`${INSTALL}icons/e2ewolf.svg`);
            expect(r.pageImgs).to.deep.equal([
                { src: `${INSTALL}images/e2emap.svg`, asset: A.map },
                { src: `${INSTALL}images/e2eruin.svg`, asset: A.ruin },
                { src: "plain.png", asset: null },
            ]);
            expect(r.ghostImg).to.equal(`${INSTALL}icons/missing.svg`);
            expect(r.tokenSrc).to.equal("icons/svg/mystery-man.svg");
            expect(r.tokenFlag, "random token image loses its address").to.equal(null);
        });
    });

    it("Add new stores the pack in the setting, selects it, and downloads nothing", () => {
        cy.intercept("POST", "**/upload").as("upload");
        cy.foundry((win) => {
            const menu = new (ap(win).AssetPacksMenu)();
            win.__assetMenu = menu;
            return menu.render({ force: true }).then(() => null);
        });
        cy.window().should((win) => {
            const button = win.__assetMenu.element?.querySelector(
                'button[data-action="addPack"][data-package="sohl"]',
            );
            expect(button, "Add new… for the sohl row").to.exist;
        });
        cy.foundry((win) => {
            win.__assetMenu.element
                .querySelector('button[data-action="addPack"][data-package="sohl"]')
                .click();
            return null;
        });
        cy.window().should((win) => {
            const input = [...win.document.querySelectorAll('dialog input[name="url"]')].pop();
            expect(input, "the pack address input").to.exist;
        });
        cy.foundry((win) => {
            const input = [...win.document.querySelectorAll('dialog input[name="url"]')].pop();
            input.value = packOneUrl;
            return null;
        });
        cy.submitDialog("ok");
        cy.window().should((win) => {
            const rec = win.game.settings.get("sohl", "imageLocations").sohl;
            expect(rec?.current).to.equal(packOneUrl);
        });
        cy.foundry((win) => {
            const rec = win.game.settings.get("sohl", "imageLocations").sohl;
            return {
                packs: rec.assetPacks.map((p) => ({ url: p.url, name: p.name, folder: p.folder })),
                sources: rec.assetPacks[0].contents.assets.map((a) => a.source),
                origin: win.location.origin,
            };
        }).then((r) => {
            expect(r.packs).to.deep.equal([{ url: packOneUrl, name: "E2E One", folder: null }]);
            for (const s of r.sources)
                expect(s.startsWith(`${r.origin}/${SRC}/one/`)).to.equal(true);
        });
        cy.window().should((win) => {
            const select = win.__assetMenu.element?.querySelector('select[name="pack.sohl"]');
            expect(select?.value).to.equal(packOneUrl);
        });
        cy.get("@upload.all").should("have.length", 0);
        cy.foundry((win) => win.__assetMenu.close().then(() => null));
    });

    it("Fix asks for a folder and warns; cancelling either changes nothing", () => {
        readRefs(ids).as("before");
        // Cancel the folder picker.
        cy.foundry((win) => {
            win.__fix = ap(win).runFix();
            return null;
        });
        cy.window().should((win) => {
            const picker = [...win.foundry.applications.instances.values()].find(
                (a) => a.constructor.name === "FilePicker" && a.rendered,
            );
            expect(picker, "folder picker").to.exist;
            expect(picker.type).to.equal("folder");
        });
        // The picker filters its listing on a debounce after rendering; closing it
        // first leaves that callback positioning a removed element.
        cy.wait(500);
        cy.foundry(async (win) => {
            const picker = [...win.foundry.applications.instances.values()].find(
                (a) => a.constructor.name === "FilePicker" && a.rendered,
            );
            await picker.close();
            return win.__fix;
        }).then((report) => {
            expect(report.skipped).to.deep.equal(["sohl"]);
            expect(report.downloaded).to.equal(0);
        });
        // Choose a folder, then decline the warning.
        cy.foundry((win) => {
            win.__fix = ap(win).runFix({
                chooseFolder: async () => FOLDER_A,
                confirmOverwrite: ap(win).defaultFixPrompts.confirmOverwrite,
            });
            return null;
        });
        cy.window().should((win) => {
            const dlg = [...win.foundry.applications.instances.values()].find(
                (a) =>
                    /dialog/i.test(a.constructor.name) &&
                    a.rendered &&
                    a.element?.textContent.includes(FOLDER_A),
            );
            expect(dlg, "overwrite warning naming the folder").to.exist;
        });
        cy.submitDialog("no");
        cy.foundry((win) => win.__fix).then((report) => {
            expect(report.skipped).to.deep.equal(["sohl"]);
            expect(report.downloaded).to.equal(0);
            expect(report.changed).to.equal(0);
        });
        cy.get("@before").then((before) => readRefs(ids).should("deep.equal", before));
    });

    it("Fix downloads the pack through the folder picker and repoints every reference", () => {
        cy.foundry((win) => {
            win.__fix = ap(win).runFix();
            return null;
        });
        cy.window().should((win) => {
            const picker = [...win.foundry.applications.instances.values()].find(
                (a) => a.constructor.name === "FilePicker" && a.rendered,
            );
            expect(picker?.element?.querySelector('input[name="file"]'), "picker input").to.exist;
        });
        cy.foundry((win) => {
            const picker = [...win.foundry.applications.instances.values()].find(
                (a) => a.constructor.name === "FilePicker" && a.rendered,
            );
            picker.element.querySelector('input[name="file"]').value = FOLDER_A;
            picker.element.querySelector('button[type="submit"]').click();
            return null;
        });
        cy.submitDialog("yes");
        cy.foundry((win) => win.__fix).then((report) => {
            expect(report.skipped).to.deep.equal([]);
            expect(report.downloaded).to.equal(4);
            expect(report.failed).to.equal(0);
            expect(report.changed).to.be.greaterThan(0);
            expect(report.staleDropped).to.equal(1);
        });
        readRefs(ids).then((r) => {
            expect(r.actorImg).to.equal(`${FOLDER_A}icons/e2ewolf.svg`);
            expect(r.protoSrc).to.equal(`${FOLDER_A}icons/e2ewolf.svg`);
            expect(r.embeddedImg).to.equal(`${FOLDER_A}icons/e2ewolf.svg`);
            expect(r.pageImgs).to.deep.equal([
                { src: `${FOLDER_A}images/e2emap.svg`, asset: A.map },
                { src: `${FOLDER_A}images/e2eruin.svg`, asset: A.ruin },
                { src: "plain.png", asset: null },
            ]);
            expect(r.handImg, "hand-set image survives").to.equal("icons/svg/item-bag.svg");
            expect(r.handFlag, "and loses its address").to.equal(null);
            expect(r.ghostImg, "the stand-in becomes the real file").to.equal(
                `${FOLDER_A}icons/e2eghost.svg`,
            );
            expect(r.tokenSrc).to.equal("icons/svg/mystery-man.svg");
        });
        cy.foundry((win) => {
            const rec = win.game.settings.get("sohl", "imageLocations").sohl;
            return { folder: rec.assetPacks[0].folder, used: rec.used };
        }).then((r) => {
            expect(r.folder).to.equal(FOLDER_A);
            expect(r.used).to.deep.equal([INSTALL, FOLDER_A]);
        });
        cy.request(`/${FOLDER_A}icons/e2ewolf.svg`).its("body").should("contain", "one wolf");
    });

    it("a second Fix downloads nothing and changes nothing", () => {
        readRefs(ids).as("before");
        fixInto(FOLDER_A).then((report) => {
            expect(report.downloaded).to.equal(0);
            expect(report.present).to.equal(4);
            expect(report.changed).to.equal(0);
            expect(report.current).to.be.greaterThan(0);
        });
        cy.get("@before").then((before) => readRefs(ids).should("deep.equal", before));
    });

    it("fetches a changed file again", () => {
        cy.foundry(async (win) => {
            await uploadText(
                win,
                `${SRC}/one`,
                "e2ewolf.svg",
                svg("one wolf, longer"),
                "image/svg+xml",
            );
            const res = await win.fetch(`${SRC}/one.json`, { cache: "no-store" });
            const pack = await res.json();
            pack.assets.find((a) => a.address === A.wolf).size = new Blob([
                svg("one wolf, longer"),
            ]).size;
            await uploadText(win, SRC, "one.json", JSON.stringify(pack), "application/json");
            return ap(win).addAssetPackFromUrl("sohl", packOneUrl);
        }).should("equal", true);
        fixInto(FOLDER_A).then((report) => {
            expect(report.downloaded).to.equal(1);
            expect(report.present).to.equal(3);
        });
        cy.request({
            url: `/${FOLDER_A}icons/e2ewolf.svg`,
            headers: { "cache-control": "no-cache" },
        })
            .its("body")
            .should("contain", "one wolf, longer");
    });

    it("switches between downloaded packs without downloading again", () => {
        cy.foundry((win) => ap(win).addAssetPackFromUrl("sohl", packTwoUrl)).should("equal", true);
        fixInto(FOLDER_B).then((report) => expect(report.downloaded).to.equal(1));
        readRefs(ids).then((r) => {
            expect(r.actorImg).to.equal(`${FOLDER_B}icons/e2ewolf.svg`);
            // Pack two covers only the wolf: the rest falls back to the shipped files.
            expect(r.pageImgs[0].src).to.equal(`${INSTALL}images/e2emap.svg`);
            expect(r.ghostImg).to.equal(`${INSTALL}icons/missing.svg`);
        });
        cy.foundry(async (win) => {
            const s = win.game.settings.get("sohl", "imageLocations");
            const next = win.sohl.apps.logic.selectAssetPack(s, "sohl", packOneUrl);
            await win.game.settings.set("sohl", "imageLocations", next);
            return null;
        });
        fixInto(FOLDER_A).then((report) => expect(report.downloaded).to.equal(0));
        readRefs(ids).then((r) => {
            expect(r.actorImg).to.equal(`${FOLDER_A}icons/e2ewolf.svg`);
            expect(r.ghostImg).to.equal(`${FOLDER_A}icons/e2eghost.svg`);
        });
        cy.foundry(async (win) => {
            const s = win.game.settings.get("sohl", "imageLocations");
            await win.game.settings.set(
                "sohl",
                "imageLocations",
                win.sohl.apps.logic.selectAssetPack(s, "sohl", packTwoUrl),
            );
            return null;
        });
        fixInto(FOLDER_B).then((report) => {
            expect(report.downloaded).to.equal(0);
            expect(report.present).to.equal(1);
        });
        readRefs(ids).its("actorImg").should("equal", `${FOLDER_B}icons/e2ewolf.svg`);
    });

    it("picking Default moves every reference back to the install root", () => {
        cy.foundry(async (win) => {
            const s = win.game.settings.get("sohl", "imageLocations");
            await win.game.settings.set(
                "sohl",
                "imageLocations",
                win.sohl.apps.logic.selectAssetPack(s, "sohl", null),
            );
            return null;
        });
        cy.foundry((win) =>
            ap(win).runFix({
                chooseFolder: async () => {
                    throw new Error("Default asks for no folder");
                },
                confirmOverwrite: async () => {
                    throw new Error("Default asks for no confirmation");
                },
            }),
        ).then((report) => {
            expect(report.downloaded).to.equal(0);
            expect(report.skipped).to.deep.equal([]);
        });
        readRefs(ids).then((r) => {
            expect(r.actorImg).to.equal(`${INSTALL}icons/e2ewolf.svg`);
            expect(r.protoSrc).to.equal(`${INSTALL}icons/e2ewolf.svg`);
            expect(r.embeddedImg).to.equal(`${INSTALL}icons/e2ewolf.svg`);
            expect(r.pageImgs.map((i) => i.src)).to.deep.equal([
                `${INSTALL}images/e2emap.svg`,
                `${INSTALL}images/e2eruin.svg`,
                "plain.png",
            ]);
            expect(r.ghostImg).to.equal(`${INSTALL}icons/missing.svg`);
            expect(r.handImg).to.equal("icons/svg/item-bag.svg");
        });
    });

    it("removes an added pack that is not selected, keeping its downloaded files", () => {
        // Default is selected after the previous test; both packs are added and not selected.
        cy.foundry((win) => {
            const menu = new (ap(win).AssetPacksMenu)();
            win.__assetMenu = menu;
            return menu.render({ force: true }).then(() => null);
        });
        const removeButton = (win, url) =>
            win.__assetMenu.element?.querySelector(
                `button[data-action="removePack"][data-package="sohl"][data-url="${url}"]`,
            );
        cy.window().should((win) => {
            expect(removeButton(win, packOneUrl), "Remove for pack one").to.exist;
            expect(removeButton(win, packTwoUrl), "Remove for pack two").to.exist;
        });
        // Select pack two: it loses its Remove control, pack one keeps its own.
        cy.foundry(async (win) => {
            const s = win.game.settings.get("sohl", "imageLocations");
            await win.game.settings.set(
                "sohl",
                "imageLocations",
                win.sohl.apps.logic.selectAssetPack(s, "sohl", packTwoUrl),
            );
            return win.__assetMenu.render().then(() => null);
        });
        cy.window().should((win) => {
            expect(removeButton(win, packTwoUrl), "no Remove for the selected pack").to.not.exist;
            expect(removeButton(win, packOneUrl), "Remove for pack one").to.exist;
        });
        // Back to Default, then remove pack two after confirming.
        cy.foundry(async (win) => {
            const s = win.game.settings.get("sohl", "imageLocations");
            await win.game.settings.set(
                "sohl",
                "imageLocations",
                win.sohl.apps.logic.selectAssetPack(s, "sohl", null),
            );
            return win.__assetMenu.render().then(() => null);
        });
        cy.foundry((win) => win.game.settings.get("sohl", "imageLocations").sohl.used.slice()).as(
            "usedBefore",
        );
        cy.window().should((win) => expect(removeButton(win, packTwoUrl)).to.exist);
        cy.foundry((win) => {
            removeButton(win, packTwoUrl).click();
            return null;
        });
        cy.submitDialog("yes");
        cy.window().should((win) => {
            const rec = win.game.settings.get("sohl", "imageLocations").sohl;
            expect(rec.assetPacks.map((p) => p.url)).to.deep.equal([packOneUrl]);
        });
        cy.get("@usedBefore").then((used) =>
            cy
                .foundry((win) => win.game.settings.get("sohl", "imageLocations").sohl.used)
                .should("deep.equal", used),
        );
        // The files Fix downloaded are still there.
        cy.foundry(async (win) => {
            const res = await win.fetch(`${FOLDER_B}icons/e2ewolf.svg`);
            return res.ok;
        }).should("equal", true);
        cy.foundry((win) => win.__assetMenu.close().then(() => null));
    });
});
