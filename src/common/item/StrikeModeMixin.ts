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
    defineType,
    Variant,
    ImpactAspect,
    IMPACT_ASPECT,
    ImpactAspects,
} from "@utils/constants";
import type { SohlLogic } from "@common/SohlLogic";
import { SohlItem } from "@common/item/SohlItem";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import type { SubTypeMixin } from "@common/item/SubTypeMixin";
import { GearMixin } from "@common/item/GearMixin";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { ImpactModifier } from "@common/modifier/ImpactModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
const { StringField, NumberField, SchemaField } = foundry.data.fields;

export const kStrikeModeMixin = Symbol("StrikeModeMixin");
export const kStrikeModeMixinData = Symbol("StrikeModeMixin.Data");

/**
 * A mixin for item data models that represent strike modes.
 *
 * @template TBase
 *
 * @param Base Base class to extend (should be a `TypeDataModel` subclass).
 * @returns The extended class with the basic strike mode properties.
 */
export function StrikeModeMixin<TBase extends Constructor<SohlItem.BaseLogic>>(
    Base: TBase,
): TBase & Constructor<InstanceType<TBase> & StrikeModeMixin.Logic> {
    return class extends Base {
        declare readonly _parent: StrikeModeMixin.Data;
        readonly [kStrikeModeMixin] = true;
        traits!: PlainObject;
        assocSkill?: SohlItem;
        impact!: ImpactModifier;
        attack!: CombatModifier;
        durability!: ValueModifier;

        static isA(obj: unknown): obj is TBase & GearMixin.Logic {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kStrikeModeMixin in obj
            );
        }

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
            this.impact.base = this._parent.impactBase;
            this.assocSkill = this.actor?.itemTypes.skill.find(
                (it: SohlItem) => it.name === this._parent.assocSkillName,
            );
            if (this.assocSkill) {
                this.attack.addVM(this.assocSkill.system.masteryLevel, {
                    includeBase: true,
                });
            } else {
                sohl.log.warn("SOHL.StrikeMode.NoAssocSkillWarning", {
                    label: sohl.i18n.localize(this.item.system.label),
                    skillName: this._parent.assocSkillName,
                });
            }
        }

        /** @inheritdoc */
        override evaluate(context: SohlEventContext): void {
            super.evaluate(context);
            const gearData = this.item.nestedIn?.system;
            if (GearMixin.Data.isA(gearData)) {
                this.durability.addVM(
                    (gearData.logic as GearMixin.Logic).durability,
                );
            }
        }

        /** @inheritdoc */
        override finalize(context: SohlEventContext): void {
            super.finalize(context);
        }
    } as unknown as TBase &
        Constructor<InstanceType<TBase> & StrikeModeMixin.Logic>;
}

export namespace StrikeModeMixin {
    export const {
        kind: EFFECT_KEY,
        values: EffectKey,
        isValue: isEffectKey,
        labels: EffectKeyLabels,
    } = defineType("SOHL.StrikeMode.EffectKey", {
        IMPACT: {
            name: "system.logic.impact",
            abbrev: "Imp",
        },
        ATTACK: {
            name: "system.logic.attack",
            abbrev: "Atk",
        },
        BLOCK: {
            name: "system.logic.defense.block",
            abbrev: "Blk",
        },
        COUNTERSTRIKE: {
            name: "system.logic.defense.counterstrike",
            abbrev: "CXMod",
        },
        NOATTACK: {
            name: "system.logic.traits.noAttack",
            abbrev: "NoAtk",
        },
        NOBLOCK: {
            name: "system.logic.traits.noBlock",
            abbrev: "NoBlk",
        },
    } as StrictObject<SohlLogic.EffectKeyData>);
    export type EffectKey = (typeof EFFECT_KEY)[keyof typeof EFFECT_KEY];

    export interface Logic extends SubTypeMixin.Logic {
        readonly [kStrikeModeMixin]: true;
        traits: PlainObject;
        assocSkill?: SohlItem;
        impact: ImpactModifier;
        attack: CombatModifier;
        durability: ValueModifier;
    }

    export interface Data extends SubTypeMixin.Data<Variant> {
        readonly [kStrikeModeMixinData]: true;
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

    export function DataModel<
        TBase extends AbstractConstructor<SohlItem.DataModel> &
            SohlItem.DataModel.Statics,
    >(
        Base: TBase,
    ): TBase &
        AbstractConstructor<InstanceType<TBase> & Data> &
        SohlItem.DataModel.Statics {
        abstract class DM extends Base {
            readonly [kStrikeModeMixinData] = true;

            constructor(...args: any[]) {
                super(...args);
            }

            static override defineSchema(): foundry.data.fields.DataSchema {
                return {
                    ...super.defineSchema(),
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
        }

        return DM as unknown as TBase &
            AbstractConstructor<InstanceType<TBase> & Data> &
            SohlItem.DataModel.Statics;
    }
}
