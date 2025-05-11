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

import { SohlItemProxy } from "@logic/common/item";
import { ContainerGearData } from "@logic/common/item/data";
import { ContainerGearPerformer } from "@logic/common/item/performer";
import { GearDataModel } from "@foundry/item/datamodel";
const { NumberField } = (foundry.utils as any).fields;

export class ContainerGearDataModel
    extends GearDataModel<ContainerGearPerformer>
    implements ContainerGearData
{
    protected static readonly logicClass = ContainerGearPerformer;
    declare readonly parent: SohlItemProxy<ContainerGearPerformer>;
    maxCapacityBase!: number;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            maxCapacityBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
        };
    }
}
