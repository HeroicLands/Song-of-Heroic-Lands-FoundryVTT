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
    MiscGearLogic,
    MiscGearData,
} from "@src/common/item/logic/MiscGearLogic";
import { ITEM_KIND } from "@src/utils/constants";

function defineMiscGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
    };
}

type MiscGearSchema = ReturnType<typeof defineMiscGearSchema>;

export class MiscGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = MiscGearSchema,
    TLogic extends MiscGearLogic<MiscGearData> = MiscGearLogic<MiscGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements MiscGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MiscGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.MISCGEAR;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMiscGearSchema();
    }
}
