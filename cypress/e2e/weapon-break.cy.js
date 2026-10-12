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
 * Weapon break on a tied block, resolved against a live weapon.
 *
 * The unit suite rolls the check against a fixture quality. What only a running
 * client proves is that the quality the exchange reads is the weapon item's own
 * — `qualityBase` on the weapongear the blocking strike mode belongs to — and
 * that the attack-result card is built from the rolled verdict.
 */

/** A melee weapongear that can block, rated at `quality`. */
function blockingWeapon(quality) {
    return {
        name: "Arming Sword",
        system: {
            qualityBase: quality,
            strikeModes: [
                {
                    shortcode: "strike",
                    type: "melee",
                    name: "Strike",
                    assocSkillCode: "melee",
                    minParts: 1,
                    attack: { spread: 0, modifier: 0 },
                    impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "edged" },
                    traits: {},
                    lengthBase: 3,
                    defense: {
                        block: { disabled: false, modifier: 0, successLevelMod: 0 },
                        counterstrike: { disabled: false, modifier: 0, successLevelMod: 0 },
                    },
                },
            ],
        },
    };
}

/**
 * Resolve a tied block (both sides a marginal success) made with `weaponId`'s
 * strike mode, with the break dice forced to `dice`, and report what the
 * exchange decided and what the card says about it.
 */
function resolveTiedBlock(win, actorId, weaponId, dice) {
    const actor = win.game.actors.get(actorId);
    const mode = actor.items.get(weaponId).logic.strikeModes[0];
    const impact = new win.sohl.entity.ImpactModifier(
        { roll: { numDice: 1, dieFaces: 6, rolls: [] }, aspect: "edged" },
        { parent: actor.logic },
    ).setBase(2);
    const side = () => ({
        normSuccessLevel: 1,
        successLevel: 1,
        isSuccess: true,
        isCritical: false,
        roll: { total: 50 },
        mishaps: new Set(),
        masteryLevelModifier: { constrainedEffective: 50, deltas: [] },
        label: "test",
        toJSON: () => ({}),
    });
    const attackResult = {
        ...side(),
        impact,
        title: "Broadsword",
        parent: actor.logic,
        speaker: actor.logic.speaker,
        combatant: { name: "Attacker", actorLogic: actor.logic },
        token: null,
    };
    const defendResult = {
        ...side(),
        testType: win.sohl.utils.TEST_TYPE.BLOCK.id,
        mode,
        combatant: { name: "Defender", actorLogic: actor.logic },
        token: null,
    };
    const result = new win.sohl.entity.CombatResult(
        { attackResult, defendResult, speaker: actor.logic.speaker },
        { parent: actor.logic },
    );
    const rolls = win.sohl.entity.roll.SimpleRoll;
    if (rolls.forcedRemaining !== 0) throw new Error("Forced-die queue belongs to another test");
    try {
        rolls.forceValues(...dice);
        result.opposedTestEvaluate();
    } finally {
        rolls.clearForced();
    }
    const { atkCardData } = win.sohl.document.combatant.logic.buildCombatCardData(result);
    return {
        weaponBreakCheck: result.weaponBreakCheck,
        roll: result.weaponBreakRoll ?? null,
        card: {
            checked: atkCardData.defWeaponBreakChecked,
            rolled: atkCardData.defWeaponBreakRolled,
            quality: atkCardData.defWeaponQuality,
            rollValue: atkCardData.defWeaponBreakRoll,
            broke: atkCardData.defWeaponBroke,
        },
    };
}

describe("weapon break on a tied block", () => {
    let actorId;
    before(() => cy.login());
    afterEach(() => {
        cy.foundry(async (win) => {
            const id = actorId;
            actorId = undefined;
            const actor = id && win.game.actors.get(id);
            if (actor) await actor.delete();
            return true;
        });
    });

    function armedDefender(quality) {
        cy.importActor()
            .then((actor) => {
                actorId = actor.id;
                return actor;
            })
            .as("actor");
        cy.then(function () {
            cy.ensureSkillML(this.actor, "melee", 50);
            cy.createItemOn(this.actor, "weapongear", blockingWeapon(quality)).as("weapon");
            cy.prepare(this.actor);
        });
    }

    it("breaks the blocking weapon when 3d6 rolls above its Quality", () => {
        armedDefender(10);
        cy.then(function () {
            cy.foundry((win) =>
                resolveTiedBlock(win, this.actor.id, this.weapon.id, [6, 5, 4]),
            ).should((r) => {
                expect(r.weaponBreakCheck).to.equal("defender");
                expect(r.roll).to.deep.equal({
                    side: "defender",
                    quality: 10,
                    roll: 15,
                    broke: true,
                });
                expect(r.card).to.deep.equal({
                    checked: true,
                    rolled: true,
                    quality: 10,
                    rollValue: 15,
                    broke: true,
                });
            });
        });
    });

    it("leaves the weapon whole when the roll stays within its Quality", () => {
        armedDefender(10);
        cy.then(function () {
            cy.foundry((win) =>
                resolveTiedBlock(win, this.actor.id, this.weapon.id, [2, 3, 4]),
            ).should((r) => {
                expect(r.roll).to.deep.equal({
                    side: "defender",
                    quality: 10,
                    roll: 9,
                    broke: false,
                });
                expect(r.card.broke).to.be.false;
                expect(r.card.rolled).to.be.true;
            });
        });
    });

    it("owes the check without a verdict when the weapon's Quality is unrated", () => {
        armedDefender(0);
        cy.then(function () {
            cy.foundry((win) =>
                resolveTiedBlock(win, this.actor.id, this.weapon.id, [6, 6, 6]),
            ).should((r) => {
                expect(r.weaponBreakCheck).to.equal("defender");
                expect(r.roll, "nothing to roll against").to.equal(null);
                expect(r.card.checked).to.be.true;
                expect(r.card.rolled).to.be.false;
                expect(r.card.broke, "the tie is not a verdict").to.be.false;
            });
        });
    });
});
