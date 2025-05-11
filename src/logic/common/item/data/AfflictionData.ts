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

import { AfflictionPerformer } from "@logic/common/item/performer";
import { SubTypeData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const AFFLICTION_TYPE = "affliction" as const;
export const isAfflictionData = (obj: any): obj is AfflictionData =>
    isOfType(obj, AFFLICTION_TYPE);

export const AFFLICTON_DEFEATED_HR = 6;
export const SUBJECT_DEAD_HR = 0;
export const UNDEFINED_HR = -1;
export const TRANSMISSION = {
    NONE: "none",
    AIRBORNE: "airborne",
    CONTACT: "contact",
    BODYFLUID: "bodyfluid",
    INJESTED: "injested",
    PROXIMITY: "proximity",
    VECTOR: "vector",
    PERCEPTION: "perception",
    ARCANE: "arcane",
    DIVINE: "divine",
    SPIRIT: "spirit",
} as const;
export type TransmissionValue =
    (typeof TRANSMISSION)[keyof typeof TRANSMISSION];

export const AFFLICTION_SUBTYPE = {
    PRIVATION: "privation",
    FATIGUE: "fatigue",
    DISEASE: "disease",
    INFECTION: "infection",
    POISONTOXIN: "poisontoxin",
    FEAR: "fear",
    MORALE: "morale",
    SHADOW: "shadow",
    PSYCHE: "psyche",
    AURALSHOCK: "auralshock",
} as const;
export type AfflictionSubType =
    (typeof AFFLICTION_SUBTYPE)[keyof typeof AFFLICTION_SUBTYPE];

export const FATIGUE_CATEGORY = {
    WINDEDNESS: "windedness",
    WEARINESS: "weariness",
    WEAKNESS: "weakness",
} as const;

export const PRIVATION_CATEGORY = {
    ASPHIXIA: "asphixia",
    COLD: "cold",
    HEAT: "heat",
    STARVATION: "starvation",
    DEHYDRATION: "dehydration",
    SLEEP_DEPRIVATION: "nosleep",
} as const;

export const FEAR_LEVEL = {
    NONE: 0,
    BRAVE: 1,
    STEADY: 2,
    AFRAID: 3,
    TERRIFIED: 4,
    CATATONIC: 5,
} as const;

export const MORALE_LEVEL = {
    NONE: 0,
    BRAVE: 1,
    STEADY: 2,
    WITHDRAWING: 3,
    ROUTED: 4,
    CATATONIC: 5,
} as const;

export const EVENT = {
    NEXT_COURSE_TEST: "nextcoursetest",
    NEXT_RECOVERY_TEST: "nextrecoverytest",
} as const;

export interface AfflictionData
    extends SubTypeData<AfflictionPerformer, AfflictionSubType> {
    category: string;
    isDormant: boolean;
    isTreated: boolean;
    diagnosisBonusBase: number;
    levelBase: number;
    healingRateBase: number;
    contagionIndexBase: number;
    transmission: TransmissionValue;
}
