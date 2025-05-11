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

import { MysticalAbilityPerformer } from "@logic/common/item/performer";
import { MasteryLevelData, SubTypeData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const MYSTICALABILITY_TYPE = "mysticalability" as const;
export const isMysticalAbilityData = (obj: any): obj is MysticalAbilityData =>
    isOfType(obj, MYSTICALABILITY_TYPE);

const MYSTICALABILITY_SUBTYPE = {
    SHAMANICRITE: "shamanicrite",
    SPIRITACTION: "spiritaction",
    SPIRITPOWER: "spiritpower",
    BENEDICTION: "benediction",
    DIVINEDEVOTION: "divinedevotion",
    DIVINEINCANTATION: "divineincantation",
    ARCANEINCANTATION: "arcaneincantation",
    ARCANEINVOCATION: "arcaneinvocation",
    ARCANETALENT: "arcanetalent",
    ALCHEMY: "alchemy",
    DIVINATION: "divination",
} as const;
export type MysticalAbilitySubType =
    (typeof MYSTICALABILITY_SUBTYPE)[keyof typeof MYSTICALABILITY_SUBTYPE];

export const DOMAIN_DEGREE = {
    PRIMARY: { name: "primary", value: 0 },
    SECONDARY: { name: "secondary", value: 1 },
    NEUTRAL: { name: "neutral", value: 2 },
    TERTIARY: { name: "tertiary", value: 3 },
    DIAMETRIC: { name: "diametric", value: 4 },
} as const;
export type DomainDegreeValue =
    (typeof DOMAIN_DEGREE)[keyof typeof DOMAIN_DEGREE];

export interface MysticalAbilityData
    extends MasteryLevelData<MysticalAbilityPerformer, MysticalAbilitySubType> {
    config: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        isImprovable: boolean;
        assocSkill: string;
        category: string;
    };
    domain: string;
    skills: string[];
    levelBase: number;
    charges: {
        value: number;
        max: number;
    };
}
