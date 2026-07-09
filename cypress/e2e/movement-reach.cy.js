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
 * Movement + reach read paths.
 *
 * Movement: `SohlCombatantLogic.computedMove(medium)` / `displayedMove` read the
 * being's per-medium base move off the lineage. Reach: `BeingLogic.reach` is the
 * greatest reach among currently-available melee modes — combat techniques are
 * always available; a weapon's mode counts only when the weapon is held in at
 * least `minParts` limbs (the hold path landed in #179 and was made
 * corruption-safe in #247).
 *
 * Basic Folk's lineage still uses the legacy `movementProfiles` format with no
 * `moveBase` / `reachBase` (#242), so both derive to 0 on a bare import; the
 * movement tests seed `moveBase` on the lineage, and reach is exercised with an
 * inline combat technique / weapon.
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

/** Set a nested field on the actor's lineage item (realm-safe). */
function setLineageField(win, actorId, path, value) {
    const a = win.game.actors.get(actorId);
    const lineage = a.items.find((i) => i.type === "lineage");
    return lineage.update(win.JSON.parse(JSON.stringify({ [path]: value })));
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

    it("computedMove reads the lineage base move for the medium", () => {
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.foundry((win) =>
                    setLineageField(
                        win,
                        actor.id,
                        "system.moveBase.terrestrial",
                        10,
                    ),
                );
                cy.prepare(actor);
                cy.placeToken(scene, actor).then((token) => {
                    cy.createCombatWith([token]).then((combat) => {
                        cy.foundry((win) =>
                            combatantLogic(
                                win,
                                combat.id,
                                actor.id,
                            ).computedMove("terrestrial"),
                        ).should("eq", 10);
                    });
                });
            });
        });
    });

    it("displayedMove reads computedMove for the seeded displayedMedium", () => {
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.foundry((win) =>
                    setLineageField(
                        win,
                        actor.id,
                        "system.moveBase.terrestrial",
                        12,
                    ),
                );
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
                                medium: cbt.data.displayedMedium,
                                displayed: cbt.displayedMove,
                                computed: cbt.computedMove("terrestrial"),
                            };
                        }).should((r) => {
                            expect(r.medium, "seeded displayedMedium").to.eq(
                                "terrestrial",
                            );
                            expect(r.displayed).to.eq(r.computed);
                            expect(r.displayed).to.eq(12);
                        });
                    });
                });
            });
        });
    });

    // moveFactor is stored on the combatant but computedMove does not read it
    // (#252). Guard the current behavior; the intended scaling is RED below.
    it("computedMove currently ignores moveFactor (#252)", () => {
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.foundry((win) =>
                    setLineageField(
                        win,
                        actor.id,
                        "system.moveBase.terrestrial",
                        10,
                    ),
                );
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
                            // Re-read the freshly-prepared logic post-update.
                            return {
                                moveFactor: cbt.logic.data.moveFactor,
                                computed: cbt.logic.computedMove("terrestrial"),
                            };
                        }).should((r) => {
                            expect(r.moveFactor, "moveFactor persisted").to.eq(
                                2,
                            );
                            // Base 10 returned unscaled — moveFactor dropped.
                            expect(r.computed).to.eq(10);
                        });
                    });
                });
            });
        });
    });

    it.skip("computedMove scales base move by moveFactor", () => {
        // RED — blocked by #252: computedMove returns effectiveBaseMove()
        // verbatim and never reads moveFactor, though its docstring says it
        // "accounts for the combatant's situational moveFactor scalar." Once
        // computedMove applies the scalar this asserts the product.
        cy.createScene().then((scene) => {
            cy.importActor().then((actor) => {
                cy.foundry((win) =>
                    setLineageField(
                        win,
                        actor.id,
                        "system.moveBase.terrestrial",
                        10,
                    ),
                );
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
                            return cbt.logic.computedMove("terrestrial");
                        }).should("eq", 20); // 10 base × 2 moveFactor
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

    it("reach equals a combat technique's melee mode length", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", meleeTechnique(5)).then(() => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return a.logic.reach;
                }).should("eq", 5);
            });
        });
    });

    it("holding a longer weapon extends reach beyond the unarmed technique", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", meleeTechnique(5)).then(() => {
                cy.createItemOn(actor, "weapongear", meleeWeapon(8)).then(
                    (weapon) => {
                        // Not held yet: only the technique's reach counts.
                        cy.prepare(actor);
                        cy.foundry((win) => {
                            const a = win.game.actors.get(actor.id);
                            return a.logic.reach;
                        }).should("eq", 5);

                        // Held: the longer weapon mode becomes available.
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
