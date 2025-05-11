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

import { SubTypeDataModel } from "@foundry/item/datamodel";
import { GearData, GearSubType } from "@logic/common/item/data";
import { GearPerformer } from "@logic/common/item/performer";
const { StringField, NumberField, BooleanField } = (foundry.utils as any)
    .fields;

export abstract class GearDataModel<T extends GearPerformer = GearPerformer>
    extends SubTypeDataModel<T, GearSubType>
    implements GearData
{
    abbrev!: string;
    quantity!: number;
    weightBase!: number;
    valueBase!: number;
    isCarried!: boolean;
    isEquipped!: boolean;
    qualityBase!: number;
    durabilityBase!: number;

    static defineSchema() {
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
