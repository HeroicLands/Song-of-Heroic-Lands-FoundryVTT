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
 * Expands a set of groups by adding all ally groups (transitively, one level).
 *
 * Iterates each group in `myGroups` and calls `allyGroupsFn` to discover allies.
 * Newly discovered ally groups are added to the result set. Groups that are
 * already in the set are not re-processed, preventing infinite loops from
 * mutual alliances.
 *
 * @param myGroups - The initial set of group names (not mutated).
 * @param allyGroupsFn - A function that returns ally group names for a given group.
 * @returns A new Set containing all original groups plus their ally groups.
 */
export function expandAllyGroups(
    myGroups: Set<string>,
    allyGroupsFn: (group: string) => string[],
): Set<string> {
    const result = new Set(myGroups);
    for (const group of myGroups) {
        for (const allyGroup of allyGroupsFn(group)) {
            result.add(allyGroup);
        }
    }
    return result;
}

/** Minimal contract a combatant's actor logic must satisfy for move computation. */
export interface BeingLogicMoveView {
    effectiveBaseMove(medium: MovementMedium): { effective: number };
}

/**
 * Compute the effective tactical move for a combatant in the given medium.
 *
 * Returns `null` when the actor has no `BeingLogic` (e.g. a vehicle actor)
 * or when the actor's base move for this medium is 0 (creature cannot move
 * in this medium). Otherwise returns `effectiveBaseMove(medium) × moveFactor`.
 */
export function computeMove(
    beingLogic: BeingLogicMoveView | undefined | null,
    medium: MovementMedium,
    moveFactor: number,
): number | null {
    if (!beingLogic || typeof beingLogic.effectiveBaseMove !== "function") {
        return null;
    }
    const base = beingLogic.effectiveBaseMove(medium).effective;
    if (!base) return null;
    return base * moveFactor;
}

/**
 * Decide which medium a newly created combatant should display in the
 * combat tracker.
 *
 * Precedence: an explicit user-set medium > the actor's lineage default >
 * nothing (caller keeps the schema default).
 */
export function chooseInitialDisplayedMedium(
    userSetMedium: string | undefined | null,
    lineageDefault: string | undefined | null,
): string | null {
    if (userSetMedium) return userSetMedium;
    if (lineageDefault) return lineageDefault;
    return null;
}
