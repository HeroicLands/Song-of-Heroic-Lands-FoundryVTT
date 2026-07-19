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
 * Movement + reach read paths.
 *
 * Movement: `SohlCombatantLogic.computedMove()` / `displayedMove` read the being's
 * tactical move off its active movement profile (`BeingLogic.feetPerRound`, for
 * the being's `currentMoveMedium`). Reach: `BeingLogic.reach` is the greatest
 * reach among currently-available melee modes — combat techniques are always
 * available; a weapon's mode counts only when the weapon is held in at least
 * `minParts` limbs (the hold path landed in #179 and was made corruption-safe in
 * #247).
 *
 * The imported Basic Folk being carries a terrestrial movement profile
 * (`feetPerRound` 50) inline at `system.movementProfiles`; its
 * `currentMoveMedium` defaults to terrestrial, so the movement tests read 50
 * directly. Reach is exercised with an inline combat technique / weapon.
 */

/**
 * A combat technique carrying a single melee strike mode of the given length.
 * Combat techniques are a `combattechnique`-subtype skill; the strike mode lives
 * under `system.strikeMode`.
 */
function meleeTechnique(lengthBase, name = "Test Technique") {
    return {
        name,
        system: {
            subType: "combattechnique",
            strikeMode: {
                type: "melee",
                name,
                assocSkillCode: "unarmed",
                minParts: 1,
                attack: { spread: 0, modifier: 0 },
                impactBase: {
                    numDice: 1,
                    die: 6,
                    modifier: 0,
                    aspect: "blunt",
                },
                traits: {},
                lengthBase,
                defense: {
                    block: { disabled: false, modifier: 0, successLevelMod: 0 },
                    counterstrike: {
                        disabled: false,
                        modifier: 0,
                        successLevelMod: 0,
                    },
                },
            },
        },
    };
}

/** A weapongear carrying a single melee strike mode of the given length. */
function meleeWeapon(lengthBase, name = "Test Spear") {
    return {
        name,
        system: {
            strikeModes: {
                strike: {
                    type: "melee",
                    name: "Strike",
                    assocSkillCode: "melee",
                    minParts: 1,
                    attack: { spread: 0, modifier: 0 },
                    impactBase: {
                        numDice: 1,
                        die: 6,
                        modifier: 0,
                        aspect: "blunt",
                    },
                    traits: {},
                    lengthBase,
                    defense: {
                        block: {
                            disabled: false,
                            modifier: 0,
                            successLevelMod: 0,
                        },
                        counterstrike: {
                            disabled: false,
                            modifier: 0,
                            successLevelMod: 0,
                        },
                    },
                },
            },
        },
    };
}

/** The SohlCombatantLogic for `actorId` in `combatId`. */
function combatantLogic(win, combatId, actorId) {
    const combat = win.game.combats.get(combatId);
    return combat.combatants.find((c) => c.actorId === actorId)?.logic;
}

describe("movement + reach read paths", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // ------------------------------------------------------------------ movement

    // Basic Folk's terrestrial movement profile is feetPerRound 50 (vault
    // export); a being's currentMoveMedium defaults to terrestrial, so the
    // being's active feetPerRound resolves to 50 — which computedMove reads
    // directly.
    it("computedMove reads the being's active feetPerRound", () => {
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) =>
                            combatantLogic(
                                win,
                                combat.id,
                                actor.id,
                            ).computedMove(),
                        ).should("eq", 50);
                    });
                });
            });
        });
    });

    it("displayedMove equals computedMove", () => {
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) => {
                            const cbt = combatantLogic(
                                win,
                                combat.id,
                                actor.id,
                            );
                            return {
                                displayed: cbt.displayedMove,
                                computed: cbt.computedMove(),
                            };
                        }).should((r) => {
                            expect(r.displayed).to.eq(r.computed);
                            expect(r.displayed).to.eq(50);
                        });
                    });
                });
            });
        });
    });

    // #252: computedMove scales the being's feetPerRound by the combatant's
    // situational moveFactor (run, terrain, haste, …; defaults to 1).
    it("computedMove scales base move by moveFactor (#252)", () => {
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry(async (win) => {
                            const c = win.game.combats.get(combat.id);
                            const cbt = c.combatants.find(
                                (x) => x.actorId === actor.id,
                            );
                            await cbt.update(
                                win.JSON.parse(
                                    JSON.stringify({ "system.moveFactor": 2 }),
                                ),
                            );
                            return {
                                moveFactor: cbt.logic.data.moveFactor,
                                computed: cbt.logic.computedMove(),
                            };
                        }).should((r) => {
                            expect(r.moveFactor, "moveFactor persisted").to.eq(
                                2,
                            );
                            // feetPerRound 50 × 2 moveFactor.
                            expect(r.computed).to.eq(100);
                        });
                    });
                });
            });
        });
    });

    // ------------------------------------------------------------------ reach

    it("reach is 0 for a being with no melee modes", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return a.logic.reach;
            }).should("eq", 0);
        });
    });

    it("reach equals a melee mode's length plus the body reachBase", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", meleeTechnique(5)).then(() => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return a.logic.reach;
                }).should("eq", 5); // 5 (mode length) + 0 (Basic Folk body reachBase)
            });
        });
    });

    it("holding a longer weapon extends reach beyond the unarmed technique", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", meleeTechnique(5)).then(() => {
                cy.createItemOn(actor, "weapongear", meleeWeapon(8)).then(
                    (weapon) => {
                        // Not held yet: only the technique's reach counts.
                        // 5 (mode length) + 0 (Basic Folk body reachBase).
                        cy.prepare(actor);
                        cy.foundry((win) => {
                            const a = win.game.actors.get(actor.id);
                            return a.logic.reach;
                        }).should("eq", 5);

                        // Held: the longer weapon mode becomes available.
                        // 8 (mode length) + 0 (Basic Folk body reachBase).
                        cy.runAction(weapon, "holdItem");
                        cy.prepare(actor);
                        cy.foundry((win) => {
                            const a = win.game.actors.get(actor.id);
                            return a.logic.reach;
                        }).should("eq", 8);
                    },
                );
            });
        });
    });
});
