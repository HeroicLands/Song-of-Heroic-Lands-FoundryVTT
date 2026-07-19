/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { SohlCalendarData } from "@src/core/foundry/SohlCalendar";
import {
    worldTimeToDateParts,
    datePartsToWorldTime,
    skipDays,
    calendarSecondsPerDay,
    monthChoices,
} from "@src/core/logic/date-picker-logic";

const SECONDS_PER_DAY = 24 * 60 * 60;

/** Base calendar config (era with no year-zero, weekdays), parameterised months. */
function makeConfig(monthDays: number[], name = "Test"): any {
    const daysPerYear = monthDays.reduce((a, b) => a + b, 0);
    return {
        name,
        years: { yearZero: 720, firstWeekday: 0 },
        era: {
            name: "TR",
            abbrev: "TR",
            beforeName: "BTR",
            beforeAbbrev: "BTR",
            description: "",
            hasYearZero: false,
        },
        months: {
            values: monthDays.map((days, i) => ({
                name: `Month${i}`,
                abbreviation: `M${i}`,
                ordinal: i + 1,
                days,
            })),
        },
        days: {
            values: Array.from({ length: 7 }, (_, i) => ({
                name: `Day${i}`,
                abbreviation: `D${i}`,
                ordinal: i + 1,
            })),
            daysPerYear,
            hoursPerDay: 24,
            minutesPerHour: 60,
            secondsPerMinute: 60,
        },
        seasons: { values: [] },
    };
}

/** Uniform 12 × 30 = 360-day calendar (the default SoHL shape). */
const uniform = new SohlCalendarData(makeConfig(Array(12).fill(30)));
/** Variable-length months (Gregorian-like, 365 days) to exercise non-uniform lengths. */
const VARIABLE_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const variable = new SohlCalendarData(makeConfig(VARIABLE_DAYS, "Variable"));

describe("worldTimeToDateParts", () => {
    it("decomposes the epoch to 1 / month 0 / era-year 1 at 00:00:00", () => {
        expect(worldTimeToDateParts(uniform, 0)).toEqual({
            monthIndex: 0,
            day: 1,
            eraYear: 1,
            beforeEra: false,
            hour: 0,
            minute: 0,
            second: 0,
        });
    });

    it("includes the time of day", () => {
        const t = 30 * SECONDS_PER_DAY + 13 * 3600 + 45 * 60 + 20;
        expect(worldTimeToDateParts(uniform, t)).toEqual({
            monthIndex: 1,
            day: 1,
            eraYear: 1,
            beforeEra: false,
            hour: 13,
            minute: 45,
            second: 20,
        });
    });
});

describe("datePartsToWorldTime", () => {
    const parts = (
        monthIndex: number,
        day: number,
        eraYear: number,
        beforeEra = false,
        hour = 0,
        minute = 0,
        second = 0,
    ) => ({ monthIndex, day, eraYear, beforeEra, hour, minute, second });

    it("maps era-year 1 / month 0 / day 1 to the epoch (era-year → absolute)", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 1, 1))).toBe(0);
    });

    it("sums uniform month lengths for day-of-year", () => {
        // Month index 1, day 1 = day-of-year 30 (month 0 has 30 days).
        expect(datePartsToWorldTime(uniform, parts(1, 1, 1))).toBe(
            30 * SECONDS_PER_DAY,
        );
    });

    it("sums VARIABLE month lengths for day-of-year", () => {
        // Variable: month index 2 (Mar), day 1 = day-of-year 31 + 28 = 59.
        expect(datePartsToWorldTime(variable, parts(2, 1, 1))).toBe(
            59 * SECONDS_PER_DAY,
        );
        // Last day of the year: month 11 (Dec), day 31 = day-of-year 364.
        expect(datePartsToWorldTime(variable, parts(11, 31, 1))).toBe(
            364 * SECONDS_PER_DAY,
        );
    });

    it("round-trips through worldTimeToDateParts for many dates", () => {
        for (const cal of [uniform, variable]) {
            const monthDays =
                cal === uniform ? Array(12).fill(30) : VARIABLE_DAYS;
            for (let m = 0; m < 12; m++) {
                for (const d of [1, 15, monthDays[m]]) {
                    for (const y of [1, 3, 722]) {
                        const p = parts(m, d, y);
                        const t = datePartsToWorldTime(cal, p);
                        expect(t, `m${m} d${d} y${y}`).not.toBeNull();
                        expect(worldTimeToDateParts(cal, t!)).toEqual(p);
                    }
                }
            }
        }
    });

    it("rejects a day past the month's length (uniform)", () => {
        // Day 31 in a 30-day month spills into the next month → invalid.
        expect(datePartsToWorldTime(uniform, parts(0, 31, 1))).toBeNull();
    });

    it("rejects a day past the month's length (variable — Feb 29 in a 28-day Feb)", () => {
        expect(datePartsToWorldTime(variable, parts(1, 29, 1))).toBeNull();
        // Feb 28 is still valid.
        expect(datePartsToWorldTime(variable, parts(1, 28, 1))).not.toBeNull();
    });

    it("rejects an out-of-range month index", () => {
        expect(datePartsToWorldTime(uniform, parts(12, 1, 1))).toBeNull();
        expect(datePartsToWorldTime(uniform, parts(-1, 1, 1))).toBeNull();
    });

    it("rejects a non-positive or non-integer day", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 0, 1))).toBeNull();
        expect(datePartsToWorldTime(uniform, parts(0, 1.5, 1))).toBeNull();
    });

    it("rejects era-year 0 on a no-year-zero calendar (via round-trip)", () => {
        // eraYear 0 → absolute -1 → before-era → round-trip era-year/flag mismatch.
        expect(datePartsToWorldTime(uniform, parts(0, 1, 0))).toBeNull();
    });

    it("includes the time of day", () => {
        expect(
            datePartsToWorldTime(uniform, parts(0, 1, 1, false, 14, 30, 15)),
        ).toBe(14 * 3600 + 30 * 60 + 15);
    });

    it("rejects an out-of-range time of day", () => {
        expect(
            datePartsToWorldTime(uniform, parts(0, 1, 1, false, 24)),
        ).toBeNull();
        expect(
            datePartsToWorldTime(uniform, parts(0, 1, 1, false, 0, 60)),
        ).toBeNull();
        expect(
            datePartsToWorldTime(uniform, parts(0, 1, 1, false, 0, 0, 60)),
        ).toBeNull();
    });
});

describe("monthChoices", () => {
    it("returns one index/name choice per month, in order", () => {
        const choices = monthChoices(variable);
        expect(choices).toHaveLength(12);
        expect(choices[0]).toEqual({ index: 0, name: "Month0" });
        expect(choices[11]).toEqual({ index: 11, name: "Month11" });
    });
});

describe("calendarSecondsPerDay", () => {
    it("is hoursPerDay × minutesPerHour × secondsPerMinute", () => {
        expect(calendarSecondsPerDay(uniform)).toBe(SECONDS_PER_DAY);
    });
});

describe("skipDays", () => {
    const parts = (
        monthIndex: number,
        day: number,
        eraYear: number,
        beforeEra = false,
        hour = 0,
        minute = 0,
        second = 0,
    ) => ({ monthIndex, day, eraYear, beforeEra, hour, minute, second });

    it("rolls forward across a month boundary", () => {
        // Uniform: last day of month 0 (day 30) + 1 → month 1, day 1.
        expect(skipDays(uniform, parts(0, 30, 1), 1)).toMatchObject({
            monthIndex: 1,
            day: 1,
            eraYear: 1,
        });
    });

    it("rolls forward across a year boundary", () => {
        // Last day of the year + 1 → first day of the next era year.
        expect(skipDays(uniform, parts(11, 30, 1), 1)).toMatchObject({
            monthIndex: 0,
            day: 1,
            eraYear: 2,
        });
    });

    it("rolls backward across a year boundary", () => {
        // First day of era year 2 − 1 → last day of era year 1.
        expect(skipDays(uniform, parts(0, 1, 2), -1)).toMatchObject({
            monthIndex: 11,
            day: 30,
            eraYear: 1,
        });
    });

    it("rolls over VARIABLE-length months correctly", () => {
        // Variable: Feb 28 + 1 → Mar 1 (Feb has 28 days).
        expect(skipDays(variable, parts(1, 28, 1), 1)).toMatchObject({
            monthIndex: 2,
            day: 1,
            eraYear: 1,
        });
    });

    it("preserves the time of day", () => {
        expect(skipDays(uniform, parts(0, 1, 1, false, 10, 20, 30), 5)).toEqual(
            {
                monthIndex: 0,
                day: 6,
                eraYear: 1,
                beforeEra: false,
                hour: 10,
                minute: 20,
                second: 30,
            },
        );
    });

    it("returns null when the starting date is invalid", () => {
        expect(skipDays(uniform, parts(0, 99, 1), 1)).toBeNull();
    });
});
