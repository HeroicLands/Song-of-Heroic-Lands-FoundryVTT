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

import { GearDataModel } from "@src/item/foundry/GearDataModel";
import { ArmorGearLogic, ArmorGearData } from "@src/item/logic/ArmorGearLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { StringField, SchemaField, ArrayField } = foundry.data.fields;

function defineArmorGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        material: new StringField(),
        locations: new SchemaField({
            flexible: new ArrayField(new StringField()),
            rigid: new ArrayField(new StringField()),
        }),
    };
}

type ArmorGearDataSchema = ReturnType<typeof defineArmorGearSchema>;

export class ArmorGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = ArmorGearDataSchema,
    TLogic extends ArmorGearLogic<ArmorGearData> =
        ArmorGearLogic<ArmorGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements ArmorGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.ArmorGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.ARMORGEAR;
    material!: string;
    locations!: { flexible: string[]; rigid: string[] };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineArmorGearSchema();
    }
}
