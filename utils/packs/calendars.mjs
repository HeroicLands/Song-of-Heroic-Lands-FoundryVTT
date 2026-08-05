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
 * Build-time access to the shipped calendar definitions. The content build reads
 * a character's birth calendar (`social.calendar`, or the default) to convert an
 * authored `traits.birthday` into the stored `Being.birthDate` world-time value
 * (#1039). It imports the **same hardcoded definitions the runtime registers**
 * (`src/core/foundry/vylarian-reckoning.mjs`, a framework-free `.mjs` shared with
 * `src/core/foundry/builtin-calendars.ts`), so there is no second copy of the
 * calendar definitions.
 */

import { VYLARIAN_RECKONING } from "../../src/core/foundry/vylarian-reckoning.mjs";

/** The shipped built-in calendars (default first) — hardcoded, shared with the runtime. */
const BUILTIN_CALENDARS = [VYLARIAN_RECKONING];

/**
 * The shortcode of the calendar used when a character names no `social.calendar`.
 * Mirrors `DEFAULT_CALENDAR_SHORTCODE` in
 * `src/core/foundry/builtin-calendars.ts`.
 */
export const DEFAULT_CALENDAR_SHORTCODE = "vylrec";

/** @type {Map<string, object> | undefined} Lazily-built shortcode → config. */
let cache;

/**
 * Index the shipped calendars by their `shortcode`. Cached after the first call.
 * @returns {Map<string, object>} Shortcode → Foundry `CalendarData` config.
 */
function loadCalendars() {
    if (cache) return cache;
    cache = new Map();
    for (const cal of BUILTIN_CALENDARS) {
        if (cal?.shortcode && cal.config) cache.set(cal.shortcode, cal.config);
    }
    return cache;
}

/**
 * Resolve a calendar's config by shortcode, failing fast on an unknown one so a
 * typo in a character's `social.calendar` surfaces as a build error rather than
 * silently defaulting.
 * @param {string} shortcode - The calendar shortcode (e.g. `"vylrec"`).
 * @returns {object} The Foundry `CalendarData` config for that calendar.
 * @throws {Error} If no shipped calendar declares that shortcode.
 */
export function resolveCalendarConfig(shortcode) {
    const config = loadCalendars().get(shortcode);
    if (!config) {
        const known = [...loadCalendars().keys()].join(", ");
        throw new Error(
            `Unknown calendar shortcode "${shortcode}" (known: ${known})`,
        );
    }
    return config;
}
