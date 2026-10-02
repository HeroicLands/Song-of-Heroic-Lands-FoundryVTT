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
 * Two body-structure mechanics driven end to end against shipped content rather
 * than a fixture: the roles an **attribute** declares, and the mishap flags an
 * **anatomy** declares. The derivations themselves are unit-tested; what is
 * proved here is that the compendium a player installs carries the values that
 * code reads.
 *
 * Basic Folk is the humanoid the suite imports. Its Right and Left Arm parts
 * hold the Manipulator role and its legs hold Locomotor, so a wound placed on a
 * real arm or leg location exercises both halves.
 *
 * Companion to `strikemode-limb-impairment.cy.js`, which drives the per-part
 * gating a weapon strike mode uses; this is the role-gated half, for an
 * attribute rather than a skill.
 */

/** The injury level that makes a struck part unusable (`G5`). */
const GRIEVOUS = 5;

/** An attribute item on an actor, found by its shortcode. */
function attributeItem(win, actorId, shortcode) {
    return win.game.actors
        .get(actorId)
        .items.find((i) => i.type === "attribute" && i.system.shortcode === shortcode);
}

/** Every hit-location shortcode belonging to the parts holding `role`. */
function locationCodesForRole(win, actorId, role) {
    return win.game.actors
        .get(actorId)
        .logic.body.structure.getPartsByRole(role)
        .flatMap((part) => part.locations.map((l) => l.shortcode));
}

/** Wound every location of every part holding `role`, at `level`. */
function woundRole(actor, role, level) {
    return cy
        .foundry((win) => locationCodesForRole(win, actor.id, role))
        .then((codes) => {
            expect(codes.length, `Basic Folk has ${role} locations`).to.be.greaterThan(0);
            for (const code of codes) {
                cy.createItemOn(actor, "trauma", {
                    name: `Wound ${code}`,
                    system: {
                        subType: "injury",
                        levelBase: level,
                        bodyLocationCode: code,
                    },
                });
            }
            cy.prepare(actor);
        });
}

/**
 * Run an attribute's Success Test headless and report the outcome flags. An
 * automatic Critical Failure is a critical that is not a success — the same
 * shape `strikemode-limb-impairment.cy.js` asserts for the per-part gate.
 */
function attributeTest(actor, shortcode) {
    return cy.foundry(async (win) => {
        const a = win.game.actors.get(actor.id);
        const attr = attributeItem(win, actor.id, shortcode);
        expect(attr, `the ${shortcode} attribute is on the sheet`).to.exist;
        const CTX = win.sohl.entity.action.SohlActionContext;
        const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
        // A roll that comfortably succeeds on its own, so a critical failure can
        // only have come from the impairment gate rather than from the dice.
        SimpleRoll.forceValues(1);
        const result = await attr.logic.successTest(
            new CTX({
                speaker: a.getSpeaker(),
                type: "attribute-impairment-gate",
                title: shortcode,
                skipDialog: true,
                noChat: true,
            }),
        );
        SimpleRoll.clearForced();
        return {
            isCritical: result?.isCritical ?? null,
            isSuccess: result?.isSuccess ?? null,
        };
    });
}

/** Resolve a blow at a named location and report its mishap dispositions. */
function injuryAt(actor, role, impact) {
    return cy.foundry((win) => {
        const structure = win.game.actors.get(actor.id).logic.body.structure;
        const code = locationCodesForRole(win, actor.id, role)[0];
        const location = structure.getAllLocations().find((l) => l.shortcode === code);
        expect(location, `a ${role} location resolves`).to.exist;
        const injury = win.sohl.entity.body.resolveInjury({
            body: structure,
            location,
            aspect: "blunt",
            impact,
            // Protection is a property of the shipped anatomy and of whatever is
            // worn; pinned here so the injury level is the impact's alone.
            armorValue: 0,
        });
        return { level: injury.level, fumble: injury.fumble, stumble: injury.stumble };
    });
}

describe("attribute impairment and mishap flags, from shipped content", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("the physical attributes declare the roles their tests depend on", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const read = (code) =>
                    attributeItem(win, actor.id, code)?.system?.impairedByRoles ?? null;
                return { str: read("str"), dex: read("dex"), agl: read("agl"), rea: read("rea") };
            }).should((roles) => {
                // Strength is whole-body exertion; Dexterity is the hands;
                // Agility is the legs (the worked example in the Body Structure
                // rules); Reasoning is the brain alone.
                expect(roles.str, "Strength").to.include.members(["manipulator", "locomotor"]);
                expect(roles.dex, "Dexterity").to.include("manipulator");
                expect(roles.dex, "Dexterity is not legs").to.not.include("locomotor");
                expect(roles.agl, "Agility").to.include("locomotor");
                expect(roles.rea, "Reasoning").to.deep.equal(["vital"]);
            });
        });
    });

    it("a Dexterity test auto-Critically-Fails once both arms are unusable", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            const actor = this.actor;
            cy.prepare(actor);
            // Unwounded first: the same forced roll must succeed, or the case
            // below would prove nothing.
            attributeTest(actor, "dex").should((r) => {
                expect(r.isSuccess, "an unwounded Dexterity test succeeds").to.be.true;
                expect(r.isCritical, "and is no critical failure").to.not.equal(true);
            });
            woundRole(actor, "manipulator", GRIEVOUS);
            cy.foundry((win) => [...win.game.actors.get(actor.id).logic.unusableRoles()]).should(
                "include",
                "manipulator",
            );
            attributeTest(actor, "dex").should((r) => {
                expect(r.isCritical, "auto-Critical-Failure").to.be.true;
                expect(r.isSuccess, "not a success").to.be.false;
            });
        });
    });

    it("a Reasoning test survives the same wounds, naming no limb", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            const actor = this.actor;
            woundRole(actor, "manipulator", GRIEVOUS);
            attributeTest(actor, "rea").should((r) => {
                expect(r.isSuccess, "Reasoning is unharmed by a ruined arm").to.be.true;
            });
        });
    });

    it("a serious wound to an arm location calls for a Fumble Test", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.prepare(this.actor);
            injuryAt(this.actor, "manipulator", 11).should((injury) => {
                expect(injury.level, "a serious wound").to.be.within(2, 3);
                expect(injury.fumble, "fumble is in question").to.equal("roll");
                expect(injury.stumble, "an arm threatens no stumble").to.equal("none");
            });
        });
    });

    it("a grievous wound to a leg location stumbles outright", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.prepare(this.actor);
            injuryAt(this.actor, "locomotor", 40).should((injury) => {
                expect(injury.level, "a grievous wound").to.be.at.least(4);
                expect(injury.stumble, "stumble is certain").to.equal("auto");
                expect(injury.fumble, "a leg threatens no fumble").to.equal("none");
            });
        });
    });
});
