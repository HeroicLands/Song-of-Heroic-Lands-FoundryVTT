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

import { TraitPerformer } from "@logic/common/item/performer";
import { isOfType } from "@logic/common/core";
import { MasteryLevelData } from "@logic/common/item/data";

export const TRAIT_TYPE = "trait" as const;
export const isTraitData = (obj: any): obj is TraitData =>
    isOfType(obj, TRAIT_TYPE);

export const SUBTYPE = {
    PHYSIQUE: "physique",
    PERSONALITY: "personality",
    TRANSCENDENT: "transcendent",
} as const;
export type TraitSubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

export const INTENSITY = {
    TRAIT: "trait",
    IMPULSE: "impulse",
    DISORDER: "disorder",
    ATTRIBUTE: "attribute",
} as const;
export type TraitIntensity = (typeof INTENSITY)[keyof typeof INTENSITY];

export interface TraitData
    extends MasteryLevelData<TraitPerformer, TraitSubType> {
    textValue: string;
    max: number | null;
    isNumeric: boolean;
    intensity: TraitIntensity;
    valueDesc: {
        label: string;
        maxValue: number;
    }[];
    choices: StrictObject<string>;
}
