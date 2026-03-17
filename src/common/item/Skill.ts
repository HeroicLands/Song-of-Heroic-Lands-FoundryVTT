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

/**
 * Logic for the **Skill** item type — a trained capability with a mastery level.
 *
 * Skills represent learned abilities that characters use to accomplish tasks:
 * combat techniques, social interactions, crafting, perception, and more.
 * Each skill has a **skill base formula** (typically derived from one or more
 * traits like Strength, Dexterity, or Aura) and a **mastery level** representing
 * training and experience.
 *
 * Skills are categorized by {@link SkillData.subType | subType} (e.g., combat,
 * social, physical) and may be associated with a **weapon group** or a
 * **mystical domain**. A skill can also reference a **base skill** from which
 * it derives or shares advancement.
 *
 * Skills are the primary mechanism for resolving actions in SoHL. When a
 * character attempts a task, the relevant skill's mastery level is tested
 * against a target number, with modifiers from traits, gear, conditions,
 * and situational factors.
 *
 * Inherits mastery level progression, fate integration, and SDR improvement
 * from {@link MasteryLevelLogic}.
 *
 * @typeParam TData - The Skill data interface.
 */
export class SkillLogic<TData extends SkillData = SkillData>
    extends MasteryLevelLogic<TData>
    implements SkillLogic<TData>
{
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface SkillData<
    TLogic extends SkillLogic<SkillData> = SkillLogic<any>,
> extends MasteryLevelData<TLogic> {
    /** Skill category (Combat, Social, Physical, etc.) */
    subType: SkillSubType;
    /** Combat category this skill applies to, if any */
    weaponGroup: string;
    /** Name of the base skill if this is a specialization */
    baseSkill: string;
    /** Mystical domain associated with this skill, if any */
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
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Skill", "SOHL.MasteryLevel", "SOHL.Item"];
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
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            skillBaseFormula: system.skillBaseFormula,
            masteryLevelBase: system.masteryLevelBase,
            improveFlag: system.improveFlag,
            subType: system.subType,
            weaponGroup: system.weaponGroup,
            baseSkill: system.baseSkill,
            domain: system.domain,
        });
    }
}
