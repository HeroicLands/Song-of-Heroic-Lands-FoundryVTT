import { describe, it, expect } from "vitest";
import {
    contagionTarget,
    isContracted,
    onsetDaysFor,
    SECONDS_PER_DAY,
} from "@src/document/actor/logic/affliction-contagion";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

describe("contagionTarget (#1183)", () => {
    it("is Contagion Index × Endurance", () => {
        expect(contagionTarget(3, 12)).toBe(36);
        expect(contagionTarget(1, 15)).toBe(15);
    });
    it("never goes negative, and rounds to an integer", () => {
        expect(contagionTarget(-2, 10)).toBe(0);
        expect(contagionTarget(2.4, 10)).toBe(24);
    });
    it("is 0 for a non-finite input rather than NaN", () => {
        expect(contagionTarget(Number.NaN, 10)).toBe(0);
    });
});

describe("isContracted (#1183)", () => {
    it("a failed contagion test contracts the affliction", () => {
        expect(isContracted(CRITICAL_FAILURE)).toBe(true);
        expect(isContracted(MARGINAL_FAILURE)).toBe(true);
    });
    it("a successful contagion test avoids it", () => {
        expect(isContracted(MARGINAL_SUCCESS)).toBe(false);
        expect(isContracted(CRITICAL_SUCCESS)).toBe(false);
    });
});

describe("onsetDaysFor (#1183)", () => {
    it("CF halves the rolled onset, rounded down", () => {
        expect(onsetDaysFor(CRITICAL_FAILURE, 7)).toBe(3);
        expect(onsetDaysFor(CRITICAL_FAILURE, 8)).toBe(4);
        expect(onsetDaysFor(CRITICAL_FAILURE, 1)).toBe(0);
    });
    it("MF uses the rolled onset as-is", () => {
        expect(onsetDaysFor(MARGINAL_FAILURE, 7)).toBe(7);
        expect(onsetDaysFor(MARGINAL_FAILURE, 0)).toBe(0);
    });
    it("a success yields no onset — the affliction was avoided", () => {
        expect(onsetDaysFor(MARGINAL_SUCCESS, 7)).toBeUndefined();
        expect(onsetDaysFor(CRITICAL_SUCCESS, 7)).toBeUndefined();
    });
    it("never yields a negative number of days", () => {
        expect(onsetDaysFor(CRITICAL_FAILURE, -4)).toBe(0);
        expect(onsetDaysFor(MARGINAL_FAILURE, -4)).toBe(0);
    });
    it("exposes the day→seconds factor used to persist the onset duration", () => {
        expect(SECONDS_PER_DAY).toBe(86400);
    });
});
