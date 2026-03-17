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

import { SohlItemDataModel } from "@common/item/foundry/SohlItem";
import { MovementProfileLogic, MovementProfileData } from "@common/item/logic/MovementProfileLogic";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    MovementFactorModes,
    MovementMedium,
    MovementMediums,
} from "@utils/constants";
const { StringField, NumberField, BooleanField, ArrayField, SchemaField } =
    foundry.data.fields;

function defineMovementProfileDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
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
                mode: new NumberField({
                    choices: MovementFactorModes,
                }),
                textValue: new StringField({
                    blank: false,
                }),
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
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.MovementProfile", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.MOVEMENTPROFILE;
    medium!: MovementMedium;
    metersPerRound!: number;
    metersPerWatch!: number[];
    disabled!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMovementProfileDataSchema();
    }
}
