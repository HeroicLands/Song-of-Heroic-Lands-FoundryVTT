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
import {
    MysteryLogic,
    MysteryData,
} from "@src/document/item/logic/MysteryLogic";
import {
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    MysterySubTypes,
    type MysterySubType,
    MysterySubTypeChoices,
} from "@src/utils/constants";
const { SchemaField, NumberField, BooleanField, StringField } =
    foundry.data.fields;

/**
 * Builds the data schema for the Mystery item, extending the base item schema
 * with a level and an optional charges tracker.
 * @returns The Foundry data schema for the mystery.
 */
function defineMysterySchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        // The mystery's subtype; `buff` marks birthsigns (matched by shortcode
        // in skill-base formulas).
        subType: new StringField({
            initial: MYSTERY_SUBTYPE.OTHER,
            required: true,
            choices: MysterySubTypeChoices,
        }),
        // Note: if levelBase is null, then there is no defined level
        levelBase: new NumberField({
            integer: true,
            nullable: true,
            initial: null,
            min: 0,
        }),
        charges: new SchemaField({
            usesCharges: new BooleanField({ initial: false }),
            // Note: if value is null, then there are infinite charges remaining
            value: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
                min: 0,
            }),
            // Note: if max is 0, then there is no maximum, if max is null,
            // then the mystery does not use charges
            max: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
                min: 0,
            }),
        }),
    };
}

type MysteryDataSchema = ReturnType<typeof defineMysterySchema>;

/** @internal */
export class MysteryDataModel<
    TSchema extends foundry.data.fields.DataSchema = MysteryDataSchema,
    TLogic extends MysteryLogic<MysteryData> = MysteryLogic<MysteryData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements MysteryData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Mystery",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.MYSTERY;
    subType!: MysterySubType;
    levelBase!: number;
    charges!: {
        usesCharges: boolean;
        value: number;
        max: number;
    };

    /**
     * Returns the Foundry data schema for the mystery item.
     * @returns The mystery data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMysterySchema();
    }
}
