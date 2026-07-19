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
 * Being Actions tab (#313): actions from `logic.actions` are split into a
 * Custom (script) section and an Intrinsic (code-defined) section, with
 * hidden-group lifecycle actions omitted. Custom actions bind a Macro; this
 * spec drives the real UI — create (bind an existing Macro), run, edit (open
 * the Macro sheet), and remove (disassociate) — plus the grouped display.
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

/** Bind a script action (executor = macroUuid) onto the actor via update. */
function bindAction(actorId, macroUuid, title) {
    return cy.foundry((win) =>
        win.game.actors
            .get(actorId)
            .update(
                toRealm(win, {
                    "system.actionDefs": [
                        {
                            shortcode: "e2eaction",
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

describe("Being Actions tab (#313)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
        // Macros aren't run-tagged; delete the ones these tests create. New
        // macros are named "<actor> <action>", so match any name containing
        // the "E2E" marker (used in every test's action/macro name).
        cy.foundry((win) =>
            Promise.all(
                win.game.macros
                    .filter((m) => m.name.includes("E2E"))
                    .map((m) => m.delete()),
            ).then(() => null),
        );
    });
    Cypress.on("uncaught:exception", () => false);

    it("lists intrinsic actions in the Intrinsic section (hidden ones omitted)", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("actions", "primary");
            cy.get(ACTIONS).within(() => {
                cy.contains("ol.actions-list", "Intrinsic Actions")
                    .find("li.item")
                    .its("length")
                    .should("be.greaterThan", 0);
                cy.contains("li.item", "postfinalize").should("not.exist");
            });
        });
    });

    /** Fill the create dialog's Action Name + Macro select, then submit. */
    function fillCreateDialog(title, macroValue) {
        cy.get('[data-action="createAction"]').click();
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
        cy.importActor().then((actor) => {
            makeMacro("E2E Bind Macro", "console.log('bind');").then(
                (macroUuid) => {
                    cy.openSheet(actor);
                    cy.switchTab("actions", "primary");
                    fillCreateDialog("E2E Bound Action", macroUuid);
                    cy.wait(700);
                    // The action def is persisted, bound to the Macro's uuid…
                    cy.foundry((win) =>
                        (
                            win.game.actors.get(actor.id).system.actionDefs ??
                            []
                        ).map((d) => d.executor),
                    ).should("include", macroUuid);
                    // …titled by the Action name, under Custom Actions.
                    cy.get(ACTIONS)
                        .contains("ol.actions-list", "Custom Actions")
                        .contains(".item", "E2E Bound Action");
                },
            );
        });
    });

    it("create <New Macro>: makes a script Macro named '<actor> <action>'", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("actions", "primary");
            fillCreateDialog("E2E Fresh Action", "__new__");
            cy.wait(800);
            // A SCRIPT macro named "<actor> E2E Fresh Action" was created…
            cy.foundry((win) => {
                const actorName = win.game.actors.get(actor.id).name;
                const m = win.game.macros.getName(
                    `${actorName} E2E Fresh Action`,
                );
                return m ? { type: m.type } : null;
            }).should((m) => {
                expect(m, "new macro exists").to.not.be.null;
                expect(m.type, "macro is a script").to.eq("script");
            });
            // …and the action is bound and listed under Custom Actions.
            cy.get(ACTIONS)
                .contains("ol.actions-list", "Custom Actions")
                .contains(".item", "E2E Fresh Action");
        });
    });

    it("run: executes the bound Macro", () => {
        cy.importActor().then((actor) => {
            makeMacro(
                "E2E Run Macro",
                "globalThis.__e2eRun = (globalThis.__e2eRun || 0) + 1;",
            ).then((macroUuid) => {
                bindAction(actor.id, macroUuid, "E2E Run Action");
                cy.foundry((win) => {
                    win.__e2eRun = 0;
                    return null;
                });
                cy.openSheet(actor);
                cy.switchTab("actions", "primary");
                cy.get(ACTIONS)
                    .contains("ol.actions-list", "Custom Actions")
                    .find('[data-action="runAction"]')
                    .click();
                cy.wait(700);
                cy.foundry((win) => win.__e2eRun).should("eq", 1);
            });
        });
    });

    it("edit: opens the bound Macro's own sheet", () => {
        cy.importActor().then((actor) => {
            makeMacro("E2E Edit Macro", "console.log('edit');").then(
                (macroUuid) => {
                    bindAction(actor.id, macroUuid, "E2E Edit Action");
                    cy.openSheet(actor);
                    cy.switchTab("actions", "primary");
                    cy.get(ACTIONS)
                        .contains("ol.actions-list", "Custom Actions")
                        .find('[data-action="editAction"]')
                        .click();
                    cy.wait(500);
                    // A Macro config/sheet application is now open.
                    cy.foundry((win) =>
                        [...win.foundry.applications.instances.values()].some(
                            (a) => /macro/i.test(a.constructor.name),
                        ),
                    ).should("be.true");
                },
            );
        });
    });

    it("remove: disassociates the action but keeps the Macro", () => {
        cy.importActor().then((actor) => {
            makeMacro("E2E Remove Macro", "console.log('rm');").then(
                (macroUuid) => {
                    bindAction(actor.id, macroUuid, "E2E Remove Action");
                    cy.openSheet(actor);
                    cy.switchTab("actions", "primary");
                    cy.get(ACTIONS)
                        .contains("ol.actions-list", "Custom Actions")
                        .find('[data-action="deleteAction"]')
                        .click();
                    cy.submitDialog("yes"); // DialogV2.confirm
                    cy.wait(700);
                    // The action def is gone…
                    cy.foundry(
                        (win) =>
                            (
                                win.game.actors.get(actor.id).system
                                    .actionDefs ?? []
                            ).length,
                    ).should("eq", 0);
                    // …but the Macro document still exists.
                    cy.foundry((win) => !!win.fromUuidSync(macroUuid)).should(
                        "be.true",
                    );
                },
            );
        });
    });
});
