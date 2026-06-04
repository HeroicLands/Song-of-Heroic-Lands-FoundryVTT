/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** A strike mode considered for availability, paired with its requirements. */
export interface StrikeModeCandidate<T> {
    /** The strike mode itself (returned when available). */
    strikeMode: T;
    /** Minimum limbs required to wield the mode. */
    minParts: number;
    /**
     * Number of limbs currently holding the weapon, or `null` for an intrinsic
     * mode (a combat technique) that is always available.
     */
    heldLimbs: number | null;
}

/**
 * Whether a strike mode is currently available.
 *
 * Intrinsic modes (`heldLimbs === null`, i.e. combat techniques) are always
 * available. A weapon mode is available only when the weapon is held in at
 * least `minParts` limbs.
 */
export function isStrikeModeAvailable(
    heldLimbs: number | null,
    minParts: number,
): boolean {
    return heldLimbs === null || heldLimbs >= minParts;
}

/**
 * The strike modes of the currently *available* candidates (see
 * {@link isStrikeModeAvailable}), preserving input order.
 */
export function selectAvailableStrikeModes<T>(
    candidates: readonly StrikeModeCandidate<T>[],
): T[] {
    return candidates
        .filter((c) => isStrikeModeAvailable(c.heldLimbs, c.minParts))
        .map((c) => c.strikeMode);
}
