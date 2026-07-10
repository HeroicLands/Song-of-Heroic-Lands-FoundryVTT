/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Shortcode input in the sheet header (#351): both Actor and Item sheets show an
 * editable `system.shortcode` input directly under the Name field — no label,
 * placeholder "shortcode" — and edits persist via submitOnChange.
 */
describe("shortcode header input (#351)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("actor sheet header: editable shortcode under the name", () => {
        cy.createActor("being", {
            name: "Hero",
            system: { shortcode: "hdrbeing" },
        }).then((actor) => {
            cy.openSheet(actor);
            cy.get(".sohl.being .sheet-header__shortcode")
                .should("have.attr", "placeholder", "shortcode")
                .and("have.value", "hdrbeing");
            cy.editSheetField(actor, "system.shortcode", "hdrbeing2");
            cy.foundry(
                (win) => win.game.actors.get(actor.id).system.shortcode,
            ).should("eq", "hdrbeing2");
        });
    });

    it("item sheet header: editable shortcode under the name", () => {
        cy.createActor("being", { name: "Owner" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Stealth",
                system: { shortcode: "hdritem" },
            }).then((item) => {
                cy.closeAllSheets();
                cy.openSheet(item);
                cy.get(".sheet-header__shortcode")
                    .should("have.attr", "placeholder", "shortcode")
                    .and("have.value", "hdritem");
                cy.editSheetField(item, "system.shortcode", "hdritem2");
                cy.foundry(
                    (win) =>
                        win.game.actors.get(actor.id).items.get(item.id).system
                            .shortcode,
                ).should("eq", "hdritem2");
            });
        });
    });
});
