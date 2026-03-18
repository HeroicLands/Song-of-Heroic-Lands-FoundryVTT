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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
import {
    StrikeModeLogic,
    StrikeModeData,
} from "@src/document/item/logic/StrikeModeLogic";
import {
    ImpactAspect,
    IMPACT_ASPECT,
    ImpactAspects,
    Variants,
    Variant,
} from "@src/utils/constants";
const { StringField, NumberField, SchemaField } = foundry.data.fields;

function defineStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: Variants,
            required: true,
        }),
        mode: new StringField(),
        minParts: new NumberField({
            integer: true,
            initial: 1,
            min: 0,
        }),
        assocSkillName: new StringField(),
        impactBase: new SchemaField({
            numDice: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            die: new NumberField({
                integer: true,
                initial: 6,
                min: 0,
            }),
            modifier: new NumberField({
                integer: true,
                initial: 0,
            }),
            aspect: new StringField({
                initial: IMPACT_ASPECT.BLUNT,
                required: true,
                choices: ImpactAspects,
            }),
        }),
    };
}

type StrikeModeSchema = ReturnType<typeof defineStrikeModeSchema>;

export abstract class StrikeModeDataModel<
    TSchema extends foundry.data.fields.DataSchema = StrikeModeSchema,
    TLogic extends StrikeModeLogic<StrikeModeData> =
        StrikeModeLogic<StrikeModeData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements StrikeModeData<TLogic>
{
    subType!: Variant;
    mode!: string;
    minParts!: number;
    assocSkillName!: string;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineStrikeModeSchema();
    }
}
