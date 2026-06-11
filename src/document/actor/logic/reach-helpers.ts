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

/** A melee strike mode considered when computing an actor's reach. */
export interface MeleeReachOption {
    /** The strike mode's effective reach (feet). */
    reach: number;
    /** Minimum limbs required to wield the weapon in this mode. */
    minParts: number;
    /**
     * Number of limbs currently holding the weapon, or `null` for an
     * intrinsic mode (a combat technique) that is always available.
     */
    heldLimbs: number | null;
}

/**
 * Whether a melee strike mode is currently available to the actor.
 *
 * @param option - The strike mode to test.
 * @returns `true` if the mode is intrinsic or the weapon is held in enough limbs.
 */
function isAvailable(option: MeleeReachOption): boolean {
    // Combat techniques (heldLimbs === null) are intrinsic and always
    // available. A weapon mode is available only when the weapon is held in
    // at least `minParts` limbs.
    return option.heldLimbs === null || option.heldLimbs >= option.minParts;
}

/**
 * An actor's melee reach: the greatest reach among its currently *available*
 * melee strike modes (see `isAvailable`). Returns 0 when no melee mode
 * is available.
 *
 * @param options - The candidate melee strike modes to consider.
 * @returns The greatest reach among available modes, or 0 if none are available.
 */
export function computeActorReach(options: MeleeReachOption[]): number {
    return options
        .filter(isAvailable)
        .reduce((max, option) => Math.max(max, option.reach), 0);
}
