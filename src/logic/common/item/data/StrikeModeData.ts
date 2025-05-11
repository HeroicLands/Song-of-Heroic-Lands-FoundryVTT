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

import { StrikeModePerformer } from "@logic/common/item/performer";
import { SubTypeData } from "@logic/common/item/data";
import { SohlVariant } from "@logic/common/core";
import { AspectType } from "@logic/common/core/modifier";

export const isStrikeMode = (obj: any): obj is StrikeModeData =>
    obj && typeof obj === "object" && Object.hasOwn(obj, "mode");

export interface StrikeModeData<
    T extends StrikeModePerformer = StrikeModePerformer,
> extends SubTypeData<T, SohlVariant> {
    mode: string;
    minParts: number;
    assocSkillName: string;
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: AspectType;
    };
}
