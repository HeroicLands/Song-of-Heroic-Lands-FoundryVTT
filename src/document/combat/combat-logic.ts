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

import { GROUP_STANCE, GroupStance } from "@src/utils/constants";

/**
 * Returns the stance map for a specific group, or an empty object if the group
 * has no recorded stances.
 */
export function getGroupStancesForGroup(
    groupStances: Record<string, Record<string, GroupStance>>,
    group: string,
): Record<string, GroupStance> {
    return groupStances[group] ?? {};
}

/**
 * Returns the names of groups that have an ALLY stance toward the given group.
 */
export function allyGroups(
    groupStances: Record<string, Record<string, GroupStance>>,
    group: string,
): string[] {
    const stances = groupStances[group] ?? {};
    return Object.entries(stances)
        .filter(([, stance]) => stance === GROUP_STANCE.ALLY)
        .map(([targetGroup]) => targetGroup);
}

/**
 * Returns the names of groups that have an ENEMY stance toward the given group.
 */
export function enemyGroups(
    groupStances: Record<string, Record<string, GroupStance>>,
    group: string,
): string[] {
    const stances = groupStances[group] ?? {};
    return Object.entries(stances)
        .filter(([, stance]) => stance === GROUP_STANCE.ENEMY)
        .map(([targetGroup]) => targetGroup);
}

/**
 * Returns a new groupStances object with the specified stance added or updated.
 * Does not mutate the input.
 */
export function withGroupStanceSet(
    groupStances: Record<string, Record<string, GroupStance>>,
    group: string,
    targetGroup: string,
    stance: GroupStance,
): Record<string, Record<string, GroupStance>> {
    const existing = groupStances[group] ?? {};
    return {
        ...groupStances,
        [group]: { ...existing, [targetGroup]: stance },
    };
}

/**
 * Returns a new groupStances object with the specified group removed.
 * Does not mutate the input.
 */
export function withGroupRemoved(
    groupStances: Record<string, Record<string, GroupStance>>,
    group: string,
): Record<string, Record<string, GroupStance>> {
    const result = { ...groupStances };
    delete result[group];
    return result;
}
