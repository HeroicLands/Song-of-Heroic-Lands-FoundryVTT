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
import type { SohlEventContext } from "@common/event/SohlEventContext";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { ImpactModifier } from "@common/modifier/ImpactModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { Gear } from "@common/item/Gear";
import type { Skill } from "@common/item/Skill";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import { SohlItem, SohlItemDataModel } from "@common/item/SohlItem";
import { isGearItem } from "@utils/helpers";
const { StringField, NumberField, SchemaField } = foundry.data.fields;

export abstract class StrikeMode<
    TData extends StrikeMode.Data = StrikeMode.Data,
> extends SohlItem.BaseLogic<TData> {
    traits!: PlainObject;
    assocSkill?: SohlItem;
    impact!: ImpactModifier;
    attack!: CombatModifier;
    durability!: ValueModifier;

    async attackTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return (await this.attack.successTest(context)) || null;
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.traits = {
            noAttack: false,
            noBlock: false,
        };
        this.impact = sohl.CONFIG.ImpactModifier({}, { parent: this });
        this.attack = sohl.CONFIG.CombatModifier({}, { parent: this });
        this.durability = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.impact.base = this.data.impactBase;
        const skills: Skill[] =
            this.actor?.itemTypes.skill.map(
                (it) => (it as any).logic as Skill,
            ) || [];
        const skill = skills.find(
            (s: Skill) => s.name === this.data.assocSkillName,
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
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
        if (this.item && isGearItem(this.item)) {
            this.durability.addVM(
                (this.nestedIn?.logic as Gear.Logic).durability,
            );
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace StrikeMode {
    export interface Logic<TData extends StrikeMode.Data = StrikeMode.Data>
        extends SohlItem.Logic<TData> {
        traits: PlainObject;
        assocSkill?: SohlItem;
        impact: ImpactModifier;
        attack: CombatModifier;
        durability: ValueModifier;
    }

    export interface Data<
        TLogic extends StrikeMode.Logic<Data> = StrikeMode.Logic<any>,
    > extends SohlItem.Data<TLogic> {
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
            StrikeMode.Logic<StrikeMode.Data> = StrikeMode.Logic<StrikeMode.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements StrikeMode.Data<TLogic>
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
