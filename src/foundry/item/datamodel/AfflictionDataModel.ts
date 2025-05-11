/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SohlItemProxy } from "@logic/common/item";
import { AfflictionData } from "@logic/common/item/data";
import { AfflictionPerformer } from "@logic/common/item/performer";
import {
    AfflictionSubType,
    TRANSMISSION,
    TransmissionValue,
    UNDEFINED_HR,
} from "@logic/common/item/data/AfflictionData";
import { SubTypeDataModel } from "@foundry/item/datamodel";
const { StringField, BooleanField, NumberField } = (foundry.utils as any)
    .fields;

export class AfflictionDataModel
    extends SubTypeDataModel<AfflictionPerformer, AfflictionSubType>
    implements AfflictionData
{
    protected static readonly logicClass = AfflictionPerformer;
    declare readonly parent: SohlItemProxy<AfflictionPerformer>;
    category!: string;
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonusBase!: number;
    levelBase!: number;
    healingRateBase!: number;
    contagionIndexBase!: number;
    transmission!: TransmissionValue;

    static defineSchema() {
        return {
            ...super.defineSchema(),
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
                initial: UNDEFINED_HR,
                min: UNDEFINED_HR,
            }),
            contagionIndexBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            transmission: new StringField({
                initial: TRANSMISSION.NONE,
                required: true,
                choices: Object.values(TRANSMISSION),
            }),
        };
    }
}
