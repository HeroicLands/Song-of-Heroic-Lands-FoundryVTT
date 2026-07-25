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
 * Strike Modes tab + editor on the Weapongear and CombatTechnique sheets (#663).
 *
 * Drives the real UI: the tab renders one row per strike mode, "Add Strike Mode"
 * appends a blank mode and opens the StrikeModeConfig editor on it, the editor
 * persists an edit through `item.update()`, and the row's ⋮ menu deletes it
 * (answering the confirm dialog). The combat-technique variant is single-mode.
 */

/**
 * Find the open StrikeModeConfig editor instance, if any. Matches on the app's
 * `id` prefix (set from DEFAULT_OPTIONS), which — unlike `constructor.name` — is
 * not mangled by the release bundle's minifier.
 */
function findEditor(win) {
    const inst = win.foundry?.applications?.instances;
    const apps =
        inst && typeof inst.values === "function" ?
            Array.from(inst.values())
        :   Object.values(inst ?? {});
    return apps.find(
        (a) => a.id?.startsWith("strike-mode-config-") && a.rendered,
    );
}

describe("strike modes tab — weapongear (multi)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("adds a strike mode, opens the editor, and persists an edit", () => {
        cy.createWorldItem("weapongear", { name: "Broadsword" }).as("wpn");
        cy.then(function () {
            const id = this.wpn.id;
            cy.openSheet(this.wpn);
            cy.switchTab("strikemodes", "sheet");
            // A fresh weapon starts with no strike modes.
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row',
            ).should("have.length", 0);
            // Add → a blank mode is written and the editor opens on it.
            cy.get(
                'section.tab[data-tab="strikemodes"] [data-action="addStrikeMode"]',
            ).click();
            // Poll (the update + render are async): one mode written, editor open.
            cy.window().should((win) => {
                const modes = win.game.items.get(id).system.strikeModes;
                expect(Object.keys(modes)).to.have.length(1);
                expect(findEditor(win), "editor open").to.exist;
            });
            // Edit the name in the editor and submit → persists via item.update.
            cy.foundry((win) => {
                const editor = findEditor(win);
                const form = editor.element;
                form.querySelector('input[name="name"]').value = "Cut";
                form.requestSubmit();
                return null;
            });
            cy.window().should((win) => {
                const modes = win.game.items.get(id).system.strikeModes;
                expect(Object.values(modes)[0]?.name).to.eq("Cut");
            });
        });
    });

    it("shows one row per strike mode with a ⋮ menu and deletes it", () => {
        cy.createWorldItem("weapongear", { name: "Axe" }).as("wpn");
        cy.then(function () {
            const id = this.wpn.id;
            // Seed two modes directly (bypassing the editor) for the row + delete
            // checks.
            cy.foundry((win) => {
                const item = win.game.items.get(id);
                return item.update(
                    win.structuredClone({
                        "system.strikeModes.aaa": {
                            type: "melee",
                            name: "Chop",
                            lengthBase: 2,
                            impactBase: { aspect: "edged" },
                        },
                        "system.strikeModes.bbb": {
                            type: "missile",
                            name: "Throw",
                            baseRangeBase: 15,
                            impactBase: { aspect: "piercing" },
                        },
                    }),
                );
            });
            cy.openSheet(this.wpn);
            cy.switchTab("strikemodes", "sheet");
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row',
            ).should("have.length", 2);
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row[data-strikemode-key="aaa"]',
            ).contains("Chop");
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row .strikemode-contextmenu',
            ).should("exist");
            // Delete the first row via its ⋮ menu, answering the confirm dialog.
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row[data-strikemode-key="aaa"] .strikemode-contextmenu',
            ).click();
            cy.get("#context-menu").contains(".context-item", "Delete").click();
            cy.submitDialog("yes");
            // Poll the store (the delete update is async).
            cy.window().should((win) => {
                const keys = Object.keys(
                    win.game.items.get(id).system.strikeModes,
                );
                expect(keys).to.have.length(1);
                expect(keys).to.include("bbb");
                expect(keys).to.not.include("aaa");
            });
        });
    });
});

describe("strike modes tab — combat technique (single)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("shows the single seeded strike mode as one row; Add is hidden", () => {
        cy.createActor("being", { name: "CT Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Judo",
                system: { subType: "combattechnique", masteryLevelBase: 30 },
            }).then((skill) => {
                cy.foundry((win) =>
                    Cypress.Promise.resolve(
                        win.fromUuidSync(skill.uuid).sheet.render(true),
                    ).then(() => null),
                );
                cy.wait(300);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(skill.uuid).sheet.element;
                    return {
                        hasTab: !!el.querySelector('[data-tab="strikemodes"]'),
                        rows: el.querySelectorAll(".strikemodes__row").length,
                        // single mode → Add control absent
                        hasAdd: !!el.querySelector(
                            '.strikemodes__row ~ * [data-action="addStrikeMode"], [data-action="addStrikeMode"]',
                        ),
                    };
                }).should((r) => {
                    expect(r.hasTab, "strikemodes tab present").to.be.true;
                    expect(r.rows, "one seeded row").to.eq(1);
                    expect(r.hasAdd, "Add hidden when a mode exists").to.be
                        .false;
                });
            });
        });
    });

    it("has no strike modes tab for a non-technique skill", () => {
        cy.createActor("being", { name: "Plain Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Oratory",
                system: { subType: "social", masteryLevelBase: 30 },
            }).then((skill) => {
                cy.foundry((win) =>
                    Cypress.Promise.resolve(
                        win.fromUuidSync(skill.uuid).sheet.render(true),
                    ).then(() => null),
                );
                cy.wait(300);
                cy.foundry(
                    (win) =>
                        !!win
                            .fromUuidSync(skill.uuid)
                            .sheet.element.querySelector(
                                '[data-tab="strikemodes"]',
                            ),
                ).should("be.false");
            });
        });
    });
});
