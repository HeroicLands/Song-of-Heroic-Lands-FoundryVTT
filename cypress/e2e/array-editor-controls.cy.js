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
 * Item-sheet array editors persist on a **real DOM click** (#734).
 *
 * The shared `.add-array-item` / `.delete-array-item` controls used to be bound
 * with per-node `addEventListener` in `_onRender`; those nodes were detached by
 * a later part swap, so a genuine click never reached the handler even though
 * invoking it directly worked. They are now wired via ApplicationV2's delegated
 * `data-action`, so these specs click the live control in the sheet (never call
 * the handler) and assert the array field persisted.
 *
 * Uses the Attribute sheet, which carries both a primitive list (Impaired By
 * Roles, delete-by-value) and an object list (Value Descriptors, delete-by-index).
 */

/** Read an attribute item's `system` back from the game realm. */
function readSystem(win, id) {
    return win.game.items.get(id).system;
}

/**
 * The open primitive add-item dialog — the single rendered DialogV2 carrying an
 * `input[name="newValue"]` (the `dialog()` helper renders exactly one).
 */
function findAddValueDialog(win) {
    return Array.from(win.foundry.applications.instances.values()).find(
        (a) => a.rendered && a.element?.querySelector('input[name="newValue"]'),
    );
}

/**
 * Fill the open add-item dialog's `newValue` input and press OK — retried until
 * the value persists. DialogV2's button handler is wired a tick *after* the
 * dialog DOM appears, so a single early click can no-op; set-and-click are kept
 * atomic (a re-render would otherwise wipe a separately-set value) and repeated
 * until the field lands. Duplicate submits are deduped by the add handler.
 *
 * @param {object|string} attr - the attribute item (or id) being edited.
 * @param {string} value - the role value to add.
 */
function addValueViaDialog(attr, value) {
    const id = typeof attr === "string" ? attr : attr.id;
    cy.window({ log: false }).should((win) => {
        const current = win.game.items.get(id).system.impairedByRoles;
        if (current.includes(value)) return; // persisted — done
        const dlg = findAddValueDialog(win);
        expect(dlg, "open add-value dialog").to.exist;
        dlg.element.querySelector('input[name="newValue"]').value = value;
        dlg.element.querySelector('button[data-action="ok"]').click();
        // Force another retry until the async update lands the value.
        expect(win.game.items.get(id).system.impairedByRoles).to.include(value);
    });
}

describe("item-sheet array editors persist on click (#734)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("Delete removes a primitive row (Impaired By Roles) via a real click", () => {
        cy.createWorldItem("attribute", {
            name: "Strength",
            // Impaired-by roles are choices-constrained to the body-role enum.
            system: { impairedByRoles: ["vital", "core"] },
        }).as("attr");
        cy.then(function () {
            const id = this.attr.id;
            cy.openSheet(this.attr);
            cy.switchTab("properties", "sheet");
            // The live trash control for the "vital" role — a genuine DOM click.
            cy.get(
                'section.tab[data-tab="properties"] ' +
                    '.delete-array-item[data-array="system.impairedByRoles"]' +
                    '[data-value="vital"]',
            ).click();
            cy.foundry((win) => readSystem(win, id).impairedByRoles).should(
                "deep.equal",
                ["core"],
            );
        });
    });

    it("Add appends a primitive row (Impaired By Roles) via a real click", () => {
        cy.createWorldItem("attribute", {
            name: "Agility",
            system: { impairedByRoles: [] },
        }).as("attr");
        cy.then(function () {
            const id = this.attr.id;
            cy.openSheet(this.attr);
            cy.switchTab("properties", "sheet");
            // Click the live "Add" control; it opens the value dialog, which
            // is then filled and submitted (retried until the value lands).
            cy.get(
                'section.tab[data-tab="properties"] ' +
                    '.add-array-item[data-array="system.impairedByRoles"]',
            ).click();
            addValueViaDialog(id, "vital");
            cy.foundry((win) => readSystem(win, id).impairedByRoles).should(
                "deep.equal",
                ["vital"],
            );
        });
    });

    it("Delete removes an object row (Value Descriptors) by index via a real click", () => {
        cy.createWorldItem("attribute", {
            name: "Dexterity",
            system: {
                valueDesc: [
                    { label: "Weak", maxValue: 5 },
                    { label: "Average", maxValue: 10 },
                ],
            },
        }).as("attr");
        cy.then(function () {
            const id = this.attr.id;
            cy.openSheet(this.attr);
            cy.switchTab("properties", "sheet");
            // Delete the first row (index 0 = "Weak").
            cy.get(
                'section.tab[data-tab="properties"] ' +
                    '.delete-array-item[data-array="system.valueDesc"]' +
                    '[data-index="0"]',
            ).click();
            cy.foundry((win) =>
                readSystem(win, id).valueDesc.map((v) => v.label),
            ).should("deep.equal", ["Average"]);
        });
    });
});
