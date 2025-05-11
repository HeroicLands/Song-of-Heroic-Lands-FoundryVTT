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

import { DomainPerformer } from "@logic/common/item/performer";
import { SohlPerformerItemData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const DOMAIN_TYPE = "domain" as const;
export const isDomainData = (obj: any): obj is DomainData =>
    isOfType(obj, DOMAIN_TYPE);

export const DIVINE_EMBODIMENT_CATEGORY = {
    DREAMS: "dreams",
    DEATH: "death",
    VIOLENCE: "violence",
    PEACE: "peace",
    FERTILITY: "fertility",
    ORDER: "order",
    KNOWLEDGE: "knowledge",
    PROSPERITY: "prosperity",
    FIRE: "fire",
    CREATION: "creation",
    VOYAGER: "voyager",
    DECAY: "decay",
} as const;
export type DivineEmbodimentCategoryValue =
    (typeof DIVINE_EMBODIMENT_CATEGORY)[keyof typeof DIVINE_EMBODIMENT_CATEGORY];

export const ELEMENT_CATEGORY = {
    FIRE: "fire",
    WATER: "water",
    EARTH: "earth",
    SPIRIT: "spirit",
    WIND: "wind",
    METAL: "metal",
    ARCANA: "arcana",
} as const;
export type ElementCategoryValue =
    (typeof ELEMENT_CATEGORY)[keyof typeof ELEMENT_CATEGORY];

export interface DomainData extends SohlPerformerItemData<DomainPerformer> {
    abbrev: string;
    cusp: string;
    magicMod: ElementCategoryValue[];
    embodiments: DivineEmbodimentCategoryValue[];
}
