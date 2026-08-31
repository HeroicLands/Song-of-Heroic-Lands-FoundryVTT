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
 * Skill sheet Impaired By Roles control (#713).
 *
 * `system.impairedByRoles` is a real schema field read by the impairment logic,
 * but the Skill properties template never rendered it, so a skill could only be
 * marked impaired by editing raw data. The Properties tab now renders an
 * "Impaired By Roles" list (at parity with the Attribute sheet) whose Add/Delete
 * controls are wired via ApplicationV2's delegated `data-action` (#734), so these
 * specs drive real DOM clicks on the live controls and assert the array persists.
 */

/** Read a skill item's `system` back from the game realm. */
function readSystem(win, id) {
    return win.game.items.get(id).system;
}

/**
 * Fill the open primitive add-item dialog's `newValue` input and press OK —
 * retried until the value persists. DialogV2's button handler is wired a tick
 * after the dialog DOM appears, so a single early click can no-op; set-and-click
 * are kept atomic and repeated until the field lands. Duplicate submits are
 * deduped by the add handler. (Mirrors array-editor-controls.cy.js.)
 *
 * @param {string} id - the skill item id being edited.
 * @param {string} value - the role value to add.
 */
function addValueViaDialog(id, value) {
    cy.window({ log: false }).should((win) => {
        const current = win.game.items.get(id).system.impairedByRoles;
        if (current.includes(value)) return; // persisted — done
        const dlg = Array.from(win.foundry.applications.instances.values()).find(
            (a) => a.rendered && a.element?.querySelector('input[name="newValue"]'),
        );
        expect(dlg, "open add-value dialog").to.exist;
        dlg.element.querySelector('input[name="newValue"]').value = value;
        dlg.element.querySelector('button[data-action="ok"]').click();
        // Force another retry until the async update lands the value.
        expect(win.game.items.get(id).system.impairedByRoles).to.include(value);
    });
}

describe("skill sheet impaired by roles (#713)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("renders the Add control and a delete control per persisted role", () => {
        cy.createWorldItem("skill", {
            name: "Climbing",
            system: {
                subType: "physical",
                impairedByRoles: ["locomotor", "vital"],
            },
        }).as("skill");
        cy.then(function () {
            cy.openSheet(this.skill);
            cy.switchTab("properties", "sheet");
            const scope = 'section.tab[data-tab="properties"] ';
            cy.get(
                scope +
                    '.add-array-item[data-action="addArrayItem"]' +
                    '[data-array="system.impairedByRoles"]',
            ).should("exist");
            cy.get(
                scope +
                    '.delete-array-item[data-action="deleteArrayItem"]' +
                    '[data-array="system.impairedByRoles"][data-value="locomotor"]',
            ).should("exist");
            cy.get(
                scope +
                    '.delete-array-item[data-array="system.impairedByRoles"]' +
                    '[data-value="vital"]',
            ).should("exist");
        });
    });

    it("Delete removes a role via a real click", () => {
        cy.createWorldItem("skill", {
            name: "Swimming",
            system: {
                subType: "physical",
                impairedByRoles: ["vital", "locomotor"],
            },
        }).as("skill");
        cy.then(function () {
            const id = this.skill.id;
            cy.openSheet(this.skill);
            cy.switchTab("properties", "sheet");
            cy.get(
                'section.tab[data-tab="properties"] ' +
                    '.delete-array-item[data-array="system.impairedByRoles"]' +
                    '[data-value="vital"]',
            ).click();
            cy.foundry((win) => readSystem(win, id).impairedByRoles).should("deep.equal", [
                "locomotor",
            ]);
        });
    });

    it("Add appends a role via a real click", () => {
        cy.createWorldItem("skill", {
            name: "Riding",
            system: { subType: "physical", impairedByRoles: [] },
        }).as("skill");
        cy.then(function () {
            const id = this.skill.id;
            cy.openSheet(this.skill);
            cy.switchTab("properties", "sheet");
            cy.get(
                'section.tab[data-tab="properties"] ' +
                    '.add-array-item[data-array="system.impairedByRoles"]',
            ).click();
            addValueViaDialog(id, "manipulator");
            cy.foundry((win) => readSystem(win, id).impairedByRoles).should("deep.equal", [
                "manipulator",
            ]);
        });
    });
});
