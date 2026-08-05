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

import type { AstrologyTraditions } from "./AstrologyTradition";
import { validateTraditions } from "./validate-traditions";
import astrokyklosData from "./astrokyklos.json";

/**
 * The system's shipped **built-in** astrology traditions, loaded from the
 * `astrokyklos.json` **data file** (not hard-coded) so the sign table is data,
 * editable in one place and validated on load.
 *
 * The default is the **Astrokýklos** — the astrological tradition of the world of
 * Thalorna: twelve signs (one per Turning Wheel month) whose date windows tile
 * the year, conferring modifiers along the six elements of the associated **Héx
 * Hodäi** arcane tradition (earth, metal, fire, air, spirit, water) mapped to the
 * skill subtypes they govern. (The seventh Héx Hodäi principle, *Kentra* — "The
 * All" — is not a birthsign element and has no entry.)
 *
 * This is only the shipped default: a world layers overrides through the
 * Astrology Traditions settings editor, and a module registers its own through
 * the runtime registry (`sohl.astrologyRegistry.register(...)`).
 */

/**
 * The **raw, self-describing** built-in tradition data as authored in
 * `astrokyklos.json` (a single tradition object carrying its own `shortcode`,
 * `label`, and `signs`) — before validation. This is the source of truth the
 * system seeds into the registry at init (`register(builtinTraditionsData,
 * "builtin")`), which validates it once. Use {@link builtinTraditions} when a
 * validated {@link AstrologyTraditions} map is wanted instead.
 */
export const builtinTraditionsData: unknown = astrokyklosData;

/**
 * The shipped built-in traditions, validated from the data file and tagged
 * `source: "builtin"`. Returned as a fresh object per call so callers may freely
 * mutate their copy.
 * @returns A map of built-in tradition key → tradition.
 */
export function builtinTraditions(): AstrologyTraditions {
    return validateTraditions(builtinTraditionsData, "builtin").traditions;
}
