import { describe, it, expect } from "vitest";
import {
    courseHrDelta,
    courseOutcomeFor,
    COURSE_DEFEATED_HR,
} from "@src/document/item/logic/affliction-course";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";
import { SHOCK_STATE } from "@src/document/actor/logic/shock";

describe("courseHrDelta (#1183)", () => {
    it("CF worsens the Healing Rate by 2", () => {
        expect(courseHrDelta(CRITICAL_FAILURE)).toBe(-2);
    });
    it("MF worsens the Healing Rate by 1", () => {
        expect(courseHrDelta(MARGINAL_FAILURE)).toBe(-1);
    });
    it("MS improves the Healing Rate by 1", () => {
        expect(courseHrDelta(MARGINAL_SUCCESS)).toBe(1);
    });
    it("CS improves the Healing Rate by 2", () => {
        expect(courseHrDelta(CRITICAL_SUCCESS)).toBe(2);
    });
});

describe("courseOutcomeFor (#1183)", () => {
    it("HR 6+ defeats the ailment — no fatigue, no shock", () => {
        for (const hr of [6, 7, 12]) {
            const out = courseOutcomeFor(hr);
            expect(out.defeated).toBe(true);
            expect(out.fatigueLevels).toBe(0);
            expect(out.shockState).toBeUndefined();
        }
        expect(COURSE_DEFEATED_HR).toBe(6);
    });

    it("HR 5 inflicts 5 weakness fatigue and no shock", () => {
        const out = courseOutcomeFor(5);
        expect(out.defeated).toBe(false);
        expect(out.fatigueLevels).toBe(5);
        expect(out.shockState).toBeUndefined();
    });

    it("HR 4 inflicts 10 weakness fatigue and no shock", () => {
        const out = courseOutcomeFor(4);
        expect(out.fatigueLevels).toBe(10);
        expect(out.shockState).toBeUndefined();
    });

    it("HR 3 inflicts Stunned shock alongside 10 weakness fatigue", () => {
        const out = courseOutcomeFor(3);
        expect(out.fatigueLevels).toBe(10);
        expect(out.shockState).toBe(SHOCK_STATE.STUNNED);
    });

    it("HR 2 inflicts Incapacitated shock alongside 10 weakness fatigue", () => {
        const out = courseOutcomeFor(2);
        expect(out.fatigueLevels).toBe(10);
        expect(out.shockState).toBe(SHOCK_STATE.INCAPACITATED);
    });

    it("HR 1 inflicts Unconscious shock alongside 10 weakness fatigue", () => {
        const out = courseOutcomeFor(1);
        expect(out.fatigueLevels).toBe(10);
        expect(out.shockState).toBe(SHOCK_STATE.UNCONSCIOUS);
    });

    it("HR 0 or below is death, and carries no fatigue of its own", () => {
        for (const hr of [0, -1, -5]) {
            const out = courseOutcomeFor(hr);
            expect(out.shockState).toBe(SHOCK_STATE.DEAD);
            expect(out.fatigueLevels).toBe(0);
            expect(out.defeated).toBe(false);
        }
    });
});
