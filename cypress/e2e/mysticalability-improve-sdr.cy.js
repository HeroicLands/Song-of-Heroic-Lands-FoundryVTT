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
 * Mystical Ability improvement flag and Skill Development Roll (#1130).
 *
 * A Mystical Ability with no Associated Skill carries a mastery level of its
 * own, so it develops exactly the way a Skill does — the same
 * `toggleImproveFlag` / `improveWithSDR` executors, the same persistence. One
 * that borrows its mastery level from a Skill offers neither, and improving an
 * ability must never write to the Skill it is associated with.
 *
 * This drives the live `.logic` through the real Foundry persistence path with
 * forced dice, then asserts the persisted `system` fields — what the unit suite
 * can only mock.
 */
describe("mystical ability improvement (#1130)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    /** A self-governed ability: no assocSkillCode, so ML 50 is its own. */
    function makeSelfGovernedAbility(actor, overrides = {}) {
        return cy.createItemOn(actor, "mysticalability", {
            name: "Sixth Sense",
            system: {
                shortcode: "sixs",
                subType: "arcanetalent",
                assocSkillCode: null,
                masteryLevelBase: 50,
                improveFlag: true,
                ...overrides,
            },
        });
    }

    function runSdr(actor, ability, forced) {
        return cy.foundry(async (win) => {
            const a = win.game.actors.get(actor.id).items.get(ability.id);
            win.sohl.entity.roll.SimpleRoll.forceValues(forced);
            // improveWithSDR opens no dialog; call with no explicit context so
            // executeAction builds the real one, exactly as the context-menu
            // invocation does.
            await a.logic.executeAction("improveWithSDR");
            const sys = win.game.actors.get(actor.id).items.get(ability.id).system;
            return {
                masteryLevelBase: sys.masteryLevelBase,
                improveFlag: sys.improveFlag,
            };
        });
    }

    it("raises masteryLevelBase and clears improveFlag on a successful roll", () => {
        cy.importActor().then((actor) => {
            makeSelfGovernedAbility(actor).then((ability) => {
                cy.prepare(actor);
                // No Skill Base of its own, so the forced d100 is the whole
                // roll: 100 > 50 → success.
                runSdr(actor, ability, 100).should((r) => {
                    expect(r.masteryLevelBase, "base raised by sdrIncr (1)").to.eq(51);
                    expect(r.improveFlag, "flag cleared after roll").to.be.false;
                });
            });
        });
    });

    it("clears improveFlag without raising masteryLevelBase on a failed roll", () => {
        cy.importActor().then((actor) => {
            makeSelfGovernedAbility(actor).then((ability) => {
                cy.prepare(actor);
                runSdr(actor, ability, 5).should((r) => {
                    expect(r.masteryLevelBase, "base unchanged").to.eq(50);
                    expect(r.improveFlag, "flag cleared after roll").to.be.false;
                });
            });
        });
    });

    it("toggles the improve flag on a self-governed ability", () => {
        cy.importActor().then((actor) => {
            makeSelfGovernedAbility(actor, { improveFlag: false }).then((ability) => {
                cy.prepare(actor);
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id).items.get(ability.id);
                    await a.logic.executeAction("toggleImproveFlag");
                    return win.game.actors.get(actor.id).items.get(ability.id).system.improveFlag;
                }).should("be.true");
            });
        });
    });

    it("offers no improve actions on an ability governed by a skill, and never writes to that skill", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Spellcraft",
                system: { shortcode: "spcr", masteryLevelBase: 70 },
            }).then((skill) => {
                cy.createItemOn(actor, "mysticalability", {
                    name: "Fire Dart",
                    system: {
                        shortcode: "fdrt",
                        subType: "arcaneincantation",
                        assocSkillCode: "spcr",
                        masteryLevelBase: 5,
                        improveFlag: true,
                        levelBase: null,
                    },
                }).then((ability) => {
                    cy.prepare(actor);
                    // The ability's EML comes from the skill, so it has nothing
                    // of its own to raise — `canImprove` is what hides the ☆
                    // star and gates every improve executor.
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id).items.get(ability.id);
                        return {
                            usesOwn: a.logic.usesOwnMasteryLevel,
                            canImprove: a.logic.canImprove,
                            eml: a.logic.masteryLevel.effective,
                        };
                    }).should((r) => {
                        expect(r.usesOwn, "borrows its mastery level").to.be.false;
                        expect(r.canImprove, "improvement not offered").to.be.false;
                        expect(r.eml, "EML drawn from the skill").to.eq(70);
                    });

                    // Reached anyway (a macro, a script) the SDR is harmless:
                    // it writes only to the ability's own — and here unused —
                    // masteryLevelBase. The associated skill is never touched,
                    // and the ability's EML still comes from that skill.
                    runSdr(actor, ability, 100);
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const items = win.game.actors.get(actor.id).items;
                        return {
                            skillBase: items.get(skill.id).system.masteryLevelBase,
                            skillFlag: items.get(skill.id).system.improveFlag,
                            eml: items.get(ability.id).logic.masteryLevel.effective,
                        };
                    }).should((r) => {
                        expect(r.skillBase, "skill mastery untouched").to.eq(70);
                        expect(r.skillFlag, "skill flag untouched").to.be.false;
                        expect(r.eml, "the ability's EML still comes from the skill").to.eq(70);
                    });
                });
            });
        });
    });
});
