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

import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";

/**
 * A group of individuals acting as a unit.
 *
 * A Cohort represents multiple actors treated as a single entity for movement,
 * combat, and other mechanics. Examples include a party of adventurers, a squad
 * of soldiers, a pack of animals, or a ship's crew section.
 *
 * Each member of a Cohort has a unique name and a `shortcode` referencing a
 * world actor that defines their capabilities. Members may be **linked**
 * (directly representing a specific world actor) or **unlinked** (individual
 * instances of a generic type, e.g., several wolves sharing the same base stats
 * but tracked separately). Members also have a
 * {@link sohl.utils.COHORT_MEMBER_ROLE | role} within the cohort (e.g., leader,
 * follower).
 *
 * The Cohort tracks a designated **leader** and a **movement representative**
 * whose movement profile determines the group's travel speed.
 *
 * When placed on a scene, a Cohort can appear as either a single group token
 * or individual tokens per member. Single-token cohorts cannot participate
 * in combat but are useful for representing group movement on large-scale maps.
 *
 * @typeParam TData - The Cohort data interface.
 */
export class CohortLogic<
    TData extends CohortData = CohortData,
> extends SohlActorBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that appends a member to {@link CohortData.members}.
     *
     * @param member - The member entry to add.
     * @returns An update payload (does not itself persist the change).
     */
    addMemberUpdate(member: CohortData["members"][number]): PlainObject {
        return {
            "system.members": [...this.data.members, member],
        };
    }

    /**
     * Build an `update()` payload that removes the member with the given name
     * from {@link CohortData.members}.
     *
     * @param name - The unique name of the member to remove.
     * @returns An update payload (does not itself persist the change).
     */
    removeMemberUpdate(name: string): PlainObject {
        return {
            "system.members": this.data.members.filter((m) => m.name !== name),
        };
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * Persisted data model for a {@link CohortLogic | Cohort} actor.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `cohort` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "cohort"`. The backing DataModel implements this interface.
 */
export interface CohortData<
    TLogic extends SohlActorLogic<CohortData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /** Name of the cohort member serving as leader */
    leaderName: string;
    /** Name of the member whose movement profile determines group speed */
    moveRepName: string;
    /** The individuals that make up this cohort */
    members: {
        /** Shortcode of the world actor that defines this member's capabilities. */
        shortcode: string;
        /** Unique display name for this member within the cohort. */
        name: string;
        /** This member's role within the cohort (e.g. leader, follower). */
        role: string;
    }[];
}
