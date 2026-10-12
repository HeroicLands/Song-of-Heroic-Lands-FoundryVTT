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

/** Held-item identity is per body part, not per hit location. */
export interface TakePart {
    /** Stable part code. */
    shortcode: string;
    /** Item held by the part, if any. */
    heldItemId: string | null;
    /** Whether this part can grip an object now. */
    canHoldItem: boolean;
    /** Immobilized hands cannot receive an object. */
    immobilized: boolean;
}

/** A won Take's grip changes; inventory writes are owner-controlled separately. */
export interface TakePlan {
    /** Object held in the struck part. */
    itemId: string;
    /** Every grip of that same object, including a two-handed grip. */
    releasePartCodes: string[];
    /** A usable empty hand of the taker, or null for the ground. */
    receivePartCode: string | null;
}

/**
 * Plan a won Take from live target/taker body parts.
 * A full-handed taker still disarms; an empty struck part has no effect.
 * @param struckPartCode - The part struck; location within it is irrelevant.
 * @param targetParts - Live target grips.
 * @param takerParts - Live taker hands, in preferred order.
 * @returns Grip changes, or undefined when there is no held item to take.
 */
export function planGrabTake(
    struckPartCode: string,
    targetParts: readonly TakePart[],
    takerParts: readonly TakePart[],
): TakePlan | undefined {
    const itemId = targetParts.find((part) => part.shortcode === struckPartCode)?.heldItemId;
    if (!itemId) return undefined;
    return {
        itemId,
        releasePartCodes: targetParts
            .filter((part) => part.heldItemId === itemId)
            .map((part) => part.shortcode),
        receivePartCode:
            takerParts.find((part) => part.canHoldItem && !part.heldItemId && !part.immobilized)
                ?.shortcode ?? null,
    };
}
