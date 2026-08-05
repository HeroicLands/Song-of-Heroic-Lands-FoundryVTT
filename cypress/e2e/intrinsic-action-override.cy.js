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
 * Overriding an intrinsic action (#1060). A Script action whose `shortcode`
 * matches a built-in (intrinsic) action WHOLLY OVERRIDES it: the live `actions`
 * map, the context menu, and `executeAction` resolve only the script, never the
 * intrinsic. The intrinsic's capability is the executor METHOD on the Logic,
 * untouched by the override, so the overriding macro can build on it by calling
 * that method directly.
 *
 * This drives the real running client (not the Node unit harness): a genuine
 * `Macro#execute` behind the overriding script — which itself reaches
 * `ctx.thisLogic.editDocument` to prove the intrinsic capability is still
 * accessible — dispatched through the same `SohlAction.execute` production uses.
 * The action lives on an item embedded in an owned actor so `resolveContext`
 * finds an actor for the execute-permission check.
 */

describe("a script action overrides the intrinsic of the same shortcode", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("hides the intrinsic in the live client, leaving its method reachable", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "miscgear", {
                name: "OverrideCarrier",
            }).as("item");
        });
        cy.then(function () {
            const actorId = this.actor.id;
            const itemId = this.item.id;
            cy.foundry(async (win) => {
                const actor = win.game.actors.get(actorId);
                const item = actor.items.get(itemId);

                // Baseline action count before the override is attached — the
                // override must REPLACE the intrinsic, not add a second entry.
                item.reset?.();
                item.prepareData?.();
                const baseSize = item.logic.actions.size();

                // A macro standing in for a house rule that builds on the
                // intrinsic. It receives the single `ctx` (the SohlActionContext)
                // and reaches the intrinsic it overrides through `ctx.thisLogic`
                // — the stand-in for `this` — exactly as an overriding macro
                // would call `ctx.thisLogic.editDocument(ctx)`. Here it just
                // confirms that executor method is still reachable.
                const macro = await win.Macro.create(
                    win.JSON.parse(
                        JSON.stringify({
                            name: "e2e-override-editDocument",
                            type: "script",
                            command:
                                "return typeof ctx?.thisLogic?.editDocument === 'function' ? 'built-on-intrinsic' : 'intrinsic-lost';",
                        }),
                    ),
                );

                // Attach a script action reusing the built-in `editDocument`
                // shortcode. No code is stored on the item — only the Macro UUID.
                await item.update(
                    win.JSON.parse(
                        JSON.stringify({
                            "system.actionDefs": [
                                {
                                    shortcode: "editDocument",
                                    subType: "script",
                                    title: "Homebrew Edit",
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

                // Rebuild the logic from the persisted actionDefs.
                item.reset?.();
                item.prepareData?.();
                const logic = item.logic;

                const live = logic.actions.get("editDocument");

                // Count context-menu entries for this shortcode: it must appear
                // exactly once (the intrinsic is hidden, not duplicated).
                const menuForShortcode = logic
                    .getContextOptions()
                    .filter((e) => e.name === "Homebrew Edit").length;

                // executeAction resolves the SCRIPT — runs the macro, which in
                // turn confirms the intrinsic method is still reachable.
                const viaExecute = await logic.executeAction("editDocument");

                await macro.delete();

                return {
                    baseSize,
                    liveSize: logic.actions.size(),
                    liveSubType: live?.data.subType,
                    intrinsicMethodPresent:
                        typeof logic.editDocument === "function",
                    menuForShortcode,
                    viaExecute,
                };
            }).then((r) => {
                // Override replaces, never grows, the action set.
                expect(r.liveSize, "override does not add an action").to.eq(
                    r.baseSize,
                );
                // The live action for the shortcode is the script.
                expect(r.liveSubType, "live action is the script").to.eq(
                    "script",
                );
                // Exactly one context-menu entry for the shortcode.
                expect(r.menuForShortcode, "one menu entry, not two").to.eq(1);
                // The intrinsic's executor method is untouched by the override.
                expect(
                    r.intrinsicMethodPresent,
                    "intrinsic method remains on the logic",
                ).to.be.true;
                // executeAction runs the script, which built on the intrinsic.
                expect(
                    r.viaExecute,
                    "executeAction runs the script; it reaches the intrinsic method",
                ).to.eq("built-on-intrinsic");
            });
        });
    });
});
