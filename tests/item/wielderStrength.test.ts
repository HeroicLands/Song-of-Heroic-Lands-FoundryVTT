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
 * The Strength Impact Modifier reaching a real weapon on a real wielder
 * (#1253) — the wiring, as opposed to the rule, which
 * `tests/domain/strikemode/strengthImpact.test.ts` pins down.
 */

import { describe, it, expect } from "vitest";
import { makeItemLogic, makeMockActor, makeAttributeStub } from "@tests/mocks/logicHarness";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";

const MELEE = {
    type: "melee",
    shortcode: "cut",
    name: "Cut",
    minParts: 1,
    assocSkillCode: "swd",
    lengthBase: 5,
    attack: { spread: 10, modifier: 0 },
    impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "edged" },
    traits: {},
    defense: { block: { modifier: 0 }, counterstrike: { modifier: 0 } },
};

const BOW = {
    type: "missile",
    shortcode: "shoot",
    name: "Shoot",
    minParts: 2,
    assocSkillCode: "bow",
    projectileType: "arrow",
    maxVolleyMult: 1,
    baseRangeBase: 100,
    drawBase: 60,
    attack: { spread: 10, modifier: 0 },
    impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "piercing" },
    traits: {},
};

/** A weapon on an actor of the given Strength, run through its lifecycle. */
function armedWielder(strength: number, strikeMode: object = MELEE) {
    const actor = makeMockActor();
    actor.items.set("str1", makeAttributeStub("str", strength));
    const weapon = makeItemLogic(
        WeaponGearLogic,
        "weapongear",
        { strikeModes: [strikeMode] },
        { actor },
    );
    weapon.initialize();
    weapon.evaluate();
    weapon.finalize();
    return weapon;
}

describe("Strength reaches a wielded weapon (#1253)", () => {
    it("a stronger wielder hits harder with the same weapon", () => {
        // The regression that prompted the issue: two wielders differing only
        // in Strength dealt identical impact.
        const weak = armedWielder(9).strikeModes[0]!;
        const strong = armedWielder(16).strikeModes[0]!;
        expect(weak.impact.effective).toBe(-1);
        expect(strong.impact.effective).toBe(3);
    });

    it("an average wielder is the unmodified baseline", () => {
        expect(armedWielder(11).strikeModes[0]!.impact.effective).toBe(0);
    });

    it("leaves a bow alone — the launcher supplies the force, not the arm", () => {
        expect(armedWielder(20, BOW).strikeModes[0]!.impact.effective).toBe(0);
    });

    it("does not double-count when the lifecycle runs again", () => {
        const actor = makeMockActor();
        actor.items.set("str1", makeAttributeStub("str", 16));
        const weapon = makeItemLogic(
            WeaponGearLogic,
            "weapongear",
            { strikeModes: [MELEE] },
            { actor },
        );
        weapon.initialize();
        weapon.evaluate();
        weapon.finalize();
        weapon.finalize();
        expect(weapon.strikeModes[0]!.impact.effective).toBe(3);
    });

    it("is inert on an unowned weapon — no wielder, no Strength", () => {
        const weapon = makeItemLogic(WeaponGearLogic, "weapongear", {
            strikeModes: [MELEE],
        });
        weapon.initialize();
        weapon.evaluate();
        weapon.finalize();
        expect(weapon.strikeModes[0]!.impact.effective).toBe(0);
    });

    it("is inert on a wielder with no Strength attribute", () => {
        // A Structure or Vehicle has no attributes; guessing a score for one
        // would silently weaken every strike mode it carries.
        const actor = makeMockActor();
        const weapon = makeItemLogic(
            WeaponGearLogic,
            "weapongear",
            { strikeModes: [MELEE] },
            { actor },
        );
        weapon.initialize();
        weapon.evaluate();
        weapon.finalize();
        expect(weapon.strikeModes[0]!.impact.effective).toBe(0);
    });
});

describe("Strength reaches a combat technique (#1253)", () => {
    /** A combat-technique skill on an actor of the given Strength. */
    function puncher(strength: number) {
        const actor = makeMockActor();
        actor.items.set("str1", makeAttributeStub("str", strength));
        const skill = makeItemLogic(
            SkillLogic,
            "skill",
            {
                subType: "combattechnique",
                masteryLevelBase: 30,
                strikeMode: {
                    ...MELEE,
                    shortcode: "punch",
                    name: "Punch",
                    assocSkillCode: "melee",
                    lengthBase: 1,
                    impactBase: {
                        numDice: 1,
                        die: 6,
                        modifier: -3,
                        aspect: "blunt",
                    },
                },
            },
            { actor },
        );
        skill.initialize();
        skill.evaluate();
        skill.finalize();
        return skill;
    }

    it("a strong puncher hits harder than a weak one", () => {
        // The Grukar case: replacing their bespoke Strength-baked Punch with
        // the shared one made every Grukar punch identically until this landed.
        expect(puncher(16).strikeMode!.impact.effective).toBe(-3 + 3);
        expect(puncher(9).strikeMode!.impact.effective).toBe(-3 - 1);
    });
});
