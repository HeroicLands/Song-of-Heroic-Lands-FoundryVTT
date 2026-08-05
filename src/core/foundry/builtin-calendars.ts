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

import { VYLARIAN_RECKONING } from "./vylarian-reckoning.mjs";

/**
 * The system's shipped **built-in calendar(s)**, registered into the calendar
 * registry at init (by {@link sohl.core.logic.SohlSystem}). The definitions are
 * **hardcoded in code** — see {@link sohl.core.foundry} `vylarian-reckoning.mjs`
 * — not loaded from a data file, so no fetch/timing concerns and nothing extra
 * ships loose.
 *
 * Ships one: the **Vylarian Reckoning** (`vylrec`), the reckoning of the world of
 * Thalorna and the default active calendar — twelve 30-day months on a 10-day
 * week. A world imports additional calendars through the Calendar Settings menu;
 * a module registers its own via `SohlSystem.registerCalendar(...)`.
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

/**
 * The shipped built-in calendars, default first. Registered at init by
 * {@link sohl.core.logic.SohlSystem} under each entry's `shortcode`.
 */
export const BUILTIN_CALENDARS: readonly BuiltinCalendarData[] = [
    VYLARIAN_RECKONING as BuiltinCalendarData,
];

/**
 * The config of the default built-in calendar (the {@link DEFAULT_CALENDAR_SHORTCODE}),
 * used to seed `CONFIG.time.worldCalendarConfig`.
 */
export const DEFAULT_CALENDAR_CONFIG: object = (
    VYLARIAN_RECKONING as BuiltinCalendarData
).config;
