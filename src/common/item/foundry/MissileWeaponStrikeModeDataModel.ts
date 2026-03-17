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

import { StrikeModeDataModel } from "@common/item/foundry/StrikeModeDataModel";
import {
    MissileWeaponStrikeModeLogic,
    MissileWeaponStrikeModeData,
} from "@common/item/logic/MissileWeaponStrikeModeLogic";
import {
    ITEM_KIND,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@utils/constants";
const { StringField } = foundry.data.fields;

function defineMissileWeaponStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
        projectileType: new StringField({
            initial: PROJECTILEGEAR_SUBTYPE.NONE,
            required: true,
            choices: ProjectileGearSubTypes,
        }),
    };
}

type MissileWeaponStrikeModeSchema = ReturnType<
    typeof defineMissileWeaponStrikeModeSchema
>;

export class MissileWeaponStrikeModeDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = MissileWeaponStrikeModeSchema,
        TLogic extends
            MissileWeaponStrikeModeLogic<MissileWeaponStrikeModeData> = MissileWeaponStrikeModeLogic<
            MissileWeaponStrikeModeData<MissileWeaponStrikeModeLogic<any>>
        >,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements MissileWeaponStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.MissileWeaponStrikeMode", "SOHL.StrikeMode", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.MISSILEWEAPONSTRIKEMODE;
    projectileType!: ProjectileGearSubType;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMissileWeaponStrikeModeSchema();
    }
}
