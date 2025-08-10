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
import type { SohlItem } from "@common/item/SohlItem";
import type { SohlEvent } from "@common/event/SohlEvent";
import type { SohlAction } from "@common/event/SohlAction";
import type { SubTypeMixin } from "@common/item/SubTypeMixin";
import { GearMixin } from "@common/item/GearMixin";
import type { CombatModifier } from "@common/modifier/CombatModifier";
import type { ImpactModifier } from "@common/modifier/ImpactModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { SohlActor } from "@common/actor/SohlActor";
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
export function StrikeModeMixin<TBase extends AnyConstructor<SohlLogic>>(
    Base: TBase,
): TBase {
    return class extends Base {
        declare readonly parent: StrikeModeMixin.Data;
        declare readonly actions: SohlAction[];
        declare readonly events: SohlEvent[];
        declare readonly item: SohlItem;
        declare readonly actor: SohlActor | null;
        declare readonly typeLabel: string;
        declare readonly label: string;
        declare readonly defaultIntrinsicActionName: string;
        declare setDefaultAction: () => void;
        readonly [kStrikeModeMixin] = true;
        traits!: PlainObject;
        assocSkill?: SohlItem;
        impact!: ImpactModifier;
        attack!: CombatModifier;
        defense!: {
            block: CombatModifier;
        };
        durability!: ValueModifier;

        static isA(obj: unknown): obj is TBase & GearMixin.Logic {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kStrikeModeMixin in obj
            );
        }

        /** @inheritdoc */
        initialize(context: SohlAction.Context): void {
            super.initialize(context);
            this.traits = {
                noAttack: false,
                noBlock: false,
            };
            this.impact = sohl.CONFIG.ImpactModifier({}, { parent: this });
            this.attack = sohl.CONFIG.CombatModifier({}, { parent: this });
            this.defense = {
                block: sohl.CONFIG.CombatModifier({}, { parent: this }),
            };
            this.durability = sohl.CONFIG.ValueModifier({}, { parent: this });
            this.impact.base = this.parent.impactBase;
            this.assocSkill = this.actor?.itemTypes.skill.find(
                (it) => it.name === this.parent.assocSkillName,
            );
            if (!this.assocSkill) {
                sohl.log.warn("SOHL.StrikeMode.NoAssocSkillWarning", {
                    label: sohl.i18n.localize(this.item.label),
                    skillName: this.parent.assocSkillName,
                });
            }
        }

        /** @inheritdoc */
        evaluate(context: SohlAction.Context): void {
            super.evaluate(context);
            const gearData = this.item.nestedIn?.system;
            if (GearMixin.Data.isA(gearData)) {
                this.durability.addVM(gearData.logic.durability);
            }
        }

        /** @inheritdoc */
        finalize(context: SohlAction.Context): void {
            super.finalize(context);
        }
    } as unknown as TBase & StrikeModeMixin.Logic;
}

export namespace StrikeModeMixin {
    export const {
        kind: EFFECT_KEY,
        values: EffectKey,
        isValue: isEffectKey,
        labels: EffectKeyLabels,
    } = defineType("SOHL.StrikeMode.EffectKey", {
        IMPACT: {
            name: "system.impact",
            abbrev: "Imp",
        },
        ATTACK: {
            name: "system.attack",
            abbrev: "Atk",
        },
        BLOCK: {
            name: "system.defense.block",
            abbrev: "Blk",
        },
        COUNTERSTRIKE: {
            name: "system.defense.counterstrike",
            abbrev: "CXMod",
        },
        NOATTACK: {
            name: "system.traits.noAttack",
            abbrev: "NoAtk",
        },
        NOBLOCK: {
            name: "system.traits.noBlock",
            abbrev: "NoBlk",
        },
    } as StrictObject<SohlLogic.EffectKeyData>);
    export type EffectKey = (typeof EFFECT_KEY)[keyof typeof EFFECT_KEY];

    export interface Logic extends SubTypeMixin.Logic<Variant> {
        readonly [kStrikeModeMixin]: true;
        parent: StrikeModeMixin.Data;
        traits: PlainObject;
        assocSkill?: SohlItem;
        impact: ImpactModifier;
        attack: CombatModifier;
        defense: {
            block: CombatModifier;
        };
        durability: ValueModifier;
    }

    export interface Data extends SubTypeMixin.Data<Variant> {
        readonly [kStrikeModeMixinData]: true;
        readonly logic: Logic;
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

    export namespace Data {
        export function isA(obj: unknown, subType?: Variant): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kStrikeModeMixinData in obj &&
                (subType ? (obj as Data).subType === subType : true)
            );
        }
    }

    export function DataModel<TBase extends AnyConstructor>(
        Base: TBase,
    ): TBase {
        return class extends Base {
            readonly [kStrikeModeMixinData] = true;

            static defineSchema(): foundry.data.fields.DataSchema {
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
        };
    }
}
