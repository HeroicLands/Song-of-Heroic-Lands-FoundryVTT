import { describe, it, expect } from "vitest";
import {
    calculateNextCheckTime,
    shouldScheduleCheck,
    isCooldownActive,
    evaluateTrigger,
    nextCheckTimeAfterTrigger,
} from "@src/document/region-behavior/encounter-logic";

const BASE_TRIGGER = {
    max: 0,
    count: 0,
    cooldown: 3600,
    interval: 14400,
    lastOccured: 0,
    probability: 1,
};

describe("calculateNextCheckTime", () => {
    it("returns next interval boundary after time 0", () => {
        expect(calculateNextCheckTime(0, 14400)).toBe(14400);
    });

    it("returns next boundary just before an interval boundary", () => {
        expect(calculateNextCheckTime(14399, 14400)).toBe(14400);
    });

    it("returns the NEXT boundary when exactly on a boundary", () => {
        // At time 14400 (a boundary), the next boundary is 28800
        expect(calculateNextCheckTime(14400, 14400)).toBe(28800);
    });

    it("handles mid-interval times correctly", () => {
        expect(calculateNextCheckTime(7200, 14400)).toBe(14400);
    });

    it("works with small intervals", () => {
        expect(calculateNextCheckTime(5, 3)).toBe(6);
    });
});

describe("shouldScheduleCheck", () => {
    it("returns false when disabled", () => {
        expect(shouldScheduleCheck(true, 0, 0)).toBe(false);
    });

    it("returns true when max is 0 (unlimited)", () => {
        expect(shouldScheduleCheck(false, 0, 999)).toBe(true);
    });

    it("returns true when count is less than max", () => {
        expect(shouldScheduleCheck(false, 5, 3)).toBe(true);
    });

    it("returns false when count equals max", () => {
        expect(shouldScheduleCheck(false, 5, 5)).toBe(false);
    });

    it("returns false when count exceeds max", () => {
        expect(shouldScheduleCheck(false, 5, 6)).toBe(false);
    });
});

describe("isCooldownActive", () => {
    it("returns false when lastOccured is 0 (never triggered)", () => {
        expect(isCooldownActive(0, 3600, 1000)).toBe(false);
    });

    it("returns true when within cooldown window", () => {
        // lastOccured=1000, cooldown=3600, time=2000 → only 1000s elapsed < 3600
        expect(isCooldownActive(1000, 3600, 2000)).toBe(true);
    });

    it("returns false when cooldown has elapsed", () => {
        // lastOccured=1000, cooldown=3600, time=4601 → 3601s elapsed > 3600
        expect(isCooldownActive(1000, 3600, 4601)).toBe(false);
    });

    it("returns false when exactly at cooldown boundary (strict less-than)", () => {
        // lastOccured=1000, cooldown=3600, time=4600 → 3600s elapsed = 3600 (not < 3600)
        expect(isCooldownActive(1000, 3600, 4600)).toBe(false);
    });
});

describe("evaluateTrigger", () => {
    it("triggers when roll is less than probability", () => {
        const trigger = { ...BASE_TRIGGER, probability: 0.5 };
        expect(evaluateTrigger(trigger, 14400, 0.3)).toBe(true);
    });

    it("triggers when roll equals probability", () => {
        const trigger = { ...BASE_TRIGGER, probability: 0.5 };
        expect(evaluateTrigger(trigger, 14400, 0.5)).toBe(true);
    });

    it("does not trigger when roll exceeds probability", () => {
        const trigger = { ...BASE_TRIGGER, probability: 0.5 };
        expect(evaluateTrigger(trigger, 14400, 0.51)).toBe(false);
    });

    it("always triggers when probability is 1", () => {
        const trigger = { ...BASE_TRIGGER, probability: 1 };
        expect(evaluateTrigger(trigger, 14400, 0.9999)).toBe(true);
    });

    it("does not trigger when probability is 0 and roll is non-zero", () => {
        const trigger = { ...BASE_TRIGGER, probability: 0 };
        expect(evaluateTrigger(trigger, 14400, 0.001)).toBe(false);
    });
});

describe("nextCheckTimeAfterTrigger", () => {
    it("schedules next check after cooldown has expired", () => {
        const trigger = { ...BASE_TRIGGER, cooldown: 3600, interval: 14400 };
        // time=14400, cooldown=3600 → post-cooldown base = 18000
        // next 14400 boundary after 18000 = 28800
        expect(nextCheckTimeAfterTrigger(trigger, 14400)).toBe(28800);
    });

    it("aligns to interval boundary after cooldown", () => {
        const trigger = { ...BASE_TRIGGER, cooldown: 100, interval: 14400 };
        // time=14400, cooldown=100 → post-cooldown base = 14500
        // next 14400 boundary after 14500 = 28800
        expect(nextCheckTimeAfterTrigger(trigger, 14400)).toBe(28800);
    });

    it("delegates to calculateNextCheckTime semantics", () => {
        const trigger = { ...BASE_TRIGGER, cooldown: 14300, interval: 14400 };
        // time=14400, cooldown=14300 → post-cooldown base = 28700
        // next 14400 boundary after 28700 = 28800
        expect(nextCheckTimeAfterTrigger(trigger, 14400)).toBe(28800);
    });
});
