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
} from "@src/document/actor/foundry/combat-actions";
import { IMPACT_ASPECT } from "@src/utils/constants";

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
