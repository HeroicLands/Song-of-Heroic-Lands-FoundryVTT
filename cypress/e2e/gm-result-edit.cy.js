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
 * GM result-edit end-to-end (#856): the test-card edit pencil re-evaluates a
 * settled test on its **frozen roll** — never a re-roll, no Fate cost. This
 * drives the real logic in the live client (as a GM, which the seeded user is):
 *
 * - a real success test posts a card whose pencil dispatches `resultEdit`,
 *   carrying the result serialized under `priorTestResult`;
 * - a live `resultEdit` with a changed situational modifier re-derives the
 *   success level against the **same** die (its total is unchanged and no forced
 *   value is consumed — the proof it did not re-roll);
 * - an edit that changes nothing is a no-op.
 *
 * The original test is forced (`SimpleRoll.forceValues`) to a deterministic,
 * **non-critical** outcome so no critical-choice dialog opens (a headless dialog
 * nobody clicks would hang the spec); the edit runs with `skipDialog` so its own
 * dialog is bypassed and the new modifiers come from scope.
 */

describe("GM result-edit — re-evaluate on the frozen roll (#856)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    it("re-derives the level on the same die when the situational modifier changes", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Edit Sword",
                system: {
                    shortcode: "esw",
                    subType: "combat",
                    masteryLevelBase: 50,
                    skillBaseFormula: "@str,@dex",
                },
            }).then((skill) => {
                cy.prepare(actor);

                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const s = a.items.get(skill.id);
                    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                    const CTX = win.sohl.entity.action.SohlActionContext;

                    // Force a single die: 34 ≤ 50 (last digit 4 → not critical) →
                    // the original test is a marginal SUCCESS. No further forced
                    // value is queued, so any re-roll would draw a random die.
                    SimpleRoll.forceValues(34);
                    const original = await s.logic.executeAction(
                        "successTest",
                        {
                            skipDialog: true,
                            scope: {},
                        },
                    );

                    const beforeRoll = original.roll.total;
                    const beforeLevel = original.successLevel;
                    const beforeSuccess = original.isSuccess;
                    // The forced queue is now empty — a re-roll below would have to
                    // invent a die, which we assert never happens.
                    const forcedAfterOriginal = SimpleRoll.forcedRemaining;

                    // Edit: drop the target by 45 (situational −45 → target 5).
                    // 34 > 5, so the SAME roll now fails.
                    await s.logic.resultEdit(
                        new CTX({
                            type: "resultEdit",
                            speaker: a.getSpeaker(),
                            skipDialog: true,
                            scope: {
                                priorTestResult: original,
                                situationalModifier: -45,
                            },
                        }),
                    );

                    return {
                        beforeRoll,
                        beforeLevel,
                        beforeSuccess,
                        forcedAfterOriginal,
                        afterRoll: original.roll.total,
                        afterSuccess: original.isSuccess,
                        forcedAfterEdit: SimpleRoll.forcedRemaining,
                    };
                }).then((r) => {
                    // The original passed on a 34 vs 50.
                    expect(r.beforeRoll, "forced die").to.eq(34);
                    expect(r.beforeSuccess, "original passed").to.be.true;
                    expect(r.forcedAfterOriginal, "queue drained").to.eq(0);
                    // After the edit the die is unchanged (never re-rolled) and the
                    // outcome re-derived to a failure against the lower target.
                    expect(r.afterRoll, "same frozen die").to.eq(34);
                    expect(r.afterSuccess, "now a failure").to.be.false;
                    // No forced value was consumed by the edit — it did not roll.
                    expect(r.forcedAfterEdit, "no die drawn by the edit").to.eq(
                        0,
                    );
                });
            });
        });
    });

    it("is a no-op when the edit changes no modifier", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Noop Sword",
                system: {
                    shortcode: "nsw",
                    subType: "combat",
                    masteryLevelBase: 50,
                    skillBaseFormula: "@str,@dex",
                },
            }).then((skill) => {
                cy.prepare(actor);

                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const s = a.items.get(skill.id);
                    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                    const CTX = win.sohl.entity.action.SohlActionContext;

                    SimpleRoll.forceValues(34);
                    const original = await s.logic.executeAction(
                        "successTest",
                        {
                            skipDialog: true,
                            scope: {},
                        },
                    );
                    const beforeLevel = original.successLevel;

                    // Same situational (0) and success-level (0) modifiers → no-op.
                    await s.logic.resultEdit(
                        new CTX({
                            type: "resultEdit",
                            speaker: a.getSpeaker(),
                            skipDialog: true,
                            scope: { priorTestResult: original },
                        }),
                    );
                    return {
                        beforeLevel,
                        afterLevel: original.successLevel,
                        roll: original.roll.total,
                    };
                }).then((r) => {
                    expect(r.afterLevel, "level unchanged").to.eq(
                        r.beforeLevel,
                    );
                    expect(r.roll, "die unchanged").to.eq(34);
                });
            });
        });
    });
});
