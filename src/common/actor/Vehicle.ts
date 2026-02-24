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
    SohlActor,
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import { ACTOR_KIND, ACTOR_METADATA } from "@utils/constants";
const { ArrayField, SchemaField, StringField, NumberField, DocumentIdField } =
    foundry.data.fields;

/**
 * The business logic class for the Vehicle actor.
 */
export class VehicleLogic<
    TData extends VehicleData = VehicleData,
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

export interface VehicleData<
    TLogic extends SohlActorLogic<VehicleData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

/**
 * Defines the data schema for the Vehicle actor.
 *
 * @returns The data schema for the Vehicle actor.
 */
function defineVehicleDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
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
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Vehicle.DATA"];
    static override readonly kind = ACTOR_KIND.VEHICLE;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineVehicleDataSchema();
    }
}

export class VehicleSheet extends SohlActorSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }
}
