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

/**
 * Fill the open "Create Strike Mode" dialog's Type/Name/Shortcode fields. The
 * dialog is the only rendered app carrying a `select[name="type"]` (the editor's
 * type is a read-only label), so it's unambiguous.
 */
function fillCreateDialog(win, { type = "melee", name, shortcode } = {}) {
    const dlg = Array.from(win.foundry.applications.instances.values()).find(
        (a) => a.rendered && a.element?.querySelector('select[name="type"]'),
    );
    const form = dlg.element.querySelector("form") ?? dlg.element;
    if (type) form.querySelector('select[name="type"]').value = type;
    if (name != null) form.querySelector('input[name="name"]').value = name;
    const sc = form.querySelector('input[name="shortcode"]');
    if (sc && shortcode != null) sc.value = shortcode;
    return null;
}

/** Close any open StrikeModeConfig editors (they auto-save, so stay open). */
function closeEditors() {
    cy.foundry((win) =>
        Promise.all(
            Array.from(win.foundry.applications.instances.values())
                .filter((a) => a.id?.startsWith("strike-mode-config-"))
                .map((a) => a.close()),
        ).then(() => null),
    );
}

describe("strike modes tab — weapongear (multi)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        closeEditors();
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("creates a strike mode via the dialog, opens the editor, and auto-saves an edit", () => {
        cy.createWorldItem("weapongear", { name: "Broadsword" }).as("wpn");
        cy.then(function () {
            const id = this.wpn.id;
            cy.openSheet(this.wpn);
            cy.switchTab("strikemodes", "sheet");
            // A fresh weapon starts with no strike modes.
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row',
            ).should("have.length", 0);
            // "+" opens the create dialog (Type / Name / Shortcode).
            cy.get(
                'section.tab[data-tab="strikemodes"] [data-action="addStrikeMode"]',
            ).click();
            cy.foundry((win) =>
                fillCreateDialog(win, {
                    type: "melee",
                    name: "Cut",
                    shortcode: "cut",
                }),
            );
            cy.submitDialog("ok"); // "Create Strike Mode"
            // One mode created with the dialog's values; editor opens on it.
            cy.window().should((win) => {
                const modes = win.game.items.get(id).system.strikeModes;
                expect(modes).to.have.length(1);
                expect(modes[0].name).to.eq("Cut");
                expect(modes[0].shortcode).to.eq("cut");
                expect(findEditor(win), "editor open").to.exist;
            });
            // Edit a field — the editor auto-saves (no Save button).
            cy.foundry((win) => {
                const form = findEditor(win).element;
                form.querySelector('input[name="minParts"]').value = "2";
                form.requestSubmit();
                return null;
            });
            cy.window().should((win) => {
                expect(
                    win.game.items.get(id).system.strikeModes[0].minParts,
                ).to.eq(2);
            });
        });
    });

    it("editor shows the identity header with a read-only type label and edits the shortcode in place", () => {
        cy.createWorldItem("weapongear", { name: "Longsword" }).as("wpn");
        cy.then(function () {
            const id = this.wpn.id;
            cy.openSheet(this.wpn);
            cy.switchTab("strikemodes", "sheet");
            cy.get(
                'section.tab[data-tab="strikemodes"] [data-action="addStrikeMode"]',
            ).click();
            cy.foundry((win) =>
                fillCreateDialog(win, {
                    type: "missile",
                    name: "Shoot",
                    shortcode: "shoot",
                }),
            );
            cy.submitDialog("ok");
            cy.window().should((win) => {
                expect(
                    win.game.items.get(id).system.strikeModes,
                ).to.have.length(1);
                expect(findEditor(win), "editor open").to.exist;
            });
            cy.foundry((win) => {
                const form = findEditor(win).element;
                expect(
                    form.querySelector(".strike-mode-config__header"),
                    "header present",
                ).to.exist;
                expect(form.querySelector('input[name="name"]')).to.exist;
                const sc = form.querySelector('input[name="shortcode"]');
                expect(sc.value).to.eq("shoot");
                expect(sc.readOnly).to.eq(false);
                // Type is a read-only LABEL, not an editable control.
                const typeEl = form.querySelector(".strike-mode-config__type");
                expect(typeEl.textContent.trim()).to.match(/missile/i);
                expect(form.querySelector('select[name="type"]')).to.eq(null);
                return null;
            });
            // Rename the shortcode; the auto-save editor updates the element.
            cy.foundry((win) => {
                const form = findEditor(win).element;
                form.querySelector('input[name="shortcode"]').value = "throw";
                form.requestSubmit();
                return null;
            });
            cy.window().should((win) => {
                const modes = win.game.items.get(id).system.strikeModes;
                expect(modes).to.have.length(1);
                expect(modes[0].shortcode).to.eq("throw");
            });
        });
    });

    it("create dialog rejects a duplicate shortcode (adds nothing)", () => {
        cy.createWorldItem("weapongear", { name: "Sabre" }).as("wpn");
        cy.then(function () {
            const id = this.wpn.id;
            cy.foundry((win) =>
                win.game.items.get(id).update(
                    win.structuredClone({
                        "system.strikeModes": [
                            {
                                shortcode: "cut",
                                type: "melee",
                                name: "Cut",
                                impactBase: { aspect: "edged" },
                            },
                        ],
                    }),
                ),
            );
            cy.openSheet(this.wpn);
            cy.switchTab("strikemodes", "sheet");
            cy.get(
                'section.tab[data-tab="strikemodes"] [data-action="addStrikeMode"]',
            ).click();
            cy.foundry((win) =>
                fillCreateDialog(win, {
                    type: "melee",
                    name: "Slash",
                    shortcode: "cut", // duplicate
                }),
            );
            cy.submitDialog("ok");
            // Still only the original mode; the duplicate was rejected.
            cy.window().should((win) => {
                const modes = win.game.items.get(id).system.strikeModes;
                expect(modes).to.have.length(1);
                expect(modes[0].shortcode).to.eq("cut");
                expect(findEditor(win), "no editor opened").to.not.exist;
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
                        "system.strikeModes": [
                            {
                                shortcode: "aaa",
                                type: "melee",
                                name: "Chop",
                                lengthBase: 2,
                                impactBase: {
                                    numDice: 2,
                                    die: 6,
                                    modifier: 1,
                                    aspect: "edged",
                                },
                            },
                            {
                                shortcode: "bbb",
                                type: "missile",
                                name: "Throw",
                                baseRangeBase: 15,
                                impactBase: { aspect: "piercing" },
                            },
                        ],
                    }),
                );
            });
            cy.openSheet(this.wpn);
            cy.switchTab("strikemodes", "sheet");
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row',
            ).should("have.length", 2);
            // Columns: Name, Shortcode, Type, Impact formula.
            cy.get(
                'section.tab[data-tab="strikemodes"] .strikemodes__row[data-strikemode-key="aaa"]',
            ).within(() => {
                cy.get(".name").contains("Chop");
                cy.get(".shortcode").contains("aaa");
                cy.get(".impact").contains("2d6+1");
            });
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
                const codes = win.game.items
                    .get(id)
                    .system.strikeModes.map((m) => m.shortcode);
                expect(codes).to.have.length(1);
                expect(codes).to.include("bbb");
                expect(codes).to.not.include("aaa");
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
