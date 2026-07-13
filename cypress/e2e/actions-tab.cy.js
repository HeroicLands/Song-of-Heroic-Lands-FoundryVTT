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
 * Being Actions tab (#313): actions from `logic.actions` are split into a
 * Custom (script) section and an Intrinsic (code-defined) section, with
 * hidden-group lifecycle actions omitted. Creating/editing a custom action is
 * driven through Foundry's Macro UI (a dialog + the macro sheet), which is not
 * exercised here; this spec covers the display and the underlying data flow.
 */
import { toRealm } from "../support/resolve";

describe("Being Actions tab (#313)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("lists intrinsic actions in the Intrinsic section (hidden ones omitted)", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("actions", "primary");
            cy.get('section.tab[data-tab="actions"]').within(() => {
                cy.contains("fieldset", "Intrinsic Actions")
                    .find("li.item")
                    .its("length")
                    .should("be.greaterThan", 0);
                // Lifecycle hooks (group "hidden") must not appear.
                cy.contains("li.item", "postfinalize").should("not.exist");
            });
        });
    });

    it("shows a Macro-bound script action in the Custom section", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) =>
                win.Macro.create(
                    toRealm(win, {
                        name: "E2E Test Macro",
                        type: "script",
                        command: "console.log('hi');",
                    }),
                ).then((macro) =>
                    win.game.actors
                        .get(actor.id)
                        .update(
                            toRealm(win, {
                                "system.actionDefs": [
                                    {
                                        shortcode: "e2eaction",
                                        subType: "script",
                                        title: "E2E Action",
                                        scope: "self",
                                        executor: macro.uuid,
                                        trigger: "true",
                                        visible: "true",
                                        iconFAClass: "sohl-bolt",
                                        group: "general",
                                    },
                                ],
                            }),
                        )
                        .then(() => null),
                ),
            );
            cy.openSheet(actor);
            cy.switchTab("actions", "primary");
            cy.get('section.tab[data-tab="actions"]').within(() => {
                cy.contains("fieldset", "Custom Actions").contains(
                    ".item",
                    "E2E Action",
                );
            });
            cy.foundry(
                (win) =>
                    win.game.macros
                        .getName("E2E Test Macro")
                        ?.delete()
                        .then(() => null) ?? null,
            );
        });
    });
});
