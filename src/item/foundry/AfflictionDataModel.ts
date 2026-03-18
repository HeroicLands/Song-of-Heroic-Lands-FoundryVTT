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
import {
    AfflictionLogic,
    AfflictionData,
} from "@src/item/logic/AfflictionLogic";
import {
    AFFLICTION_TRANSMISSION,
    AfflictionHealRate,
    AfflictionSubType,
    AfflictionSubTypes,
    AfflictionTransmission,
    AfflictionTransmissions,
    ITEM_KIND,
} from "@src/utils/constants";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

function defineAfflictionSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: AfflictionSubTypes,
            required: true,
        }),
        category: new StringField({ initial: "" }),
        isDormant: new BooleanField({ initial: false }),
        isTreated: new BooleanField({ initial: false }),
        diagnosisBonusBase: new NumberField({
            integer: true,
            initial: 0,
        }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        healingRateBase: new NumberField({
            integer: true,
            initial: AfflictionHealRate.NONE,
            min: AfflictionHealRate.NONE,
        }),
        contagionIndexBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        transmission: new StringField({
            initial: AFFLICTION_TRANSMISSION.NONE,
            required: true,
            choices: AfflictionTransmissions,
        }),
    };
}

type AfflictionDataSchema = ReturnType<typeof defineAfflictionSchema>;

export class AfflictionDataModel<
    TSchema extends foundry.data.fields.DataSchema = AfflictionDataSchema,
    TLogic extends AfflictionLogic<AfflictionData> =
        AfflictionLogic<AfflictionData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements AfflictionData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Affliction",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.AFFLICTION;
    subType!: AfflictionSubType;
    category!: string;
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonusBase!: number;
    levelBase!: number;
    healingRateBase!: number;
    contagionIndexBase!: number;
    transmission!: AfflictionTransmission;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAfflictionSchema();
    }
}
