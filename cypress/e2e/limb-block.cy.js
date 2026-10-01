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
 * Limb Block, resolved against a live being.
 *
 * The unit suite resolves the exchange against a fixture body. What only a
 * running client proves is the chain either side of it: the shipped Limb Block
 * technique reaches a document carrying the `limbBlock` trait the exchange reads,
 * and the location the exchange settles is a real hit location on the defender's
 * own anatomy.
 */

/** The shipped unarmed defence, and the limb role it is performed with. */
const TECHNIQUE = { shortcode: "limbblock", role: "manipulator" };

/**
 * Resolve a limb-block exchange in the game realm against `actor`'s body, at the
 * given success levels, and report what the exchange decided.
 *
 * Both sides are the minimal shapes `CombatResult` reads — the same seam the
 * unit harness uses — but the strike mode, the impact modifier and the body are
 * all the live client's own.
 */
function resolve(win, actorId, technique, atkLevel, defLevel) {
    const actor = win.game.actors.get(actorId);
    const mode = actor.items.get(technique.id).logic.strikeMode;
    const impact = new win.sohl.entity.ImpactModifier(
        { roll: { numDice: 1, dieFaces: 6, rolls: [] }, aspect: "edged" },
        { parent: actor.logic },
    ).setBase(2);
    const side = (level) => ({
        normSuccessLevel: level,
        isSuccess: level >= 1,
        isCritical: false,
        roll: { total: 50 },
        mishaps: new Set(),
        toJSON: () => ({}),
    });
    const attackResult = {
        ...side(atkLevel),
        impact,
        title: "Broadsword",
        parent: actor.logic,
        speaker: actor.logic.speaker,
    };
    const defendResult = {
        ...side(defLevel),
        // Read from the live client's own vocabulary, so a renamed test type
        // fails here rather than quietly matching nothing.
        testType: win.sohl.utils.TEST_TYPE.BLOCK.id,
        mode,
        combatant: { actorLogic: actor.logic },
    };
    const result = new win.sohl.entity.CombatResult(
        { attackResult, defendResult, speaker: actor.logic.speaker },
        { parent: actor.logic },
    );
    result.opposedTestEvaluate();
    const struck =
        result.blockingLimbLocationCode ?
            actor.logic.body.structure.getLocationByCode(result.blockingLimbLocationCode)
        :   undefined;
    return {
        landsBlow: result.attackerLandsBlow,
        strikesLimb: result.limbBlockStrikesLimb,
        isLimbBlock: result.isLimbBlock,
        weaponBreakCheck: result.weaponBreakCheck,
        locationCode: result.blockingLimbLocationCode,
        // The part the struck location belongs to, and the roles it fills — the
        // blow has to land on a limb the technique could have been made with.
        partCode: struck?.bodyPart?.shortcode ?? "",
        partRoles: struck?.bodyPart?.roles ?? [],
        ward: impact.get("LmbBlk")?.numValue ?? null,
        impactEffective: impact.effective,
    };
}

describe("limb block", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /**
     * Basic Folk, who carries every unarmed technique including Limb Block, with
     * its Melee skill set so the defence has a mastery level to roll.
     */
    function defender() {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.ensureSkillML(this.actor, "melee", 50);
            cy.prepare(this.actor);
            cy.foundry((win) => {
                const technique = win.game.actors
                    .get(this.actor.id)
                    .items.find(
                        (i) => i.type === "skill" && i.system.shortcode === TECHNIQUE.shortcode,
                    );
                if (!technique)
                    throw new Error(`no "${TECHNIQUE.shortcode}" technique on the being`);
                return { id: technique.id };
            }).as("technique");
        });
    }

    it("reaches the client as a blocking technique that cannot attack", () => {
        defender();
        cy.then(function () {
            cy.foundry((win) => {
                const mode = win.game.actors.get(this.actor.id).items.get(this.technique.id)
                    .logic.strikeMode;
                return {
                    limbBlock: mode.traits.limbBlock,
                    blockDisabled: !!mode.defense.block.disabledReason,
                    attackDisabled: !!mode.attack.disabledReason,
                    roles: mode.parent.data.impairedByRoles,
                };
            }).should((r) => {
                expect(r.limbBlock, "the trait the exchange reads").to.be.true;
                expect(r.blockDisabled, "it blocks").to.be.false;
                expect(r.attackDisabled, "it never attacks").to.be.true;
                expect(r.roles).to.deep.equal([TECHNIQUE.role]);
            });
        });
    });

    it("lands a tied blow on one of the defender's own limbs, two points lighter", () => {
        defender();
        cy.then(function () {
            cy.foundry((win) => resolve(win, this.actor.id, this.technique, 1, 1)).should((r) => {
                expect(r.isLimbBlock).to.be.true;
                expect(r.landsBlow, "a tie does not ward").to.be.true;
                expect(r.strikesLimb).to.be.true;
                expect(r.locationCode, "a real hit location").to.not.equal("");
                expect(r.partRoles, "on a limb the technique uses").to.include(TECHNIQUE.role);
                expect(r.ward).to.equal(-2);
                // 1d6+2 becomes 1d6+0; the limb's own armour answers what is left.
                expect(r.impactEffective).to.equal(0);
                expect(r.weaponBreakCheck, "a limb is not a weapon").to.equal("none");
            });
        });
    });

    it("wards a blow it out-levels, and settles no location", () => {
        defender();
        cy.then(function () {
            cy.foundry((win) => resolve(win, this.actor.id, this.technique, 1, 2)).should((r) => {
                expect(r.landsBlow).to.be.false;
                expect(r.strikesLimb).to.be.false;
                expect(r.locationCode).to.equal("");
                expect(r.ward).to.equal(null);
                expect(r.weaponBreakCheck).to.equal("none");
            });
        });
    });

    it("takes an ordinary blow when the attack out-levels it", () => {
        defender();
        cy.then(function () {
            cy.foundry((win) => resolve(win, this.actor.id, this.technique, 2, 1)).should((r) => {
                expect(r.landsBlow).to.be.true;
                expect(r.strikesLimb, "the limb never got there").to.be.false;
                expect(r.locationCode).to.equal("");
                expect(r.ward, "full impact").to.equal(null);
                expect(r.impactEffective).to.equal(2);
            });
        });
    });
});
