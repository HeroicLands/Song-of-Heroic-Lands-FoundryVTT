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
 * intrinsic. The shadowed intrinsic stays reachable on `intrinsicActions` /
 * `executeIntrinsicAction` so an overriding script can build on it without
 * re-entering itself.
 *
 * This drives the real running client (not the Node unit harness): a genuine
 * `Macro#execute` behind the overriding script, dispatched through the same
 * `SohlAction.execute` production uses. The action lives on an item embedded in
 * an owned actor so `resolveContext` finds an actor for the execute-permission
 * check.
 */

describe("a script action overrides the intrinsic of the same shortcode", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("hides the intrinsic in the live client yet keeps it invocable", () => {
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

                // A macro that records each run so we can prove which path ran,
                // and returns a sentinel distinct from the intrinsic's result.
                const macro = await win.Macro.create(
                    win.JSON.parse(
                        JSON.stringify({
                            name: "e2e-override-editDocument",
                            type: "script",
                            command:
                                "globalThis.__e2eOverrideRuns = (globalThis.__e2eOverrideRuns || 0) + 1; return 'script-override';",
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
                const intrinsic = logic.intrinsicActions.get("editDocument");

                // Count context-menu entries for this shortcode: it must appear
                // exactly once (the intrinsic is hidden, not duplicated).
                const menuForShortcode = logic
                    .getContextOptions()
                    .filter((e) => e.name === "Homebrew Edit").length;

                win.globalThis.__e2eOverrideRuns = 0;

                // executeAction resolves the SCRIPT — runs the macro.
                const viaExecute = await logic.executeAction("editDocument");
                const runsAfterExecute = win.globalThis.__e2eOverrideRuns;

                // executeIntrinsicAction reaches the shadowed intrinsic — the
                // macro must NOT run again (its counter stays put), and the
                // result is not the script sentinel.
                const viaIntrinsic =
                    await logic.executeIntrinsicAction("editDocument");
                const runsAfterIntrinsic = win.globalThis.__e2eOverrideRuns;

                await macro.delete();
                delete win.globalThis.__e2eOverrideRuns;

                return {
                    baseSize,
                    liveSize: logic.actions.size(),
                    liveSubType: live?.data.subType,
                    intrinsicSubType: intrinsic?.data.subType,
                    menuForShortcode,
                    viaExecute,
                    runsAfterExecute,
                    viaIntrinsic,
                    runsAfterIntrinsic,
                };
            }).then((r) => {
                // Override replaces, never grows, the action set.
                expect(r.liveSize, "override does not add an action").to.eq(
                    r.baseSize,
                );
                // The live action for the shortcode is the script; the intrinsic
                // is retained separately.
                expect(r.liveSubType, "live action is the script").to.eq(
                    "script",
                );
                expect(
                    r.intrinsicSubType,
                    "intrinsic is retained on intrinsicActions",
                ).to.eq("intrinsic");
                // Exactly one context-menu entry for the shortcode.
                expect(r.menuForShortcode, "one menu entry, not two").to.eq(1);
                // executeAction runs the script (macro), returning its sentinel.
                expect(r.viaExecute, "executeAction runs the script").to.eq(
                    "script-override",
                );
                expect(r.runsAfterExecute, "macro ran once").to.eq(1);
                // executeIntrinsicAction runs the intrinsic, NOT the macro.
                expect(
                    r.runsAfterIntrinsic,
                    "intrinsic path does not re-run the macro",
                ).to.eq(1);
                expect(
                    r.viaIntrinsic,
                    "intrinsic result is not the script sentinel",
                ).to.not.eq("script-override");
            });
        });
    });
});
