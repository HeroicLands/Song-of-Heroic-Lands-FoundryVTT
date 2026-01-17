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
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ITEM_KIND,
    ITEM_METADATA,
    MOVEMENT_MODE,
    MovementMode,
    MovementModes,
} from "@utils/constants";
const { StringField, NumberField, BooleanField, ArrayField } =
    foundry.data.fields;

export class MovementProfileLogic<
    TData extends MovementProfileData = MovementProfileData,
> extends SohlItemBaseLogic<TData> {
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

export interface MovementProfileData<
    TLogic extends SohlItemLogic<MovementProfileData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    mode: MovementMode;

    /** Tactical movement: meters per round (not terrain-specific) */
    metersPerRound: number;

    /** Overland movement: meters per watch per terrain type */
    metersPerWatch: number[];

    disabled: boolean;
}

function defineMovementProfileDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        mode: new StringField({
            required: true,
            choices: MovementModes,
            initial: MOVEMENT_MODE.LAND,
        }),
        metersPerRound: new NumberField({
            integer: true,
            min: 0,
            initial: 0,
        }),
        metersPerWatch: new ArrayField(
            new NumberField({
                integer: true,
                min: 0,
                initial: 0,
            }),
        ),
        disabled: new BooleanField({ initial: false }),
    };
}

type SohlMovementProfileDataSchema = ReturnType<
    typeof defineMovementProfileDataSchema
>;

export class MovementProfileDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = SohlMovementProfileDataSchema,
        TLogic extends
            MovementProfileLogic<MovementProfileData> = MovementProfileLogic<MovementProfileData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements MovementProfileData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MovementProfile.DATA",
    ];
    static override readonly kind = ITEM_KIND.MOVEMENTPROFILE;
    mode!: MovementMode;
    metersPerRound!: number;
    metersPerWatch!: number[];
    disabled!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMovementProfileDataSchema();
    }
}

export class MovementProfileSheet extends SohlItemSheetBase {
    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
