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
 * Build-time access to the shipped calendar data files. The content build reads
 * a character's birth calendar (`social.calendar`, or the default) to convert an
 * authored `traits.birthday` into the stored `Being.birthDate` world-time value
 * (#1039). It reads the same JSON files the runtime registers
 * (`src/core/foundry/calendars/*.json`, see
 * `src/core/foundry/builtin-calendars.ts`), so there is no second copy of the
 * calendar definitions — only the default-shortcode constant is mirrored here,
 * since that lives in code, not data.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Directory holding the shipped calendar JSON files. */
const CALENDARS_DIR = path.resolve(
    __dirname,
    "../../src/core/foundry/calendars",
);

/**
 * The shortcode of the calendar used when a character names no `social.calendar`.
 * Mirrors `DEFAULT_CALENDAR_SHORTCODE` in
 * `src/core/foundry/builtin-calendars.ts` (a code constant, not a data file).
 */
export const DEFAULT_CALENDAR_SHORTCODE = "vylrec";

/** @type {Map<string, object> | undefined} Lazily-loaded shortcode → config. */
let cache;

/**
 * Load every shipped calendar, indexed by its `shortcode`. Cached after the
 * first call. Malformed files (no `shortcode`/`config`) are skipped.
 * @returns {Map<string, object>} Shortcode → Foundry `CalendarData` config.
 */
function loadCalendars() {
    if (cache) return cache;
    cache = new Map();
    for (const file of fs.readdirSync(CALENDARS_DIR)) {
        if (!file.endsWith(".json")) continue;
        const data = JSON.parse(
            fs.readFileSync(path.join(CALENDARS_DIR, file), "utf8"),
        );
        if (data?.shortcode && data.config) {
            cache.set(data.shortcode, data.config);
        }
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
