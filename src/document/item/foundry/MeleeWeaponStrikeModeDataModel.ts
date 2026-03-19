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

import { StrikeModeDataModel } from "@src/document/item/foundry/StrikeModeDataModel";
import {
    MeleeWeaponStrikeModeLogic,
    MeleeWeaponStrikeModeData,
} from "@src/document/item/logic/MeleeWeaponStrikeModeLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { NumberField } = foundry.data.fields;

function defineMeleeWeaponStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type MeleeWeaponStrikeModeSchema = ReturnType<
    typeof defineMeleeWeaponStrikeModeSchema
>;

export class MeleeWeaponStrikeModeDataModel<
    TSchema extends foundry.data.fields.DataSchema =
        MeleeWeaponStrikeModeSchema,
    TLogic extends MeleeWeaponStrikeModeLogic<MeleeWeaponStrikeModeData> =
        MeleeWeaponStrikeModeLogic<MeleeWeaponStrikeModeData>,
>
    extends StrikeModeDataModel<TSchema, TLogic>
    implements MeleeWeaponStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MeleeWeaponStrikeMode",
        "SOHL.StrikeMode",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.MELEEWEAPONSTRIKEMODE;
    lengthBase!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMeleeWeaponStrikeModeSchema();
    }
}
