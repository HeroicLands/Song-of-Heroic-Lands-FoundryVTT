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

import { BodyZonePerformer } from "@logic/common/item/performer";
import { SohlPerformerItemData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const BODYZONE_TYPE = "bodyzone" as const;
export const isBodyZoneData = (obj: any): obj is BodyZoneData =>
    isOfType(obj, BODYZONE_TYPE);

export interface BodyZoneData extends SohlPerformerItemData<BodyZonePerformer> {
    abbrev: string;
}
