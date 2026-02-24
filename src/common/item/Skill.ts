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

import type { SohlActionContext } from "@common/SohlActionContext";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    MasteryLevelLogic,
    MasteryLevelDataModel,
    MasteryLevelData,
} from "@common/item/MasteryLevel";
import {
    SKILL_COMBAT_CATEGORY,
    SkillCombatCategories,
    SkillSubTypes,
    SkillSubType,
    SKILL_SUBTYPE,
    ITEM_KIND,
    ITEM_METADATA,
} from "@utils/constants";
const { StringField } = foundry.data.fields;

export class SkillLogic<TData extends SkillData = SkillData>
    extends MasteryLevelLogic<TData>
    implements SkillLogic<TData>
{
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface SkillData<
    TLogic extends SkillLogic<SkillData> = SkillLogic<any>,
> extends MasteryLevelData<TLogic> {
    subType: SkillSubType;
    weaponGroup: string;
    baseSkill: string;
    domain: string;
}

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
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Skill.DATA"];
    subType!: SkillSubType;
    weaponGroup!: string;
    baseSkill!: string;
    domain!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSkillSchema();
    }
}

export class SkillSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
