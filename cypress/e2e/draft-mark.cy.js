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
 * The **Draft** checkbox in the sheet header: a referee's mark that a document's
 * content is unfinished. What only a running client proves is the round trip —
 * the box is in the header, clicking it writes `system.isDraft`, clearing it
 * writes `false` back, and a sheet the viewer may not edit hands them a control
 * they cannot use.
 */

const DRAFT_BOX = '.sheet-header input[name="system.isDraft"]';

describe("the draft mark", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("carries the checkbox in an item sheet header, clear by default", () => {
        cy.createWorldItem("skill").then((item) => {
            cy.openSheet(item);
            cy.get(DRAFT_BOX).should("be.visible").and("not.be.checked");
        });
    });

    it("writes the mark onto the item when the box is ticked", () => {
        cy.createWorldItem("skill").then((item) => {
            cy.openSheet(item);
            cy.editSheetField(item, "system.isDraft", true);
            cy.foundry((win) => win.game.items.get(item.id).system.isDraft).should("eq", true);
            cy.get(DRAFT_BOX).should("be.checked");
        });
    });

    it("clears the mark when the box is cleared", () => {
        cy.createWorldItem("skill").then((item) => {
            cy.openSheet(item);
            cy.editSheetField(item, "system.isDraft", true);
            cy.editSheetField(item, "system.isDraft", false);
            cy.foundry((win) => win.game.items.get(item.id).system.isDraft).should("eq", false);
            cy.get(DRAFT_BOX).should("not.be.checked");
        });
    });

    it("carries the checkbox in a being sheet header and writes through it", () => {
        // A being's name and shortcode are edited through the identity dialog,
        // so this is the one control on that header that writes directly.
        cy.createActor("being").then((actor) => {
            cy.openSheet(actor);
            cy.get(DRAFT_BOX).should("be.visible").and("not.be.checked");
            cy.editSheetField(actor, "system.isDraft", true);
            cy.foundry((win) => win.game.actors.get(actor.id).system.isDraft).should("eq", true);
        });
    });

    it("is disabled on a sheet the viewer may not edit", () => {
        // A document opened straight from the locked `sohl.actors` compendium is
        // read-only, and Foundry disables the sheet's form controls — which is
        // the whole of this control's permission rule.
        cy.getFromCompendium("sohl.actors", "being", "basicfolk").then((doc) => {
            cy.openSheet(doc);
            cy.get(DRAFT_BOX).should("be.disabled");
        });
    });
});
