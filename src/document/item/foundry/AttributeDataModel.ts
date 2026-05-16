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

import {
    AttributeLogic,
    AttributeData,
} from "@src/document/item/logic/AttributeLogic";
import { BodyZones, ITEM_KIND } from "@src/utils/constants";
import { SohlItemDataModel } from "./SohlItem";
const { ArrayField, SchemaField, NumberField, StringField } =
    foundry.data.fields;

function defineAttributeSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        scoreBase: new NumberField({
            integer: true,
            nullable: true,
            initial: null,
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
        initDiceFormula: new StringField({ initial: "" }),
        /**
         * Body zones whose injury impairs this attribute. Mirrors the same
         * field on Skill — see SkillDataModel and BodyZone in constants.
         * Mental attributes (Will, Reasoning, Empathy, etc.) leave this
         * empty; physical attributes (Strength, Agility, Dexterity, etc.)
         * list the zones whose injury degrades them.
         */
        impairedByZones: new ArrayField(
            new StringField({ blank: false, choices: BodyZones }),
            { initial: [] },
        ),
    };
}

type AttributeSchema = ReturnType<typeof defineAttributeSchema>;

export class AttributeDataModel<
    TSchema extends foundry.data.fields.DataSchema = AttributeSchema,
    TLogic extends AttributeLogic<AttributeData> =
        AttributeLogic<AttributeData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements AttributeData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Attribute",
        "SOHL.MasteryLevel",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.ATTRIBUTE;
    scoreBase!: number;
    valueDesc!: {
        label: string;
        maxValue: number;
    }[];
    initDiceFormula!: string;
    impairedByZones!: string[];

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAttributeSchema();
    }
}
