/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SohlItemProxy } from "@logic/common/item";
import {
    MissileWeaponStrikeModeData,
    PROJECTILEGEAR_KIND,
    ProjectileGearKind,
} from "@logic/common/item/data";
import { MissileWeaponStrikeModePerformer } from "@logic/common/item/performer";
import { StrikeModeDataModel } from "@foundry/item/datamodel";
const { StringField } = (foundry.utils as any).fields;

export class MissileWeaponStrikeModeDataModel
    extends StrikeModeDataModel<MissileWeaponStrikeModePerformer>
    implements MissileWeaponStrikeModeData
{
    protected static readonly logicClass = MissileWeaponStrikeModePerformer;
    declare readonly parent: SohlItemProxy<MissileWeaponStrikeModePerformer>;
    projectileType!: ProjectileGearKind;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            projectileType: new StringField({
                initial: PROJECTILEGEAR_KIND.NONE,
                required: true,
                choices: Object.values(PROJECTILEGEAR_KIND),
            }),
        };
    }
}
