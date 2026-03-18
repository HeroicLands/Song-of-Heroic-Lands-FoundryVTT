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

import { GearDataModel } from "@src/common/item/foundry/GearDataModel";
import {
    WeaponGearLogic,
    WeaponGearData,
} from "@src/common/item/logic/WeaponGearLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { NumberField } = foundry.data.fields;

function defineWeaponGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type WeaponGearSchema = ReturnType<typeof defineWeaponGearSchema>;

export class WeaponGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = WeaponGearSchema,
    TLogic extends WeaponGearLogic<WeaponGearData> =
        WeaponGearLogic<WeaponGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements WeaponGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.WeaponGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.WEAPONGEAR;
    lengthBase!: number;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineWeaponGearSchema();
    }
}
