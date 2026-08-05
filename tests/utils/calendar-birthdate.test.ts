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

import { describe, it, expect } from "vitest";
import {
    parseBirthday,
    componentsToWorldTime,
    birthdayToWorldTime,
} from "@src/utils/calendar-birthdate.mjs";
import vylarianReckoning from "@assets/calendar/vylarian-reckoning.json";

// The build converts an authored `traits.birthday` (Y/M/D era-year/month/day)
// into the `Being.birthDate` world-time integer using a calendar's config.
// These expectations mirror Foundry's `CalendarData.componentsToTime` arithmetic
// for the Vylarian Reckoning (12 × 30-day months, 360-day year, 86400 s/day,
// `hasYearZero: false` so era-year N is absolute year N − 1).
const VYLARIAN = vylarianReckoning.config;
const SECONDS_PER_DAY = 86400;
const DAYS_PER_YEAR = 360;

describe("parseBirthday", () => {
    it("parses a Y/M/D string into 1-based era-year/month/day", () => {
        expect(parseBirthday("686/4/2")).toEqual({
            eraYear: 686,
            month: 4,
            day: 2,
        });
    });

    it("tolerates surrounding whitespace", () => {
        expect(parseBirthday("  700/1/1  ")).toEqual({
            eraYear: 700,
            month: 1,
            day: 1,
        });
    });

    it("returns null for absent / malformed input", () => {
        expect(parseBirthday(undefined)).toBeNull();
        expect(parseBirthday(null)).toBeNull();
        expect(parseBirthday("")).toBeNull();
        expect(parseBirthday("686-4-2")).toBeNull();
        expect(parseBirthday("686/4")).toBeNull();
        expect(parseBirthday("not a date")).toBeNull();
        expect(parseBirthday("686/0/2")).toBeNull(); // month < 1
        expect(parseBirthday("686/4/0")).toBeNull(); // day < 1
    });
});

describe("componentsToWorldTime (Vylarian Reckoning)", () => {
    it("maps era-year 686, month 4, day 2 to the expected world time", () => {
        // absolute year 685, day-of-year = 3×30 + 1 = 91.
        const totalDays = 685 * DAYS_PER_YEAR + 91;
        expect(
            componentsToWorldTime(VYLARIAN, {
                eraYear: 686,
                month: 4,
                day: 2,
            }),
        ).toBe(totalDays * SECONDS_PER_DAY);
        expect(
            componentsToWorldTime(VYLARIAN, { eraYear: 686, month: 4, day: 2 }),
        ).toBe(21_314_102_400);
    });

    it("maps the first day of the era-year to a whole number of years", () => {
        // era-year 700, month 1, day 1 → absolute year 699, day-of-year 0.
        expect(
            componentsToWorldTime(VYLARIAN, { eraYear: 700, month: 1, day: 1 }),
        ).toBe(699 * DAYS_PER_YEAR * SECONDS_PER_DAY);
    });

    it("accumulates the optional time-of-day components", () => {
        const base = componentsToWorldTime(VYLARIAN, {
            eraYear: 700,
            month: 1,
            day: 1,
        });
        expect(
            componentsToWorldTime(VYLARIAN, {
                eraYear: 700,
                month: 1,
                day: 1,
                hour: 2,
                minute: 3,
                second: 4,
            }),
        ).toBe(base + 2 * 3600 + 3 * 60 + 4);
    });

    it("throws when the month is out of range", () => {
        expect(() =>
            componentsToWorldTime(VYLARIAN, {
                eraYear: 700,
                month: 13,
                day: 1,
            }),
        ).toThrow(/month/i);
    });

    it("throws when the day exceeds the month length", () => {
        expect(() =>
            componentsToWorldTime(VYLARIAN, {
                eraYear: 700,
                month: 1,
                day: 31,
            }),
        ).toThrow(/day/i);
    });
});

describe("birthdayToWorldTime", () => {
    it("parses and converts in one step", () => {
        expect(birthdayToWorldTime(VYLARIAN, "686/4/2")).toBe(21_314_102_400);
    });

    it("returns null for absent / malformed birthdays", () => {
        expect(birthdayToWorldTime(VYLARIAN, undefined)).toBeNull();
        expect(birthdayToWorldTime(VYLARIAN, "")).toBeNull();
        expect(birthdayToWorldTime(VYLARIAN, "nonsense")).toBeNull();
    });
});
