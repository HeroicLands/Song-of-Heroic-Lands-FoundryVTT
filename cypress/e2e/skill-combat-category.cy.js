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
 * Skill sheet Combat Category control (#709).
 *
 * `system.combatCategory` is a real schema field, but the properties template
 * referenced a phantom `weaponGroup` field so no control ever rendered. The
 * control must appear (bound to `system.combatCategory`) only when the skill's
 * `subType` is `combat`, and edits must persist.
 */
describe("skill sheet combat category (#709)", () => {
    const SEL = '[name="system.combatCategory"]';

    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function renderSheet(uuid) {
        cy.foundry((win) =>
            Cypress.Promise.resolve(
                win.fromUuidSync(uuid).sheet.render(true),
            ).then(() => null),
        );
        cy.wait(400);
    }

    it("shows the Combat Category select on the properties tab for a combat skill", () => {
        cy.createActor("being", { name: "CC Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Melee",
                system: { subType: "combat", combatCategory: "melee" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(skill.uuid).sheet.element;
                    const ctrl = el.querySelector(SEL);
                    return { present: !!ctrl, value: ctrl?.value };
                }).should((r) => {
                    expect(r.present, "combat category control present").to.be
                        .true;
                    expect(r.value).to.equal("melee");
                });
            });
        });
    });

    it("omits the Combat Category control for a non-combat skill", () => {
        cy.createActor("being", { name: "Social Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Oratory",
                system: { subType: "social" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.foundry(
                    (win) =>
                        !!win
                            .fromUuidSync(skill.uuid)
                            .sheet.element.querySelector(SEL),
                ).should("be.false");
            });
        });
    });

    it("persists an edit to the Combat Category select", () => {
        cy.createActor("being", { name: "Edit Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Missile",
                system: { subType: "combat", combatCategory: "melee" },
            }).then((skill) => {
                renderSheet(skill.uuid);
                cy.then(() => {
                    cy.foundry((win) =>
                        win.fromUuidSync(skill.uuid),
                    ).then((doc) =>
                        cy.editSheetField(doc, "system.combatCategory", "missile"),
                    );
                });
                cy.foundry(
                    (win) =>
                        win.fromUuidSync(skill.uuid).system.combatCategory,
                ).should("equal", "missile");
            });
        });
    });
});
