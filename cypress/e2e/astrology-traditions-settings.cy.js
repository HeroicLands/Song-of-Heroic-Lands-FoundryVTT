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
 * Astrology Traditions settings (#1023 / #1028) — the world-setting-backed
 * registry and its editor menu in a live world: the setting and menu are
 * registered, the built-in "Astrokýklos" tradition resolves, a world
 * tradition round-trips through the setting, and the editor renders the list.
 */
describe("astrology traditions settings (#1023)", () => {
    before(() => cy.login());

    afterEach(() => {
        // Reset the world traditions setting between tests.
        cy.foundry((win) =>
            win.game.settings.set("sohl", "astrologyTraditions", {}),
        );
    });

    it("registers the world setting and the editor menu", () => {
        cy.foundry((win) => ({
            hasSetting: win.game.settings.settings.has(
                "sohl.astrologyTraditions",
            ),
            hasMenu: win.game.settings.menus.has(
                "sohl.astrologyTraditionsMenu",
            ),
            defaultValue: win.game.settings.get("sohl", "astrologyTraditions"),
        })).then((r) => {
            expect(r.hasSetting, "astrologyTraditions setting").to.be.true;
            expect(r.hasMenu, "astrologyTraditionsMenu").to.be.true;
            expect(r.defaultValue).to.deep.eq({});
        });
    });

    it("resolves the shipped built-in Astrokýklos tradition", () => {
        cy.foundry((win) => {
            const reg = win.sohl.entity.astrology.builtinTraditions();
            const t = reg["astrokyklos"];
            return {
                key: t?.key,
                signCount: t?.signs?.length,
                firstSign: t?.signs?.[0]?.shortcode,
            };
        }).then((r) => {
            expect(r.key).to.eq("astrokyklos");
            expect(r.signCount).to.eq(12);
            expect(r.firstSign).to.eq("arnos");
        });
    });

    it("round-trips a world tradition through the setting and validator", () => {
        cy.foundry((win) => {
            const raw = {
                arc: {
                    label: "Arcane",
                    signs: [
                        {
                            shortcode: "alpha",
                            start: { month: 1, day: 1 },
                            end: { month: 6, day: 30 },
                            cuspDays: 2,
                            skillModifiers: { pel: 15, "subtype:combat": 5 },
                        },
                    ],
                },
            };
            const { traditions } =
                win.sohl.entity.astrology.validateTraditions(raw);
            return win.game.settings
                .set("sohl", "astrologyTraditions", traditions)
                .then(() =>
                    win.game.settings.get("sohl", "astrologyTraditions"),
                );
        }).then((stored) => {
            expect(stored.arc.source).to.eq("world");
            expect(stored.arc.signs[0].skillModifiers.pel).to.eq(15);
        });
    });

    it("renders the editor listing the built-in tradition", () => {
        cy.foundry(async (win) => {
            const M = win.game.settings.menus.get(
                "sohl.astrologyTraditionsMenu",
            ).type;
            const app = new M();
            await app.render({ force: true });
            win.__astroMenu = app;
            return true;
        });
        // The rendered app lists the built-in tradition by its localized label.
        cy.get(".astrology-traditions", { timeout: 10000 }).should(
            "contain.text",
            "Astrokýklos",
        );
        cy.foundry((win) => {
            win.__astroMenu?.close();
            delete win.__astroMenu;
            return true;
        });
    });
});
