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

import { SkillData } from "@common/item/datamodel";
import { PerformerClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { MasteryLevelPerformer } from "@common/item/performer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "SkillPerformer",
    }),
)
export class SkillPerformer extends MasteryLevelPerformer<SkillData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {
        super.initialize(options);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {
        super.evaluate(options);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {
        super.finalize(options);
    }
}
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

import { SohlItem } from "@common/item";
import { SkillPerformer } from "@common/item/performer";
import {
    MasteryLevelData,
    MasteryLevelDataModel,
} from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { defineType, isOfType } from "@utils";
const { StringField } = (foundry.data as any).fields;

export const SKILL_TYPE = "skill" as const;
export const isSkillData = (obj: any): obj is SkillData =>
    isOfType(obj, SKILL_TYPE);

export const {
    kind: SKILL_SUBTYPE,
    values: SkillSubTypes,
    isValue: isSkillSubType,
} = defineType({
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
});
export type SkillSubType = (typeof SKILL_SUBTYPE)[keyof typeof SKILL_SUBTYPE];

export const {
    kind: COMBAT,
    values: CombatTypes,
    isValue: isCombatType,
} = defineType({
    NONE: "none",
    ALL: "all",
    MELEE: "melee",
    MISSILE: "missile",
    MELEEMISSILE: "meleemissile",
    MANEUVER: "maneuver",
    MELEEMANEUVER: "meleemaneuver",
});
export type CombatType = (typeof COMBAT)[keyof typeof COMBAT];

export interface SkillData
    extends MasteryLevelData<SkillPerformer, SkillSubType> {
    weaponGroup: string;
    baseSkill: string;
    domain: string;
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: SKILL_TYPE,
        logicClass: SkillPerformer,
        iconCssClass: "fas fa-head-side-gear",
        img: "systems/sohl/assets/icons/head-gear.svg",
        sheet: "systems/sohl/templates/item/skill-sheet.hbs",
        schemaVersion: "0.6.0",
        subTypes: Object.values(SKILL_SUBTYPE),
    }),
)
export class SkillDataModel
    extends MasteryLevelDataModel<SkillPerformer, SkillSubType>
    implements SkillData
{
    static override readonly LOCALIZATION_PREFIXES = ["SKILL"];
    declare readonly parent: SohlItem<SkillPerformer>;
    weaponGroup!: string;
    baseSkill!: string;
    domain!: string;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            weaponGroup: new StringField({
                initial: COMBAT.NONE,
                blank: false,
                choices: Object.values(COMBAT),
            }),
            baseSkill: new StringField(),
            domain: new StringField(),
        };
    }
}
