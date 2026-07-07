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
 * Script actions run a referenced Foundry Macro (#156), never compiled code.
 * This exercises the path unit tests can't: a real `Macro#execute` in a running
 * Foundry, driven through a Script action's `executor` (the Macro UUID). The
 * macro's return value flows back through `SohlAction.execute`.
 *
 * The action lives on an item embedded in an owned actor so `resolveContext`
 * finds an actor for the execute-permission check (a world item has no actor and
 * would be gated out).
 */

describe("script action runs a Foundry Macro", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("executes the referenced Macro and returns its value", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "miscgear", {
                name: "MacroCarrier",
            }).as("item");
        });
        cy.then(function () {
            const actorId = this.actor.id;
            const itemId = this.item.id;
            cy.foundry(async (win) => {
                const actor = win.game.actors.get(actorId);
                const item = actor.items.get(itemId);

                // 1. GM-authored "homebrew": an ordinary script Macro. Foundry
                //    gates creation behind the MACRO_SCRIPT permission (the
                //    seeded user is a GM).
                const macro = await win.Macro.create(
                    win.JSON.parse(
                        JSON.stringify({
                            name: "e2e-return-42",
                            type: "script",
                            command: "return 42;",
                        }),
                    ),
                );

                // 2. A Script action on the item that references the Macro by
                //    UUID — no code is stored on the item.
                await item.update(
                    win.JSON.parse(
                        JSON.stringify({
                            "system.actionDefs": [
                                {
                                    shortcode: "e2eMacro",
                                    subType: "script",
                                    title: "E2E Macro",
                                    scope: "self",
                                    executor: macro.uuid,
                                    trigger: "true",
                                    visible: "true",
                                    iconFAClass: "sohl-question",
                                    group: "general",
                                    minActorOwnership: 0,
                                },
                            ],
                        }),
                    ),
                );

                // 3. Rebuild the logic (actions are derived from actionDefs) and
                //    run the action; execute() yields the macro's return value.
                item.reset?.();
                item.prepareData?.();
                const action = item.logic.actions.get("e2eMacro");
                const result =
                    action ?
                        await action.execute(item.logic._getContext())
                    :   undefined;

                await macro.delete();
                return { hasAction: !!action, result };
            }).then((r) => {
                expect(r.hasAction, "script action was built from actionDefs")
                    .to.be.true;
                expect(r.result, "macro return value flows back").to.eq(42);
            });
        });
    });
});
