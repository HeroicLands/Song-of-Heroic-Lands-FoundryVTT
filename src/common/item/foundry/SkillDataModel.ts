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

import { MasteryLevelDataModel } from "@src/common/item/foundry/MasteryLevelDataModel";
import { SkillLogic, SkillData } from "@src/common/item/logic/SkillLogic";
import {
    SKILL_COMBAT_CATEGORY,
    SkillCombatCategories,
    SkillSubTypes,
    SkillSubType,
    SKILL_SUBTYPE,
    ITEM_KIND,
} from "@src/utils/constants";
const { StringField } = foundry.data.fields;

function defineSkillSchema(): foundry.data.fields.DataSchema {
    return {
        ...MasteryLevelDataModel.defineSchema(),
        subType: new StringField({
            initial: SKILL_SUBTYPE.SOCIAL,
            required: true,
            choices: SkillSubTypes,
        }),
        weaponGroup: new StringField({
            initial: SKILL_COMBAT_CATEGORY.NONE,
            blank: false,
            choices: SkillCombatCategories,
        }),
        baseSkill: new StringField(),
        domain: new StringField(),
    };
}

type SkillSchema = ReturnType<typeof defineSkillSchema>;

export class SkillDataModel<
    TSchema extends foundry.data.fields.DataSchema = SkillSchema,
    TLogic extends SkillLogic<SkillData> = SkillLogic<SkillData>,
>
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements SkillData<TLogic>
{
    static override readonly kind = ITEM_KIND.SKILL;
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Skill",
        "SOHL.MasteryLevel",
        "SOHL.Item",
    ];
    subType!: SkillSubType;
    weaponGroup!: string;
    baseSkill!: string;
    domain!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSkillSchema();
    }
}
