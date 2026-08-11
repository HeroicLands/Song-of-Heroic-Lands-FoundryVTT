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
 * Skill Value Test end-to-end (#848): a graded success test resolving sustained
 * work in one roll. This drives the real logic in the live client:
 *
 * - the `successValueTest` intrinsic action is registered and runnable on a skill;
 * - it grades the (forced) roll into a Success Value (Index + Modifier) and
 *   Value Diamonds via the skill's svTable, marking the result `isSuccessValue`;
 * - it posts a card showing the Success Value and Value Diamonds.
 *
 * The roll is forced to a deterministic, non-critical outcome so no
 * critical-choice dialog opens; the action runs with `skipDialog`. The card is
 * posted fire-and-forget (`void speaker.toChat`), so the posted-card assertions
 * poll `game.messages` through a retriable `cy.window().should` rather than
 * reading it synchronously.
 */

describe("Skill Value Test — graded success value (#848)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    it("grades a forced roll into a Success Value and Value Diamonds, and posts the card", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Weaponcraft",
                system: {
                    shortcode: "wcraft",
                    subType: "craft",
                    masteryLevelBase: 50,
                    skillBaseFormula: "sb(attr.str, attr.dex)",
                },
            }).then((skill) => {
                cy.prepare(actor);

                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const s = a.items.get(skill.id);
                    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;

                    // The action is registered and human-runnable.
                    const hasAction = !!s.logic.actions.get("successValueTest");

                    win.__svBefore = win.game.messages.size;
                    // Force a marginal success (34 ≤ 50, last digit 4 → not
                    // critical). ML 50 → Index 5; SV = 5 + 1 − 1 = 5 → one star.
                    SimpleRoll.forceValues(34);
                    const result = await s.logic.executeAction(
                        "successValueTest",
                        { skipDialog: true, scope: {} },
                    );

                    return {
                        hasAction,
                        isSuccessValue: result.isSuccessValue,
                        successValue: result.targetValue,
                        valueDiamonds: result.valueDiamonds,
                    };
                }).then((r) => {
                    expect(r.hasAction, "successValueTest action registered").to
                        .be.true;
                    expect(r.isSuccessValue, "marked a Success Value test").to
                        .be.true;
                    expect(r.successValue, "SV = Index 5 + MS 0").to.eq(5);
                    expect(r.valueDiamonds, "one Value Diamond").to.eq(1);
                });

                // The card posts fire-and-forget; poll until it arrives, then
                // assert it shows the Success Value and Value Diamonds rows.
                cy.window().should((win) => {
                    expect(win.game.messages.size).to.be.greaterThan(
                        win.__svBefore,
                    );
                    const content =
                        win.game.messages.contents.at(-1)?.content ?? "";
                    expect(content).to.contain("Success Value:");
                    expect(content).to.contain("Value Diamonds:");
                });
            });
        });
    });
});
