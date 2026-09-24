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

/**
 * The Foundry-free conversion between a stored **worldTime** value (seconds
 * since the calendar epoch) and the calendar parts a user edits in the
 * {@link sohl.document | date-picker} dialog: a month index, a 1-based day of
 * month, and the year.
 *
 * The active calendar is passed in so these functions stay Foundry-free and
 * unit-testable. Only the base `CalendarData` API is read, so the dialog works
 * against whichever calendar the world has installed. Correctness relies on two
 * calendar facts:
 *
 * - {@link foundry.data.CalendarData.componentsToTime} consumes **day-of-year**
 *   (`components.day`) and ignores `month`/`dayOfMonth`, so
 *   {@link datePartsToWorldTime} builds day-of-year from each month's own length
 *   (`days`/`leapDays`, which vary per month and per leap year).
 * - Validity is confirmed by **round-trip** (`componentsToTime` →
 *   `timeToComponents` → compare), which tolerates calendars with intercalary
 *   days and rejects an out-of-range day without assuming uniform months.
 */

/** The active world calendar, read through the base `CalendarData` API alone. */
type PickerCalendar = foundry.data.CalendarData<foundry.data.CalendarData.TimeComponents>;

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
export function monthChoices(calendar: PickerCalendar): MonthChoice[] {
    return calendar.months!.values.map((m, index) => ({
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
    /** The calendar's own year. */
    year: number;
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
export function calendarSecondsPerDay(calendar: PickerCalendar): number {
    const { hoursPerDay, minutesPerHour, secondsPerMinute } = calendar.days;
    return hoursPerDay * minutesPerHour * secondsPerMinute;
}

/**
 * Decompose a worldTime value into the editable calendar parts.
 * @param calendar - The active calendar.
 * @param time - The worldTime value (seconds since epoch).
 * @returns The month index, 1-based day, year, and time of day.
 */
export function worldTimeToDateParts(calendar: PickerCalendar, time: number): DateParts {
    const c = calendar.timeToComponents(time);
    return {
        monthIndex: c.month,
        day: c.dayOfMonth + 1,
        year: c.year,
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
    calendar: PickerCalendar,
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
 * Day-of-year (0-based) for a month + 1-based day, summing each preceding
 * month's own length (leap-aware). Does not itself validate the day against the
 * month length — {@link datePartsToWorldTime} validates by round-trip.
 * @param calendar - The active calendar.
 * @param year - The year (for the leap-year test).
 * @param monthIndex - Zero-based month index.
 * @param day - One-based day of month.
 * @returns The 0-based day of the year.
 */
function dayOfYear(
    calendar: PickerCalendar,
    year: number,
    monthIndex: number,
    day: number,
): number {
    const leap = calendar.isLeapYear(year);
    let doy = 0;
    for (let i = 0; i < monthIndex; i++) {
        const m = calendar.months!.values[i];
        doy += leap ? ((m as { leapDays?: number }).leapDays ?? m.days) : m.days;
    }
    return doy + (day - 1);
}

/**
 * Convert editable calendar parts to a worldTime value, or `null` when the
 * parts do not resolve to a real date on `calendar`.
 *
 * Validity is checked by round-trip: the computed time is decomposed again and
 * must yield the same month, day-of-month, and year. This catches an
 * out-of-range day (which would spill into the next month or into intercalary
 * days), without assuming uniform months.
 * @param calendar - The active calendar.
 * @param parts - The editable calendar parts.
 * @returns The worldTime value (seconds since epoch), or `null` if invalid.
 */
export function datePartsToWorldTime(calendar: PickerCalendar, parts: DateParts): number | null {
    const { monthIndex, day, year, hour, minute, second } = parts;
    const { hoursPerDay, minutesPerHour, secondsPerMinute } = calendar.days;
    if (
        !Number.isInteger(monthIndex) ||
        monthIndex < 0 ||
        monthIndex >= calendar.months!.values.length ||
        !Number.isInteger(day) ||
        day < 1 ||
        !Number.isInteger(year) ||
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

    const doy = dayOfYear(calendar, year, monthIndex, day);
    const time = calendar.componentsToTime({
        year,
        day: doy,
        hour,
        minute,
        second,
    } as foundry.data.CalendarData.TimeComponents);

    // Round-trip the date part (time of day is range-checked above, so it never
    // rolls the day over): month, day-of-month, and year must all match.
    const rt = calendar.timeToComponents(time);
    if (rt.month !== monthIndex || rt.dayOfMonth !== day - 1 || rt.year !== year) {
        return null;
    }
    return time;
}
