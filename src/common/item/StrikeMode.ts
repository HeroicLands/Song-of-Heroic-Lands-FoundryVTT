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

import {
    ImpactAspect,
    IMPACT_ASPECT,
    ImpactAspects,
    Variants,
    Variant,
} from "@utils/constants";
import type { SohlActionContext } from "@common/SohlActionContext";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { ImpactModifier } from "@common/modifier/ImpactModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { GearLogic } from "@common/item/Gear";
import type { SkillLogic } from "@common/item/Skill";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
} from "@common/item/SohlItem";
import { isGearItem } from "@utils/helpers";
const { StringField, NumberField, SchemaField } = foundry.data.fields;

export abstract class StrikeModeLogic<
    TData extends StrikeModeData = StrikeModeData,
> extends SohlItemBaseLogic<TData> {
    traits!: PlainObject;
    assocSkill?: SohlItem;
    impact!: ImpactModifier;
    attack!: CombatModifier;
    durability!: ValueModifier;

    async attackTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.attack.successTest(context)) || null;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        this.traits = {
            noAttack: false,
            noBlock: false,
        };
        this.impact = sohl.CONFIG.ImpactModifier({}, { parent: this });
        this.attack = sohl.CONFIG.CombatModifier({}, { parent: this });
        this.durability = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.impact.base = this.data.impactBase;
        const skills: SkillLogic[] =
            this.actor?.itemTypes.skill.map(
                (it) => (it as any).logic as SkillLogic,
            ) || [];
        const skill = skills.find(
            (s: SkillLogic) => s.name === this.data.assocSkillName,
        );
        if (skill) {
            this.assocSkill = skill.item;
            this.attack.addVM(skill.masteryLevel, {
                includeBase: true,
            });
        } else {
            sohl.log.warn("SOHL.StrikeMode.NoAssocSkillWarning", {
                label: sohl.i18n.localize(this.data.label),
                skillName: this.data.assocSkillName,
            });
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
        if (this.item && isGearItem(this.item)) {
            this.durability.addVM(
                (this.nestedIn?.logic as GearLogic).durability,
            );
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface StrikeModeData<
    TLogic extends StrikeModeLogic<StrikeModeData> = StrikeModeLogic<any>,
> extends SohlItemData<TLogic> {
    subType: Variant;
    mode: string;
    minParts: number;
    assocSkillName: string;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
}

function defineStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: Variants,
            required: true,
        }),
        mode: new StringField(),
        minParts: new NumberField({
            integer: true,
            initial: 1,
            min: 0,
        }),
        assocSkillName: new StringField(),
        impactBase: new SchemaField({
            numDice: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            die: new NumberField({
                integer: true,
                initial: 6,
                min: 0,
            }),
            modifier: new NumberField({
                integer: true,
                initial: 0,
            }),
            aspect: new StringField({
                initial: IMPACT_ASPECT.BLUNT,
                required: true,
                choices: ImpactAspects,
            }),
        }),
    };
}

type StrikeModeSchema = ReturnType<typeof defineStrikeModeSchema>;

export abstract class StrikeModeDataModel<
        TSchema extends foundry.data.fields.DataSchema = StrikeModeSchema,
        TLogic extends
            StrikeModeLogic<StrikeModeData> = StrikeModeLogic<StrikeModeData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements StrikeModeData<TLogic>
{
    subType!: Variant;
    mode!: string;
    minParts!: number;
    assocSkillName!: string;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineStrikeModeSchema();
    }
}
