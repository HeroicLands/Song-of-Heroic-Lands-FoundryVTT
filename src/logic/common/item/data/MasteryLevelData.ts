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

import { MasteryLevelPerformer } from "@logic/common/item/performer";
import { SubTypeData } from "@logic/common/item/data";

export const isMasteryLevel = (obj: any): obj is MasteryLevelData =>
    typeof obj === "object" &&
    typeof obj?.config === "object" &&
    Object.hasOwn(obj.config, "isImprovable");

export interface MasteryLevelData<
    T extends MasteryLevelPerformer = MasteryLevelPerformer,
    ST extends string = string,
> extends SubTypeData<T, ST> {
    config: {
        isImprovable: boolean;
        assocSkill: string;
        category: string;
        assocPhilosophy: string;
        usesCharges: boolean;
    };
    domain: string;
    levelBase: number;
    charges: {
        value: number;
        max: number;
    };
}
