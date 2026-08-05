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
 * The manifest of the system's shipped **built-in calendars**. These are true
 * **data files** — fetched over HTTP at runtime (`sohl.fetchJson` →
 * {@link fvttFetchJson}) from
 * `systems/sohl/assets/calendar/` and registered into the calendar registry at
 * init, exactly as a module loads its own. This module holds only the *paths*
 * (and the code constants that must live in code, not data); the calendar
 * definitions are never imported into the bundle. Each file is self-describing —
 * a stable **`shortcode`** (its registry id, and the value a character's
 * `social.calendar` names), a display `label`, and the Foundry `CalendarData`
 * `config`.
 *
 * Ships two: the **Vylarian Reckoning** (`vylrec`) — the reckoning of the world
 * of Thalorna and the default active calendar — and the **Turning Wheel**
 * (`twheel`). Both are twelve 30-day months on a 10-day week; they differ only in
 * their month and era names.
 */

/** A shipped built-in calendar file: its shortcode/id, display label, and config. */
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
 * The Foundry data paths of the shipped built-in calendar files, default first.
 * Fetched and registered at init by `registerBuiltinCalendars` in `sohl.ts`,
 * each under its file's own `shortcode`.
 */
export const BUILTIN_CALENDAR_PATHS: readonly string[] = [
    "systems/sohl/assets/calendar/vylarian-reckoning.json",
    "systems/sohl/assets/calendar/turning-wheel.json",
];

/**
 * A **bootstrap placeholder** for `SOHLCONFIG.time.worldCalendarConfig`. The real
 * default calendar config is not available synchronously at module load (it lives
 * in a data file). `sohl.ts` fetches it during `init` and assigns the real config
 * to `SOHLCONFIG.time.worldCalendarConfig` **before** `setupSystem()` merges
 * `SOHLCONFIG` into Foundry's `CONFIG` — so this empty object is only what the
 * field holds during the brief window before that runs.
 */
export const DEFAULT_CALENDAR_CONFIG: object = {};
