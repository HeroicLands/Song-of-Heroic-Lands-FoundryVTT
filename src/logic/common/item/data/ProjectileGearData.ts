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

import { ProjectileGearPerformer } from "@logic/common/item/performer";
import { isOfType } from "@logic/common/core";
import { GearData } from "@logic/common/item/data";

export const PROJECTILEGEAR_TYPE = "projectilegear" as const;
export const isProjectileGearData = (obj: any): obj is ProjectileGearData =>
    isOfType(obj, PROJECTILEGEAR_TYPE);

export const PROJECTILEGEAR_KIND = {
    NONE: "none",
    ARROW: "arrow",
    BOLT: "bolt",
    BULLET: "bullet",
    DART: "dart",
    OTHER: "other",
} as const;
export type ProjectileGearKind =
    (typeof PROJECTILEGEAR_KIND)[keyof typeof PROJECTILEGEAR_KIND];

export interface ProjectileGearData extends GearData<ProjectileGearPerformer> {
    kind: ProjectileGearKind;
    shortName: string;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: string;
    };
}
