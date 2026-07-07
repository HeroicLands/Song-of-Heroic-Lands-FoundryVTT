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
 * Scenario 5 (head): combat setup — create a combat over two tokens, start it,
 * seed combatant groups, and advance turns/rounds.
 *
 * Combatants receive `SohlCombatantDataModel` (and thus `.logic`) via the `base`
 * type registration (fix for #142); before that they fell back to the typeless
 * `base` model with no `system.logic` and group seeding crashed.
 */

describe("combat setup", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("creates and activates a combat document", () => {
        cy.createScene({ name: "arena" }).then((scene) => {
            cy.foundry((win) =>
                win.Combat.create(
                    win.JSON.parse(
                        JSON.stringify({ scene: scene.id, active: true }),
                    ),
                ),
            ).then((combat) => {
                expect(combat, "combat document").to.exist;
                cy.foundry((win) => {
                    const c = win.game.combats.get(combat.id);
                    return { exists: !!c, active: c?.active };
                }).then((r) => {
                    expect(r.exists).to.be.true;
                    expect(r.active, "is the active combat").to.be.true;
                });
            });
        });
    });

    describe("combat with combatants", () => {
        function twoTokensInCombat() {
            cy.createActor("being", {
                name: "attacker",
                system: { defaultCombatGroup: "Attackers" },
            }).as("a");
            cy.createActor("being", {
                name: "defender",
                system: { defaultCombatGroup: "Defenders" },
            }).as("b");
            cy.createScene({ name: "arena" }).as("scene");
            cy.then(function () {
                cy.placeAdjacentTokens(this.scene, this.a, this.b).as("tokens");
            });
        }

        it("registers both combatants with logic and starts the combat", () => {
            twoTokensInCombat();
            cy.then(function () {
                cy.createCombatWith(this.tokens).then((combat) => {
                    cy.foundry((win) => {
                        const c = win.game.combats.get(combat.id);
                        return {
                            combatants: c.combatants.size,
                            started: c.started,
                            // The #142 fix: every combatant receives its data
                            // model, so `system.logic` (SohlCombatantLogic) is
                            // present. (`sohl.currentCombatCombatantLogics` is
                            // not asserted here — it reads the *viewed* combat
                            // via `game.combat`, which needs a canvas viewport
                            // absent in headless runs.)
                            allHaveLogic: c.combatants.contents.every(
                                (cb) => !!cb.system?.logic,
                            ),
                        };
                    }).then((r) => {
                        expect(r.combatants, "two combatants").to.eq(2);
                        expect(r.started, "combat started").to.be.true;
                        expect(r.allHaveLogic, "combatants have logic").to.be
                            .true;
                    });
                });
            });
        });

        it("seeds combatant groups and derives enemy relation across groups", () => {
            twoTokensInCombat();
            cy.then(function () {
                cy.createCombatWith(this.tokens).then((combat) => {
                    cy.foundry(async (win) => {
                        const c = win.game.combats.get(combat.id);
                        // Group seeding runs async in the post-create hook
                        // (`void seedCombatantGroups`), so poll until assigned.
                        for (let i = 0; i < 50; i++) {
                            const [a, b] = c.combatants.contents;
                            if (a.groupId && b.groupId) break;
                            await new Promise((r) => setTimeout(r, 100));
                        }
                        const [c1, c2] = c.combatants.contents;
                        return {
                            g1: c1.groupId ?? null,
                            g2: c2.groupId ?? null,
                            enemies: c1.logic.isEnemyOf(c2.logic),
                        };
                    }).then((r) => {
                        expect(r.g1, "combatant 1 grouped").to.not.be.null;
                        expect(r.g2, "combatant 2 grouped").to.not.be.null;
                        expect(r.g1).to.not.eq(r.g2);
                        expect(r.enemies, "different groups are enemies").to.be
                            .true;
                    });
                });
            });
        });

        it("advances turn and round", () => {
            twoTokensInCombat();
            cy.then(function () {
                cy.createCombatWith(this.tokens).then((combat) => {
                    cy.advanceTurn(combat);
                    cy.advanceRound(combat);
                    cy.foundry(
                        (win) => win.game.combats.get(combat.id).round,
                    ).should("be.greaterThan", 1);
                });
            });
        });
    });
});
