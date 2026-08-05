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
import { SafeExpressionField } from "@src/core/foundry/SafeExpressionField";
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
 * opening-mastery multiplier (initSkillMult), and injury-impairment roles.
 *
 * @returns The Skill data schema.
 */
function defineSkillSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        // Required with no default: a Skill must declare its kind at creation
        // (subType is never silently defaulted). SKILL_SUBTYPE stays imported
        // for the COMBATTECHNIQUE check below.
        subType: new StringField({
            required: true,
            choices: SkillSubTypeChoices,
        }),
        // A SafeExpression source (e.g. `sb(attr.str, attr.dex)`). Stored as a
        // plain string; the SafeExpressionField adds grammar validation and
        // marks the field for the code editor (edit button on the Skill sheet).
        // Its defaults are exactly this field's shape — nullable, non-blank,
        // `initial: null` (unset-when-blank) — so no options are needed.
        skillBaseFormula: new SafeExpressionField(),
        // `null` = "not yet opened" (distinct from a deliberate 0). On an actor
        // an unopened skill opens at Skill Base × initSkillMult; see
        // SkillLogic.initialize.
        masteryLevelBase: new NumberField({
            integer: true,
            nullable: true,
            initial: null,
            min: 0,
        }),
        improveFlag: new BooleanField({ initial: false }),
        combatCategory: new StringField({
            initial: SKILL_COMBAT_CATEGORY.NONE,
            blank: false,
            choices: SkillCombatCategoryChoices,
        }),
        // Shortcode of the parent (base) skill this skill specializes, or
        // `null` when it is not a specialization. Nullable and non-blank so
        // Foundry cleans a blank form submission (and any legacy `""`) to
        // `null` — null at the persistence edge, per the null/undefined
        // discipline in docs/contributing/system-development.md.
        parentSkillCode: new StringField({
            nullable: true,
            initial: null,
            blank: false,
        }),
        // When this skill specializes another (its `parentSkillCode` resolves
        // to a parent skill), track that parent's mastery-level base instead of
        // this skill's own: during `evaluate()` the mastery-level base is set
        // from the parent's `masteryLevelBase` before this skill's own boosts
        // and clamp apply on top. Ignored when there is no resolvable parent.
        adoptParentMasteryLevel: new BooleanField({ initial: false }),
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
            { nullable: true, initial: null },
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
    skillBaseFormula!: string | null;
    masteryLevelBase!: number | null;
    improveFlag!: boolean;
    combatCategory!: string;
    parentSkillCode!: string | null;
    adoptParentMasteryLevel!: boolean;
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
