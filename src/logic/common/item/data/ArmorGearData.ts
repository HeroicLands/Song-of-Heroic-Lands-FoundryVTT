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

import { ArmorGearPerformer } from "@logic/common/item/performer";
import { GearData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const ARMORGEAR_TYPE = "armorgear" as const;
export const isArmorGearData = (obj: any): obj is ArmorGearData =>
    isOfType(obj, ARMORGEAR_TYPE);

export interface ArmorGearData extends GearData<ArmorGearPerformer> {
    material: string;
    locations: {
        flexible: string[];
        rigid: string[];
    };
}
