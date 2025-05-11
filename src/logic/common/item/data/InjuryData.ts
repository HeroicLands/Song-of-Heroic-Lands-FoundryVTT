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

import { InjuryPerformer } from "@logic/common/item/performer";
import { SohlPerformerItemData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";
import { AspectType } from "@logic/common/core/modifier";

export const INJURY_TYPE = "domain" as const;
export const isInjuryData = (obj: any): obj is InjuryData =>
    isOfType(obj, INJURY_TYPE);

export const SHOCK = {
    NONE: 0,
    STUNNED: 1,
    INCAPACITATED: 2,
    UNCONCIOUS: 3,
    KILLED: 4,
} as const;
export type ShockValue = (typeof SHOCK)[keyof typeof SHOCK];

export const UNTREATED = {
    hr: 4,
    infect: true,
    impair: false,
    bleed: false,
    newInj: -1,
} as const;

export const INJURY_LEVELS = ["NA", "M1", "S2", "S3", "G4", "G5"];

export interface InjuryData extends SohlPerformerItemData<InjuryPerformer> {
    injuryLevelBase: number;
    healingRateBase: number;
    aspect: AspectType;
    isTreated: boolean;
    isBleeding: boolean;
    bodyLocationId: string;
}
