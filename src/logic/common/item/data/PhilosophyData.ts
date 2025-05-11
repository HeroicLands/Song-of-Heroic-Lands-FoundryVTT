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

import { PhilosophyPerformer } from "@logic/common/item/performer";
import { SubTypeData } from "@logic/common/item/data";
import { isOfType } from "@logic/common/core";

export const PHILOSOPHY_TYPE = "philosophy" as const;
export const isPhilosophyData = (obj: any): obj is PhilosophyData =>
    isOfType(obj, PHILOSOPHY_TYPE);

const PHILOSOPHY_SUBTYPE = {
    ARCANE: "arcane",
    DIVINE: "divine",
    SPIRIT: "spirit",
    ASTRAL: "astral",
    NATURAL: "natural",
} as const;
export type PhilosophySubType =
    (typeof PHILOSOPHY_SUBTYPE)[keyof typeof PHILOSOPHY_SUBTYPE];

export interface PhilosophyData
    extends SubTypeData<PhilosophyPerformer, PhilosophySubType> {}
