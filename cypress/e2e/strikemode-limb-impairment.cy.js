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
 * Strike-mode required-limb impairment (#628).
 *
 * A weapon strike mode depends on the *specific* body part(s) holding the weapon,
 * not on a role — so the impairment of that held limb gates the roll. This spec
 * drives the full runtime chain the unit tests cannot: `heldBy` → the being's
 * `bodyPartImpairments` → `GearLogic.heldLimbImpairments` → the `successTest`
 * auto-Critical-Failure / mastery-level penalty seam. It is the per-part
 * counterpart to the role-based skill/attribute gating (#568), which
 * `combattechnique-skill.cy.js` and `injury.cy.js` already exercise.
 *
 * Basic Folk has a body with Right/Left Arm parts (`canHoldItem`), so holding the
 * weapon assigns it to a real limb whose hit locations can then be injured.
 */

/** Minimal weapongear with the correct nested defense schema (avoids #246). */
const INLINE_WEAPON = {
    name: "Test Sword",
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
                lengthBase: 3,
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
    },
};

/**
 * Import Basic Folk, give it the held weapon, and injure the limb holding it at
 * the given severity. Yields `{ actor, weapon }` via the callback once prepared.
 *
 * @param {number} level - Injury level to inflict on the holding limb
 *   (5 = grievous → unusable; 2 = serious → −10 but usable).
 */
function heldWeaponInjuredLimb(level, cb) {
    cy.importActor().then((actor) => {
        cy.createItemOn(actor, "weapongear", INLINE_WEAPON).then((weapon) => {
            cy.runAction(weapon, "holdItem");
            cy.prepare(actor);
            // Resolve a hit location on the limb that is now holding the weapon.
            cy.foundry((win) => {
                const w = win.game.actors.get(actor.id).items.get(weapon.id);
                const heldBy = w.logic.heldBy;
                expect(
                    heldBy.length,
                    "a limb holds the weapon",
                ).to.be.greaterThan(0);
                return heldBy[0].locations[0].shortcode;
            }).then((loc) => {
                // Inject the injury directly (createEmbeddedDocuments bypasses the
                // healing-check offer that the action path would surface).
                cy.createItemOn(actor, "trauma", {
                    name: "Limb Wound",
                    system: {
                        subType: "physical",
                        levelBase: level,
                        bodyLocationCode: loc,
                    },
                });
                cy.prepare(actor);
                cb({ actor, weapon });
            });
        });
    });
}

describe("strike-mode required-limb impairment (#628)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("an unusable held limb makes the weapon's attack auto-Critically-Fail", () => {
        heldWeaponInjuredLimb(5, ({ actor, weapon }) => {
            // The new plumbing: the holding limb reads unusable.
            cy.foundry((win) => {
                const w = win.game.actors.get(actor.id).items.get(weapon.id);
                const imps = w.logic.heldLimbImpairments;
                return {
                    n: imps.length,
                    allUsable: imps.every((i) => i.usable),
                };
            }).should((r) => {
                expect(r.n, "a holding limb resolves").to.be.greaterThan(0);
                expect(r.allUsable, "the grievously injured limb is unusable")
                    .to.be.false;
            });

            // End-to-end: the attack test resolves as an automatic Critical Failure.
            cy.foundry((win) => {
                const w = win.game.actors.get(actor.id).items.get(weapon.id);
                const sm = w.logic.strikeModes[0];
                return w.logic
                    .executeAction("attackTest", {
                        skipDialog: true,
                        noChat: true,
                        scope: { strikeModeId: sm.id, situationalModifier: 0 },
                    })
                    .then((res) => ({
                        isCritical: res?.isCritical ?? null,
                        isSuccess: res?.isSuccess ?? null,
                    }));
            }).should((r) => {
                expect(r.isCritical, "auto-Critical-Failure").to.be.true;
                expect(r.isSuccess, "not a success").to.be.false;
            });
        });
    });

    it("an impaired-but-usable held limb penalizes the attack mastery level by −10", () => {
        heldWeaponInjuredLimb(2, ({ actor, weapon }) => {
            // The holding limb is impaired (−10) but still usable.
            cy.foundry((win) => {
                const w = win.game.actors.get(actor.id).items.get(weapon.id);
                const imps = w.logic.heldLimbImpairments;
                return {
                    usable: imps.every((i) => i.usable),
                    worst: Math.min(0, ...imps.map((i) => i.impairment)),
                };
            }).should((r) => {
                expect(r.usable, "the serious injury leaves the limb usable").to
                    .be.true;
                expect(r.worst, "serious injury impairs by −10").to.eq(-10);
            });

            // The attack test's effective mastery level is reduced by exactly the
            // held-limb penalty — the live strike-mode ML is unchanged, so the
            // difference is the −10 folded in by successTest.
            cy.foundry((win) => {
                const w = win.game.actors.get(actor.id).items.get(weapon.id);
                const sm = w.logic.strikeModes[0];
                const baseAttack = sm.attack.effective;
                return w.logic
                    .executeAction("attackTest", {
                        skipDialog: true,
                        noChat: true,
                        scope: { strikeModeId: sm.id, situationalModifier: 0 },
                    })
                    .then((res) => ({
                        baseAttack,
                        resultMl:
                            res ? res.masteryLevelModifier.effective : null,
                    }));
            }).should((r) => {
                expect(r.resultMl, "the test resolved").to.not.equal(null);
                expect(
                    r.resultMl,
                    "held-limb impairment folds −10 into the attack ML",
                ).to.eq(r.baseAttack - 10);
            });
        });
    });
});
