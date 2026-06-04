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

import type { BodyStructure } from "@src/domain/body/BodyStructure";

/** A strike mode paired with the number of limbs currently wielding it. */
export interface StrikeModeCandidate<T> {
    /** The strike mode itself (returned when available). */
    strikeMode: T;
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
 * {@link isStrikeModeAvailable}), preserving input order. Each mode's required
 * limb count is read from its own `minParts`.
 */
export function selectAvailableStrikeModes<T extends { minParts: number }>(
    candidates: readonly StrikeModeCandidate<T>[],
): T[] {
    return candidates
        .filter((c) => isStrikeModeAvailable(c.heldLimbs, c.strikeMode.minParts))
        .map((c) => c.strikeMode);
}

/**
 * The strike modes available to a combatant, given its anatomy and arms:
 *
 * - every combat-technique mode (intrinsic, always available), and
 * - each weapon mode whose weapon is held in at least the mode's `minParts`
 *   limbs (per {@link BodyStructure.limbsHolding}).
 *
 * Pure domain logic — the caller supplies the already-resolved technique modes
 * and weapons (each an id plus its strike modes); this decides availability.
 *
 * @param bodyStructure The combatant's anatomy, or `undefined` (then no weapon
 *   is considered held).
 * @param techniqueModes The combat techniques' strike modes.
 * @param weapons The combatant's weapons, each with its id and strike modes.
 * @returns The available strike modes, technique modes first, in input order.
 */
export function computeAvailableStrikeModes<T extends { minParts: number }>(
    bodyStructure: BodyStructure | undefined,
    techniqueModes: readonly T[],
    weapons: readonly { id: string; strikeModes: readonly T[] }[],
): T[] {
    const candidates: StrikeModeCandidate<T>[] = [
        ...techniqueModes.map((strikeMode) => ({ strikeMode, heldLimbs: null })),
        ...weapons.flatMap((weapon) => {
            const heldLimbs = bodyStructure?.limbsHolding(weapon.id) ?? 0;
            return weapon.strikeModes.map((strikeMode) => ({
                strikeMode,
                heldLimbs,
            }));
        }),
    ];
    return selectAvailableStrikeModes(candidates);
}
