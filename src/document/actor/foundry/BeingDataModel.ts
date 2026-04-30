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

import { SohlActorDataModel } from "@src/document/actor/foundry/SohlActor";
import {
    ACTOR_KIND,
    ImpactAspects,
    MOVEMENT_MEDIUM,
    MovementFactorModes,
    MovementMediums,
} from "@src/utils/constants";
import type { BeingData } from "@src/document/actor/logic/BeingLogic";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { BodyStructure } from "@src/domain/body/BodyStructure";
import type { MovementProfile } from "@src/domain/movement/MovementProfile";

const {
    StringField,
    ArrayField,
    BooleanField,
    DocumentIdField,
    NumberField,
    SchemaField,
} = foundry.data.fields;

function defineBeingDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        bodyStructure: new SchemaField({
            parts: new ArrayField(
                new SchemaField({
                    shortcode: new StringField({ blank: false }),
                    name: new StringField({ blank: false }),
                    affectedSkillCodes: new ArrayField(
                        new StringField({ blank: false }),
                        {
                            initial: [],
                        },
                    ),
                    affectedAttributeCodes: new ArrayField(
                        new StringField({ blank: false }),
                        { initial: [] },
                    ),
                    affectsMobility: new BooleanField({ initial: false }),
                    canHoldItem: new BooleanField({ initial: false }),
                    heldItemId: new DocumentIdField({
                        nullable: true,
                        initial: null,
                    }),
                    probWeight: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    locations: new ArrayField(
                        new SchemaField({
                            shortcode: new StringField({ blank: false }),
                            name: new StringField({ blank: false }),
                            isFumble: new BooleanField({ initial: false }),
                            isStumble: new BooleanField({ initial: false }),
                            bleedingSevThreshold: new NumberField({
                                integer: true,
                                initial: 0,
                                min: 0,
                            }),
                            amputateModifier: new NumberField({
                                integer: true,
                                initial: 0,
                            }),
                            shockValue: new NumberField({
                                integer: true,
                                initial: 0,
                                min: 0,
                            }),
                            probWeight: new NumberField({
                                integer: true,
                                initial: 0,
                                min: 0,
                            }),
                            protectionBase: new SchemaField({
                                blunt: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                                edged: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                                piercing: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                                fire: new NumberField({
                                    integer: true,
                                    initial: 0,
                                    min: 0,
                                }),
                            }),
                        }),
                        { initial: [] },
                    ),
                }),
                { initial: [] },
            ),
            adjacent: new ArrayField(
                new ArrayField(new StringField({ blank: false }), {
                    initial: [],
                }),
                { initial: [] },
            ),
        }),
        movementProfiles: new ArrayField(
            new SchemaField({
                medium: new StringField({
                    required: true,
                    choices: MovementMediums,
                    initial: MOVEMENT_MEDIUM.TERRESTRIAL,
                }),
                metersPerRound: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                metersPerWatch: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                factors: new ArrayField(
                    new SchemaField({
                        scope: new StringField({
                            blank: false,
                        }),
                        key: new StringField({
                            blank: false,
                        }),
                        mode: new StringField({
                            choices: MovementFactorModes,
                        }),
                        textValue: new StringField({
                            blank: false,
                        }),
                    }),
                ),
                disabled: new BooleanField({ initial: false }),
            }),
            { initial: [] },
        ),
    };
}

type BeingDataSchema = ReturnType<typeof defineBeingDataSchema>;

/**
 * The Foundry VTT data model for the Being actor.
 */
export class BeingDataModel<
    TSchema extends foundry.data.fields.DataSchema = BeingDataSchema,
    TLogic extends BeingLogic<BeingData> = BeingLogic<BeingData>,
>
    extends SohlActorDataModel<TSchema, TLogic>
    implements BeingData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Being",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.BEING;
    bodyStructure!: BodyStructure.Data;
    movementProfiles!: MovementProfile.Data[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineBeingDataSchema();
    }
}
