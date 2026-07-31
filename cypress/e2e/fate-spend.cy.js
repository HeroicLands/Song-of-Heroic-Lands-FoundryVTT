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
 * The Fate mechanic end-to-end (#854): a player spends a Fate Point *after* a
 * test to raise its success level — the die is never re-rolled. This drives the
 * real logic in the live client:
 *
 * - `availableFate` resolves the actor's eligible Fate Mystery items;
 * - a real success test on a Fate-eligible skill is `canFate`;
 * - a live `fateTest` consumes a charge and bumps the original result's stored
 *   success level, keyed on the Fate roll's matched rung (not `isSuccess`).
 *
 * Dice are forced with `SimpleRoll.forceValues` so the outcome is deterministic
 * and — deliberately — a **non-critical** marginal success, so no critical-choice
 * dialog opens (a headless dialog nobody clicks would hang the spec). With a
 * single eligible Mystery the source is auto-picked, so the whole flow runs with
 * no dialogs.
 */

describe("Fate spend — post-roll success-level bump (#854)", () => {
    before(() =>
        cy.login().then(() => {
            cy.cleanupWorld();
            // Fate rules must be enabled for a skill's fateMasteryLevel to arm.
            cy.foundry((win) =>
                win.game.settings.set("sohl", "optionFate", "everyone"),
            );
        }),
    );

    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    it("consumes a Fate Point and raises a marginal failure to a marginal success", () => {
        cy.importActor().then((actor) => {
            // A general Fate Point (usable on any skill), two charges.
            cy.createItemOn(actor, "mystery", {
                name: "Lucky Star",
                system: {
                    subType: "fate",
                    assocSkillCode: null,
                    levelBase: null,
                    charges: { usesCharges: true, value: 2, max: 3 },
                },
            }).then((fate) => {
                // A non-aura combat skill so its fateMasteryLevel is not
                // disabled (aura-based skills cannot use Fate).
                cy.createItemOn(actor, "skill", {
                    name: "Fate Sword",
                    system: {
                        shortcode: "fsw",
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

                        // Fate must be armed and a point available.
                        const armed = !s.logic.fateMasteryLevel.disabled;
                        const points = s.logic.availableFate.length;

                        // Force the original test to a marginal FAILURE (88 > 50,
                        // last digit 8 → not critical) and the Fate roll to a
                        // non-critical marginal SUCCESS (34 ≤ target, last digit
                        // 4 → not critical).
                        SimpleRoll.forceValues(88, 34);

                        const original = await s.logic.executeAction(
                            "successTest",
                            { skipDialog: true, scope: {} },
                        );
                        const beforeLevel = original.successLevel;
                        const beforeCanFate = original.canFate;

                        await s.logic.fateTest(
                            new CTX({
                                type: "fate",
                                speaker: a.getSpeaker(),
                                skipDialog: true,
                                scope: { priorTestResult: original },
                            }),
                        );

                        const remaining = a.items.get(fate.id).system.charges
                            .value;

                        return {
                            armed,
                            points,
                            beforeLevel,
                            beforeCanFate,
                            afterLevel: original.successLevel,
                            afterSuccess: original.isSuccess,
                            remaining,
                        };
                    }).then((r) => {
                        // Preconditions: Fate armed and one point available.
                        expect(r.armed, "fateMasteryLevel armed").to.be.true;
                        expect(r.points, "one eligible Fate Point").to.eq(1);
                        // The original test is Fate-eligible and started as a
                        // marginal failure (success level 0).
                        expect(r.beforeCanFate, "original offers Fate").to.be
                            .true;
                        expect(r.beforeLevel, "started a marginal failure").to.eq(
                            0,
                        );
                        // Fate bumped it to a marginal success (level 1)…
                        expect(r.afterLevel, "bumped to marginal success").to.eq(
                            1,
                        );
                        expect(r.afterSuccess, "now a success").to.be.true;
                        // …and consumed exactly one charge (2 → 1).
                        expect(r.remaining, "one charge consumed").to.eq(1);
                    });
                });
            });
        });
    });
});
