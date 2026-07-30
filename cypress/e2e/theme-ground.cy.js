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
 * The Being sheet header/ground must follow the Manuscript light/dark token swap
 * (#810). Three regressions are gated here:
 *
 * 1. The parchment ground. `.window-content` painted a fixed light `parchment.jpg`
 *    with no theme-aware base, so in dark mode the token surfaces darkened while
 *    the ground stayed bright. The fix paints the texture over
 *    `--sohl-color-bg-sheet` with `background-blend-mode: multiply`, so the
 *    resolved background-color is the paper token in whichever theme is active.
 * 2. The header name. As an `<h1>`, `.sheet-header__name` inherited Foundry's
 *    `--color-text-light-primary` (remapped to `--sohl-color-text-inverse`, cream
 *    in light mode) and went near-white on the light band. The fix pins it to
 *    `--sohl-color-text-primary`, so it flips with the theme like everything else.
 * 3. The ProseMirror toolbar. Foundry paints the menu bar with its fixed dark
 *    `--menu-background: --color-cool-4`, so it stayed a plum near-black in both
 *    themes and clashed on the light vellum. The fix repoints `--menu-background`
 *    (and the icon color) at SoHL tokens (`--sohl-color-bg-stamp`), so the bar
 *    follows the theme. Shared by every ProseMirror editor.
 *
 * We assert the resolved colors flip — appearance is confirmed separately by
 * screenshot review.
 */

// `--sohl-color-bg-sheet`, resolved: light #f7f1e2 / dark #1e1a13.
const LIGHT_GROUND = "rgb(247, 241, 226)";
const DARK_GROUND = "rgb(30, 26, 19)";
// `--sohl-color-text-primary`, resolved: light #211d16 / dark #ece3cf.
const LIGHT_INK = "rgb(33, 29, 22)";
const DARK_INK = "rgb(236, 227, 207)";
// `--sohl-color-bg-stamp`, resolved: light #e7ddc2 / dark #2a2417 — the ProseMirror
// toolbar bar, re-themed off Foundry's fixed dark `--color-cool-4`.
const LIGHT_TOOLBAR = "rgb(231, 221, 194)";
const DARK_TOOLBAR = "rgb(42, 36, 23)";

describe("theme-aware parchment ground", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    after(() => cy.cleanupWorld());

    // Restore the OS-driven theme after the suite so we don't pin later specs.
    afterEach(() => {
        cy.foundry((win) => {
            win.document.documentElement.removeAttribute("data-theme");
            return null;
        });
    });

    function themeStyle(win) {
        const ground = win.document.querySelector(".sohl .window-content");
        const gcs = win.getComputedStyle(ground);
        const name = win.document.querySelector(
            ".sohl.being .sheet-header__name",
        );
        const toolbar = win.document.querySelector(
            ".sohl.being .facade__editor prose-mirror menu",
        );
        return {
            bg: gcs.backgroundColor,
            blend: gcs.backgroundBlendMode,
            image: gcs.backgroundImage,
            nameColor: win.getComputedStyle(name).color,
            toolbarBg:
                toolbar ? win.getComputedStyle(toolbar).backgroundColor : null,
        };
    }

    it("resolves the ground, header name, and editor toolbar to theme tokens in each theme", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.get(".sohl.being .window-content").should("exist");
            cy.get(".sohl.being .sheet-header__name").should("exist");
            cy.get(".sohl.being .facade__editor prose-mirror menu").should(
                "exist",
            );

            cy.foundry((win) => {
                win.document.documentElement.setAttribute("data-theme", "dark");
                return themeStyle(win);
            }).then((s) => {
                expect(s.bg, "dark ground color").to.eq(DARK_GROUND);
                expect(s.blend, "blend mode").to.eq("multiply");
                expect(s.image, "textured").to.contain("parchment");
                expect(s.nameColor, "dark name ink").to.eq(DARK_INK);
                expect(s.toolbarBg, "dark toolbar bar").to.eq(DARK_TOOLBAR);
            });

            cy.foundry((win) => {
                win.document.documentElement.setAttribute(
                    "data-theme",
                    "light",
                );
                return themeStyle(win);
            }).then((s) => {
                expect(s.bg, "light ground color").to.eq(LIGHT_GROUND);
                expect(s.blend, "blend mode").to.eq("multiply");
                expect(s.image, "textured").to.contain("parchment");
                expect(s.nameColor, "light name ink").to.eq(LIGHT_INK);
                expect(s.toolbarBg, "light toolbar bar").to.eq(LIGHT_TOOLBAR);
            });
        });
    });
});
