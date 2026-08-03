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
 * Shortcode-reference field widget (#974).
 *
 * Fields that reference another item by its shortcode render as a dropdown of
 * the actor's items when the referencing item is embedded, and as the free-text
 * input when it is a world/pack item. Selecting an option persists the shortcode
 * string (no schema change); a stored shortcode with no matching item is shown
 * as a selected, flagged "(unresolved)" option rather than being blanked.
 *
 * Exercised here on a Skill's `parentSkillCode` (Skill → Skill), the clearest
 * case: the same widget/context path drives `assocSkillCode` and
 * `bodyLocationCode` on the other sheets.
 */

const PROPS = 'section.tab[data-tab="properties"] ';

describe("shortcode-reference field (#974)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("renders a <select> of the actor's other skills when embedded, and persists the pick", () => {
        cy.createActor("being").as("actor");
        cy.then(function () {
            const actor = this.actor;
            cy.createItemOn(actor, "skill", {
                name: "Herblore",
                system: { subType: "craft", shortcode: "prnt" },
            });
            cy.createItemOn(actor, "skill", {
                name: "Alchemy",
                system: { subType: "craft", shortcode: "chld" },
            }).as("child");
        });
        cy.then(function () {
            cy.openSheet(this.child);
            cy.switchTab("properties", "sheet");
            // Dropdown, not a free-text input.
            cy.get(PROPS + 'select[name="system.parentSkillCode"]').should(
                "exist",
            );
            cy.get(PROPS + 'input[name="system.parentSkillCode"]').should(
                "not.exist",
            );
            // Lists the sibling skill by display name…
            cy.get(
                PROPS +
                    'select[name="system.parentSkillCode"] option[value="prnt"]',
            ).should("contain.text", "Herblore");
            // …but never the skill itself (a skill cannot be its own parent).
            cy.get(
                PROPS +
                    'select[name="system.parentSkillCode"] option[value="chld"]',
            ).should("not.exist");
        });
        // Selecting an option persists exactly the shortcode string.
        cy.then(function () {
            cy.editSheetField(this.child, "system.parentSkillCode", "prnt");
        });
        cy.then(function () {
            const id = this.child.id;
            const actorId = this.child.parent.id;
            cy.foundry(
                (win) =>
                    win.game.actors.get(actorId).items.get(id).system
                        .parentSkillCode,
            ).should("eq", "prnt");
        });
    });

    it("falls back to a free-text input on a world (unowned) item", () => {
        cy.createWorldItem("skill", {
            name: "Loner",
            system: { subType: "craft" },
        }).as("world");
        cy.then(function () {
            cy.openSheet(this.world);
            cy.switchTab("properties", "sheet");
            cy.get(PROPS + 'select[name="system.parentSkillCode"]').should(
                "not.exist",
            );
            cy.get(PROPS + 'input[name="system.parentSkillCode"]').should(
                "exist",
            );
        });
    });

    it("shows a dangling stored shortcode as a selected, flagged option (never blanked)", () => {
        cy.createActor("being").as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "skill", {
                name: "Orphan",
                system: { subType: "craft", parentSkillCode: "zzz" },
            }).as("child");
        });
        cy.then(function () {
            cy.openSheet(this.child);
            cy.switchTab("properties", "sheet");
            cy.get(
                PROPS +
                    'select[name="system.parentSkillCode"] option[value="zzz"]',
            )
                .should("contain.text", "(unresolved)")
                .and("be.selected");
        });
        // The stored value is preserved, not silently cleared.
        cy.then(function () {
            const id = this.child.id;
            const actorId = this.child.parent.id;
            cy.foundry(
                (win) =>
                    win.game.actors.get(actorId).items.get(id).system
                        .parentSkillCode,
            ).should("eq", "zzz");
        });
    });
});
