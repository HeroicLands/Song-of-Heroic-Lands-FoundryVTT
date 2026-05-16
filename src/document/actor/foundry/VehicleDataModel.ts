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
    MOVEMENT_MEDIUM,
    MovementFactorModes,
    MovementMediums,
    VEHICLE_OCCUPANT_ROLE,
    VehicleOccupantRoles,
} from "@src/utils/constants";
import type { VehicleData } from "@src/document/actor/logic/VehicleLogic";
import { VehicleLogic } from "@src/document/actor/logic/VehicleLogic";

const {
    ArrayField,
    SchemaField,
    StringField,
    NumberField,
    DocumentIdField,
    BooleanField,
} = foundry.data.fields;

/**
 * Defines the data schema for the Vehicle actor.
 *
 * @returns The data schema for the Vehicle actor.
 */
function defineVehicleDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        crewRequired: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        maxPassengers: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        minDraftCreatures: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        cargoCapacity: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        tareWeight: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        /**
         * Drag factor: a multiplicative penalty applied to the pulling
         * creature's effective movement speed. Typical values:
         *   1.00 = no drag (e.g., riding gear, pack saddle)
         *   0.80 = light cart on good road
         *   0.60 = wagon on road
         *   0.40 = wagon off-road
         *   0.20 = heavy wagon in difficult terrain
         * Applied at travel-resolution time via TravelContext.vehicleDrag,
         * not via the vehicle's own movementProfiles.
         */
        dragFactor: new NumberField({
            integer: false,
            initial: 1,
            min: 0,
        }),
        occupants: new ArrayField(
            new SchemaField({
                actorId: new DocumentIdField({
                    nullable: true,
                    initial: null,
                }),
                isLinked: new BooleanField({ initial: false }),
                name: new StringField({ blank: false, initial: "" }),
                role: new StringField({
                    required: true,
                    choices: VehicleOccupantRoles,
                    initial: VEHICLE_OCCUPANT_ROLE.PASSENGER,
                }),
                title: new StringField({ blank: false, initial: "" }),
            }),
            {
                initial: [],
            },
        ),
        movementProfiles: new ArrayField(
            new SchemaField({
                medium: new StringField({
                    required: true,
                    choices: MovementMediums,
                    initial: MOVEMENT_MEDIUM.TERRESTRIAL,
                }),
                /** Tactical speed in feet per combat round. */
                feetPerRound: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 0,
                }),
                /** Strategic speed in leagues per 4-hour watch (1 league ≈ 3 miles). */
                leaguesPerWatch: new NumberField({
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

type VehicleDataSchema = ReturnType<typeof defineVehicleDataSchema>;

/**
 * The Foundry VTT data model for the Vehicle actor.
 */
export class VehicleDataModel<
    TSchema extends foundry.data.fields.DataSchema = VehicleDataSchema,
    TLogic extends VehicleLogic<VehicleData> = VehicleLogic<VehicleData>,
> extends SohlActorDataModel<TSchema, TLogic> {
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Vehicle",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.VEHICLE;
    occupants!: string[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineVehicleDataSchema();
    }
}
