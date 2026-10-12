/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { createRng } from "@src/entity/random/createRng";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { qualifierRoll } from "@src/entity/roll/qualifierRoll";

const parent = { name: "Qualifier test" } as any;
const ladder = ["none", "minor", "moderate", "major", "exceptional", "legendary"];

afterEach(() => SimpleRoll.clearForced());

describe("qualifierRoll", () => {
    it("compares every d10 independently to the same TN and returns its ladder rung", () => {
        SimpleRoll.forceValues(1, 4, 5, 8, 10);

        const result = qualifierRoll(5, 5, ladder, parent);

        expect(result.rolls).toEqual([1, 4, 5, 8, 10]);
        expect(result.successCount).toBe(3);
        expect(result.result).toBe("major");
        expect(SimpleRoll.forcedRemaining).toBe(0);
    });

    it("uses an injected seeded RNG deterministically", () => {
        const first = qualifierRoll(4, 6, ladder, parent, createRng("qualifier repeat"));
        const second = qualifierRoll(4, 6, ladder, parent, createRng("qualifier repeat"));

        expect(second).toEqual(first);
        expect(first.rolls).toHaveLength(4);
        expect(first.rolls.every((value) => value >= 1 && value <= 10)).toBe(true);
    });

    it("clamps TNs without consuming dice or forced values", () => {
        SimpleRoll.forceValues(4, 5);
        const rng = createRng("qualifier clamps");
        const die = vi.spyOn(rng, "die");

        const atZero = qualifierRoll(2, 0, ladder, parent, rng);
        const belowZero = qualifierRoll(2, -1, ladder, parent, rng);
        const atTen = qualifierRoll(2, 10, ladder, parent, rng);
        const aboveTen = qualifierRoll(2, 11, ladder, parent, rng);

        expect(atZero).toEqual({ rolls: [], successCount: 0, result: "none" });
        expect(belowZero).toEqual(atZero);
        expect(atTen).toEqual({ rolls: [], successCount: 2, result: "moderate" });
        expect(aboveTen).toEqual(atTen);
        expect(die).not.toHaveBeenCalled();
        expect(SimpleRoll.forcedRemaining).toBe(2);
    });

    it("returns the zero-success rung for a zero-die batch", () => {
        expect(qualifierRoll(0, 5, ["none"], parent)).toEqual({
            rolls: [],
            successCount: 0,
            result: "none",
        });
    });

    it("rejects invalid batch sizes, target numbers, and incomplete ladders", () => {
        expect(() => qualifierRoll(-1, 5, ladder, parent)).toThrow(RangeError);
        expect(() => qualifierRoll(1.5, 5, ladder, parent)).toThrow(RangeError);
        expect(() => qualifierRoll(1, Number.NaN, ladder, parent)).toThrow(RangeError);
        expect(() => qualifierRoll(1, 1.5, ladder, parent)).toThrow(RangeError);
        expect(() => qualifierRoll(1, Number.POSITIVE_INFINITY, ladder, parent)).toThrow(
            RangeError,
        );
        expect(() => qualifierRoll(2, 5, ["none", "one"], parent)).toThrow(RangeError);
        const sparseLadder = new Array(3);
        sparseLadder[0] = "none";
        sparseLadder[2] = "two";
        expect(() => qualifierRoll(2, 5, sparseLadder, parent)).toThrow(
            /missing the 1 success rung/,
        );
    });
});
