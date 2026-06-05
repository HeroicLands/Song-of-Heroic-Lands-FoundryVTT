/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    resolveStrikeModeML,
    resolveStrikeModeImpact,
    buildDamageCardData,
    buildAttackResult,
    resolveAttackTarget,
} from "@src/document/actor/foundry/combat-actions";
import { IMPACT_ASPECT, TEST_TYPE } from "@src/utils/constants";
import { AttackResult } from "@src/domain/result/AttackResult";
import { CombatModifier } from "@src/domain/modifier/CombatModifier";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import { SimpleRoll } from "@src/utils/SimpleRoll";

const attackerParent = {
    data: { kind: "weapongear" },
    name: "Broadsword",
    label: "Broadsword",
    item: { logic: { availableFate: [] } },
} as any;

function makeActor(items: any[]): any {
    return {
        items: {
            get: (id: string) => items.find((i) => i.id === id),
        },
    };
}

function makeWeaponWithModes(weaponId: string, modes: any[]): any {
    return {
        id: weaponId,
        logic: { strikeModes: modes },
    };
}

const ATK_MOD = Symbol("attack");
const BLK_MOD = Symbol("block");
const CX_MOD = Symbol("counterstrike");

const meleeMode = (id: string) => ({
    id,
    attack: ATK_MOD,
    defense: { block: BLK_MOD, counterstrike: CX_MOD },
});

const missileMode = (id: string) => ({
    id,
    attack: ATK_MOD,
});

describe("resolveStrikeModeML", () => {
    it("returns the attack modifier for testKind 'attack'", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "attack")).toBe(
            ATK_MOD,
        );
    });

    it("returns the block modifier for testKind 'block'", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "block")).toBe(BLK_MOD);
    });

    it("returns the counterstrike modifier for testKind 'counterstrike'", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(
            resolveStrikeModeML(actor, "wp1", "sm1", "counterstrike"),
        ).toBe(CX_MOD);
    });

    it("returns null when the item does not exist on the actor", () => {
        const actor = makeActor([]);
        expect(resolveStrikeModeML(actor, "missing", "sm1", "attack")).toBeNull();
    });

    it("returns null when the item has no logic.strikeModes array", () => {
        const actor = makeActor([{ id: "wp1", logic: {} }]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "attack")).toBeNull();
    });

    it("returns null when the strike mode id is not found", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "other", "attack")).toBeNull();
    });

    it("returns null for 'block' on a missile strike mode without defense", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [missileMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "block")).toBeNull();
    });

    it("returns null for 'counterstrike' on a missile strike mode", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [missileMode("sm1")]),
        ]);
        expect(
            resolveStrikeModeML(actor, "wp1", "sm1", "counterstrike"),
        ).toBeNull();
    });

    it("returns null for an unknown testKind", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(
            resolveStrikeModeML(actor, "wp1", "sm1", "bogus" as any),
        ).toBeNull();
    });

    it("works with combat techniques (items without a 'weapon' role)", () => {
        // Combat techniques carry strike modes the same way weapons do.
        const actor = makeActor([
            makeWeaponWithModes("ct1", [meleeMode("brawl")]),
        ]);
        expect(resolveStrikeModeML(actor, "ct1", "brawl", "attack")).toBe(
            ATK_MOD,
        );
    });

    it("finds the right mode when an item has multiple strike modes", () => {
        const m1 = meleeMode("m1");
        const m2 = meleeMode("m2");
        (m2 as any).attack = Symbol("m2-attack");
        const actor = makeActor([makeWeaponWithModes("wp1", [m1, m2])]);
        expect(resolveStrikeModeML(actor, "wp1", "m2", "attack")).toBe(
            (m2 as any).attack,
        );
    });
});

const impactMode = (id: string, impact: any) => ({ id, impact });

describe("resolveStrikeModeImpact", () => {
    it("returns the impact modifier for a live strike mode", () => {
        const impact = { disabled: "" };
        const actor = makeActor([
            makeWeaponWithModes("wp1", [impactMode("sm1", impact)]),
        ]);
        expect(resolveStrikeModeImpact(actor, "wp1", "sm1")).toBe(impact);
    });

    it("returns null when the impact modifier is disabled", () => {
        const impact = { disabled: "SOHL.ImpactModifier.DISABLED" };
        const actor = makeActor([
            makeWeaponWithModes("wp1", [impactMode("sm1", impact)]),
        ]);
        expect(resolveStrikeModeImpact(actor, "wp1", "sm1")).toBeNull();
    });

    it("returns null when the item, strike mode, or impact is missing", () => {
        expect(resolveStrikeModeImpact(makeActor([]), "wp1", "sm1")).toBeNull();
        const actor = makeActor([
            makeWeaponWithModes("wp1", [{ id: "sm1" }]),
        ]);
        expect(resolveStrikeModeImpact(actor, "wp1", "sm1")).toBeNull();
        expect(resolveStrikeModeImpact(actor, "wp1", "nope")).toBeNull();
    });
});

describe("buildDamageCardData", () => {
    const base = {
        title: "Broadsword – Cut",
        actorId: "atk1",
        sourceActorUuid: "Actor.atk1",
        impactLabel: "2d6+3e",
        rollResult: "[3, 5] + 3",
        impact: 11,
        aspect: IMPACT_ASPECT.EDGED,
    };

    it("serializes only impact + aspect into the injury request (assisted)", () => {
        const data = buildDamageCardData({
            ...base,
            target: { name: "Goblin", actorUuid: "Actor.def1" },
        });
        expect(data).toMatchObject({
            title: "Broadsword – Cut",
            impactLabel: "2d6+3e",
            rollResult: "[3, 5] + 3",
            impact: 11,
            aspect: IMPACT_ASPECT.EDGED,
            hasTarget: true,
            targetName: "Goblin",
            handlerUuid: "Actor.def1",
        });
        expect(JSON.parse(data.testResultJson as string)).toEqual({
            impact: 11,
            aspect: IMPACT_ASPECT.EDGED,
        });
    });

    it("omits target wiring when nothing is targeted", () => {
        const data = buildDamageCardData({ ...base, target: null });
        expect(data.hasTarget).toBe(false);
        expect(data.handlerUuid).toBe("");
        expect(data.targetName).toBe("");
    });
});

describe("buildAttackResult", () => {
    function makeAttackML(base: number): CombatModifier {
        return new CombatModifier({ baseValue: base } as any, {
            parent: attackerParent,
        });
    }
    function makeImpact(): ImpactModifier {
        return new ImpactModifier(
            {
                roll: { numDice: 2, dieFaces: 6, modifier: 5 },
                aspect: IMPACT_ASPECT.EDGED,
            } as any,
            { parent: attackerParent },
        );
    }

    it("assembles an AttackResult from the strike-mode attack ML and impact", () => {
        const attackML = makeAttackML(54);
        const impact = makeImpact();
        const roll = new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [44] });

        const ar = buildAttackResult({
            attackML,
            impact,
            parent: attackerParent,
            token: null,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            allowedDefenses: ["block", "dodge", "counterstrike", "ignore"],
            roll,
        });

        expect(ar).toBeInstanceOf(AttackResult);
        expect(ar.testType).toBe(TEST_TYPE.AUTOCOMBATMELEE.id);
        expect(ar.roll.total).toBe(44);
        expect(ar.masteryLevelModifier.constrainedEffective).toBe(54);
        expect(ar.impactModifier.die).toBe(6);
        expect(ar.impactModifier.numDice).toBe(2);
        expect([...ar.allowedDefenses].sort()).toEqual([
            "block",
            "counterstrike",
            "dodge",
            "ignore",
        ]);
    });

    it("clones the modifiers so mutating the result does not touch the strike mode", () => {
        const attackML = makeAttackML(54);
        const impact = makeImpact();

        const ar = buildAttackResult({
            attackML,
            impact,
            parent: attackerParent,
            token: null,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            allowedDefenses: ["dodge"],
            roll: new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [1] }),
        });

        expect(ar.masteryLevelModifier).not.toBe(attackML);
        expect(ar.impactModifier).not.toBe(impact);
        // Independent: mutating the result's modifier leaves the source alone.
        ar.masteryLevelModifier.successLevelMod = 3;
        expect(attackML.successLevelMod).toBe(0);
        expect(ar.masteryLevelModifier.constrainedEffective).toBe(54);
    });
});

describe("resolveAttackTarget", () => {
    const inCombat = (_t: any) => true;
    const notInCombat = (_t: any) => false;

    it("returns the single targeted token when it is in combat", () => {
        const t = { id: "t1" };
        expect(resolveAttackTarget([t], inCombat)).toBe(t);
    });

    it("throws when nothing is targeted", () => {
        expect(() => resolveAttackTarget([], inCombat)).toThrow(/one target/i);
    });

    it("throws when more than one token is targeted", () => {
        expect(() =>
            resolveAttackTarget([{ id: "a" }, { id: "b" }], inCombat),
        ).toThrow(/one target/i);
    });

    it("throws when the target is not in combat", () => {
        expect(() => resolveAttackTarget([{ id: "t1" }], notInCombat)).toThrow(
            /combat/i,
        );
    });
});
