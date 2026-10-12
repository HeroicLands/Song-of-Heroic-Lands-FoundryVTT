/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    worldTimeToDateParts,
    datePartsToWorldTime,
    skipDays,
    calendarSecondsPerDay,
    monthChoices,
    datePartsToCalendaria,
    calendariaToWorldTime,
} from "@src/core/logic/date-picker-logic";

const SECONDS_PER_DAY = 24 * 60 * 60;

/** Base calendar config (weekdays, no leap rule), parameterised months. */
function makeConfig(monthDays: number[], name = "Test"): any {
    const daysPerYear = monthDays.reduce((a, b) => a + b, 0);
    return {
        name,
        years: { yearZero: 0, firstWeekday: 0 },
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

/** Build a core `CalendarData` for the given month lengths. */
function makeCalendar(monthDays: number[], name?: string): any {
    return new (foundry as any).data.CalendarData(makeConfig(monthDays, name));
}

/** Uniform 12 × 30 = 360-day calendar. */
const uniform = makeCalendar(Array(12).fill(30));
/** Variable-length months (Gregorian-like, 365 days) to exercise non-uniform lengths. */
const VARIABLE_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const variable = makeCalendar(VARIABLE_DAYS, "Variable");

/** Assemble {@link DateParts} positionally, for terse table-style cases. */
const parts = (
    monthIndex: number,
    day: number,
    year: number,
    hour = 0,
    minute = 0,
    second = 0,
) => ({ monthIndex, day, year, hour, minute, second });

describe("worldTimeToDateParts", () => {
    it("decomposes time 0 to day 1 of month 0 in year 0 at 00:00:00", () => {
        expect(worldTimeToDateParts(uniform, 0)).toEqual(parts(0, 1, 0));
    });

    it("includes the time of day", () => {
        const t = 30 * SECONDS_PER_DAY + 13 * 3600 + 45 * 60 + 20;
        expect(worldTimeToDateParts(uniform, t)).toEqual(parts(1, 1, 0, 13, 45, 20));
    });
});

describe("datePartsToWorldTime", () => {
    it("maps year 0 / month 0 / day 1 to time 0", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 1, 0))).toBe(0);
    });

    it("sums uniform month lengths for day-of-year", () => {
        // Month index 1, day 1 = day-of-year 30 (month 0 has 30 days).
        expect(datePartsToWorldTime(uniform, parts(1, 1, 0))).toBe(30 * SECONDS_PER_DAY);
    });

    it("sums VARIABLE month lengths for day-of-year", () => {
        // Variable: month index 2 (Mar), day 1 = day-of-year 31 + 28 = 59.
        expect(datePartsToWorldTime(variable, parts(2, 1, 0))).toBe(59 * SECONDS_PER_DAY);
        // Last day of the year: month 11 (Dec), day 31 = day-of-year 364.
        expect(datePartsToWorldTime(variable, parts(11, 31, 0))).toBe(364 * SECONDS_PER_DAY);
    });

    it("round-trips through worldTimeToDateParts for many dates", () => {
        for (const cal of [uniform, variable]) {
            const monthDays = cal === uniform ? Array(12).fill(30) : VARIABLE_DAYS;
            for (let m = 0; m < 12; m++) {
                for (const d of [1, 15, monthDays[m]]) {
                    for (const y of [0, 3, 722]) {
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
        expect(datePartsToWorldTime(uniform, parts(0, 31, 0))).toBeNull();
    });

    it("rejects a day past the month's length (variable — Feb 29 in a 28-day Feb)", () => {
        expect(datePartsToWorldTime(variable, parts(1, 29, 0))).toBeNull();
        // Feb 28 is still valid.
        expect(datePartsToWorldTime(variable, parts(1, 28, 0))).not.toBeNull();
    });

    it("rejects an out-of-range month index", () => {
        expect(datePartsToWorldTime(uniform, parts(12, 1, 0))).toBeNull();
        expect(datePartsToWorldTime(uniform, parts(-1, 1, 0))).toBeNull();
    });

    it("rejects a non-positive or non-integer day", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 0, 0))).toBeNull();
        expect(datePartsToWorldTime(uniform, parts(0, 1.5, 0))).toBeNull();
    });

    it("rejects a non-integer year", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 1, 1.5))).toBeNull();
    });

    it("includes the time of day", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 1, 0, 14, 30, 15))).toBe(
            14 * 3600 + 30 * 60 + 15,
        );
    });

    it("rejects an out-of-range time of day", () => {
        expect(datePartsToWorldTime(uniform, parts(0, 1, 0, 24))).toBeNull();
        expect(datePartsToWorldTime(uniform, parts(0, 1, 0, 0, 60))).toBeNull();
        expect(datePartsToWorldTime(uniform, parts(0, 1, 0, 0, 0, 60))).toBeNull();
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
    it("rolls forward across a month boundary", () => {
        // Uniform: last day of month 0 (day 30) + 1 → month 1, day 1.
        expect(skipDays(uniform, parts(0, 30, 0), 1)).toMatchObject({
            monthIndex: 1,
            day: 1,
            year: 0,
        });
    });

    it("rolls forward across a year boundary", () => {
        // Last day of the year + 1 → first day of the next year.
        expect(skipDays(uniform, parts(11, 30, 0), 1)).toMatchObject({
            monthIndex: 0,
            day: 1,
            year: 1,
        });
    });

    it("rolls backward across a year boundary", () => {
        // First day of year 2 − 1 → last day of year 1.
        expect(skipDays(uniform, parts(0, 1, 2), -1)).toMatchObject({
            monthIndex: 11,
            day: 30,
            year: 1,
        });
    });

    it("rolls over VARIABLE-length months correctly", () => {
        // Variable: Feb 28 + 1 → Mar 1 (Feb has 28 days).
        expect(skipDays(variable, parts(1, 28, 0), 1)).toMatchObject({
            monthIndex: 2,
            day: 1,
            year: 0,
        });
    });

    it("preserves the time of day", () => {
        expect(skipDays(uniform, parts(0, 1, 0, 10, 20, 30), 5)).toEqual(
            parts(0, 6, 0, 10, 20, 30),
        );
    });

    it("returns null when the starting date is invalid", () => {
        expect(skipDays(uniform, parts(0, 99, 0), 1)).toBeNull();
    });
});

describe("optional public calendar picker conversion", () => {
    it("round-trips every month with one-based public dates and preserved seconds", () => {
        for (const calendar of [uniform, variable])
            for (let month = 0; month < 12; month++) {
                const previous = parts(month, 15, 3, 13, 47, 29);
                const selected = datePartsToCalendaria(calendar, previous);
                expect(selected.month).toBe(month + 1);
                expect(selected.day).toBe(15);
                expect(calendariaToWorldTime(calendar, selected, previous)).toBe(
                    datePartsToWorldTime(calendar, previous),
                );
            }
    });
    it("applies the calendar's display year offset in both directions", () => {
        const config = makeConfig([31, 28, 31]);
        config.years.yearZero = 1492;
        const calendar = new (foundry as any).data.CalendarData(config);
        const previous = parts(1, 12, 4, 13, 47, 29);
        expect(datePartsToCalendaria(calendar, previous).year).toBe(1496);
        const selected = { year: 1497, month: 3, day: 2, hour: 6, minute: 10 };
        expect(calendariaToWorldTime(calendar, selected, previous)).toBe(
            datePartsToWorldTime(calendar, parts(2, 2, 5, 6, 10, 29)),
        );
    });
    it("date-only selections preserve hours, minutes, and seconds", () => {
        expect(
            calendariaToWorldTime(
                variable,
                { year: 2, month: 3, day: 17 },
                parts(0, 1, 0, 7, 23, 51),
            ),
        ).toBe(datePartsToWorldTime(variable, parts(2, 17, 2, 7, 23, 51)));
    });
    it.each([
        { year: 0, month: 0, day: 1 },
        { year: 0, month: 13, day: 1 },
        { year: 0, month: 2, day: 31 },
        { year: 0, month: 1, day: 1, hour: 24 },
    ])("rejects invalid public date %j", (selected) => {
        expect(calendariaToWorldTime(variable, selected, parts(0, 1, 0))).toBeNull();
    });
});

/** A custom calendar matching Calendaria's month/dayOfMonth input contract. */
function makeMonthCalendar(leap: boolean): any {
    const actualDays = [31, leap ? 29 : 28, 31];
    const backing = makeCalendar(actualDays);
    const config = makeConfig([31, 28, 31]);
    config.years.yearZero = 1492;
    config.months.values[1].leapDays = 29;
    class MonthCalendar extends (foundry as any).data.CalendarData {
        constructor(calendarConfig: any) {
            super(calendarConfig);
        }
        isLeapYear() {
            return leap;
        }
        componentsToTime({ year = 0, month = 0, dayOfMonth = 0, ...time }: any) {
            // Deliberately ignore `day`, as Calendaria 1.4.5 does.
            const day =
                actualDays.slice(0, month).reduce((sum, length) => sum + length, 0) + dayOfMonth;
            return backing.componentsToTime({ ...time, year, day });
        }
        timeToComponents(time: number) {
            return backing.timeToComponents(time);
        }
    }
    return new MonthCalendar(config);
}

describe("custom calendar month/dayOfMonth contract", () => {
    it.each([false, true])(
        "converts later months with leap=%s and preserves display year and seconds",
        (leap) => {
            const calendar = makeMonthCalendar(leap);
            const previous = parts(0, 1, 0, 7, 23, 29);
            const selected = { year: 1496, month: 3, day: 2, hour: 6, minute: 10 };
            const expectedDay = 31 + (leap ? 29 : 28) + 1;
            const daysPerYear = 31 + (leap ? 29 : 28) + 31;
            const expected =
                (4 * daysPerYear + expectedDay) * SECONDS_PER_DAY + 6 * 3600 + 10 * 60 + 29;
            expect(calendariaToWorldTime(calendar, selected, previous)).toBe(expected);
            expect(worldTimeToDateParts(calendar, expected)).toEqual(parts(2, 2, 4, 6, 10, 29));
            expect(datePartsToCalendaria(calendar, parts(2, 2, 4, 6, 10, 29))).toEqual({
                ...selected,
            });
        },
    );
    it("accepts the leap-only day and rejects overflow in both calendar contracts", () => {
        const calendar = makeMonthCalendar(true);
        const previous = parts(0, 1, 0, 7, 23, 29);
        const time = calendariaToWorldTime(calendar, { year: 1492, month: 2, day: 29 }, previous);
        expect(time).toBe(59 * SECONDS_PER_DAY + 7 * 3600 + 23 * 60 + 29);
        expect(worldTimeToDateParts(calendar, time!)).toEqual(parts(1, 29, 0, 7, 23, 29));
        expect(datePartsToWorldTime(calendar, parts(1, 30, 0))).toBeNull();
        expect(datePartsToWorldTime(makeMonthCalendar(false), parts(1, 29, 0))).toBeNull();
    });
});
