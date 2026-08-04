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

import type {
    AstrologyTradition,
    AstrologyTraditions,
} from "./AstrologyTradition";

/**
 * A single, deliberately **generic** built-in tradition shipped so the
 * astrology mechanism works out of the box and has something to demonstrate —
 * the four-quarter *Wheel of the Year*. Its signs, cusps, and modifiers are
 * original, system-neutral placeholders (no game-world content): a world
 * replaces or extends it through the Astrology Traditions settings editor, and
 * the migration converts a world's existing birthsigns into world traditions.
 *
 * It exercises every mechanic — wrapping windows, a cusp between neighbours, a
 * `subtype:` wildcard, and a specific-shortcode override of that wildcard —
 * against the default 360-day (12 × 30) calendar.
 */
const WHEEL_OF_THE_YEAR: AstrologyTradition = {
    key: "wheel-of-the-year",
    label: "SOHL.Astrology.Tradition.WheelOfTheYear",
    source: "builtin",
    signs: [
        {
            shortcode: "dawnsign",
            label: "SOHL.Astrology.Sign.Dawnsign",
            start: { month: 1, day: 1 },
            end: { month: 3, day: 30 },
            cuspDays: 3,
            skillModifiers: { "subtype:combat": 5 },
        },
        {
            shortcode: "zenithsign",
            label: "SOHL.Astrology.Sign.Zenithsign",
            start: { month: 4, day: 1 },
            end: { month: 6, day: 30 },
            cuspDays: 3,
            skillModifiers: { "subtype:craft": 5 },
        },
        {
            shortcode: "dusksign",
            label: "SOHL.Astrology.Sign.Dusksign",
            start: { month: 7, day: 1 },
            end: { month: 9, day: 30 },
            cuspDays: 3,
            skillModifiers: { "subtype:lore": 5 },
        },
        {
            // Wraps across year-end (month 10 → month 12), demonstrating a
            // window whose start day-of-year is greater than its end.
            shortcode: "midnightsign",
            label: "SOHL.Astrology.Sign.Midnightsign",
            start: { month: 10, day: 1 },
            end: { month: 12, day: 30 },
            cuspDays: 3,
            skillModifiers: { "subtype:physical": 5 },
        },
    ],
};

/**
 * The registry the system ships with: the shipped-in built-in traditions,
 * keyed by tradition key. Frozen — the Foundry boundary layers world
 * traditions on top (world entries override a built-in with the same key).
 * Returned as a fresh object per call so callers can freely mutate their copy.
 * @returns A shallow map of built-in tradition key → tradition.
 */
export function builtinTraditions(): AstrologyTraditions {
    return { [WHEEL_OF_THE_YEAR.key]: WHEEL_OF_THE_YEAR };
}
