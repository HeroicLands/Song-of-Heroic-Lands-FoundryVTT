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
    MysticalAbilityData,
    MysticalAbilitySubType,
} from "@logic/common/item/data";
import { MysticalAbilityPerformer } from "@logic/common/item/performer";
import { MasteryLevelDataModel } from "./MasteryLevelDataModel";
const { SchemaField, NumberField, StringField, BooleanField } = (
    foundry.utils as any
).fields;

export class MysticalAbilityDataModel
    extends MasteryLevelDataModel<
        MysticalAbilityPerformer,
        MysticalAbilitySubType
    >
    implements MysticalAbilityData
{
    protected static readonly logicClass = MysticalAbilityPerformer;
    declare readonly parent: SohlItemProxy<MysticalAbilityPerformer>;
    config!: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        isImprovable: boolean;
        assocSkill: string;
        category: string;
    };
    domain!: string;
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
                isImprovable: new BooleanField({ initial: false }),
                assocSkill: new StringField(),
                category: new StringField(),
                assocPhilosophy: new StringField(),
                usesCharges: new BooleanField({ initial: false }),
            }),
            domain: new StringField(),
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
