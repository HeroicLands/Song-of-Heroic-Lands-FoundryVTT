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
 * The system's shipped **built-in calendar(s)**, registered into the calendar
 * registry at init (by {@link sohl.core.logic.SohlSystem}). The definition is
 * **hardcoded in code** — the {@link VYLARIAN_RECKONING} constant below — not
 * loaded from a data file, so there is no fetch/timing concern and nothing
 * ships loose.
 *
 * Ships one: the **Vylarian Reckoning** (`vylrec`), the reckoning of the world of
 * Thalorna and the default active calendar — twelve 30-day months on a 10-day
 * week (360-day year), the **VR / BVR** era, `yearZero: 720`, no year zero. A
 * world imports additional calendars through the Calendar Settings menu; a module
 * registers its own via `SohlSystem.registerCalendar(...)`.
 */

/** A shipped built-in calendar: its shortcode/id, display label, and config. */
export interface BuiltinCalendarData {
    /** Stable identifier (the registry id; the value `social.calendar` names). */
    shortcode: string;
    /** Display name (a localization key). */
    label: string;
    /** The Foundry `CalendarData.CreateData` config. */
    config: object;
}

/** The shortcode of the calendar new worlds use by default. */
export const DEFAULT_CALENDAR_SHORTCODE = "vylrec";

/** The shipped default calendar — the **Vylarian Reckoning** of Thalorna. */
export const VYLARIAN_RECKONING: BuiltinCalendarData = {
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

/**
 * The shipped built-in calendars, default first. Registered at init by
 * {@link sohl.core.logic.SohlSystem} under each entry's `shortcode`.
 */
export const BUILTIN_CALENDARS: readonly BuiltinCalendarData[] = [VYLARIAN_RECKONING];

/**
 * The config of the default built-in calendar (the {@link DEFAULT_CALENDAR_SHORTCODE}),
 * used to seed `CONFIG.time.worldCalendarConfig`.
 */
export const DEFAULT_CALENDAR_CONFIG: object = VYLARIAN_RECKONING.config;
