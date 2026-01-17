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

import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import {
    ACTOR_KIND,
    ACTOR_METADATA,
    COHORT_MEMBER_ROLE,
    CohortMemberRoles,
    REACTION,
    Reactions,
} from "@utils/constants";
const { ArrayField, SchemaField, StringField, NumberField, DocumentIdField } =
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
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface CohortData<
    TLogic extends SohlActorLogic<CohortData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

/**
 * Defines the data schema for the Cohort actor.
 *
 * @remarks
 * `leader` refers to the Document ID of the actor in this Cohort
 * which serves as the leader. This may affect certain checks
 * or abilities that depend on leadership.
 *
 * `moveRep` refers to the Document ID of the actor in this Cohort
 * which serves as the representative for movement purposes. Generally
 * this would be the slowest member of the Cohort, but may vary based
 * on the situation.
 *
 * @returns The data schema for the Cohort actor.
 */
function defineCohortDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        leader: new DocumentIdField({ nullable: true, initial: null }),
        moveRep: new DocumentIdField({ nullable: true, initial: null }),
        members: new ArrayField(
            new SchemaField({
                actorId: new DocumentIdField({ nullable: false }),
                role: new StringField({
                    choices: CohortMemberRoles,
                    initial: COHORT_MEMBER_ROLE.MEMBER,
                }),
                quantity: new NumberField({
                    initial: 1,
                    min: 1,
                    integer: true,
                }),
            }),
        ),
        defaultReaction: new StringField({
            choices: Reactions,
            initial: REACTION.NEUTRAL,
        }),
        reactions: new ArrayField(
            new SchemaField({
                targetId: new DocumentIdField({ nullable: false }),
                targetName: new StringField({ nullable: true, initial: null }),
                reaction: new StringField({
                    choices: Reactions,
                    initial: REACTION.NEUTRAL,
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

export class CohortSheet extends SohlActorSheetBase {}
