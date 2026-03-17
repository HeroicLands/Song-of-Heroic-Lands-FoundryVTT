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

import { MasteryLevelDataModel } from "@common/item/foundry/MasteryLevelDataModel";
import { MysticalAbilityLogic, MysticalAbilityData } from "@common/item/logic/MysticalAbilityLogic";
import {
    ITEM_KIND,
    MysticalAbilitySubType,
    MysticalAbilitySubTypes,
} from "@utils/constants";
const { SchemaField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

function defineMysticalAbilityDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...MasteryLevelDataModel.defineSchema(),
        subType: new StringField({
            choices: MysticalAbilitySubTypes,
            required: true,
        }),
        assocSkillCode: new StringField({
            blank: false,
            nullable: true,
        }),
        isImprovable: new BooleanField({ initial: false }),
        domainCode: new StringField({
            blank: false,
            nullable: true,
        }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        charges: new SchemaField({
            // Note: if value is null, then there are infinite charges remaining
            value: new NumberField({
                integer: true,
                nullable: true,
                initial: 0,
                min: 0,
            }),
            // Note: if max is 0, then there is no maximum, if max is null,
            // then the mystical ability does not use charges
            max: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
                min: 0,
            }),
        }),
    };
}

type MysticalAbilityDataSchema = ReturnType<
    typeof defineMysticalAbilityDataSchema
>;

export class MysticalAbilityDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = MysticalAbilityDataSchema,
        TLogic extends
            MysticalAbilityLogic<MysticalAbilityData> = MysticalAbilityLogic<MysticalAbilityData>,
    >
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements MysticalAbilityData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.MysticalAbility", "SOHL.MasteryLevel", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.MYSTICALABILITY;
    subType!: MysticalAbilitySubType;
    assocSkillCode?: string;
    isImprovable!: boolean;
    domainCode?: string;
    levelBase!: number;
    charges!: {
        value: number;
        max: number | null;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMysticalAbilityDataSchema();
    }
}
