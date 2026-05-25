/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { resolveStrikeModeML } from "@src/document/actor/foundry/combat-actions";

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
