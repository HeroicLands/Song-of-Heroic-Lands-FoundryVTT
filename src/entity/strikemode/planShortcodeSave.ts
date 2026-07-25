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
 * The decision produced by {@link planShortcodeSave}: the shortcode a weapon
 * strike mode should be saved with, and — when the requested value was rejected
 * — why.
 */
export interface ShortcodeSavePlan {
    /**
     * The shortcode to persist on the edited strike mode. The requested value
     * when it is valid and unique; otherwise the mode's existing shortcode
     * (the edit is kept, only the shortcode change is refused).
     */
    shortcode: string;
    /**
     * A human-readable reason the requested shortcode was rejected, or
     * `undefined` when the requested value was accepted. When set, the caller
     * should surface this message and fall back to {@link shortcode}.
     */
    error?: string;
}

/**
 * Characters permitted in a strike-mode shortcode: word characters and dashes
 * only. The shortcode is matched against `strikeModeId` scope values and DOM
 * `data-sm-id` attributes, so keeping it to a plain slug avoids surprises.
 */
const VALID_SHORTCODE = /^[\w-]+$/;

/**
 * Validate a possibly-changed shortcode for a weapon strike mode.
 *
 * A weapon's strike modes are stored as an array; each element carries its own
 * shortcode, and no two modes on one weapon may share one. When the submitted
 * shortcode is unchanged it is accepted as-is; otherwise it must be non-blank,
 * use only `[\w-]` characters, and not collide with any sibling. On rejection
 * the plan keeps the mode's current shortcode and reports the reason.
 *
 * Pure and Foundry-free.
 *
 * @param currentShortcode - The shortcode the strike mode is stored with today.
 * @param submittedShortcode - The shortcode from the edited form (trimmed here).
 * @param siblingShortcodes - The shortcodes of the weapon's *other* strike modes
 *   (excluding the one being edited).
 * @returns A {@link ShortcodeSavePlan}.
 */
export function planShortcodeSave(
    currentShortcode: string,
    submittedShortcode: string,
    siblingShortcodes: readonly string[],
): ShortcodeSavePlan {
    const next = (submittedShortcode ?? "").trim();
    const keep = (error?: string): ShortcodeSavePlan => ({
        shortcode: currentShortcode,
        error,
    });

    if (next === currentShortcode) return { shortcode: currentShortcode };
    if (next === "") return keep("Shortcode cannot be blank.");
    if (!VALID_SHORTCODE.test(next)) {
        return keep(
            `Shortcode "${next}" is invalid: use only letters, numbers, underscores, and dashes.`,
        );
    }
    if (siblingShortcodes.includes(next)) {
        return keep(
            `A strike mode with shortcode "${next}" already exists on this weapon.`,
        );
    }
    return { shortcode: next };
}

/**
 * Derive a unique strike-mode shortcode from a suggested base, avoiding any
 * already in use on the weapon. The base is slugged to `[\w-]` (falling back to
 * `"mode"` when nothing survives); if it is taken, an incrementing numeric
 * suffix is appended (`sword`, `sword2`, `sword3`, …).
 *
 * Pure and Foundry-free.
 *
 * @param base - The suggested shortcode (e.g. the new mode's name).
 * @param existing - Every shortcode already present on the weapon.
 * @returns A shortcode not present in `existing`.
 */
export function uniqueShortcode(
    base: string,
    existing: readonly string[],
): string {
    const taken = new Set(existing);
    const slug = (base ?? "").toLowerCase().replace(/[^\w-]+/g, "") || "mode";
    if (!taken.has(slug)) return slug;
    for (let n = 2; ; n++) {
        const candidate = `${slug}${n}`;
        if (!taken.has(candidate)) return candidate;
    }
}
