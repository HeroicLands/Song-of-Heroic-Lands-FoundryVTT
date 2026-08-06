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
import {
    collectSharedGear,
    type SharedGearEntry,
} from "@src/document/actor/logic/cohort-shared-gear";
import type { GearLogic } from "@src/document/item/logic/GearLogic";
import { fvttActorByRef } from "@src/core/FoundryHelpers";
import { isGearKind } from "@src/utils/constants";

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
    /* Membership                                    */
    /* --------------------------------------------- */

    /**
     * The logic of every member actor this cohort can resolve.
     *
     * Each {@link CohortData.members} entry names its world actor by
     * `shortcodeOrUuid` — a `system.shortcode` for a world or compendium actor,
     * a UUID for an unlinked Token Actor — resolved through
     * {@link fvttActorByRef}. Entries that no longer
     * resolve (the actor was deleted, or this client cannot see it) are simply
     * absent; a cohort with a stale member still lists the rest.
     *
     * @returns One logic per resolvable member, in `members` order.
     */
    get memberLogics(): SohlActorLogic<any>[] {
        const logics: SohlActorLogic<any>[] = [];
        for (const member of this.data.members) {
            const actor = fvttActorByRef(member.shortcodeOrUuid);
            const logic = actor?.logic as SohlActorLogic<any> | undefined;
            if (logic) logics.push(logic);
        }
        return logics;
    }

    /* --------------------------------------------- */
    /* Shared gear                                   */
    /* --------------------------------------------- */

    /**
     * Every reference by which a gear item may name **this** cohort in its
     * `system.sharedWithCohortIds` — the cohort's `shortcode`, its document id,
     * and its UUID. The inverse of
     * {@link sohl.document.item.logic.GearLogic.sharedWithCohorts}.
     *
     * @returns The non-empty reference keys identifying this cohort.
     */
    get sharingRefs(): string[] {
        return [this.data.shortcode, this.data.id, this.data.uuid].filter(
            (ref): ref is string => !!ref,
        );
    }

    /**
     * The gear this cohort's members have shared with it (issue #76).
     *
     * A cohort carries nothing of its own: this walks each resolvable member and
     * collects the gear whose sharing list names this cohort, pairing every item
     * with the member that actually carries it. The result is **read-only** — the
     * item stays on its custodian, and it is edited there.
     *
     * @returns One entry per shared item, ordered by carrier then item name.
     */
    get sharedGear(): SharedGearEntry<GearLogic>[] {
        const carriers = this.memberLogics.map((logic) => ({
            name: logic.data.name,
            uuid: logic.data.uuid,
            gear: logic.allLogics.filter((item): item is GearLogic =>
                isGearKind(item.data.kind),
            ),
        }));
        return collectSharedGear(carriers, this.sharingRefs);
    }

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
     * Build an `update()` payload that removes the member with the given shortcode or UUID
     * from {@link CohortData.members}.
     *
     * @param shortcodeOrUuid - The shortcode or UUID of the member to remove.
     * @returns An update payload (does not itself persist the change).
     */
    removeMemberUpdate(shortcodeOrUuid: string): PlainObject {
        return {
            "system.members": this.data.members.filter(
                (m) => m.shortcodeOrUuid !== shortcodeOrUuid,
            ),
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
    leaderName: string | null;
    /** The individuals that make up this cohort */
    members: {
        /** Shortcode of the world actor that defines this member's capabilities. */
        shortcodeOrUuid: string;
        /** This member's role within the cohort (e.g. leader, follower). */
        role: string;
    }[];
}
