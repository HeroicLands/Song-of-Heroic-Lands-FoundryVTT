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

import { describe, it, expect } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import {
    strengthImpactModifier,
    strengthImpactApplies,
    applyStrengthImpact,
    OFF_HAND_IMPACT_PENALTY,
    THROWN_IMPACT_PENALTY,
} from "@src/entity/strikemode/strengthImpact";

const MOCK_LOGIC = brandLogic({
    actor: null,
    data: { kind: "weapongear" },
    name: "Test Weapon",
    label: "Test Weapon",
    speaker: {},
}) as any;

function melee(over: Partial<MeleeStrikeMode.Data> = {}): MeleeStrikeMode.Data {
    return {
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
        ...over,
    } as MeleeStrikeMode.Data;
}

function missile(projectileType: string): MissileStrikeMode.Data {
    return {
        type: "missile",
        shortcode: "shoot",
        name: "Shoot",
        minParts: 1,
        assocSkillCode: "bow",
        projectileType,
        maxVolleyMult: 1,
        baseRangeBase: 100,
        drawBase: 0,
        attack: { spread: 10, modifier: 0 },
        impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "piercing" },
        traits: {},
    } as MissileStrikeMode.Data;
}

/**
 * The printed Strength Impact Modifier table, as the authority. The
 * implementation is a closed form, not a lookup — these rows exist to prove the
 * formula reproduces the table exactly.
 */
const PRINTED: Array<[number, number]> = [
    [1, -10],
    [2, -8],
    [3, -6],
    [4, -4],
    [5, -3],
    [6, -2],
    [7, -2],
    [8, -1],
    [9, -1],
    [10, 0],
    [11, 0],
    [12, 1],
    [13, 1],
    [14, 2],
    [15, 2],
    [16, 3],
    [17, 3],
    [18, 4],
    [19, 4],
    [20, 5],
    [21, 5],
    [22, 6],
    [23, 6],
    [24, 7],
    [25, 7],
];

describe("strengthImpactModifier", () => {
    it.each(PRINTED)("STR %i gives %i", (str, expected) => {
        expect(strengthImpactModifier(str)).toBe(expected);
    });

    it("increases by 1 every two STR above 24, without bound", () => {
        // "Impact modifier increases by 1 every two STR above 24."
        expect(strengthImpactModifier(26)).toBe(8);
        expect(strengthImpactModifier(27)).toBe(8);
        expect(strengthImpactModifier(28)).toBe(9);
        expect(strengthImpactModifier(40)).toBe(15);
        // A colossus is not capped — the whole point of computing it.
        expect(strengthImpactModifier(100)).toBe(45);
    });

    it("keeps falling on the steep low tail below STR 5", () => {
        // The printed low end drops by 2 per point, not 1 per two points.
        expect(strengthImpactModifier(4)).toBe(-4);
        expect(strengthImpactModifier(0)).toBe(-12);
    });

    it("is monotonic across the whole range", () => {
        for (let s = 0; s < 60; s++) {
            expect(strengthImpactModifier(s + 1)).toBeGreaterThanOrEqual(
                strengthImpactModifier(s),
            );
        }
    });

    it("rounds a fractional Strength down to the weaker band", () => {
        expect(strengthImpactModifier(13.9)).toBe(strengthImpactModifier(13));
    });
});

describe("strengthImpactApplies", () => {
    it("applies to a melee strike mode", () => {
        const sm = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        expect(strengthImpactApplies(sm)).toBe(true);
    });

    it("applies to a thrown weapon (the weapon itself is the projectile)", () => {
        const sm = new MissileStrikeMode(missile("none"), MOCK_LOGIC, "sm");
        expect(strengthImpactApplies(sm)).toBe(true);
    });

    it.each(["arrow", "bolt", "bullet"])(
        "does not apply to a %s launcher — bows, crossbows and slings get no benefit",
        (projectileType) => {
            const sm = new MissileStrikeMode(
                missile(projectileType),
                MOCK_LOGIC,
                "sm",
            );
            expect(strengthImpactApplies(sm)).toBe(false);
        },
    );

    it("does not apply to a mode carrying the noStrMod trait", () => {
        const sm = new MeleeStrikeMode(
            melee({ traits: { noStrMod: true } } as any),
            MOCK_LOGIC,
            "sm",
        );
        expect(strengthImpactApplies(sm)).toBe(false);
    });
});

describe("applyStrengthImpact", () => {
    it("adds the Strength modifier to a melee mode's impact", () => {
        const sm = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        const before = sm.impact.effective;
        applyStrengthImpact(sm, { strength: 16 });
        expect(sm.impact.effective).toBe(before + 3);
    });

    it("makes a stronger attacker hit harder with the same weapon (#1253)", () => {
        const weak = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        const strong = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        applyStrengthImpact(weak, { strength: 9 });
        applyStrengthImpact(strong, { strength: 16 });
        expect(strong.impact.effective).toBeGreaterThan(weak.impact.effective);
    });

    it("leaves an ineligible mode untouched", () => {
        const sm = new MissileStrikeMode(missile("arrow"), MOCK_LOGIC, "sm");
        const before = sm.impact.effective;
        applyStrengthImpact(sm, { strength: 20 });
        expect(sm.impact.effective).toBe(before);
    });

    it("reduces the modifier by 1 in the off-hand", () => {
        const sm = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        applyStrengthImpact(sm, { strength: 16, offHand: true });
        expect(sm.impact.effective).toBe(3 + OFF_HAND_IMPACT_PENALTY);
    });

    it("reduces the modifier by 1 when thrown", () => {
        const sm = new MissileStrikeMode(missile("none"), MOCK_LOGIC, "sm");
        applyStrengthImpact(sm, { strength: 16, thrown: true });
        expect(sm.impact.effective).toBe(3 + THROWN_IMPACT_PENALTY);
    });

    it("stacks off-hand and thrown", () => {
        const sm = new MissileStrikeMode(missile("none"), MOCK_LOGIC, "sm");
        applyStrengthImpact(sm, {
            strength: 16,
            thrown: true,
            offHand: true,
        });
        expect(sm.impact.effective).toBe(3 - 2);
    });

    it("still applies the off-hand penalty when Strength contributes nothing", () => {
        // STR 10 gives +0; the off-hand reduction is not conditional on it.
        const sm = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        applyStrengthImpact(sm, { strength: 10, offHand: true });
        expect(sm.impact.effective).toBe(-1);
    });

    it("names each contribution so the impact breakdown shows it", () => {
        const sm = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        applyStrengthImpact(sm, { strength: 16, offHand: true });
        const abbrevs = sm.impact.deltas.map((d: any) => d.abbrev);
        expect(abbrevs).toContain("StrImp");
        expect(abbrevs).toContain("OffHnd");
    });

    it("is idempotent per call site — applying twice does not double-count", () => {
        const sm = new MeleeStrikeMode(melee(), MOCK_LOGIC, "sm");
        applyStrengthImpact(sm, { strength: 16 });
        applyStrengthImpact(sm, { strength: 16 });
        expect(sm.impact.effective).toBe(3);
    });
});
