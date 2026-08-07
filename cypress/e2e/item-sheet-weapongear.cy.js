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

itemSheetSuite("weapongear");

/**
 * #1179 — the shared suite proves an edit *persists* onto the document, but not
 * that the sheet renders the stored value back. The Encumbrance control bound
 * its `value=` to a nonexistent `system.encumbrance`, so it saved correctly and
 * still redrew blank. Assert the rendered input, which is the only thing that
 * catches a wrong `value=` binding.
 */
describe("item sheet — weapongear encumbrance display (#1179)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("renders the stored encumbrance when the sheet is opened", () => {
        cy.createWorldItem("weapongear", {
            system: { encumbranceBase: 4 },
        }).as("item");
        cy.then(function () {
            cy.openSheet(this.item);
        });
        cy.then(function () {
            const id = this.item.id;
            cy.foundry(
                (win) =>
                    win.game.items
                        .get(id)
                        .sheet.element.querySelector(
                            'input[name="system.encumbranceBase"]',
                        )?.value,
            ).should("eq", "4");
        });
    });
});
