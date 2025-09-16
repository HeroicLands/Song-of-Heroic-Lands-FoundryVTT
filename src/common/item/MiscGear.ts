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
const kMiscGear = Symbol("MiscGear");
const kData = Symbol("MiscGear.Data");

export class MiscGear
    extends GearMixin(SohlItem.BaseLogic)
    implements MiscGear.Logic
{
    declare readonly [kGearMixin]: true;
    declare readonly _parent: MiscGear.Data;
    readonly [kMiscGear] = true;

    static isA(obj: unknown): obj is MiscGear {
        return typeof obj === "object" && obj !== null && kMiscGear in obj;
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

export namespace MiscGear {
    export interface Logic extends GearMixin.Logic {
        readonly _parent: MiscGear.Data;
        readonly [kMiscGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
    }

    export const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<MiscGear.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["MISCGEAR"];
        readonly [kData] = true;
    }
}
