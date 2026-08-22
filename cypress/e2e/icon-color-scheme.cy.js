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
 * #917 — SVG icons invisible on first load when the OS appearance and Foundry's
 * UI theme disagree.
 *
 * The bundled icons are `<img>`-embedded SVGs whose fill follows the element's
 * used `color-scheme` (see `utils/svg-theme.mjs`). Foundry stamps `color-scheme`
 * from ITS OWN theme onto the enclosing chrome, but SoHL's surface themes from
 * the OS — so without the fix the icon fill and the vellum ground diverge and the
 * icons vanish. The fix pins `color-scheme` on SoHL's own scoped surfaces to the
 * OS/`[data-theme]` signal, so it must be `light dark` on `.sohl` and must NOT
 * follow Foundry's independent UI theme. Foundry's own chrome (the compendium)
 * must keep following Foundry's theme.
 *
 * This is a deterministic DOM/CSS contract — independent of the host OS
 * appearance — so it holds in a headless run whatever the runner's preference is.
 */
describe("icon color-scheme (#917)", () => {
    let originalScheme;

    before(() =>
        cy
            .login()
            .then(() => cy.cleanupWorld())
            .then(() =>
                cy.foundry((win) => {
                    originalScheme = win.foundry.utils.deepClone(
                        win.game.settings.get("core", "uiConfig").colorScheme,
                    );
                    return null;
                }),
            ),
    );

    afterEach(() => cy.cleanupWorld());

    after(() =>
        cy.foundry(async (win) => {
            const cfg = win.foundry.utils.deepClone(
                win.game.settings.get("core", "uiConfig"),
            );
            cfg.colorScheme = originalScheme;
            await win.game.settings.set("core", "uiConfig", cfg);
            return null;
        }),
    );

    // Helper: force Foundry's UI theme (applications + interface) to a value.
    const setFoundryTheme = (theme) =>
        cy.foundry(async (win) => {
            const cfg = win.foundry.utils.deepClone(
                win.game.settings.get("core", "uiConfig"),
            );
            cfg.colorScheme.applications = theme;
            cfg.colorScheme.interface = theme;
            await win.game.settings.set("core", "uiConfig", cfg);
            return win.game.settings.get("core", "uiConfig").colorScheme
                .interface;
        });

    it("pins the being sheet's color-scheme to `light dark`, regardless of Foundry's theme", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);

            // Under Foundry DARK, the sheet must NOT inherit `dark` — the scoped
            // rule pins `light dark` so the <img> icons follow the OS-driven
            // vellum surface, not Foundry's chrome.
            setFoundryTheme("dark").should("eq", "dark");
            cy.get(".sohl.being").should(($el) => {
                expect(getComputedStyle($el[0]).colorScheme).to.eq(
                    "light dark",
                );
            });

            // Toggling Foundry to LIGHT must NOT change it — the sheet's icons
            // are decoupled from Foundry's independent UI theme (the whole bug).
            setFoundryTheme("light").should("eq", "light");
            cy.get(".sohl.being").should(($el) => {
                expect(getComputedStyle($el[0]).colorScheme).to.eq(
                    "light dark",
                );
            });
        });
    });

    it("serves default item art carrying the dark-mode fill swap (#1677)", () => {
        // The unit suite proves the injection and the source files agree; only
        // a running system proves the *deployed* icon carries the result. An
        // icon whose colour sat in an inline `style` was declined by the build
        // and shipped black on Foundry's own dark chrome.
        cy.foundry((win) => [
            ...new Set(
                [
                    ...Object.values(win.sohl.utils.ITEM_METADATA),
                    ...Object.values(win.sohl.utils.ACTOR_METADATA),
                ].map((m) => m.Image),
            ),
        ]).then((images) => {
            expect(images, "default art paths").to.have.length.greaterThan(0);
            for (const src of images) {
                cy.request(`/${src}`).then((res) => {
                    expect(res.body, `${src} is themed`).to.contain(
                        "prefers-color-scheme",
                    );
                    // The cream ink the dark branch swaps in.
                    expect(res.body, `${src} dark ink`).to.contain("#ece3cf");
                });
            }
        });
    });

    it("leaves Foundry's own chrome following Foundry's theme (scope boundary)", () => {
        // The fix is scoped to `.sohl` and must NOT leak onto Foundry's own
        // windows: the compendium directory must keep inheriting Foundry's theme
        // so its thumbnails stay legible on the themed chrome they sit on.
        setFoundryTheme("dark");
        cy.foundry(async (win) => {
            const pack = win.game.packs.get("sohl.actors");
            await pack.render(true);
            // The app instance's element attaches asynchronously after render —
            // poll until a rendered Compendium instance with an element exists.
            const findApp = () =>
                [...win.foundry.applications.instances.values()].find(
                    (a) =>
                        a.constructor.name.includes("Compendium") &&
                        a.rendered &&
                        a.element,
                );
            let app = findApp();
            for (let i = 0; i < 40 && !app; i++) {
                await new Promise((r) => setTimeout(r, 50));
                app = findApp();
            }
            const el = app.element;
            return {
                underSohlScope: !!el.closest(".sohl"),
                colorScheme: win.getComputedStyle(el).colorScheme,
            };
        }).should((res) => {
            expect(res.underSohlScope, "compendium under .sohl").to.eq(false);
            // Follows Foundry's theme (here `dark`), NOT the `.sohl` pin.
            expect(res.colorScheme, "compendium color-scheme").to.not.eq(
                "light dark",
            );
        });
    });
});
