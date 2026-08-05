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
    AstrologySign,
    AstrologyTradition,
    AstrologyTraditions,
    MonthDay,
} from "./AstrologyTradition";

/**
 * The **Astrokýklos** — the astrological tradition of the world of Thalorna,
 * shipped as SoHL's built-in default. Its twelve signs each cover a date window
 * (one per Turning Wheel month) that tiles the year exactly, and confer
 * modifiers along the six elements of the associated **Héx Hodäi** arcane
 * tradition: *earth (Physéra)*, *metal (Sidéros)*, *fire (Pyréthos)*, *air
 * (Zephäris)*, *spirit (Pneuménos)*, and *water (Hydälis)* — each mapped to the
 * skill subtypes it governs. (The seventh Héx Hodäi principle, *Kentra* — "The
 * All", the space encompassing every school — is not a birthsign element and so
 * has no column here.) A world replaces or extends this through the Astrology
 * Traditions settings editor.
 */

/** No cusp overlap: the Astrokýklos windows tile the year exactly (birth ⇒ one sign). */
const CUSP_DAYS = 0;

/**
 * Héx Hodäi element → the skill subtype(s) it governs, in the six-column order
 * of the sign table below: earth, metal, fire, air, spirit, water. A column's
 * value is conferred on every subtype it lists.
 */
const ELEMENT_SUBTYPES: readonly (readonly string[])[] = [
    ["nature"], // earth — Physéra
    ["script", "craft"], // metal — Sidéros
    ["combattechnique", "combat"], // fire — Pyréthos
    ["physical"], // air — Zephäris
    ["mystical", "lore"], // spirit — Pneuménos
    ["language", "social"], // water — Hydälis
];

/** One row of the authored Astrokýklos grid. */
interface AstrokyklosSignRow {
    /** The sign's name (its stable identity; lowercased for the shortcode). */
    name: string;
    /** Inclusive window start (1-based month/day). */
    start: MonthDay;
    /** Inclusive window end (1-based month/day; wraps year-end for Opsar). */
    end: MonthDay;
    /** Signed values in element order: [earth, metal, fire, air, spirit, water]. */
    elements: readonly [number, number, number, number, number, number];
}

/**
 * The authored Astrokýklos grid, in Turning Wheel month order — windows
 * transcribed from the `from`/`to` columns and element values from the six
 * element columns.
 */
const ASTROKYKLOS_SIGNS: readonly AstrokyklosSignRow[] = [
    // name        from (m,d)    to (m,d)      earth metal fire  air  spirit water
    {
        name: "Arnos",
        start: { month: 1, day: 4 },
        end: { month: 2, day: 3 },
        elements: [15, 5, -5, -15, -5, 5],
    },
    {
        name: "Bourax",
        start: { month: 2, day: 4 },
        end: { month: 3, day: 2 },
        elements: [10, 10, 0, -10, -10, 0],
    },
    {
        name: "Diplos",
        start: { month: 3, day: 3 },
        end: { month: 4, day: 3 },
        elements: [5, 15, 5, -5, -15, -5],
    },
    {
        name: "Chelyx",
        start: { month: 4, day: 4 },
        end: { month: 5, day: 4 },
        elements: [0, 10, 10, 0, -10, -10],
    },
    {
        name: "Thyron",
        start: { month: 5, day: 5 },
        end: { month: 6, day: 6 },
        elements: [-5, 5, 15, 5, -5, -15],
    },
    {
        name: "Korith",
        start: { month: 6, day: 7 },
        end: { month: 7, day: 5 },
        elements: [-10, 0, 10, 10, 0, -10],
    },
    {
        name: "Stathmos",
        start: { month: 7, day: 6 },
        end: { month: 8, day: 4 },
        elements: [-15, -5, 5, 15, 5, -5],
    },
    {
        name: "Kentros",
        start: { month: 8, day: 5 },
        end: { month: 9, day: 3 },
        elements: [-10, -10, 0, 10, 10, 0],
    },
    {
        name: "Belos",
        start: { month: 9, day: 4 },
        end: { month: 10, day: 2 },
        elements: [-5, -15, -5, 5, 15, 5],
    },
    {
        name: "Tragyx",
        start: { month: 10, day: 3 },
        end: { month: 11, day: 2 },
        elements: [0, -10, -10, 0, 10, 10],
    },
    {
        name: "Nalos",
        start: { month: 11, day: 3 },
        end: { month: 12, day: 1 },
        elements: [5, -5, -15, -5, 5, 15],
    },
    {
        name: "Opsar",
        start: { month: 12, day: 2 },
        end: { month: 1, day: 3 },
        elements: [10, 0, -10, -10, 0, 10],
    },
];

/**
 * Expand an element-value row into a `skillModifiers` map keyed by
 * `"subtype:<skillSubType>"`. Zero-valued elements contribute nothing.
 * @param elements - Signed values in element order (earth…water).
 * @returns The subtype-keyed modifier map.
 */
function buildSkillModifiers(
    elements: readonly number[],
): Record<string, number> {
    const out: Record<string, number> = {};
    elements.forEach((value, i) => {
        if (value === 0) return;
        for (const subType of ELEMENT_SUBTYPES[i]) {
            out[`subtype:${subType}`] = value;
        }
    });
    return out;
}

/** The Astrokýklos tradition, assembled from the authored grid. */
const ASTROKYKLOS: AstrologyTradition = {
    key: "astrokyklos",
    label: "SOHL.Astrology.Tradition.Astrokyklos",
    source: "builtin",
    signs: ASTROKYKLOS_SIGNS.map(
        (row): AstrologySign => ({
            shortcode: row.name.toLowerCase(),
            label: `SOHL.Astrology.Sign.${row.name}`,
            start: row.start,
            end: row.end,
            cuspDays: CUSP_DAYS,
            skillModifiers: buildSkillModifiers(row.elements),
        }),
    ),
};

/**
 * The registry the system ships with: the shipped-in built-in traditions, keyed
 * by tradition key. The Foundry boundary layers world traditions on top (a world
 * entry overrides a built-in of the same key). Returned as a fresh object per
 * call so callers can freely mutate their copy.
 * @returns A shallow map of built-in tradition key → tradition.
 */
export function builtinTraditions(): AstrologyTraditions {
    return { [ASTROKYKLOS.key]: ASTROKYKLOS };
}
