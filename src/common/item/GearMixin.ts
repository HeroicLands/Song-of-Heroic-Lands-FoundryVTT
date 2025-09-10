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

import type { SohlItem } from "@common/item/SohlItem";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import type { ValueModifier } from "@common/modifier/ValueModifier";
const { StringField, NumberField, BooleanField } = foundry.data.fields;

export const kGearMixin = Symbol("GearMixin");
export const kGearMixinData = Symbol("GearMixin.Data");

/**
 * A mixin for item data models that represent gear.
 *
 * @template TBase
 *
 * @param Base Base class to extend (should be a `TypeDataModel` subclass).
 * @returns The extended class with the basic gear properties.
 */
export function GearMixin<TBase extends AnyConstructor<SohlItem.BaseLogic>>(
    Base: TBase,
): TBase & Constructor<InstanceType<TBase> & GearMixin.Logic> {
    return class extends Base {
        declare readonly parent: GearMixin.Data;
        readonly [kGearMixin] = true;
        weight!: ValueModifier;
        value!: ValueModifier;
        quality!: ValueModifier;
        durability!: ValueModifier;

        static isA(obj: unknown): obj is TBase & GearMixin.Logic {
            return typeof obj === "object" && obj !== null && kGearMixin in obj;
        }

        /** @inheritdoc */
        initialize(context: SohlEventContext): void {
            super.initialize(context);
            this.weight = sohl.CONFIG.ValueModifier({}, { parent: this });
            this.value = sohl.CONFIG.ValueModifier({}, { parent: this });
            this.quality = sohl.CONFIG.ValueModifier({}, { parent: this });
            this.durability = sohl.CONFIG.ValueModifier({}, { parent: this });
        }

        /** @inheritdoc */
        evaluate(context: SohlEventContext): void {
            super.evaluate(context);
        }

        /** @inheritdoc */
        finalize(context: SohlEventContext): void {
            super.finalize(context);
        }
    } as unknown as TBase & Constructor<InstanceType<TBase> & GearMixin.Logic>;
}

export namespace GearMixin {
    export interface Logic extends SohlItem.Logic {
        readonly [kGearMixin]: true;
        readonly _parent: GearMixin.Data;
        weight: ValueModifier;
        value: ValueModifier;
        quality: ValueModifier;
        durability: ValueModifier;
    }

    export interface Data extends SohlItem.Data {
        readonly [kGearMixinData]: true;
        abbrev: string;
        quantity: number;
        weightBase: number;
        valueBase: number;
        isCarried: boolean;
        isEquipped: boolean;
        qualityBase: number;
        durabilityBase: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return (
                typeof obj === "object" && obj !== null && kGearMixinData in obj
            );
        }
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
            declare abbrev: string;
            declare quantity: number;
            declare weightBase: number;
            declare valueBase: number;
            declare isCarried: boolean;
            declare isEquipped: boolean;
            declare qualityBase: number;
            declare durabilityBase: number;
            readonly [kGearMixinData] = true;

            static defineSchema(): foundry.data.fields.DataSchema {
                return {
                    ...super.defineSchema(),
                    abbrev: new StringField(),
                    quantity: new NumberField({
                        integer: true,
                        initial: 1,
                        min: 0,
                    }),
                    weightBase: new NumberField({
                        initial: 0,
                        min: 0,
                    }),
                    valueBase: new NumberField({
                        initial: 0,
                        min: 0,
                    }),
                    isCarried: new BooleanField({ initial: true }),
                    isEquipped: new BooleanField({ initial: false }),
                    qualityBase: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    durabilityBase: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                };
            }
        }

        return DM as unknown as TBase &
            AbstractConstructor<InstanceType<TBase> & Data> &
            SohlItem.DataModel.Statics;
    }
}
