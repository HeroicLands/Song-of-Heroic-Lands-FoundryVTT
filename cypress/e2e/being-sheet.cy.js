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
            // The sheet submits on change (SheetMixin form.submitOnChange), so a
            // native `change` (via editSheetField) is required — Cypress
            // `.type().blur()` does not reliably trigger it. (#349)
            cy.editSheetField(actor, "name", "Renamed Hero");
            cy.foundry((win) => win.game.actors.get(actor.id).name).should(
                "eq",
                "Renamed Hero",
            );
            // Renaming detaches the run tag, so cleanupWorld (tag-based) can no
            // longer reclaim this actor — delete it by id to avoid leaking it
            // into the persistent e2e world.
            cy.foundry((win) =>
                win.Actor.deleteDocuments([actor.id]).then(() => null),
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

    // #769 — the EML and Fate value cells bind a hover tooltip to the
    // mastery-level modifier abbrev. The attribute's presence (even when empty)
    // proves the binding; before the fix the cells carried no data-tooltip.
    it("binds a modifier-abbrev tooltip on the skills EML/Fate cells (#769)", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("skills", "primary");
            cy.get(
                'section.tab[data-tab="skills"] li.item ' +
                    '.list__detail.rollable[data-action="successTest"]',
            )
                .first()
                .should("have.attr", "data-tooltip");
            cy.get(
                'section.tab[data-tab="skills"] li.item ' +
                    '.list__detail.rollable[data-action="fateTest"]',
            )
                .first()
                .should("have.attr", "data-tooltip");
        });
    });

    // #769 — the strike-mode Impact/Atk/Blk/CX value cells bind a hover tooltip
    // to the underlying ValueModifier abbrev. A combattechnique skill seeds a
    // melee strike mode so the combat tab has a row to assert against. Only the
    // enabled value cells carry the `rollable` class (a disabled column renders
    // a plain ✕ cell), and each such cell must now carry a `data-tooltip`.
    it("binds a modifier-abbrev tooltip on the combat strike-mode cells (#769)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Unarmed",
                system: { subType: "combattechnique", masteryLevelBase: 30 },
            });
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.get(
                'section.tab[data-tab="combat"] li[data-sm-id] .list__detail.rollable',
            )
                .should("have.length.greaterThan", 0)
                .each(($cell) => {
                    cy.wrap($cell).should("have.attr", "data-tooltip");
                });
        });
    });
});
