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

import type { SohlEventContext } from "@common/event/SohlEventContext";
import { SohlItemSheetBase } from "@common/item/SohlItem";
import { MasteryLevel, MasteryLevelDataModel } from "@common/item/MasteryLevel";
import {
    SKILL_COMBAT_CATEGORY,
    SkillCombatCategories,
    SkillSubTypes,
    SkillSubType,
    SKILL_SUBTYPE,
    ITEM_KIND,
} from "@utils/constants";
import { MysticalAbility } from "./MysticalAbility";
const { StringField } = foundry.data.fields;

export class Skill<TData extends Skill.Data = Skill.Data>
    extends MasteryLevel<TData>
    implements Skill.Logic<TData>
{
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Skill {
    export const Kind = ITEM_KIND.SKILL;

    export interface Logic<TData extends Skill.Data = Skill.Data>
        extends MasteryLevel.Logic<TData> {}

    export interface Data<TLogic extends Skill.Logic<Data> = Skill.Logic<any>>
        extends MasteryLevel.Data<TLogic> {
        subType: SkillSubType;
        weaponGroup: string;
        baseSkill: string;
        domain: string;
    }
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
        TLogic extends Skill.Logic<Skill.Data> = Skill.Logic<Skill.Data>,
    >
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements Skill.Data<TLogic>
{
    static override readonly kind = Skill.Kind;
    static override readonly LOCALIZATION_PREFIXES = ["SKILL"];
    subType!: SkillSubType;
    weaponGroup!: string;
    baseSkill!: string;
    domain!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSkillSchema();
    }
}

export class SkillSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/skill.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
