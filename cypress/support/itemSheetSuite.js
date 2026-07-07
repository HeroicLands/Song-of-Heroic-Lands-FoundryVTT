/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Shared suite for an item-kind sheet. Each `item-sheet-<kind>.cy.js` is a thin
 * call to this so a failure names the exact kind. Exercises: create, open, all
 * four tabs, and — the core "edit reliably" contract — persisting an edit to
 * every simple (text/number) properties field on change, with no button press.
 *
 * @param {string} kind - the item kind (e.g. `"miscgear"`).
 * @param {object} [opts] - options:
 *   - `overrides`: passed to `cy.createWorldItem`.
 *   - `persistRed`: when set to an issue reference, the field-persist test is
 *     skipped (create/open/tabs still run) — for kinds whose whole-form submit
 *     is rejected (e.g. a required field the form leaves unsatisfied).
 *   - `red`: when set to an issue reference string, the WHOLE suite is skipped
 *     (`describe.skip`) — for kinds whose sheet is not yet functional.
 */
export function itemSheetSuite(kind, opts = {}) {
    const overrides = opts.overrides ?? {};
    const describeFn = opts.red ? describe.skip : describe;
    const persistIt = opts.persistRed ? it.skip : it;

    describeFn(`item sheet — ${kind}`, () => {
        before(() => cy.login().then(() => cy.cleanupWorld()));
        afterEach(() => {
            cy.closeAllSheets();
            cy.cleanupWorld();
        });

        it("creates and opens the sheet", () => {
            cy.createWorldItem(kind, overrides).as("item");
            cy.then(function () {
                cy.openSheet(this.item);
            });
            cy.get("input[name='name']").should("exist");
            cy.get("img.item-img").should("exist");
        });

        ["properties", "description", "actions", "effects"].forEach((tab) => {
            it(`activates the ${tab} tab`, () => {
                cy.createWorldItem(kind, overrides).as("item");
                cy.then(function () {
                    cy.openSheet(this.item);
                });
                cy.switchTab(tab, "sheet");
            });
        });

        persistIt(
            "persists edits to its simple properties fields (change → save)",
            () => {
                cy.createWorldItem(kind, overrides).as("item");
                cy.then(function () {
                    cy.openSheet(this.item);
                });
                cy.then(function () {
                    const id = this.item.id;
                    // Discover editable text/number fields once (names only — element
                    // refs would detach on the re-render each edit triggers).
                    cy.foundry((win) => {
                        const root = win.game.items.get(id).sheet.element;
                        return Array.from(
                            root.querySelectorAll('input[name^="system."]'),
                        )
                            .filter(
                                (el) =>
                                    (el.type === "number" ||
                                        el.type === "text") &&
                                    !el.disabled &&
                                    !el.readOnly,
                            )
                            .map((el) => el.name);
                    }).then((names) => {
                        // Edit each field to "3" (persists as 3 for numbers, "3" for
                        // strings) and assert the round-trip onto the document.
                        names.forEach((name) => {
                            cy.then(function () {
                                cy.editSheetField(this.item, name, 3);
                            });
                            cy.then(function () {
                                cy.foundry((win) => {
                                    const sys = win.game.items.get(id).system;
                                    return name
                                        .split(".")
                                        .slice(1)
                                        .reduce((o, k) => o?.[k], sys);
                                }).should((actual) => {
                                    expect(
                                        String(actual),
                                        `${name} persisted`,
                                    ).to.eq("3");
                                });
                            });
                        });
                    });
                });
            },
        );
    });
}
