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

import { MysteryPerformer } from "@logic/common/item/performer";
import { SubTypeData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const MYSTERY_TYPE = "mystery" as const;
export const isMysteryData = (obj: any): obj is MysteryData =>
    isOfType(obj, MYSTERY_TYPE);

export const MYSTERY_SUBTYPE = {
    GRACE: "grace",
    PIETY: "piety",
    FATE: "fate",
    FATEBONUS: "fateBonus",
    FATEPOINTBONUS: "fatePointBonus",
    BLESSING: "blessing",
    ANCESTOR: "ancestor",
    TOTEM: "totem",
};
export type MysterySubType =
    (typeof MYSTERY_SUBTYPE)[keyof typeof MYSTERY_SUBTYPE];

export const MYSTERY_KIND = {
    DIVINE: "divinedomain",
    SKILL: "skill",
    CREATURE: "creature",
    NONE: "none",
};
export type KindType = (typeof MYSTERY_KIND)[keyof typeof MYSTERY_KIND];

export const DOMAINMAP = {
    [MYSTERY_SUBTYPE.GRACE]: MYSTERY_KIND.DIVINE,
    [MYSTERY_SUBTYPE.PIETY]: MYSTERY_KIND.DIVINE,
    [MYSTERY_SUBTYPE.FATE]: MYSTERY_KIND.SKILL,
    [MYSTERY_SUBTYPE.FATEBONUS]: MYSTERY_KIND.SKILL,
    [MYSTERY_SUBTYPE.FATEPOINTBONUS]: MYSTERY_KIND.NONE,
    [MYSTERY_SUBTYPE.BLESSING]: MYSTERY_KIND.DIVINE,
    [MYSTERY_SUBTYPE.ANCESTOR]: MYSTERY_KIND.SKILL,
    [MYSTERY_SUBTYPE.TOTEM]: MYSTERY_KIND.CREATURE,
};
export type DomainMapValue = (typeof DOMAINMAP)[keyof typeof DOMAINMAP];

export interface MysteryData
    extends SubTypeData<MysteryPerformer, MysterySubType> {
    config: {
        usesCharges: boolean;
        usesSkills: boolean;
        assocPhilosophy: string;
        kind: KindType;
    };
    skills: string[];
    levelBase: number;
    charges: {
        value: number;
        max: number;
    };
}
