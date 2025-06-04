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

import { defineType, DocumentId, HTMLString } from "@utils";
import { SohlDataModel, SohlPerformer } from "@common";
import { SohlItem } from "@common/item";
import { SohlAction } from "@common/event";
import { SohlActor } from "@common/actor";
const { StringField, NumberField, BooleanField } = (foundry.data as any).fields;

const kGearMixin = Symbol("GearMixin");
const kDataModel = Symbol("GearMixin.DataModel");

/**
 * A mixin for item data models that represent gear.
 *
 * @template TBase
 *
 * @param Base Base class to extend (should be a `TypeDataModel` subclass).
 * @returns The extended class with the basic gear properties.
 */
export function GearMixin<TBase extends AnyConstructor<SohlPerformer>>(
    Base: TBase,
): TBase {
    return class InternalGearPerformer extends Base {
        readonly [kGearMixin] = true;

        static isA(obj: unknown): obj is TBase {
            return typeof obj === "object" && obj !== null && kGearMixin in obj;
        }

        /** @inheritdoc */
        initialize(context: SohlAction.Context = {}): void {
            super.initialize(context);
        }

        /** @inheritdoc */
        evaluate(context: SohlAction.Context = {}): void {
            super.evaluate(context);
        }

        /** @inheritdoc */
        finalize(context: SohlAction.Context = {}): void {
            super.finalize(context);
        }
    };
}

export namespace GearMixin {
    export const Kind = "gear";

    export interface Data<TPerformer extends SohlPerformer = SohlPerformer>
        extends SohlItem.Data<TPerformer> {
        abbrev: string;
        quantity: number;
        weightBase: number;
        valueBase: number;
        isCarried: boolean;
        isEquipped: boolean;
        qualityBase: number;
        durabilityBase: number;
    }

    export type DataModelConstructor<
        TPerformer extends SohlPerformer = SohlPerformer,
    > = SohlItem.DataModelConstructor<TPerformer>;

    export const {
        kind: GEAR_KIND,
        values: GearKinds,
        isValue: isGearKind,
        labels: gearKindLabels,
    } = defineType(`Gear.GEAR_KIND`, {
        ARMOR: "armorgear",
        WEAPON: "weapongear",
        PROJECTILE: "projectilegear",
        CONCOCTION: "concoctiongear",
        CONTAINER: "containergear",
        MISC: "miscgear",
    });
    export type GearKind = (typeof GEAR_KIND)[keyof typeof GEAR_KIND];

    export function DataModel<
        TBase extends AnyConstructor,
        TPerformer extends SohlPerformer = SohlPerformer,
    >(Base: TBase): TBase & Data<TPerformer> {
        return class InternalDataModel
            extends Base
            implements Data<TPerformer>
        {
            declare notes: HTMLString;
            declare description: HTMLString;
            declare textReference: HTMLString;
            declare transfer: boolean;
            declare nestedIn: DocumentId | null;
            declare parent: SohlItem;
            declare logic: SohlPerformer<any>;
            declare actionList: PlainObject[];
            declare eventList: PlainObject[];
            declare abbrev: string;
            declare quantity: number;
            declare weightBase: number;
            declare valueBase: number;
            declare isCarried: boolean;
            declare isEquipped: boolean;
            declare qualityBase: number;
            declare durabilityBase: number;
            readonly [kDataModel] = true;

            static isA(obj: unknown): obj is TBase & Data<TPerformer> {
                return (
                    typeof obj === "object" && obj !== null && kDataModel in obj
                );
            }

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
        } as unknown as TBase & Data<TPerformer>;
    }
}
