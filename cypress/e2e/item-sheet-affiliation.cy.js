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

import { itemSheetSuite } from "../support/itemSheetSuite.js";

itemSheetSuite("affiliation");

describe("affiliation common skills", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("adds, opens and removes a skill reference without copying a skill", () => {
        cy.createWorldItem("skill", { name: "Common Lore" }).then((skill) => {
            cy.createWorldItem("affiliation").then((affiliation) => {
                cy.openSheet(affiliation);
                cy.switchTab("properties", "sheet");
                cy.foundry((win) => win.game.items.get(affiliation.id).system.commonSkills).should(
                    "deep.equal",
                    [],
                );

                cy.get(`[data-action="addCommonSkill"]`).click();
                cy.get('form#add-common-skill input[name="uuid"]').type(skill.uuid);
                cy.submitDialog("ok");

                cy.foundry((win) => win.game.items.get(affiliation.id).system.commonSkills).should(
                    "deep.equal",
                    [skill.uuid],
                );
                cy.get(`[data-action="openCommonSkill"][data-uuid="${skill.uuid}"]`)
                    .should("contain.text", skill.name)
                    .click();
                cy.foundry((win) => win.game.items.get(skill.id).sheet.rendered).should("eq", true);
                cy.foundry((win) => win.game.items.get(affiliation.id).actor).should("eq", null);

                cy.get('[data-action="deleteCommonSkill"][data-index="0"]').click();
                cy.foundry((win) => win.game.items.get(affiliation.id).system.commonSkills).should(
                    "deep.equal",
                    [],
                );
            });
        });
    });
});
