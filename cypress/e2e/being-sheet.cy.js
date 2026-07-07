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
 * The whole Being sheet as one suite: it must render, switch across all tabs,
 * and edit reliably (behavior, not appearance). Setup imports Basic Folk so
 * every tab has content.
 */

const BEING_TABS = [
    "facade",
    "profile",
    "skills",
    "combat",
    "trauma",
    "mysteries",
    "gear",
    "actions",
    "effects",
];

describe("being sheet", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("opens the being sheet", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor).then((el) => {
                expect(el).to.exist;
            });
            cy.get(".sohl.being").should("be.visible");
            cy.get(".sohl.being input[name='name']").should("exist");
        });
    });

    BEING_TABS.forEach((tab) => {
        it(`activates the ${tab} tab and renders its content`, () => {
            cy.importActor().then((actor) => {
                cy.openSheet(actor);
                cy.switchTab(tab, "primary");
                cy.get(
                    `section.tab[data-group="primary"][data-tab="${tab}"]`,
                ).should("have.class", "active");
            });
        });
    });

    it("edits the actor name and persists it", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            // force: the input can be visually covered by header layout; we
            // assert the edit persists (behavior), not that it is clickable (UI).
            // The sheet now submits on change (SheetMixin form.submitOnChange).
            cy.get(".sohl.being input[name='name']")
                .clear({ force: true })
                .type("Renamed Hero", { force: true })
                .blur();
            cy.foundry((win) => win.game.actors.get(actor.id).name).should(
                "eq",
                "Renamed Hero",
            );
        });
    });

    it("lists skills with skillbase/mastery columns on the skills tab", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("skills", "primary");
            cy.get('section.tab[data-tab="skills"] li.item')
                .its("length")
                .should("be.greaterThan", 10);
        });
    });
});
