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

/** The default combat group name used when a token carries no override. */
export const DEFAULT_COMBAT_GROUP = "Opponents";

/** A newly created combatant awaiting group assignment. */
export interface SeedingCombatant {
    /** The combatant's id. */
    id: string;
    /** True if the combatant already belongs to a group (skip it). */
    hasGroup: boolean;
    /** The group name requested via the token flag (may be empty/undefined). */
    desiredName: string | null | undefined;
}

/** An existing {@link CombatantGroup} on the combat. */
export interface ExistingGroup {
    /** The group's id. */
    id: string;
    /** The group's display name. */
    name: string;
}

/** The plan produced by {@link resolveGroupSeeding}. */
export interface GroupSeedingPlan {
    /** Distinct group names to create, in first-seen order, exactly as typed. */
    groupsToCreate: string[];
    /** The group name each ungrouped combatant resolves to. */
    assignments: {
        /** The combatant being assigned. */
        combatantId: string;
        /** The group name it is assigned to. */
        groupName: string;
    }[];
}

/**
 * Compute, without touching Foundry, how a batch of newly created combatants
 * should be seeded into {@link CombatantGroup}s.
 *
 * For each combatant lacking a group, the desired name (falling back to
 * {@link DEFAULT_COMBAT_GROUP} when blank) is matched case-insensitively
 * against existing groups and against names already queued for creation. A
 * distinct new name is queued for creation exactly once — never N racing
 * creates for the same group. Each assignment resolves to the canonical
 * stored name (the existing group's name, or the first-seen casing for a new
 * one) so the caller can map name → id after creation.
 *
 * Does not mutate its inputs.
 *
 * @param newCombatants - The newly created combatants to seed into groups.
 * @param existingGroups - The combatant groups that already exist.
 * @returns The plan describing which groups to create and how to assign combatants.
 */
export function resolveGroupSeeding(
    newCombatants: SeedingCombatant[],
    existingGroups: ExistingGroup[],
): GroupSeedingPlan {
    // lower-cased name -> canonical name, seeded with existing groups.
    const canonicalByLower = new Map<string, string>();
    for (const group of existingGroups) {
        canonicalByLower.set(group.name.toLowerCase(), group.name);
    }

    const existingLower = new Set(canonicalByLower.keys());
    const groupsToCreate: string[] = [];
    const assignments: { combatantId: string; groupName: string }[] = [];

    for (const combatant of newCombatants) {
        if (combatant.hasGroup) continue;

        const name =
            combatant.desiredName?.trim() ?
                combatant.desiredName.trim()
            :   DEFAULT_COMBAT_GROUP;
        const lower = name.toLowerCase();

        let canonical = canonicalByLower.get(lower);
        if (canonical === undefined) {
            canonical = name;
            canonicalByLower.set(lower, canonical);
        }
        if (!existingLower.has(lower) && !groupsToCreate.includes(canonical)) {
            groupsToCreate.push(canonical);
        }

        assignments.push({ combatantId: combatant.id, groupName: canonical });
    }

    return { groupsToCreate, assignments };
}
