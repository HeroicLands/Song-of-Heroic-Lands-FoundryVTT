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

import { BodyLocationPerformer } from "@logic/common/item/performer";
import { SohlPerformerItemData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const BODYLOCATION_TYPE = "bodylocation" as const;
export const isBodyLocationData = (obj: any): obj is BodyLocationData =>
    isOfType(obj, BODYLOCATION_TYPE);

export interface BodyLocationData
    extends SohlPerformerItemData<BodyLocationPerformer> {
    abbrev: string;
    isFumble: boolean;
    isStumble: boolean;
}
