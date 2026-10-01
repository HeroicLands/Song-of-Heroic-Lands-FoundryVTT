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
                // The prompt's fields are addressed through the dialog's own
                // form: DialogV2 assigns the content to the `innerHTML` of a
                // `<form>` it owns, and the HTML parser drops a nested `<form>`
                // start tag while keeping its children, so the prompt's wrapper
                // never reaches the document.
                cy.get('.dialog-content input[name="uuid"]').type(skill.uuid);
                cy.submitDialog("ok");

                // Pressing the button resolves the reference and writes the
                // document after the click returns, so the read has to retry:
                // `cy.foundry` samples the client once and `.should` would then
                // re-assert that one sample. `cy.window().should` re-runs the
                // whole read.
                cy.window({ log: false }).should((win) => {
                    expect(win.game.items.get(affiliation.id).system.commonSkills).to.deep.eq([
                        skill.uuid,
                    ]);
                });
                cy.get(`[data-action="openCommonSkill"][data-uuid="${skill.uuid}"]`)
                    .should("contain.text", skill.name)
                    .click();
                cy.window({ log: false }).should((win) => {
                    expect(win.game.items.get(skill.id).sheet.rendered).to.eq(true);
                });
                cy.foundry((win) => win.game.items.get(affiliation.id).actor).should("eq", null);

                // The skill's sheet now sits over the affiliation's, and the
                // remove control is behind it. Close it so the next click lands
                // on the control rather than on whatever covers it.
                cy.foundry(async (win) => {
                    await win.game.items.get(skill.id).sheet.close();
                    return null;
                });
                cy.get('[data-action="deleteCommonSkill"][data-index="0"]').click();
                cy.window({ log: false }).should((win) => {
                    expect(win.game.items.get(affiliation.id).system.commonSkills).to.deep.eq([]);
                });
            });
        });
    });
});
