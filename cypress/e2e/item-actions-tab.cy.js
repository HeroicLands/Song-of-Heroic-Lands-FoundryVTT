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
 * Item Actions tab (#501): the item sheet now offers the same custom-action
 * authoring the being sheet has — create (bind a Macro), run, edit (open the
 * Macro sheet), and delete — split into a Custom section and a run-only
 * Intrinsic section. Both sheets share the `core/foundry/sheet-actions` helper,
 * so this drives the item variant of that behavior through the real UI.
 */
import { toRealm } from "../support/resolve";

const ACTIONS = 'section.tab[data-tab="actions"]';

/** Create a script Macro in the game realm; yields its uuid. */
function makeMacro(name, command) {
    return cy
        .foundry((win) =>
            win.Macro.create(
                toRealm(win, { name, type: "script", command }),
            ).then((m) => m.uuid),
        )
        .then((uuid) => uuid);
}

/** Bind a script action (executor = macroUuid) onto a world item via update. */
function bindAction(itemId, macroUuid, title) {
    return cy.foundry((win) =>
        win.game.items
            .get(itemId)
            .update(
                toRealm(win, {
                    "system.actionDefs": [
                        {
                            shortcode: "e2eitemaction",
                            subType: "script",
                            title,
                            scope: "self",
                            executor: macroUuid,
                            trigger: "true",
                            visible: "true",
                            iconFAClass: "fa-solid fa-bolt",
                            group: "general",
                        },
                    ],
                }),
            )
            .then(() => null),
    );
}

describe("Item Actions tab (#501)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
        cy.foundry((win) =>
            Promise.all(
                win.game.macros
                    .filter((m) => m.name.includes("E2E"))
                    .map((m) => m.delete()),
            ).then(() => null),
        );
    });
    Cypress.on("uncaught:exception", () => false);

    /** Fill the create dialog's Action Name + Macro select, then submit. */
    function fillCreateDialog(title, macroValue) {
        cy.get(`${ACTIONS} [data-action="createAction"]`).click();
        cy.get('select[name="macro"]', { timeout: 10000 }).should("exist");
        cy.foundry((win) => {
            const dlg = [...win.foundry.applications.instances.values()]
                .reverse()
                .find((a) => /dialog/i.test(a.constructor.name));
            dlg.element.querySelector('input[name="title"]').value = title;
            dlg.element.querySelector('select[name="macro"]').value =
                macroValue;
            return null;
        });
        cy.submitDialog("ok");
    }

    it("create: binds a selected Macro under the given Action name", () => {
        cy.createWorldItem("skill", { name: "E2E Skill" }).then((item) => {
            makeMacro("E2E Item Bind Macro", "console.log('bind');").then(
                (macroUuid) => {
                    cy.openSheet(item);
                    cy.switchTab("actions", "sheet");
                    fillCreateDialog("E2E Item Bound Action", macroUuid);
                    cy.wait(700);
                    cy.foundry((win) =>
                        (
                            win.game.items.get(item.id).system.actionDefs ?? []
                        ).map((d) => d.executor),
                    ).should("include", macroUuid);
                    cy.get(ACTIONS)
                        .contains("ol.actions-list", "Custom Actions")
                        .contains(".item", "E2E Item Bound Action");
                },
            );
        });
    });

    it("run: executes the bound Macro (item on an actor)", () => {
        // A SCRIPT action executes through the owning actor's logic, so the run
        // test uses an item embedded on an actor (a world item has no actor).
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", { name: "E2E Run Skill" }).then(
                (item) => {
                    makeMacro(
                        "E2E Item Run Macro",
                        "globalThis.__e2eItemRun = (globalThis.__e2eItemRun || 0) + 1;",
                    ).then((macroUuid) => {
                        cy.foundry((win) =>
                            win.game.actors
                                .get(actor.id)
                                .items.get(item.id)
                                .update(
                                    toRealm(win, {
                                        "system.actionDefs": [
                                            {
                                                shortcode: "e2eitemaction",
                                                subType: "script",
                                                title: "E2E Item Run Action",
                                                scope: "self",
                                                executor: macroUuid,
                                                trigger: "true",
                                                visible: "true",
                                                iconFAClass: "fa-solid fa-bolt",
                                                group: "general",
                                            },
                                        ],
                                    }),
                                )
                                .then(() => null),
                        );
                        cy.foundry((win) => {
                            win.__e2eItemRun = 0;
                            return null;
                        });
                        cy.openSheet(item);
                        cy.switchTab("actions", "sheet");
                        cy.get(ACTIONS)
                            .contains("ol.actions-list", "Custom Actions")
                            .find('[data-action="runAction"]')
                            .click();
                        cy.wait(700);
                        cy.foundry((win) => win.__e2eItemRun).should("eq", 1);
                    });
                },
            );
        });
    });

    it("edit: opens the bound Macro's own sheet", () => {
        cy.createWorldItem("skill", { name: "E2E Edit Skill" }).then((item) => {
            makeMacro("E2E Item Edit Macro", "console.log('edit');").then(
                (macroUuid) => {
                    bindAction(item.id, macroUuid, "E2E Item Edit Action");
                    cy.openSheet(item);
                    cy.switchTab("actions", "sheet");
                    cy.get(ACTIONS)
                        .contains("ol.actions-list", "Custom Actions")
                        .find('[data-action="editAction"]')
                        .click();
                    cy.wait(500);
                    cy.foundry((win) =>
                        [...win.foundry.applications.instances.values()].some(
                            (a) => /macro/i.test(a.constructor.name),
                        ),
                    ).should("be.true");
                },
            );
        });
    });

    it("delete: disassociates the action but keeps the Macro", () => {
        cy.createWorldItem("skill", { name: "E2E Del Skill" }).then((item) => {
            makeMacro("E2E Item Del Macro", "console.log('rm');").then(
                (macroUuid) => {
                    bindAction(item.id, macroUuid, "E2E Item Del Action");
                    cy.openSheet(item);
                    cy.switchTab("actions", "sheet");
                    cy.get(ACTIONS)
                        .contains("ol.actions-list", "Custom Actions")
                        .find('[data-action="deleteAction"]')
                        .click();
                    cy.submitDialog("yes");
                    cy.wait(700);
                    cy.foundry(
                        (win) =>
                            (
                                win.game.items.get(item.id).system.actionDefs ??
                                []
                            ).length,
                    ).should("eq", 0);
                    cy.foundry((win) => !!win.fromUuidSync(macroUuid)).should(
                        "be.true",
                    );
                },
            );
        });
    });
});
