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
 * The shipped **default calendar** — the **Vylarian Reckoning** of the world of
 * Thalorna — hardcoded in code (not a data file). Twelve 30-day months on a
 * 10-day week (360-day year), the **VR / BVR** era, `yearZero: 720`, no year zero.
 *
 * This is a framework-free `.mjs` so it is a single source shared by both the
 * TypeScript runtime (`builtin-calendars.ts`, which registers it into the
 * calendar registry) and the Node content build (`utils/packs/calendars.mjs`,
 * which reads its month lengths to convert an authored `traits.birthday` into a
 * stored `Being.birthDate`). A `.ts` constant would not be importable by the
 * build script; a `.json` data file would have to be fetched or bundled.
 *
 * @typedef {object} BuiltinCalendarData
 * @property {string} shortcode - Stable registry id (the value `social.calendar` names).
 * @property {string} label     - Display name (a localization key).
 * @property {object} config    - The Foundry `CalendarData.CreateData` config.
 */

/** @type {BuiltinCalendarData} */
export const VYLARIAN_RECKONING = {
    shortcode: "vylrec",
    label: "SOHL.CalendarSettings.vylarian",
    config: {
        name: "Vylarian Reckoning",
        description: "The Vylarian Reckoning calendar of Thalorna.",
        years: {
            yearZero: 720,
            firstWeekday: 0,
        },
        era: {
            name: "SOHL.CALENDAR.VYLARIAN.EraName",
            abbrev: "SOHL.CALENDAR.VYLARIAN.EraAbbr",
            beforeName: "SOHL.CALENDAR.VYLARIAN.BeforeEraName",
            beforeAbbrev: "SOHL.CALENDAR.VYLARIAN.BeforeEraAbbr",
            description: "",
            hasYearZero: false,
        },
        months: {
            values: Array.from({ length: 12 }, (_unused, i) => ({
                name: `SOHL.Calendar.Vylarian.Month.${i}.label`,
                abbreviation: `SOHL.Calendar.Vylarian.Month.${i}.abbr`,
                ordinal: i + 1,
                days: 30,
            })),
        },
        days: {
            values: Array.from({ length: 10 }, (_unused, i) => ({
                name: `SOHL.Calendar.Default.Weekday.${i}.label`,
                abbreviation: `SOHL.Calendar.Default.Weekday.${i}.abbr`,
                ordinal: i + 1,
            })),
            daysPerYear: 360,
            hoursPerDay: 24,
            minutesPerHour: 60,
            secondsPerMinute: 60,
        },
        seasons: {
            values: [
                {
                    name: "SOHL.Calendar.Default.Season.0.label",
                    monthStart: 1,
                    monthEnd: 3,
                },
                {
                    name: "SOHL.Calendar.Default.Season.1.label",
                    monthStart: 4,
                    monthEnd: 6,
                },
                {
                    name: "SOHL.Calendar.Default.Season.2.label",
                    monthStart: 7,
                    monthEnd: 9,
                },
                {
                    name: "SOHL.Calendar.Default.Season.3.label",
                    monthStart: 10,
                    monthEnd: 12,
                },
            ],
        },
    },
};
