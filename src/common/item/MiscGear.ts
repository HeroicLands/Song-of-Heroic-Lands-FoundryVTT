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
import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import { GearMixin, kGearMixin } from "@common/item/GearMixin";
import { SohlLogic } from "@common/SohlLogic";
import { ValueModifier } from "@common/modifier/ValueModifier";
const kMiscGear = Symbol("MiscGear");
const kData = Symbol("MiscGear.Data");

export class MiscGear extends GearMixin(SohlLogic) implements MiscGear.Logic {
    declare readonly [kGearMixin]: true;
    declare readonly parent: MiscGear.Data;
    weight!: ValueModifier;
    value!: ValueModifier;
    quality!: ValueModifier;
    durability!: ValueModifier;
    readonly [kMiscGear] = true;

    static isA(obj: unknown): obj is MiscGear {
        return typeof obj === "object" && obj !== null && kMiscGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace MiscGear {
    export interface Logic extends GearMixin.Logic {
        readonly parent: MiscGear.Data;
        readonly [kMiscGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
        readonly logic: Logic;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<MiscGear.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["MISCGEAR"];
        declare _logic: Logic;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new MiscGear(this);
            return this._logic;
        }
    }
}
