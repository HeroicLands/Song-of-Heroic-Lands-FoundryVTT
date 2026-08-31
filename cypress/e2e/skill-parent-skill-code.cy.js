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
 * Skill sheet Parent Skill control (#710).
 *
 * `system.parentSkillCode` is a real schema field (nullable, initial null,
 * blank false) that marks a skill as a specialization of another skill, but no
 * control ever rendered on the sheet. The control must appear (bound to
 * `system.parentSkillCode`), edits must persist, and clearing it must store
 * `null` (Foundry cleans a blank string on a nullable/non-blank field to null).
 */
describe("skill sheet parent skill code (#710)", () => {
    const SEL = '[name="system.parentSkillCode"]';

    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function renderSheet(uuid) {
        cy.foundry((win) =>
            Cypress.Promise.resolve(win.fromUuidSync(uuid).sheet.render(true)).then(() => null),
        );
        cy.wait(400);
    }

    it("shows the Parent Skill control on the properties tab", () => {
        cy.createActor("being", { name: "Parent Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Trade-Tongue",
                system: { subType: "language", parentSkillCode: "lang" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(skill.uuid).sheet.element;
                    const ctrl = el.querySelector(SEL);
                    return { present: !!ctrl, value: ctrl?.value };
                }).should((r) => {
                    expect(r.present, "parent skill control present").to.be.true;
                    expect(r.value).to.equal("lang");
                });
            });
        });
    });

    it("cleans a blank parentSkillCode to null on create (legacy/blank handling)", () => {
        cy.createActor("being", { name: "Blank Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Oratory",
                system: { subType: "social", parentSkillCode: "" },
            }).then((skill) => {
                cy.foundry((win) => win.fromUuidSync(skill.uuid).system.parentSkillCode).should(
                    "equal",
                    null,
                );
            });
        });
    });

    it("persists an edit to the Parent Skill field", () => {
        cy.createActor("being", { name: "Edit Being" }).then((actor) => {
            // When embedded on an actor the control is a dropdown of the actor's
            // other skills (#974/#980), so a value is selectable only if a
            // sibling skill carries that shortcode. Seed one, then pick it — the
            // parent skill must exist on the actor by construction.
            cy.createItemOn(actor, "skill", {
                name: "Swordsmanship",
                system: { subType: "combat", shortcode: "sword" },
            });
            cy.createItemOn(actor, "skill", {
                name: "Broadsword",
                system: { subType: "combat" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.then(() => {
                    cy.foundry((win) => win.fromUuidSync(skill.uuid)).then((doc) =>
                        cy.editSheetField(doc, "system.parentSkillCode", "sword"),
                    );
                });
                cy.foundry((win) => win.fromUuidSync(skill.uuid).system.parentSkillCode).should(
                    "equal",
                    "sword",
                );
            });
        });
    });

    it("stores null when the Parent Skill field is cleared", () => {
        cy.createActor("being", { name: "Clear Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sabre",
                system: { subType: "combat", parentSkillCode: "sword" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.then(() => {
                    cy.foundry((win) => win.fromUuidSync(skill.uuid)).then((doc) =>
                        cy.editSheetField(doc, "system.parentSkillCode", ""),
                    );
                });
                cy.foundry((win) => win.fromUuidSync(skill.uuid).system.parentSkillCode).should(
                    "equal",
                    null,
                );
            });
        });
    });
});
