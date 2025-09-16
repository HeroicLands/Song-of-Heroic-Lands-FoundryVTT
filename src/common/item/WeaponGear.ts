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

import type { SohlEventContext } from "@common/event/SohlEventContext";

import { SohlItem } from "@common/item/SohlItem";
import { GearMixin, kGearMixin } from "@common/item/GearMixin";

const { NumberField } = foundry.data.fields;
const kWeaponGear = Symbol("WeaponGear");
const kData = Symbol("WeaponGear.Data");

export class WeaponGear
    extends GearMixin(SohlItem.BaseLogic)
    implements WeaponGear.Logic
{
    declare [kGearMixin]: true;
    declare readonly _parent: WeaponGear.Data;
    readonly [kWeaponGear] = true;

    static isA(obj: unknown): obj is WeaponGear {
        return typeof obj === "object" && obj !== null && kWeaponGear in obj;
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

export namespace WeaponGear {
    export interface Logic extends GearMixin.Logic {
        readonly _parent: WeaponGear.Data;
        readonly [kWeaponGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
        lengthBase: number;
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
        readonly [kData] = true;

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
