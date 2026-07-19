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

import type {
    SohlCalendarData,
    SohlCalendarComponents,
} from "@src/core/foundry/SohlCalendar";

/**
 * The Foundry-free conversion between a stored **worldTime** value (seconds
 * since the calendar epoch) and the calendar parts a user edits in the
 * {@link sohl.document | date-picker} dialog: a month index, a 1-based day of
 * month, and the display (era) year.
 *
 * The active calendar ({@link sohl.core.foundry.SohlCalendarData}) is passed in
 * so these functions stay Foundry-free and unit-testable. Correctness relies on
 * two calendar facts:
 *
 * - {@link foundry.data.CalendarData.componentsToTime} consumes **day-of-year**
 *   (`components.day`) and ignores `month`/`dayOfMonth`, so
 *   {@link datePartsToWorldTime} builds day-of-year from each month's own length
 *   (`days`/`leapDays`, which vary per month and per leap year).
 * - Validity is confirmed by **round-trip** (`componentsToTime` →
 *   `timeToComponents` → compare), which tolerates calendars with intercalary
 *   days and rejects an out-of-range day without assuming uniform months.
 */

/** A selectable month for the date-picker month dropdown. */
export interface MonthChoice {
    /** Zero-based month index (the stored `monthIndex`). */
    index: number;
    /** Localized month name for display. */
    name: string;
}

/**
 * The months of `calendar` as dropdown choices, with localized names.
 * @param calendar - The active calendar.
 * @returns One {@link MonthChoice} per month, in calendar order.
 */
export function monthChoices(calendar: SohlCalendarData): MonthChoice[] {
    return calendar.months.values.map((m, index) => ({
        index,
        name: sohl.i18n.localize(m.name),
    }));
}

/** Editable calendar parts for a worldTime value. */
export interface DateParts {
    /** Zero-based month index (into `calendar.months.values`). */
    monthIndex: number;
    /** One-based day of the month. */
    day: number;
    /** Year as displayed in the calendar's era terms (always positive). */
    eraYear: number;
    /** True when the year falls before the era's epoch. Defaults to `false`. */
    beforeEra: boolean;
    /** Hour of day (0 … hoursPerDay − 1). */
    hour: number;
    /** Minute of hour (0 … minutesPerHour − 1). */
    minute: number;
    /** Second of minute (0 … secondsPerMinute − 1). */
    second: number;
}

/**
 * The number of seconds in one calendar day (`hoursPerDay × minutesPerHour ×
 * secondsPerMinute`). Constant for a given calendar, so day arithmetic on the
 * linear worldTime value is exact regardless of month/year boundaries.
 * @param calendar - The active calendar.
 * @returns Seconds per day.
 */
export function calendarSecondsPerDay(calendar: SohlCalendarData): number {
    const { hoursPerDay, minutesPerHour, secondsPerMinute } = calendar.days;
    return hoursPerDay * minutesPerHour * secondsPerMinute;
}

/**
 * Decompose a worldTime value into the editable calendar parts.
 * @param calendar - The active calendar.
 * @param time - The worldTime value (seconds since epoch).
 * @returns The month index, 1-based day, era year, before-era flag, and time of day.
 */
export function worldTimeToDateParts(
    calendar: SohlCalendarData,
    time: number,
): DateParts {
    const c = calendar.timeToComponents(time) as SohlCalendarComponents;
    return {
        monthIndex: c.month,
        day: c.dayOfMonth + 1,
        eraYear: c.eraYear,
        beforeEra: c.beforeEra,
        hour: c.hour,
        minute: c.minute,
        second: c.second,
    };
}

/**
 * Shift a date by a whole number of days, rolling months and years over
 * correctly. Because a day is a constant number of seconds, this is exact
 * arithmetic on the linear worldTime value — the calendar's own decomposition
 * handles every month/year boundary (including variable-length months and
 * intercalary days).
 * @param calendar - The active calendar.
 * @param parts - The starting date parts (time of day is preserved).
 * @param nDays - Days to add (negative to go backward).
 * @returns The shifted parts, or `null` if `parts` is not a valid date.
 */
export function skipDays(
    calendar: SohlCalendarData,
    parts: DateParts,
    nDays: number,
): DateParts | null {
    const time = datePartsToWorldTime(calendar, parts);
    if (time === null) return null;
    return worldTimeToDateParts(
        calendar,
        time + Math.trunc(nDays) * calendarSecondsPerDay(calendar),
    );
}

/**
 * Convert a display (era) year into the calendar's absolute `year`, inverting
 * {@link sohl.core.foundry.SohlCalendarData.timeToComponents}'s era mapping.
 * @param calendar - The active calendar.
 * @param eraYear - The positive era year.
 * @param beforeEra - Whether the year is before the era epoch.
 * @returns The absolute year used by `componentsToTime`.
 */
function eraYearToAbsolute(
    calendar: SohlCalendarData,
    eraYear: number,
    beforeEra: boolean,
): number {
    if (beforeEra) return -eraYear;
    return eraYear - (calendar.era.hasYearZero ? 0 : 1);
}

/**
 * Day-of-year (0-based) for a month + 1-based day, summing each preceding
 * month's own length (leap-aware). Does not itself validate the day against the
 * month length — {@link datePartsToWorldTime} validates by round-trip.
 * @param calendar - The active calendar.
 * @param absoluteYear - The absolute year (for the leap-year test).
 * @param monthIndex - Zero-based month index.
 * @param day - One-based day of month.
 * @returns The 0-based day of the year.
 */
function dayOfYear(
    calendar: SohlCalendarData,
    absoluteYear: number,
    monthIndex: number,
    day: number,
): number {
    const leap = calendar.isLeapYear(absoluteYear);
    let doy = 0;
    for (let i = 0; i < monthIndex; i++) {
        const m = calendar.months.values[i];
        doy +=
            leap ? ((m as { leapDays?: number }).leapDays ?? m.days) : m.days;
    }
    return doy + (day - 1);
}

/**
 * Convert editable calendar parts to a worldTime value, or `null` when the
 * parts do not resolve to a real date on `calendar`.
 *
 * Validity is checked by round-trip: the computed time is decomposed again and
 * must yield the same month, day-of-month, era year, and before-era flag. This
 * catches an out-of-range day (which would spill into the next month or into
 * intercalary days) and any era mismatch, without assuming uniform months.
 * @param calendar - The active calendar.
 * @param parts - The editable calendar parts.
 * @returns The worldTime value (seconds since epoch), or `null` if invalid.
 */
export function datePartsToWorldTime(
    calendar: SohlCalendarData,
    parts: DateParts,
): number | null {
    const { monthIndex, day, eraYear, beforeEra, hour, minute, second } = parts;
    const { hoursPerDay, minutesPerHour, secondsPerMinute } = calendar.days;
    if (
        !Number.isInteger(monthIndex) ||
        monthIndex < 0 ||
        monthIndex >= calendar.months.values.length ||
        !Number.isInteger(day) ||
        day < 1 ||
        !Number.isInteger(eraYear) ||
        !Number.isInteger(hour) ||
        hour < 0 ||
        hour >= hoursPerDay ||
        !Number.isInteger(minute) ||
        minute < 0 ||
        minute >= minutesPerHour ||
        !Number.isInteger(second) ||
        second < 0 ||
        second >= secondsPerMinute
    ) {
        return null;
    }

    const year = eraYearToAbsolute(calendar, eraYear, beforeEra);
    const doy = dayOfYear(calendar, year, monthIndex, day);
    const time = calendar.componentsToTime({
        year,
        day: doy,
        hour,
        minute,
        second,
    } as foundry.data.CalendarData.TimeComponents);

    // Round-trip the date part (time of day is range-checked above, so it never
    // rolls the day over): month, day-of-month, and era must all match.
    const rt = calendar.timeToComponents(time) as SohlCalendarComponents;
    if (
        rt.month !== monthIndex ||
        rt.dayOfMonth !== day - 1 ||
        rt.eraYear !== eraYear ||
        rt.beforeEra !== beforeEra
    ) {
        return null;
    }
    return time;
}
