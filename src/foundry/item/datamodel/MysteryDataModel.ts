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
    KindType,
    MYSTERY_KIND,
    MysteryData,
    MysterySubType,
} from "@logic/common/item/data";
import { MysteryPerformer } from "@logic/common/item/performer";
import { SubTypeDataModel } from "@foundry/item/datamodel";
const { SchemaField, ArrayField, NumberField, StringField, BooleanField } = (
    foundry.utils as any
).fields;

export class MysteryDataModel
    extends SubTypeDataModel<MysteryPerformer, MysterySubType>
    implements MysteryData
{
    protected static readonly logicClass = MysteryPerformer;
    declare readonly parent: SohlItemProxy<MysteryPerformer>;
    config!: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        kind: KindType;
    };
    skills!: string[];
    levelBase!: number;
    charges!: {
        value: number;
        max: number;
    };

    static defineSchema() {
        return {
            ...super.defineSchema(),
            config: new SchemaField({
                usesCharges: new BooleanField({ initial: false }),
                usesSkills: new BooleanField({ initial: false }),
                assocPhilosophy: new StringField(),
                category: new StringField({
                    initial: MYSTERY_KIND.NONE,
                    required: true,
                    choices: Object.values(MYSTERY_KIND),
                }),
            }),
            domain: new StringField(),
            skills: new ArrayField(
                new StringField({
                    required: true,
                    blank: false,
                }),
            ),
            levelBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            charges: new SchemaField({
                value: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                // Note: if max charges is 0, then there is no maximum
                max: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            }),
        };
    }
}
