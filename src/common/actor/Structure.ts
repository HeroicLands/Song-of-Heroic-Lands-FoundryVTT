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
import { ACTOR_KIND, ACTOR_METADATA } from "@utils/constants";
const { ArrayField, SchemaField, StringField, NumberField, DocumentIdField } =
    foundry.data.fields;

/**
 * The business logic class for the Structure actor.
 */
export class StructureLogic<
    TData extends StructureData = StructureData,
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

export interface StructureData<
    TLogic extends SohlActorLogic<StructureData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

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
    };
}

type StructureDataSchema = ReturnType<typeof defineStructureDataSchema>;

/**
 * The Foundry VTT data model for the Structure actor.
 */
export class StructureDataModel<
    TSchema extends foundry.data.fields.DataSchema = StructureDataSchema,
    TLogic extends
        StructureLogic<StructureData> = StructureLogic<StructureData>,
> extends SohlActorDataModel<TSchema, TLogic> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Structure.DATA"];
    static override readonly kind = ACTOR_KIND.STRUCTURE;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineStructureDataSchema();
    }
}

export class StructureSheet extends SohlActorSheetBase {}
