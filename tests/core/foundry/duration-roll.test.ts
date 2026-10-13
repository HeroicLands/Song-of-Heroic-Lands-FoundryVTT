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

import { afterEach, describe, expect, it, vi } from "vitest";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import {
    parseSimpleRollExpression,
    simpleRollExpressionRange,
} from "@src/entity/roll/parseSimpleRollFormula.mjs";
const parent = { kind: "test-parent" } as any;
afterEach(() => SimpleRoll.clearForced());
describe("arithmetic SimpleRoll duration expressions", () => {
    it.each(["(2+1)d6", "2d(4+2)"])(
        "supports grouped deterministic dice operands %s",
        (formula) => {
            SimpleRoll.forceValues(2, 3, 4);
            const roll = SimpleRoll.fromFormula(formula, parent);
            expect(roll.roll()).toBe(formula.startsWith("(") ? 9 : 5);
        },
    );
    it("distinguishes normal precedence and parentheses without consuming extra dice", () => {
        SimpleRoll.forceValues(3, 4, 3, 4);
        expect(SimpleRoll.fromFormula("2d6+3*3600", parent).roll()).toBe(10807);
        expect(SimpleRoll.fromFormula("(2d6+3)*3600", parent).roll()).toBe(36000);
        expect(SimpleRoll.forcedRemaining).toBe(0);
    });
    it("preserves mixed-group FIFO faces through serialization and replay", () => {
        SimpleRoll.forceValues(2, 5, 6);
        const roll = SimpleRoll.fromFormula("(1d4*60+1d6*3600)/2+-10", parent);
        expect(roll.roll()).toBe(9050);
        expect(roll.roll()).toBe(9050);
        expect(SimpleRoll.forcedRemaining).toBe(1);
        const restored = new SimpleRoll(roll.toJSON() as any, { parent });
        expect(restored.total).toBe(9050);
        expect(restored.formula).toBe(roll.formula);
        restored.reset();
        restored.setRolls([4, 6]);
        expect(restored.total).toBe(10910);
    });
    it("supports signed scaling and unary signs below dice", () => {
        SimpleRoll.forceValues(2, 3);
        expect(SimpleRoll.fromFormula("-2d6", parent).roll()).toBe(-5);
        expect(SimpleRoll.fromFormula("(-3)*-60", parent).roll()).toBe(180);
        expect(SimpleRoll.fromFormula("1/2", parent).roll()).toBe(0.5);
    });
    it.each(["2d6kh1", "{1d6,2d6}", "1d0", "1d6+", "1e999", "@strength"])(
        "rejects malformed or unsupported expression %s",
        (formula) => {
            expect(() => SimpleRoll.fromFormula(formula, parent)).toThrow();
        },
    );
    it("shares sign-aware interval calculations with authored build validation", () => {
        expect(simpleRollExpressionRange(parseSimpleRollExpression("(1d6-10)*-60"))).toEqual({
            min: 240,
            max: 540,
        });
        expect(simpleRollExpressionRange(parseSimpleRollExpression("1/0")).max).toBe(Infinity);
    });
});

vi.mock("@src/document/combat/foundry/SohlCombat", () => ({ SohlCombat: class {} }));
import { fvttToFoundryRoll } from "../../../src/core/FoundryHelpers";
describe("seeded arithmetic chat conversion", () => {
    it("creates lazy parenthetical rolls and distributes faces without rerolling", async () => {
        class Die {
            number = 1;
            results: any[] = [];
            evaluate = vi.fn(async () => this);
        }
        const first = new Die(),
            second = new Die();
        const nested: any = { term: "1d4+1d6" };
        const NativeRoll = vi.fn(function (this: any, formula: string) {
            this.terms = formula === "1d4+1d6" ? [first, second] : [nested];
        });
        const originalDice = (globalThis as any).foundry.dice;
        vi.stubGlobal("Roll", NativeRoll);
        (globalThis as any).foundry.dice = {
            ...originalDice,
            terms: { ...originalDice?.terms, Die },
        };
        try {
            const simple = SimpleRoll.fromFormula("(1d4+1d6)*60", parent);
            simple.setRolls([2, 5]);
            await fvttToFoundryRoll(simple);
            expect(first.results).toEqual([{ result: 2, active: true }]);
            expect(second.results).toEqual([{ result: 5, active: true }]);
            expect(first.evaluate).toHaveBeenCalledTimes(1);
            expect(second.evaluate).toHaveBeenCalledTimes(1);
            expect(nested.roll).toBeDefined();
        } finally {
            (globalThis as any).foundry.dice = originalDice;
            vi.unstubAllGlobals();
        }
    });
});
