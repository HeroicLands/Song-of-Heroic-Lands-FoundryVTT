/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    MasteryLevelLogic,
    MasteryLevelData,
} from "@common/item/logic/MasteryLevelLogic";
import type {
    SkillSubType,
} from "@utils/constants";

/**
 * Logic for the **Skill** item type — a trained capability with a mastery level.
 *
 * Skills represent learned abilities that characters use to accomplish tasks:
 * combat techniques, social interactions, crafting, perception, and more.
 * Each skill has a **skill base formula** (typically derived from one or more
 * traits like Strength, Dexterity, or Aura) and a **mastery level** representing
 * training and experience.
 *
 * Skills are categorized by {@link SkillData.subType | subType} (e.g., combat,
 * social, physical) and may be associated with a **weapon group** or a
 * **mystical domain**. A skill can also reference a **base skill** from which
 * it derives or shares advancement.
 *
 * Skills are the primary mechanism for resolving actions in SoHL. When a
 * character attempts a task, the relevant skill's mastery level is tested
 * against a target number, with modifiers from traits, gear, conditions,
 * and situational factors.
 *
 * Inherits mastery level progression, fate integration, and SDR improvement
 * from {@link MasteryLevelLogic}.
 *
 * @typeParam TData - The Skill data interface.
 */
export class SkillLogic<TData extends SkillData = SkillData>
    extends MasteryLevelLogic<TData>
    implements SkillLogic<TData>
{
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface SkillData<
    TLogic extends SkillLogic<SkillData> = SkillLogic<any>,
> extends MasteryLevelData<TLogic> {
    /** Skill category (Combat, Social, Physical, etc.) */
    subType: SkillSubType;
    /** Combat category this skill applies to, if any */
    weaponGroup: string;
    /** Name of the base skill if this is a specialization */
    baseSkill: string;
    /** Mystical domain associated with this skill, if any */
    domain: string;
}
