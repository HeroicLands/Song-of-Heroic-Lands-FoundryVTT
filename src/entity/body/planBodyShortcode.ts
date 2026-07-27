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
 * The decision produced by {@link planBodyShortcode}: the shortcode a body part
 * or body location should be saved with, and — when the requested value was
 * rejected — why.
 */
export interface BodyShortcodeSavePlan {
    /**
     * The shortcode to persist. The requested value when it is valid and
     * unique; otherwise the entry's existing shortcode (the edit is kept, only
     * the shortcode change is refused).
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
 * Characters permitted in a body part/location shortcode: word characters and
 * dashes only. A shortcode identifies an entry within its owner (a part within
 * the structure, a location within its part) and is used as a DOM/data key, so
 * keeping it to a plain slug avoids surprises.
 */
const VALID_SHORTCODE = /^[\w-]+$/;

/**
 * Validate a body-entry shortcode against its siblings' shortcodes.
 *
 * The shortcode must be non-blank, use only `[\w-]` characters, and not collide
 * with any of `existing`. `noun` names the entry kind ("body part" / "body
 * location") and `scope` names where uniqueness is required ("this body" /
 * "this part") so the rejection message reads naturally.
 *
 * Pure and Foundry-free.
 *
 * @param candidate - The proposed shortcode (trimmed here).
 * @param existing - The shortcodes it must not collide with.
 * @param noun - The entry kind, for the message (e.g. `"body part"`).
 * @param scope - Where uniqueness applies, for the message (e.g. `"this body"`).
 * @returns A human-readable rejection reason, or `undefined` if it is valid.
 */
export function validateBodyShortcode(
    candidate: string,
    existing: readonly string[],
    noun: string,
    scope: string,
): string | undefined {
    const sc = (candidate ?? "").trim();
    if (sc === "") return "Shortcode cannot be blank.";
    if (!VALID_SHORTCODE.test(sc)) {
        return `Shortcode "${sc}" is invalid: use only letters, numbers, underscores, and dashes.`;
    }
    if (existing.includes(sc)) {
        return `A ${noun} with shortcode "${sc}" already exists on ${scope}.`;
    }
    return undefined;
}

/**
 * Validate a possibly-changed shortcode for a body part or body location.
 *
 * When the submitted shortcode is unchanged it is accepted as-is; otherwise it
 * is checked with {@link validateBodyShortcode}. On rejection the plan keeps the
 * entry's current shortcode and reports the reason, so an in-progress edit is
 * never lost to a bad shortcode.
 *
 * Pure and Foundry-free.
 *
 * @param currentShortcode - The shortcode the entry is stored with today.
 * @param submittedShortcode - The shortcode from the edited form (trimmed here).
 * @param siblingShortcodes - The shortcodes of the *other* sibling entries
 *   (excluding the one being edited).
 * @param noun - The entry kind, for the message (e.g. `"body part"`).
 * @param scope - Where uniqueness applies, for the message (e.g. `"this body"`).
 * @returns A {@link BodyShortcodeSavePlan}.
 */
export function planBodyShortcode(
    currentShortcode: string,
    submittedShortcode: string,
    siblingShortcodes: readonly string[],
    noun: string,
    scope: string,
): BodyShortcodeSavePlan {
    const next = (submittedShortcode ?? "").trim();
    if (next === currentShortcode) return { shortcode: currentShortcode };
    const error = validateBodyShortcode(next, siblingShortcodes, noun, scope);
    if (error) return { shortcode: currentShortcode, error };
    return { shortcode: next };
}
