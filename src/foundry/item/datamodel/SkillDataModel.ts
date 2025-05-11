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
import { COMBAT, SkillData, SkillSubType } from "@logic/common/item/data";
import { SkillPerformer } from "@logic/common/item/performer";
import { MasteryLevelDataModel } from "./MasteryLevelDataModel";
const { StringField } = (foundry.utils as any).fields;

export class SkillDataModel
    extends MasteryLevelDataModel<SkillPerformer, SkillSubType>
    implements SkillData
{
    protected static readonly logicClass = SkillPerformer;
    declare readonly parent: SohlItemProxy<SkillPerformer>;
    weaponGroup!: string;
    baseSkill!: string;
    domain!: string;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            weaponGroup: new StringField({
                initial: COMBAT.NONE,
                blank: false,
                choices: Object.values(COMBAT),
            }),
            baseSkill: new StringField(),
            domain: new StringField(),
        };
    }
}
