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
import { SohlLogic } from "@common/SohlLogic";
import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import { GearMixin, kGearMixin } from "@common/item/GearMixin";
import { ValueModifier } from "@common/modifier/ValueModifier";

const { NumberField } = foundry.data.fields;
const kWeaponGear = Symbol("WeaponGear");
const kData = Symbol("WeaponGear.Data");

export class WeaponGear
    extends GearMixin(SohlLogic)
    implements WeaponGear.Logic
{
    declare weight: ValueModifier;
    declare value: ValueModifier;
    declare quality: ValueModifier;
    declare durability: ValueModifier;
    declare [kGearMixin]: true;
    declare readonly parent: WeaponGear.Data;
    readonly [kWeaponGear] = true;

    static isA(obj: unknown): obj is WeaponGear {
        return typeof obj === "object" && obj !== null && kWeaponGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace WeaponGear {
    export interface Logic extends GearMixin.Logic {
        readonly parent: WeaponGear.Data;
        readonly [kWeaponGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
        readonly logic: Logic;
        lengthBase: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<WeaponGear.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        static readonly LOCALIZATION_PREFIXES = ["WEAPONGEAR"];
        declare lengthBase: number;
        declare abbrev: string;
        declare quantity: number;
        declare weightBase: number;
        declare valueBase: number;
        declare isCarried: boolean;
        declare isEquipped: boolean;
        declare qualityBase: number;
        declare durabilityBase: number;
        declare _logic: Logic;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new WeaponGear(this);
            return this._logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                lengthBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            };
        }
    }
}
