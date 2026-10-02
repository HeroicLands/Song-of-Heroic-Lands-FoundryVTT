/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    SHIELD_DEFENSE_ABBREV,
    bestShieldMod,
    isShieldStrikeMode,
    shieldModOf,
    applyShieldDefenseBonus,
} from "@src/entity/strikemode/shieldDefense";

/** A strike mode stub carrying only the trait the rule reads. */
function mode(traits: Record<string, unknown>) {
    return { traits } as never;
}

/** A modifier stub recording the deltas added to it. */
function modifier() {
    const deltas: Array<{ name: string; abbrev: string; value: number }> = [];
    return {
        deltas,
        add(name: string, abbrev: string, value: number) {
            deltas.push({ name, abbrev, value });
        },
    } as never as import("@src/entity/modifier/CombatModifier").CombatModifier & {
        deltas: Array<{ name: string; abbrev: string; value: number }>;
    };
}

describe("shieldModOf", () => {
    it("reads the authored value", () => {
        expect(shieldModOf(mode({ shieldMod: 20 }))).toBe(20);
    });

    it("is nothing for the zero every non-shield authors", () => {
        expect(shieldModOf(mode({ shieldMod: 0 }))).toBe(0);
    });

    it("is nothing when the trait is absent or not a number", () => {
        expect(shieldModOf(mode({}))).toBe(0);
        expect(shieldModOf(mode({ shieldMod: "10" }))).toBe(0);
        expect(shieldModOf({} as never)).toBe(0);
    });

    it("ignores a negative value, which would make a shield a liability", () => {
        expect(shieldModOf(mode({ shieldMod: -5 }))).toBe(0);
    });
});

describe("isShieldStrikeMode", () => {
    it("a non-zero Shield Mod is what marks a shield", () => {
        // A shield is off-side-exempt and defence-granting because it is made
        // for the arm, and this trait is the marker of that.
        expect(isShieldStrikeMode(mode({ shieldMod: 5 }))).toBe(true);
        expect(isShieldStrikeMode(mode({ shieldMod: 0 }))).toBe(false);
        expect(isShieldStrikeMode(mode({}))).toBe(false);
    });
});

describe("bestShieldMod", () => {
    it("is nothing when no shield is held", () => {
        expect(bestShieldMod([])).toBe(0);
        expect(bestShieldMod([mode({ shieldMod: 0 }), mode({})])).toBe(0);
    });

    it("takes the higher of two shields rather than their sum", () => {
        // A shield on each arm grants the better, never 10 + 20.
        expect(bestShieldMod([mode({ shieldMod: 10 }), mode({ shieldMod: 20 })])).toBe(20);
    });

    it("ignores the modes of everything that is not a shield", () => {
        expect(bestShieldMod([mode({ shieldMod: 0 }), mode({ shieldMod: 5 })])).toBe(5);
    });
});

describe("applyShieldDefenseBonus", () => {
    it("adds the bonus as a named delta", () => {
        const mod = modifier();
        applyShieldDefenseBonus(mod, 15);
        expect(mod.deltas).toEqual([
            { name: "SOHL.INFO.ShieldMod", abbrev: SHIELD_DEFENSE_ABBREV, value: 15 },
        ]);
    });

    it("adds nothing when no shield is held", () => {
        const mod = modifier();
        applyShieldDefenseBonus(mod, 0);
        expect(mod.deltas).toEqual([]);
    });

    it("restates rather than stacks when the lifecycle phase runs again", () => {
        const mod = modifier();
        applyShieldDefenseBonus(mod, 15);
        applyShieldDefenseBonus(mod, 15);
        expect(mod.deltas).toHaveLength(1);
        expect(mod.deltas[0]!.value).toBe(15);
    });

    it("replaces the prior bonus when the held shield changes", () => {
        const mod = modifier();
        applyShieldDefenseBonus(mod, 20);
        applyShieldDefenseBonus(mod, 5);
        expect(mod.deltas).toEqual([
            { name: "SOHL.INFO.ShieldMod", abbrev: SHIELD_DEFENSE_ABBREV, value: 5 },
        ]);
    });

    it("clears the prior bonus when the shield is stowed", () => {
        const mod = modifier();
        applyShieldDefenseBonus(mod, 20);
        applyShieldDefenseBonus(mod, 0);
        expect(mod.deltas).toEqual([]);
    });
});
