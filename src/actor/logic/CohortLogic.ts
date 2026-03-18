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

/*
 * The Cohort actor represents a group of actors that are treated as a single unit.
 * It allows for the management of multiple actors as a cohesive group, with shared,
 * properties and behaviors, such as shared reactions, movement, or combat.
 *
 * The Cohort can represent a variety of groupings, such as a party of adventurers,
 * a squad of soldiers, or a pack of animals. It provides a way to manage these groups
 * more efficiently, especially in situations where they need to be treated as a single
 * entity for certain mechanics, while still allowing for individual actors to have
 * their own unique properties and actions.
 *
 * Each member of the Cohort must have a unique name.
 *
 * If a member's `isLinked` property is set to true, then the member is considered
 * to be directly representing that actor. If the `isLinked` property is false, then
 * the member is considered to be an individual of the same type as the world actor
 * with the specified `shortcode`. For example, if a Cohort represents a pack of wolves,
 * each member may have the same `shortcode` representing a generic wolf, but each member
 * will have a unique `name` and the `isLinked` property set to false, indicating that
 * they are separate individuals of the same type.
 *
 * When a Cohort actor is dropped onto a scene, a dialog will appear providing a choice
 * between creating a single token representing the entire Cohort or creating individual
 * tokens for each member. Single token Cohorts may not participate in combat, but are useful
 * for representing movement of groups, especially on large-scale maps.
 */
import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorLogic,
} from "@src/actor/foundry/SohlActor";

/**
 * Logic for the **Cohort** actor type — a group of individuals acting as a unit.
 *
 * A Cohort represents multiple actors treated as a single entity for movement,
 * combat, and other mechanics. Examples include a party of adventurers, a squad
 * of soldiers, a pack of animals, or a ship's crew section.
 *
 * Each member of a Cohort has a unique name and a `shortcode` referencing a
 * world actor that defines their capabilities. Members may be **linked**
 * (directly representing a specific world actor) or **unlinked** (individual
 * instances of a generic type, e.g., several wolves sharing the same base stats
 * but tracked separately). Members also have a {@link COHORT_MEMBER_ROLE | role}
 * within the cohort (e.g., leader, follower).
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

export interface CohortData<
    TLogic extends SohlActorLogic<CohortData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /** Name of the cohort member serving as leader */
    leaderName: string;
    /** Name of the member whose movement profile determines group speed */
    moveRepName: string;
    /** The individuals that make up this cohort */
    members: {
        shortcode: string;
        name: string;
        role: string;
    }[];
}
