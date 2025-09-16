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

import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import {
    kMasteryLevelMixin,
    MasteryLevelMixin,
} from "@common/item/MasteryLevelMixin";
import {
    SKILL_COMBAT_CATEGORY,
    SkillCombatCategories,
    SkillSubType,
    SkillSubTypes,
} from "@utils/constants";
import type { SohlEventContext } from "@common/event/SohlEventContext";
const kSkill = Symbol("Skill");
const kData = Symbol("Skill.Data");
const { StringField } = foundry.data.fields;

export class Skill
    extends SubTypeMixin(MasteryLevelMixin(SohlItem.BaseLogic))
    implements Skill.Logic
{
    declare readonly [kMasteryLevelMixin]: true;
    declare readonly _parent: Skill.Data;
    readonly [kSkill] = true;

    static isA(obj: unknown): obj is Skill {
        return typeof obj === "object" && obj !== null && kSkill in obj;
    }

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
    export interface Logic
        extends MasteryLevelMixin.Logic,
            SubTypeMixin.Logic<SkillSubType> {
        readonly _parent: Skill.Data;
        readonly [kSkill]: true;
    }

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<SkillSubType> {
        readonly [kData]: true;
        weaponGroup: string;
        baseSkill: string;
        domain: string;
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        SkillSubType,
        typeof SkillSubTypes
    >(
        MasteryLevelMixin.DataModel(SohlItem.DataModel),
        SkillSubTypes,
    ) as unknown as Constructor<Skill.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static readonly LOCALIZATION_PREFIXES = ["Skill"];
        declare abbrev: string;
        declare skillBaseFormula: string;
        declare masteryLevelBase: number;
        declare improveFlag: boolean;
        declare weaponGroup: string;
        declare baseSkill: string;
        declare domain: string;
        declare subType: SkillSubType;
        readonly [kData] = true;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                weaponGroup: new StringField({
                    initial: SKILL_COMBAT_CATEGORY.NONE,
                    blank: false,
                    choices: SkillCombatCategories,
                }),
                baseSkill: new StringField(),
                domain: new StringField(),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/skill.hbs",
                },
            });
    }
}
