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
 * Dark-mode visibility (#893). In dark mode several surfaces were unreadable:
 * the ProseMirror editor content, right-click/⋮ context menus, and the black
 * bundled SVG art (portrait + compendium thumbnails).
 *
 * SoHL's dark tokens and the injected SVG `prefers-color-scheme` swap both key
 * off the OS scheme, so we emulate `prefers-color-scheme: dark` (not the
 * `data-theme` toggle) to reproduce the real "OS in dark mode" scenario. The
 * editor/context-menu fixes are asserted on resolved colors; the SVG fixes are
 * confirmed by screenshot review (an <img>'s internal fill is not readable via
 * getComputedStyle).
 */

// `--sohl-color-text-primary` in dark: #ece3cf.
const DARK_INK = "rgb(236, 227, 207)";
// `--sohl-color-bg-surface` in dark: #241f16.
const DARK_SURFACE = "rgb(36, 31, 22)";

function emulateDark() {
    return cy.wrap(null, { log: false }).then(() =>
        Cypress.automation("remote:debugger:protocol", {
            command: "Emulation.setEmulatedMedia",
            params: {
                features: [{ name: "prefers-color-scheme", value: "dark" }],
            },
        }),
    );
}

describe("dark-mode visibility (#893)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    after(() => {
        cy.cleanupWorld();
        // Clear the emulation so later specs run under the default scheme.
        cy.wrap(null, { log: false }).then(() =>
            Cypress.automation("remote:debugger:protocol", {
                command: "Emulation.setEmulatedMedia",
                params: { features: [] },
            }),
        );
    });

    it("editor content ink follows the dark theme (was invisible)", () => {
        emulateDark();
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("facade", "primary");
            cy.get(".sohl.being .facade__editor .editor-content", {
                timeout: 10000,
            }).should("exist");
            cy.foundry((win) => {
                const el = win.document.querySelector(
                    ".sohl.being .facade__editor .editor-content",
                );
                return win.getComputedStyle(el).color;
            }).should("eq", DARK_INK);
            // Visual: portrait SVG + editor legibility.
            cy.screenshot("facade-dark", { capture: "viewport" });
        });
    });

    it("context-menu items are legible in dark mode (were dark-on-dark)", () => {
        emulateDark();
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("skills", "primary");
            // Open the first skill row's ⋮ context menu.
            cy.get(".sohl.being .item-contextmenu", {
                timeout: 10000,
            })
                .first()
                .click({ force: true });
            cy.get("#context-menu", { timeout: 10000 }).should("be.visible");
            cy.foundry((win) => {
                const menu = win.document.querySelector("#context-menu");
                const item = menu.querySelector(".context-item");
                return {
                    menuBg: win.getComputedStyle(menu).backgroundColor,
                    itemColor: item ? win.getComputedStyle(item).color : null,
                };
            }).then((s) => {
                expect(s.itemColor, "context item ink").to.eq(DARK_INK);
                expect(s.menuBg, "menu surface").to.eq(DARK_SURFACE);
            });
            cy.screenshot("context-menu-dark", { capture: "viewport" });
        });
    });

    it("compendium thumbnails show black SVG art in dark mode", () => {
        emulateDark();
        cy.foundry((win) => {
            const pack = win.game.packs.get("sohl.actors");
            return pack ? pack.render(true) : null;
        });
        cy.get(".directory.compendium, .compendium-sidebar, .application", {
            timeout: 10000,
        }).should("exist");
        // Give thumbnails a moment to load, then capture.
        cy.wait(800);
        cy.screenshot("compendium-dark", { capture: "viewport" });
    });
});
