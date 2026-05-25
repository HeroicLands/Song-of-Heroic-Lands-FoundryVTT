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

import type { MovementMedium } from "@src/utils/constants";

/**
 * Per-medium base move in feet per combat round. A value of 0 means
 * the creature cannot move in that medium.
 */
export interface MoveBaseDict {
    terrestrial: number;
    aquatic: number;
    aerial: number;
    burrowing: number;
    astral: number;
}

/**
 * Read the base move for a given medium from a (possibly absent) moveBase
 * dict. Returns 0 when the dict is missing, the medium key is unknown, or
 * the creature has no value for that medium.
 *
 * The caller is responsible for wrapping the returned number in whatever
 * envelope is appropriate (e.g. a `ValueModifier`).
 */
export function readBaseMove(
    moveBase: MoveBaseDict | undefined | null,
    medium: MovementMedium,
): number {
    if (!moveBase) return 0;
    const value = (moveBase as unknown as Record<string, number>)[medium];
    return typeof value === "number" ? value : 0;
}
