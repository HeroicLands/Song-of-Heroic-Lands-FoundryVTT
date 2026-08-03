import { describe, it, expect } from "vitest";
import {
    calcMasteryBoost,
    computeBoostContribution,
} from "@src/document/item/logic/masteryBoost";

describe("calcMasteryBoost", () => {
    it("returns the tabulated bonus for each ML tier", () => {
        expect(calcMasteryBoost(0)).toBe(10);
        expect(calcMasteryBoost(39)).toBe(10);
        expect(calcMasteryBoost(40)).toBe(9);
        expect(calcMasteryBoost(44)).toBe(9);
        expect(calcMasteryBoost(45)).toBe(8);
        expect(calcMasteryBoost(49)).toBe(8);
        expect(calcMasteryBoost(50)).toBe(7);
        expect(calcMasteryBoost(59)).toBe(7);
        expect(calcMasteryBoost(60)).toBe(6);
        expect(calcMasteryBoost(69)).toBe(6);
        expect(calcMasteryBoost(70)).toBe(5);
        expect(calcMasteryBoost(79)).toBe(5);
        expect(calcMasteryBoost(80)).toBe(4);
        expect(calcMasteryBoost(99)).toBe(4);
        expect(calcMasteryBoost(100)).toBe(3);
        expect(calcMasteryBoost(150)).toBe(3);
    });
});

describe("computeBoostContribution — existing skill", () => {
    it("compounds N boosts off the seeded ML and returns the EML delta", () => {
        // Worked check from the design: seed 52, N=3 → 52(+7)59(+7)66(+6)72 ⇒ +20.
        const r = computeBoostContribution({
            hasSkill: true,
            seedML: 52,
            count: 3,
        });
        expect(r.conferred).toBe(false);
        expect(r.workingML).toBe(72);
        expect(r.delta).toBe(20);
    });

    it("N=1 applies a single boost off the seed", () => {
        // seed 52, N=1 → 52(+7)59 ⇒ +7.
        const r = computeBoostContribution({
            hasSkill: true,
            seedML: 52,
            count: 1,
        });
        expect(r.delta).toBe(7);
        expect(r.workingML).toBe(59);
    });

    it("N=0 (or negative) contributes nothing", () => {
        expect(
            computeBoostContribution({ hasSkill: true, seedML: 52, count: 0 })
                .delta,
        ).toBe(0);
        expect(
            computeBoostContribution({ hasSkill: true, seedML: 52, count: -2 })
                .delta,
        ).toBe(0);
    });
});

describe("computeBoostContribution — absent skill (grant)", () => {
    it("spends the first boost opening the skill at Skill Base, then compounds the rest", () => {
        // Worked check: SB 40, N=3 → open 40, 40(+9)49(+8)57 ⇒ conferred at EML 57.
        const r = computeBoostContribution({
            hasSkill: false,
            skillBase: 40,
            count: 3,
        });
        expect(r.conferred).toBe(true);
        expect(r.workingML).toBe(57);
        // A conferred skill has no prior EML, so the grant IS the working ML.
        expect(r.delta).toBe(57);
    });

    it("N=1 confers the skill at its Skill Base (first boost only opens it)", () => {
        const r = computeBoostContribution({
            hasSkill: false,
            skillBase: 40,
            count: 1,
        });
        expect(r.conferred).toBe(true);
        expect(r.workingML).toBe(40);
        expect(r.delta).toBe(40);
    });

    it("N=0 confers nothing (no boost to even open the skill)", () => {
        const r = computeBoostContribution({
            hasSkill: false,
            skillBase: 40,
            count: 0,
        });
        expect(r.conferred).toBe(false);
        expect(r.workingML).toBe(0);
        expect(r.delta).toBe(0);
    });
});
