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

import { SohlItemDataModel } from "@src/item/foundry/SohlItem";
import { InjuryLogic, InjuryData } from "@src/item/logic/InjuryLogic";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    ITEM_KIND,
} from "@src/utils/constants";
const { NumberField, BooleanField, StringField, DocumentIdField } =
    foundry.data.fields;

function defineInjuryDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        injuryLevelBase: new NumberField({
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
        bodyLocationId: new DocumentIdField(),
    };
}

type InjuryDataSchema = ReturnType<typeof defineInjuryDataSchema>;

export class InjuryDataModel<
    TSchema extends foundry.data.fields.DataSchema = InjuryDataSchema,
    TLogic extends InjuryLogic<InjuryData> = InjuryLogic<InjuryData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements InjuryData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Injury",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.INJURY;
    injuryLevelBase!: number;
    healingRateBase!: number;
    aspect!: ImpactAspect;
    isTreated!: boolean;
    isBleeding!: boolean;
    bodyLocationId!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineInjuryDataSchema();
    }
}
