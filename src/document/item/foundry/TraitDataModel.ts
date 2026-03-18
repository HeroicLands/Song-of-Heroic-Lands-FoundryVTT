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

import { MasteryLevelDataModel } from "@src/document/item/foundry/MasteryLevelDataModel";
import { TraitLogic, TraitData } from "@src/document/item/logic/TraitLogic";
import {
    ITEM_KIND,
    TRAIT_INTENSITY,
    TRAIT_SUBTYPE,
    TraitIntensities,
    TraitIntensity,
    TraitSubType,
    TraitSubTypes,
} from "@src/utils/constants";
const {
    ArrayField,
    ObjectField,
    SchemaField,
    NumberField,
    StringField,
    BooleanField,
} = foundry.data.fields;

function defineTraitSchema(): foundry.data.fields.DataSchema {
    return {
        ...MasteryLevelDataModel.defineSchema(),
        subType: new StringField({
            initial: TRAIT_SUBTYPE.PHYSIQUE,
            required: true,
            choices: TraitSubTypes,
        }),
        textValue: new StringField(),
        max: new NumberField({
            integer: true,
            nullable: true,
            initial: null,
        }),
        isNumeric: new BooleanField({ initial: false }),
        intensity: new StringField({
            initial: TRAIT_INTENSITY.TRAIT,
            required: true,
            choices: TraitIntensities,
        }),
        valueDesc: new ArrayField(
            new SchemaField({
                label: new StringField({
                    blank: false,
                    required: true,
                }),
                maxValue: new NumberField({
                    integer: true,
                    required: true,
                    initial: 0,
                }),
            }),
        ),
        choices: new ObjectField(),
        diceFormula: new StringField({ initial: "" }),
    };
}

type TraitSchema = ReturnType<typeof defineTraitSchema>;

export class TraitDataModel<
    TSchema extends foundry.data.fields.DataSchema = TraitSchema,
    TLogic extends TraitLogic<TraitData> = TraitLogic<TraitData>,
>
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements TraitData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Trait",
        "SOHL.MasteryLevel",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.TRAIT;
    subType!: TraitSubType;
    textValue!: string;
    max!: number | null;
    isNumeric!: boolean;
    intensity!: TraitIntensity;
    valueDesc!: {
        label: string;
        maxValue: number;
    }[];
    choices!: StrictObject<string>;
    diceFormula!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineTraitSchema();
    }
}
