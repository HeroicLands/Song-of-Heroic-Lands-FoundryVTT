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

import { SkillPerformer } from "@logic/common/item/performer";
import { isOfType } from "@logic/common/core";
import { MasteryLevelData } from "./MasteryLevelData";

export const SKILL_TYPE = "skill" as const;
export const isSkillData = (obj: any): obj is SkillData =>
    isOfType(obj, SKILL_TYPE);

export const SKILL_SUBTYPE = {
    SOCIAL: "social",
    NATURE: "nature",
    CRAFT: "craft",
    LORE: "lore",
    LANGUAGE: "language",
    SCRIPT: "script",
    RITUAL: "ritual",
    PHYSICAL: "physical",
    COMBAT: "combat",
    ESOTERIC: "esoteric",
} as const;
export type SkillSubType = (typeof SKILL_SUBTYPE)[keyof typeof SKILL_SUBTYPE];

export const COMBAT = {
    NONE: "none",
    ALL: "all",
    MELEE: "melee",
    MISSILE: "missile",
    MELEEMISSILE: "meleemissile",
    MANEUVER: "maneuver",
    MELEEMANEUVER: "meleemaneuver",
} as const;
export type CombatType = (typeof COMBAT)[keyof typeof COMBAT];

export interface SkillData
    extends MasteryLevelData<SkillPerformer, SkillSubType> {
    weaponGroup: string;
    baseSkill: string;
    domain: string;
}
