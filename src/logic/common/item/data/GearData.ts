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

import { GearPerformer } from "@logic/common/item/performer";
import { SubTypeData } from "@logic/common/item/data";

export const isGearData = (obj: any): obj is GearData =>
    typeof obj === "object" && Object.hasOwn(obj, "isCarried");

export const GEAR_SUBTYPE = {
    ARMOR: "armorgear",
    WEAPON: "weapongear",
    PROJECTILE: "projectilegear",
    CONCOCTION: "concoctiongear",
    CONTAINER: "containergear",
    MISC: "miscgear",
} as const;
export type GearSubType = (typeof GEAR_SUBTYPE)[keyof typeof GEAR_SUBTYPE];

export interface GearData<T extends GearPerformer = GearPerformer>
    extends SubTypeData<T, GearSubType> {
    abbrev: string;
    quantity: number;
    weightBase: number;
    valueBase: number;
    isCarried: boolean;
    isEquipped: boolean;
    qualityBase: number;
    durabilityBase: number;
}
