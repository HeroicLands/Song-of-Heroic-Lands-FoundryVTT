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

import { SohlActorDataModel } from "@src/document/actor/foundry/SohlActorDataModel";
import {
    ACTOR_KIND,
    VEHICLE_OCCUPANT_ROLE,
    VehicleOccupantRoleChoices,
    MovementMediumChoices,
    MOVEMENT_MEDIUM,
} from "@src/utils/constants";
import type { VehicleData } from "@src/document/actor/logic/VehicleLogic";
import { VehicleLogic } from "@src/document/actor/logic/VehicleLogic";
import { MovementProfile } from "@src/document/item/logic/CorpusLogic";

const { ArrayField, SchemaField, StringField, NumberField, BooleanField } =
    foundry.data.fields;

/**
 * Defines the data schema for the Vehicle actor.
 *
 * @returns The data schema for the Vehicle actor.
 */
function defineVehicleDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        /**
         * Per-medium movement profiles. Each entry describes how the being moves
         * in one {@link MovementMedium}: its tactical and travel speeds, and the
         * {@link sohl.entity.expr.SafeExpression}s that turn carried weight into encumbrance
         * (`encumbrance`, of `wt`) and shift it by strength (`strMod`, of `str`).
         */
        movementProfiles: new ArrayField(
            new SchemaField({
                /** The movement medium this profile describes. */
                medium: new StringField({
                    required: true,
                    choices: MovementMediumChoices,
                }),
                /** Tactical move (feet per combat round) in this medium. */
                feetPerRound: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                /** Overland travel speed (leagues per watch) in this medium. */
                leaguesPerWatch: new NumberField({
                    integer: false,
                    min: 0,
                    initial: 0,
                }),
                /** Whether this movement profile is disabled. */
                disabled: new BooleanField({ initial: false }),
            }),
            { initial: [] },
        ),
        occupants: new ArrayField(
            new SchemaField({
                actorCodeOrUuid: new StringField({
                    nullable: false,
                    required: true,
                }),
                role: new StringField({
                    choices: VehicleOccupantRoleChoices,
                    initial: VEHICLE_OCCUPANT_ROLE.PASSENGER,
                }),
                title: new StringField({
                    blank: false,
                    nullable: true,
                    initial: null,
                }),
            }),
            {
                initial: [],
            },
        ),
    };
}

type VehicleDataSchema = ReturnType<typeof defineVehicleDataSchema>;

/**
 * The Foundry VTT data model for the Vehicle actor.
 * @internal
 */
export class VehicleDataModel<
    TSchema extends foundry.data.fields.DataSchema = VehicleDataSchema,
    TLogic extends VehicleLogic<VehicleData> = VehicleLogic<VehicleData>,
> extends SohlActorDataModel<TSchema, TLogic> {
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Vehicle",
        "SOHL.Actor",
    ];
    /** @inheritDoc */
    static override readonly kind = ACTOR_KIND.VEHICLE;
    occupants!: string[];
    movementProfiles!: MovementProfile[];

    /**
     * Returns the Foundry data schema for the vehicle actor.
     * @returns The vehicle data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineVehicleDataSchema();
    }
}
