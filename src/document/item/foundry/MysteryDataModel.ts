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
import { ITEM_KIND } from "@src/utils/constants";
const { SchemaField, NumberField } = foundry.data.fields;

function defineMysterySchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        charges: new SchemaField({
            // Note: if value is null, then there are infinite charges remaining
            value: new NumberField({
                integer: true,
                nullable: true,
                initial: 0,
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
    charges!: {
        value: number;
        max: number;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMysterySchema();
    }
}
