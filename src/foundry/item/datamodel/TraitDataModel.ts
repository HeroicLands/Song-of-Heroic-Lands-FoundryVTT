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
import {
    INTENSITY,
    TraitData,
    TraitIntensity,
    TraitSubType,
} from "@logic/common/item/data";
import { TraitPerformer } from "@logic/common/item/performer";
import { MasteryLevelDataModel } from "./MasteryLevelDataModel";
const {
    ArrayField,
    ObjectField,
    SchemaField,
    NumberField,
    StringField,
    BooleanField,
} = (foundry.utils as any).fields;

export class TraitDataModel
    extends MasteryLevelDataModel<TraitPerformer, TraitSubType>
    implements TraitData
{
    protected static readonly logicClass = TraitPerformer;
    declare readonly parent: SohlItemProxy<TraitPerformer>;
    textValue!: string;
    max!: number | null;
    isNumeric!: boolean;
    intensity!: TraitIntensity;
    valueDesc!: {
        label: string;
        maxValue: number;
    }[];
    choices!: StrictObject<string>;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            textValue: new StringField(),
            max: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
            }),
            isNumeric: new BooleanField({ initial: false }),
            intensity: new StringField({
                initial: INTENSITY.TRAIT,
                required: true,
                choices: Object.values(INTENSITY),
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
        };
    }
}
