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

import { SohlActorDataModel } from "@src/common/actor/foundry/SohlActor";
import {
    ACTOR_KIND,
    COHORT_MEMBER_ROLE,
    CohortMemberRoles,
} from "@src/utils/constants";
import type { CohortData } from "@src/common/actor/logic/CohortLogic";
import { CohortLogic } from "@src/common/actor/logic/CohortLogic";

const { ArrayField, SchemaField, StringField, BooleanField, DocumentIdField } =
    foundry.data.fields;

/**
 * Defines the data schema for the Cohort actor.
 */
function defineCohortDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        leaderName: new StringField(),
        moveRepName: new StringField(),
        members: new ArrayField(
            new SchemaField({
                shortcode: new StringField({
                    blank: false,
                    required: true,
                }),
                name: new StringField({
                    blank: false,
                    required: true,
                }),
                role: new StringField({
                    choices: CohortMemberRoles,
                    initial: COHORT_MEMBER_ROLE.MEMBER,
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
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Cohort",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.COHORT;
    leaderName!: string;
    moveRepName!: string;
    members!: { shortcode: string; name: string; role: string }[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineCohortDataSchema();
    }
}
