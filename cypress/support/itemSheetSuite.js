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
 * Resolve the schema field behind a rendered `system.*` input, or `undefined`
 * when the path doesn't resolve to one (a discriminated `TypedSchemaField`
 * sub-path, for instance).
 *
 * @param {object} item - the live Item document.
 * @param {string} name - the input's `name` (e.g. `system.quantity`).
 * @returns {object|undefined} the DataField, when it resolves.
 */
function schemaFieldFor(item, name) {
    try {
        return (
            item.system.schema.getField(name.slice("system.".length)) ??
            undefined
        );
    } catch {
        return undefined;
    }
}

/**
 * Choose a value a numeric input will actually accept and persist.
 *
 * The suite's default probe is `3`, but a field may bound its range — armour's
 * `perceptionPenaltyBase` is `max: 0`, because a perception penalty is zero or
 * negative — and Foundry cleans an out-of-range value back to the field's
 * initial. Probing such a field with `3` therefore fails the round-trip
 * assertion against a system that is behaving correctly (#1359).
 *
 * Bounds come from the schema when the path resolves, else from the input's own
 * `min`/`max` attributes. Candidates are tried in order and the first in-range
 * one that differs from the field's current value wins, so the edit actually
 * proves persistence rather than re-writing what is already there.
 *
 * @param {object} item - the live Item document.
 * @param {HTMLInputElement} el - the rendered `type="number"` input.
 * @returns {number} a value within the field's permitted range.
 */
function pickNumericValue(item, el) {
    const field = schemaFieldFor(item, el.name);
    const attr = (v) => (v == null || v === "" ? undefined : Number(v));
    const max = field?.max ?? attr(el.getAttribute("max"));
    let min = field?.min ?? attr(el.getAttribute("min"));
    // `positive: true` is a min of "the smallest value above 0"; for the integer
    // fields SoHL uses, 1.
    if (field?.positive && (min === undefined || min < 1)) min = 1;

    const integer = Boolean(field?.integer);
    const inRange = (v) =>
        (min === undefined || v >= min) && (max === undefined || v <= max);
    const candidates = [
        3,
        -3,
        max === undefined ? undefined
        : integer ? Math.floor(max)
        : max,
        min === undefined ? undefined
        : integer ? Math.ceil(min)
        : min,
        0,
    ].filter((v) => v !== undefined && Number.isFinite(v) && inRange(v));

    const current = Number(el.value);
    return candidates.find((v) => v !== current) ?? candidates[0] ?? current;
}

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
                    // Discover editable text/number fields once, each paired with a
                    // value its own schema permits (names + values only — element
                    // refs would detach on the re-render each edit triggers).
                    cy.foundry((win) => {
                        const item = win.game.items.get(id);
                        const root = item.sheet.element;
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
                            .map((el) => ({
                                name: el.name,
                                value:
                                    el.type === "number" ?
                                        pickNumericValue(item, el)
                                    :   3,
                            }));
                    }).then((fields) => {
                        // Edit each field to its chosen value (a number for number
                        // inputs, "3" for strings) and assert the round-trip onto
                        // the document.
                        fields.forEach((f) => {
                            cy.then(function () {
                                cy.editSheetField(this.item, f.name, f.value);
                            });
                            cy.then(function () {
                                cy.foundry((win) => {
                                    const sys = win.game.items.get(id).system;
                                    return f.name
                                        .split(".")
                                        .slice(1)
                                        .reduce((o, k) => o?.[k], sys);
                                }).should((actual) => {
                                    expect(
                                        String(actual),
                                        `${f.name} persisted`,
                                    ).to.eq(String(f.value));
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
                            // `aspect` only when `subType` is "injury") — or
                            // disable it (armor's `isWorn` is gated on
                            // `isCarried`, #1097). Skip a planned field a prior
                            // edit removed or locked: a field not shown, or
                            // shown disabled, can't be set in the current state.
                            cy.then(function () {
                                const item = this.item;
                                cy.foundry((win) => {
                                    const el = win.game.items
                                        .get(id)
                                        .sheet.element.querySelector(
                                            `[name="${f.name}"]`,
                                        );
                                    return Boolean(el) && !el.disabled;
                                }).then((present) => {
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
