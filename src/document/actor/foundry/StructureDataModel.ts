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
    VEHICLE_OCCUPANT_ROLE,
    VehicleOccupantRoleChoices,
    ACTOR_KIND,
} from "@src/utils/constants";
import type { StructureData } from "@src/document/actor/logic/StructureLogic";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";

/**
 * Defines the data schema for the Structure actor.
 *
 * @remarks
 *
 * @returns The data schema for the Structure actor.
 */
function defineStructureDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
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
        workshopRating: new foundry.data.fields.NumberField({
            initial: 0,
            min: 0,
            max: 5,
            integer: true,
            nullable: false,
        }),
        maxHealth: new foundry.data.fields.NumberField({
            initial: 0,
            min: 0,
            integer: true,
            nullable: false,
        }),
        occupantCapacity: new foundry.data.fields.NumberField({
            initial: 0,
            min: 0,
            integer: true,
            nullable: false,
        }),
        cargoCapacity: new foundry.data.fields.NumberField({ initial: 0, min: 0, nullable: false }),
    };
}

const { ArrayField, SchemaField, StringField } = foundry.data.fields;

type StructureDataSchema = ReturnType<typeof defineStructureDataSchema>;

/**
 * The Foundry VTT data model for the Structure actor.
 * @internal
 */
export class StructureDataModel<
    TSchema extends foundry.data.fields.DataSchema = StructureDataSchema,
    TLogic extends StructureLogic<StructureData> = StructureLogic<StructureData>,
> extends SohlActorDataModel<TSchema, TLogic> {
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Structure", "SOHL.Actor"];
    occupants!: import("@src/document/actor/logic/StructureLogic").StructureOccupant[];
    workshopRating!: number;
    maxHealth!: number;
    occupantCapacity!: number;
    cargoCapacity!: number;
    /** @inheritDoc */
    static override readonly kind = ACTOR_KIND.STRUCTURE;

    /**
     * Defines the data schema for a Structure actor.
     *
     * @returns The Structure data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineStructureDataSchema();
    }
}
