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
import { BodyRoles, ITEM_KIND, BodyRoleChoices } from "@src/utils/constants";
import { SohlItemDataModel } from "./SohlItemDataModel";
const { ArrayField, SchemaField, NumberField, StringField } =
    foundry.data.fields;

/**
 * Builds the Attribute data schema (score, value descriptors, init formula,
 * and impairing body roles) on top of the base item schema.
 * @returns The Attribute data schema.
 */
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
         * Body roles whose injury impairs this attribute. Mirrors the same
         * field on Skill — see SkillDataModel and BodyRole in constants.
         * Mental attributes (Will, Reasoning, Empathy, etc.) leave this
         * empty; physical attributes (Strength, Agility, Dexterity, etc.)
         * list the roles whose injury degrades them.
         */
        impairedByRoles: new ArrayField(
            new StringField({ blank: false, choices: BodyRoleChoices }),
            { initial: [] },
        ),
    };
}

type AttributeSchema = ReturnType<typeof defineAttributeSchema>;

/** @internal */
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
    impairedByRoles!: string[];

    /**
     * Defines the Attribute data schema.
     * @returns The Attribute data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAttributeSchema();
    }
}
