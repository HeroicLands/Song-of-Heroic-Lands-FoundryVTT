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
 * Validate a strike-mode shortcode against the weapon's other shortcodes.
 *
 * The shortcode must be non-blank, use only `[\w-]` characters, and not collide
 * with any of `existing`. Used when creating a new mode (all current shortcodes
 * are `existing`) and, via {@link planShortcodeSave}, when editing one (the
 * edited mode's own shortcode excluded from `existing`).
 *
 * Pure and Foundry-free.
 *
 * @param candidate - The proposed shortcode (trimmed here).
 * @param existing - The shortcodes it must not collide with.
 * @returns A human-readable rejection reason, or `undefined` if it is valid.
 */
export function validateShortcode(
    candidate: string,
    existing: readonly string[],
): string | undefined {
    const sc = (candidate ?? "").trim();
    if (sc === "") return "Shortcode cannot be blank.";
    if (!VALID_SHORTCODE.test(sc)) {
        return `Shortcode "${sc}" is invalid: use only letters, numbers, underscores, and dashes.`;
    }
    if (existing.includes(sc)) {
        return `A strike mode with shortcode "${sc}" already exists on this weapon.`;
    }
    return undefined;
}

/**
 * Validate a possibly-changed shortcode for a weapon strike mode.
 *
 * A weapon's strike modes are stored as an array; each element carries its own
 * shortcode, and no two modes on one weapon may share one. When the submitted
 * shortcode is unchanged it is accepted as-is; otherwise it is checked with
 * {@link validateShortcode}. On rejection the plan keeps the mode's current
 * shortcode and reports the reason.
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
    if (next === currentShortcode) return { shortcode: currentShortcode };
    const error = validateShortcode(next, siblingShortcodes);
    if (error) return { shortcode: currentShortcode, error };
    return { shortcode: next };
}
