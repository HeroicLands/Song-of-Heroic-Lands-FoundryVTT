/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") <toasty@heroiclands.org>
 *
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute this file under the terms of that license.
 *
 * See LICENSE.md in the project root or:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

describe("initial Active Effects on healing targets", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("keeps a custom disable through preparation and forces the healing test outcome", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "trauma", {
                name: "Cursed Wound",
                system: {
                    subType: "injury",
                    levelBase: 3,
                    healingRateBase: 4,
                    treatmentDate: 1,
                },
            }).then((wound) => {
                cy.createItemOn(actor, "affliction", {
                    name: "Cursed Fever",
                    system: {
                        subType: "disease",
                        levelBase: 3,
                        healingRateBase: 4,
                        treatmentDate: 1,
                    },
                }).then((affliction) => {
                    cy.foundry(async (win) => {
                        for (const itemId of [wound.id, affliction.id]) {
                            const item = win.game.actors.get(actor.id).items.get(itemId);
                            await item.createEmbeddedDocuments("ActiveEffect", [
                                win.JSON.parse(
                                    JSON.stringify({
                                        name: "Binding Curse",
                                        type: "sohleffectdata",
                                        system: {
                                            scope: "this",
                                            changes: [
                                                {
                                                    key: "mod:logic.healing",
                                                    type: "custom",
                                                    value: " disable ",
                                                    phase: "initial",
                                                    priority: 0,
                                                },
                                            ],
                                        },
                                    }),
                                ),
                            ]);
                        }
                        return null;
                    });

                    cy.prepare(actor);
                    cy.foundry(async (win) => {
                        const liveActor = win.game.actors.get(actor.id);
                        const liveWound = liveActor.items.get(wound.id);
                        const liveAffliction = liveActor.items.get(affliction.id);
                        const modifiers = [liveWound.logic.healing, liveAffliction.logic.healing];
                        const woundRoll = await liveWound.logic.rollHealingTest();
                        const afflictionContext = {
                            skipDialog: true,
                            scope: { schedule: false },
                        };
                        const outcomes = await Promise.all([
                            liveWound.logic.healingTest({
                                skipDialog: true,
                                scope: { schedule: false },
                            }),
                            liveAffliction.logic.healingTest(afflictionContext),
                        ]);
                        return {
                            modifiers: modifiers.map((modifier) => ({
                                disabled: modifier.disabled,
                                source: modifier.disabledByEffect,
                            })),
                            woundSuccessLevel: woundRoll,
                            afflictionRoll: afflictionContext.scope.roll?.rolls,
                            levels: outcomes.map((outcome) => outcome?.level),
                        };
                    }).should((result) => {
                        expect(result.modifiers).to.deep.equal([
                            {
                                disabled: "SOHL.ValueModifier.disabledByEffect",
                                source: "Binding Curse",
                            },
                            {
                                disabled: "SOHL.ValueModifier.disabledByEffect",
                                source: "Binding Curse",
                            },
                        ]);
                        expect(result.woundSuccessLevel).to.equal(-1);
                        expect(result.afflictionRoll).to.deep.equal([100]);
                        // The custom disable is applied during the actor's real
                        // initial-effect phase; both healing tests therefore
                        // resolve as CF and do not reduce the level.
                        expect(result.levels).to.deep.equal([3, 3]);
                    });
                });
            });
        });
    });
});
