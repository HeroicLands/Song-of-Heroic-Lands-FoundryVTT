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
    SohlActor,
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import {
    ACTOR_KIND,
    COHORT_MEMBER_ROLE,
    CohortMemberRoles,
    REACTION,
    Reactions,
} from "@utils/constants";
const { ArrayField, SchemaField, StringField, BooleanField, DocumentIdField } =
    foundry.data.fields;

/**
 * The business logic class for the Cohort actor.
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
> extends SohlActorData<TLogic> {}

/**
 * Defines the data schema for the Cohort actor.
 */
function defineCohortDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        leaderName: new StringField({
            hint: "The name of the actor in this cohort serving as the leader",
        }),
        moveRepName: new StringField({
            hint: "The name of the actor in this cohort representing this cohort for movement purposes",
        }),
        members: new ArrayField(
            new SchemaField({
                shortcode: new StringField({
                    blank: false,
                    required: true,
                    hint: "The shortcode of the actor representing this member",
                }),
                name: new StringField({
                    blank: false,
                    required: true,
                    hint: "The unique name of the actor representing this member",
                }),
                isLinked: new BooleanField({
                    initial: false,
                    hint: "Whether this member is linked to a specific actor in the world",
                }),
                role: new StringField({
                    choices: CohortMemberRoles,
                    initial: COHORT_MEMBER_ROLE.MEMBER,
                    hint: "The role of this member within the cohort",
                }),
            }),
        ),
    };
}

type CohortDataSchema = ReturnType<typeof defineCohortDataSchema>;

/**
 * The Foundry VTT data model for the Cohort actor.
 */
export class CohortDataModel<
        TSchema extends foundry.data.fields.DataSchema = CohortDataSchema,
        TLogic extends CohortLogic<CohortData> = CohortLogic<CohortData>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements CohortData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Cohort.DATA"];
    static override readonly kind = ACTOR_KIND.COHORT;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineCohortDataSchema();
    }
}

export class CohortSheet extends SohlActorSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }
}
