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

import turningWheel from "./calendars/turning-wheel.json";
import vylarianReckoning from "./calendars/vylarian-reckoning.json";

/**
 * The system's shipped **built-in calendars**, loaded from JSON **data files**
 * (not embedded in code) and registered into the calendar registry at init.
 * Each file is self-describing — a stable **`shortcode`** (its registry id, and
 * the value a character's `social.calendar` names), a display `label`, and the
 * Foundry `CalendarData` `config`.
 *
 * Ships two: the **Vylarian Reckoning** (`vylrec`) — the reckoning of the world
 * of Thalorna and the default active calendar — and the **Turning Wheel**
 * (`twheel`). Both are twelve 30-day months on a 10-day week; they differ only in
 * their month and era names.
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
    vylarianReckoning as BuiltinCalendarData,
    turningWheel as BuiltinCalendarData,
];

/**
 * The config of the default built-in calendar (the {@link DEFAULT_CALENDAR_SHORTCODE}),
 * used to seed `CONFIG.time.worldCalendarConfig`.
 */
export const DEFAULT_CALENDAR_CONFIG: object =
    BUILTIN_CALENDARS.find((c) => c.shortcode === DEFAULT_CALENDAR_SHORTCODE)
        ?.config ?? vylarianReckoning.config;
