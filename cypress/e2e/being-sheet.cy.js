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
            // The redesigned header shows the name as read-only text with an
            // edit-identity pencil (name + shortcode are edited via a dialog),
            // rather than an inline <input name="name">.
            cy.get(".sohl.being .sheet-header__name")
                .invoke("text")
                .should("not.be.empty");
            cy.get(".sohl.being [data-action='editIdentity']").should("exist");
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
            // The redesigned header edits name + shortcode together through the
            // editIdentity DialogV2 (no inline <input name="name">). Open the
            // dialog from the header pencil, set the name field, and Save.
            cy.openSheet(actor);
            // The pencil is revealed on hover (opacity), so force the click.
            cy.get(".sohl.being [data-action='editIdentity']").click({
                force: true,
            });
            // Wait for the identity dialog to actually render (cy.foundry's
            // callback isn't retriable), then set the name field and Save.
            const findIdentityDlg = (win) =>
                Array.from(win.foundry.applications.instances.values())
                    .reverse()
                    .find(
                        (app) =>
                            /dialog/i.test(app.constructor.name) &&
                            app.rendered &&
                            app.element?.querySelector("input[name='name']"),
                    );
            cy.window({ log: false }).should((win) => {
                expect(findIdentityDlg(win), "edit-identity dialog rendered").to
                    .exist;
            });
            // Set the name field and press Save atomically — the DialogV2 ok
            // button reads its form via FormDataExtended on click, so the value
            // must be in place at the moment of the click.
            cy.foundry((win) => {
                const dlg = findIdentityDlg(win);
                dlg.element.querySelector("input[name='name']").value =
                    "Renamed Hero";
                dlg.element.querySelector("button[data-action='ok']").click();
                return null;
            });
            // actor.update from the dialog callback is async — poll the live
            // document (cy.foundry reads once and would not re-observe the
            // rename) until the persisted name updates.
            cy.window({ log: false }).should((win) => {
                expect(win.game.actors.get(actor.id).name).to.eq(
                    "Renamed Hero",
                );
            });
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
            cy.get('section.tab[data-tab="skills"] .ledger__row')
                .its("length")
                .should("be.greaterThan", 10);
        });
    });

    // #769 — the EML and Fate value cells bind a hover tooltip to the
    // mastery-level modifier delta summary (deltaLabel), positioned above the
    // row (data-tooltip-direction="UP"). The attributes' presence (the tooltip
    // text is empty when a value has no deltas) proves the binding; before the
    // fix the cells carried no data-tooltip.
    it("binds an above-row deltaLabel tooltip on the skills EML/Fate cells (#769)", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("skills", "primary");
            for (const action of ["successTest", "fateTest"]) {
                cy.get(
                    'section.tab[data-tab="skills"] .ledger__row ' +
                        `.ledger__cell--rollable[data-action="${action}"]`,
                )
                    .first()
                    .should(($el) => {
                        expect($el).to.have.attr("data-tooltip");
                        expect($el).to.have.attr(
                            "data-tooltip-direction",
                            "UP",
                        );
                    });
            }
        });
    });

    // #769 — the strike-mode Impact/Atk/Blk/CX value cells bind an above-row
    // deltaLabel tooltip. A combattechnique skill seeds a melee strike mode so
    // the combat tab has a row to assert against. Only the enabled value cells
    // carry the `rollable` class (a disabled column renders a plain ✕ cell), and
    // each such cell must carry both data-tooltip and the UP direction.
    it("binds an above-row deltaLabel tooltip on the combat strike-mode cells (#769)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Unarmed",
                system: { subType: "combattechnique", masteryLevelBase: 30 },
            });
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.get(
                'section.tab[data-tab="combat"] .ledger__row[data-sm-id] .ledger__cell--rollable',
            )
                .should("have.length.greaterThan", 0)
                .each(($cell) => {
                    expect($cell).to.have.attr("data-tooltip");
                    expect($cell).to.have.attr("data-tooltip-direction", "UP");
                });
        });
    });
});
