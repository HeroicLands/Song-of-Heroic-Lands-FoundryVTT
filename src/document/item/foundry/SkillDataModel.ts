/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {
    SkillLogic,
    SkillData,
} from "@src/document/item/logic/SkillLogic";
import {
    BodyRoles,
    SKILL_COMBAT_CATEGORY,
    SkillCombatCategories,
    SkillSubTypes,
    SkillSubType,
    SKILL_SUBTYPE,
    ITEM_KIND,
    STRIKE_MODE_TYPE,
    SkillSubTypeChoices,
    SkillCombatCategoryChoices,
    BodyRoleChoices,
} from "@src/utils/constants";
import { SohlItemDataModel } from "./SohlItemDataModel";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
const {
    ArrayField,
    NumberField,
    StringField,
    BooleanField,
    SchemaField,
    TypedSchemaField,
} = foundry.data.fields;

/**
 * Builds the Skill data schema, extending the base item schema with skill
 * subtype, mastery/base formula fields, combat category, parent skill link,
 * initiative multiplier, and injury-impairment roles.
 *
 * @returns The Skill data schema.
 */
function defineSkillSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            initial: SKILL_SUBTYPE.SOCIAL,
            required: true,
            choices: SkillSubTypeChoices,
        }),
        skillBaseFormula: new StringField({ initial: "" }),
        masteryLevelBase: new NumberField({
            initial: 0,
            min: 0,
        }),
        improveFlag: new BooleanField({ initial: false }),
        combatCategory: new StringField({
            initial: SKILL_COMBAT_CATEGORY.NONE,
            blank: false,
            choices: SkillCombatCategoryChoices,
        }),
        parentSkillCode: new StringField({ initial: "" }),
        initSkillMult: new NumberField({
            integer: false,
            initial: 0,
            min: 0,
        }),
        /**
         * Body roles whose injury impairs this skill. The skill is impaired
         * if the actor has any unhealed injury at a body part tagged with
         * any of these roles. Roles: vital, core, manipulator, locomotor.
         * See BodyRole in constants for semantics.
         */
        impairedByRoles: new ArrayField(
            new StringField({ blank: false, choices: BodyRoleChoices }),
            { initial: [] },
        ),
        /**
         * Optional embedded strike mode, populated only for the
         * `combattechnique` subtype (a trained fighting maneuver — grapple,
         * unarmed strike, etc. — whose Atk/Blk/CX derive from this skill's own
         * mastery level). Null for every other skill subtype. A discriminated
         * melee/missile union.
         */
        strikeMode: new TypedSchemaField(
            {
                [STRIKE_MODE_TYPE.MELEE]: new SchemaField(
                    MeleeStrikeMode.schemaFields(),
                ),
                [STRIKE_MODE_TYPE.MISSILE]: new SchemaField(
                    MissileStrikeMode.schemaFields(),
                ),
            },
            { required: false, nullable: true, initial: null },
        ),
    };
}

type SkillSchema = ReturnType<typeof defineSkillSchema>;

/** @internal */
export class SkillDataModel<
    TSchema extends foundry.data.fields.DataSchema = SkillSchema,
    TLogic extends SkillLogic<SkillData> = SkillLogic<SkillData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements SkillData<TLogic>
{
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.SKILL;
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Skill",
        "SOHL.MasteryLevel",
        "SOHL.Item",
    ];
    subType!: SkillSubType;
    skillBaseFormula!: string;
    masteryLevelBase!: number;
    improveFlag!: boolean;
    combatCategory!: string;
    parentSkillCode!: string;
    initSkillMult!: number;
    impairedByRoles!: string[];
    strikeMode!: MeleeStrikeMode.Data | MissileStrikeMode.Data | null;

    /**
     * Returns the Skill data schema.
     *
     * @returns The Skill data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSkillSchema();
    }

    /**
     * Seed a default melee strike mode when a new `combattechnique` skill is
     * created without one, so the item is immediately valid and usable (a
     * combat technique's Atk/Blk/CX derive from this skill's own mastery level;
     * the strike mode is refined afterward on the skill sheet). Every other
     * skill subtype keeps a null strike mode.
     *
     * @param data - The creation source data.
     * @param options - The creation options.
     * @param user - The requesting user.
     * @returns `false` to veto creation, otherwise void.
     */
    protected override async _preCreate(
        data: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(
            data as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        if (
            this.subType === SKILL_SUBTYPE.COMBATTECHNIQUE &&
            !this.strikeMode
        ) {
            this.updateSource({
                strikeMode: {
                    type: STRIKE_MODE_TYPE.MELEE,
                    name: this.parent?.name || "Strike",
                },
            } as any);
        }
        return undefined;
    }
}
