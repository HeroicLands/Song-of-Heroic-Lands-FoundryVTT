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
 * Skill sheet "Adopt Parent Mastery" option (#719).
 *
 * `system.adoptParentMasteryLevel` (BooleanField, initial false) lets a
 * specialization skill track its parent skill's mastery level. The control must
 * render on the properties tab ONLY when `system.parentSkillCode` is set, its
 * edit must persist, and when the flag is on the prepared skill's mastery-level
 * base must equal the parent skill's `masteryLevelBase` (adopted before its own
 * boosts/clamp) — driven through the live `.logic`.
 */
describe("skill sheet adopt parent mastery level (#719)", () => {
    const SEL = '[name="system.adoptParentMasteryLevel"]';

    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function renderSheet(uuid) {
        cy.foundry((win) =>
            Cypress.Promise.resolve(win.fromUuidSync(uuid).sheet.render(true)).then(() => null),
        );
        cy.wait(400);
    }

    function controlPresent(uuid) {
        return cy.foundry((win) => {
            const el = win.fromUuidSync(uuid).sheet.element;
            return !!el.querySelector(SEL);
        });
    }

    it("shows the control only when a parent skill is set", () => {
        cy.createActor("being", { name: "Adopt Being" }).then((actor) => {
            // With a parent → control renders.
            cy.createItemOn(actor, "skill", {
                name: "Trade-Tongue",
                system: { subType: "language", parentSkillCode: "lang" },
            }).then((withParent) => {
                renderSheet(withParent.uuid);
                controlPresent(withParent.uuid).should("be.true");
            });
            // Without a parent → control hidden.
            cy.createItemOn(actor, "skill", {
                name: "Oratory",
                system: { subType: "social" },
            }).then((noParent) => {
                renderSheet(noParent.uuid);
                controlPresent(noParent.uuid).should("be.false");
            });
        });
    });

    it("persists an edit to the Adopt Parent Mastery flag", () => {
        cy.createActor("being", { name: "Persist Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Broadsword",
                system: { subType: "combat", parentSkillCode: "sword" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.foundry((win) => win.fromUuidSync(skill.uuid)).then((doc) =>
                    cy.editSheetField(doc, "system.adoptParentMasteryLevel", true),
                );
                cy.foundry(
                    (win) => win.fromUuidSync(skill.uuid).system.adoptParentMasteryLevel,
                ).should("equal", true);
            });
        });
    });

    it("adopts the parent skill's masteryLevelBase in the prepared logic", () => {
        cy.createActor("being", { name: "Adoption Being" }).then((actor) => {
            // Parent (base) skill with a known mastery-level base.
            cy.createItemOn(actor, "skill", {
                name: "Base Sword",
                system: {
                    subType: "combat",
                    shortcode: "psword",
                    masteryLevelBase: 40,
                },
            });
            // Child specialization set to adopt the parent's base.
            cy.createItemOn(actor, "skill", {
                name: "Sabre",
                system: {
                    subType: "combat",
                    shortcode: "csabre",
                    parentSkillCode: "psword",
                    adoptParentMasteryLevel: true,
                    masteryLevelBase: 20,
                },
            }).then((child) => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const logic = win
                        .fromUuidSync(child.uuid)
                        .actor.logic.getItemLogic("csabre", "skill");
                    return logic.masteryLevel.base;
                }).should("equal", 40); // adopted parent's 40, not its own 20
            });
        });
    });
});
