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
import { TraumaLogic, TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    ITEM_KIND,
    TRAUMA_SUBTYPE,
    TraumaSubType,
    TraumaSubTypes,
} from "@src/utils/constants";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

function defineTraumaDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            initial: TRAUMA_SUBTYPE.PHYSICAL,
            choices: TraumaSubTypes,
        }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        healingRateBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        aspect: new StringField({
            initial: IMPACT_ASPECT.BLUNT,
            choices: ImpactAspects,
        }),
        isTreated: new BooleanField({ initial: false }),
        isBleeding: new BooleanField({ initial: false }),
        bodyLocationCode: new StringField({ initial: "", required: true }),
    };
}

type TraumaDataSchema = ReturnType<typeof defineTraumaDataSchema>;

export class TraumaDataModel<
    TSchema extends foundry.data.fields.DataSchema = TraumaDataSchema,
    TLogic extends TraumaLogic<TraumaData> = TraumaLogic<TraumaData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements TraumaData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Trauma",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.TRAUMA;
    subType!: TraumaSubType;
    levelBase!: number;
    healingRateBase!: number;
    aspect!: ImpactAspect;
    isTreated!: boolean;
    isBleeding!: boolean;
    bodyLocationCode!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineTraumaDataSchema();
    }
}
