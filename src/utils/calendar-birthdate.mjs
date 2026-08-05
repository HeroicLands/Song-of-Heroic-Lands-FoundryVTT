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
 * Foundry-free conversion of an authored calendar date (`Y/M/D` era-year /
 * month / day) into the world-time integer a `Being.birthDate` stores (#1039).
 *
 * The content build authors birthdays as calendar components but persists a
 * calendar-agnostic world-time value (seconds, `game.time.worldTime` scale);
 * the astrology derivation (#1018) later decomposes that value through the
 * **active** calendar. This module supplies the build-time components → seconds
 * mapping without loading Foundry, mirroring the arithmetic of Foundry's
 * `CalendarData.componentsToTime` for the non-leap calendars SoHL ships. It is a
 * pure module (no `fs`, no Foundry globals) so it bundles into the client and is
 * unit-testable in Node; the build resolves the calendar `config` it takes from
 * the shipped calendar JSON (see `utils/packs/calendars.mjs`).
 */

/** `Y/M/D` — era-year, month, day, each a run of decimal digits. */
const BIRTHDAY_RE = /^(\d+)\/(\d+)\/(\d+)$/;

/**
 * Parse an authored `traits.birthday` string (`Y/M/D`, 1-based era-year / month
 * / day, e.g. `686/4/2`) into its numeric components.
 *
 * @param {unknown} raw - The authored birthday value (or `undefined`/`null`).
 * @returns {{ eraYear: number, month: number, day: number } | null} The parsed
 *   components, or `null` when the value is absent or not a well-formed `Y/M/D`
 *   string with all parts `>= 1`.
 */
export function parseBirthday(raw) {
    if (typeof raw !== "string") return null;
    const match = BIRTHDAY_RE.exec(raw.trim());
    if (!match) return null;
    const eraYear = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (eraYear < 1 || month < 1 || day < 1) return null;
    return { eraYear, month, day };
}

/**
 * Convert calendar date components to a world-time integer (seconds) using a
 * calendar's `config`, mirroring Foundry's `CalendarData.componentsToTime`.
 *
 * The era-year is mapped to Foundry's absolute `year` the same way
 * {@link SohlCalendarData.timeToComponents} inverts it: after-era year `N` is
 * absolute year `N − (hasYearZero ? 0 : 1)`. Only after-era dates are
 * supported — the authored `Y/M/D` format carries no before-era marker. The
 * shipped calendars declare no `years.leapYear`, so leap-year calendars are
 * rejected rather than converted incorrectly.
 *
 * @param {object} config - A Foundry `CalendarData` config (the `config` block
 *   of a shipped calendar JSON): `months.values[].days`, `days.daysPerYear`,
 *   `days.{hoursPerDay,minutesPerHour,secondsPerMinute}`, and `era.hasYearZero`.
 * @param {object} components - The date components.
 * @param {number} components.eraYear - 1-based era year (`>= 1`).
 * @param {number} components.month - 1-based month.
 * @param {number} components.day - 1-based day of the month.
 * @param {number} [components.hour=0] - Hour of the day.
 * @param {number} [components.minute=0] - Minute of the hour.
 * @param {number} [components.second=0] - Second of the minute.
 * @returns {number} The world-time value in seconds.
 * @throws {Error} If the calendar uses leap years, or the month/day falls
 *   outside the calendar's ranges.
 */
export function componentsToWorldTime(config, components) {
    const {
        eraYear,
        month,
        day,
        hour = 0,
        minute = 0,
        second = 0,
    } = components;

    if (config?.years?.leapYear) {
        throw new Error(
            "birthday conversion does not support leap-year calendars",
        );
    }

    const months = config.months.values;
    if (!Number.isInteger(month) || month < 1 || month > months.length) {
        throw new Error(`month ${month} is out of range 1..${months.length}`);
    }
    const monthIndex = month - 1;
    const monthDays = months[monthIndex].days;
    if (!Number.isInteger(day) || day < 1 || day > monthDays) {
        throw new Error(
            `day ${day} is out of range 1..${monthDays} for month ${month}`,
        );
    }

    const hasYearZero = config.era?.hasYearZero ?? false;
    const year = eraYear - (hasYearZero ? 0 : 1);

    // Day of the year (0-based): sum the preceding months' lengths, then the
    // 0-based day of the current month.
    let dayOfYear = 0;
    for (let i = 0; i < monthIndex; i++) dayOfYear += months[i].days;
    dayOfYear += day - 1;

    const { secondsPerMinute, minutesPerHour, hoursPerDay, daysPerYear } =
        config.days;
    // Non-leap path of Foundry's componentsToTime: total days = year-boundary
    // days (year × daysPerYear) plus the day-of-year offset.
    const totalDays = year * daysPerYear + dayOfYear;
    let time = totalDays * secondsPerMinute * minutesPerHour * hoursPerDay;
    time += hour * secondsPerMinute * minutesPerHour;
    time += minute * secondsPerMinute;
    time += second;
    return time;
}

/**
 * Parse and convert an authored `traits.birthday` string in one step.
 *
 * @param {object} config - A Foundry `CalendarData` config (see
 *   {@link componentsToWorldTime}).
 * @param {unknown} raw - The authored birthday value (`Y/M/D`), or
 *   `undefined`/`null`/`""` for "no birthday".
 * @returns {number | null} The world-time value in seconds, or `null` when the
 *   birthday is absent or not a well-formed `Y/M/D` string.
 * @throws {Error} If the parsed month/day is out of the calendar's range, or the
 *   calendar uses leap years (propagated from {@link componentsToWorldTime}).
 */
export function birthdayToWorldTime(config, raw) {
    const parts = parseBirthday(raw);
    if (!parts) return null;
    return componentsToWorldTime(config, parts);
}
