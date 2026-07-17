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
 *
 * Beyond text/number persistence, the suite also sweeps `<select>` (choice) and
 * checkbox (boolean) fields (#500), and guards that every rendered `system.*`
 * input maps to a real schema field — so a template referencing a field the
 * schema doesn't define is caught rather than silently accepted.
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

        persistIt(
            "persists edits to its choice (select) and boolean (checkbox) fields",
            () => {
                cy.createWorldItem(kind, overrides).as("item");
                cy.then(function () {
                    cy.openSheet(this.item);
                });
                cy.then(function () {
                    const id = this.item.id;
                    // Selects: pick a valid option different from the current
                    // value (names + chosen targets only — refs detach on
                    // re-render). Checkboxes: flip the current state.
                    cy.foundry((win) => {
                        const root = win.game.items.get(id).sheet.element;
                        const selects = Array.from(
                            root.querySelectorAll('select[name^="system."]'),
                        )
                            .filter((el) => !el.disabled)
                            .map((el) => {
                                // Choose a non-empty option other than the
                                // current value. An empty option is a
                                // placeholder a required field would reject, so
                                // skip a select with no other valid choice.
                                const value = Array.from(el.options)
                                    .map((o) => o.value)
                                    .find((v) => v !== "" && v !== el.value);
                                return value === undefined ? null : (
                                        { kind: "select", name: el.name, value }
                                    );
                            })
                            .filter(Boolean);
                        const checks = Array.from(
                            root.querySelectorAll(
                                'input[type="checkbox"][name^="system."]',
                            ),
                        )
                            .filter((el) => !el.disabled)
                            .map((el) => ({
                                kind: "checkbox",
                                name: el.name,
                                value: !el.checked,
                            }));
                        return [...selects, ...checks];
                    }).then((fields) => {
                        fields.forEach((f) => {
                            // Editing one choice field can re-render the sheet
                            // and conditionally hide another (e.g. trauma shows
                            // `aspect` only when `subType` is "physical"). Skip a
                            // planned field a prior edit removed — a field not
                            // shown in the current state can't be set.
                            cy.then(function () {
                                const item = this.item;
                                cy.foundry((win) =>
                                    Boolean(
                                        win.game.items
                                            .get(id)
                                            .sheet.element.querySelector(
                                                `[name="${f.name}"]`,
                                            ),
                                    ),
                                ).then((present) => {
                                    if (!present) return;
                                    cy.editSheetField(item, f.name, f.value);
                                    cy.foundry((win) => {
                                        const sys =
                                            win.game.items.get(id).system;
                                        return f.name
                                            .split(".")
                                            .slice(1)
                                            .reduce((o, k) => o?.[k], sys);
                                    }).should((actual) => {
                                        const got =
                                            f.kind === "checkbox" ?
                                                Boolean(actual)
                                            :   String(actual);
                                        const want =
                                            f.kind === "checkbox" ?
                                                f.value
                                            :   String(f.value);
                                        expect(
                                            got,
                                            `${f.name} persisted`,
                                        ).to.eq(want);
                                    });
                                });
                            });
                        });
                    });
                });
            },
        );

        it("renders only system fields the schema defines (coverage guard)", () => {
            cy.createWorldItem(kind, overrides).as("item");
            cy.then(function () {
                cy.openSheet(this.item);
            });
            cy.then(function () {
                const id = this.item.id;
                cy.foundry((win) => {
                    const item = win.game.items.get(id);
                    const schema = item.system.schema;
                    const root = item.sheet.element;
                    // Every rendered `system.*` control must resolve (at least at
                    // its top-level segment) to a schema field. Discriminated
                    // sub-paths (e.g. strikeMode.<type>.<field>) are tolerated by
                    // checking the head segment. An orphan input — a template
                    // referencing a field the schema lacks — is a real defect.
                    const orphans = Array.from(
                        root.querySelectorAll('[name^="system."]'),
                    )
                        .map((el) => el.name.slice("system.".length))
                        .filter((path) => path.length > 0)
                        .filter((path) => {
                            const head = path.split(".")[0];
                            try {
                                return !schema.getField(head);
                            } catch {
                                return true;
                            }
                        });
                    return Array.from(new Set(orphans));
                }).should((orphans) => {
                    expect(
                        orphans,
                        `${kind}: system inputs with no schema field`,
                    ).to.deep.eq([]);
                });
            });
        });
    });
}
