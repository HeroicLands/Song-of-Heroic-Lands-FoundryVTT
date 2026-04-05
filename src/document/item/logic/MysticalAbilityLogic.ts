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

import { ValueModifier } from "@src/modifier/ValueModifier";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { MysteryLogic } from "./MysteryLogic";
import {
    MasteryLevelLogic,
    MasteryLevelData,
} from "@src/document/item/logic/MasteryLevelLogic";
import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { MysticalAbilitySubType } from "@src/utils/constants";

/**
 * Logic for the **Mystical Ability** item type — an actively invoked
 * supernatural power.
 *
 * Mystical Abilities represent spells, rites, invocations, and other powers
 * that a character actively uses. Unlike {@link MysteryLogic | Mysteries}
 * (which are often passive), mystical abilities must be deliberately activated
 * and their success is typically determined by a skill test.
 *
 * Each ability is linked to an **associated skill** (via shortcode) that
 * governs its activation test, and to a mystery that
 * determines its mystical tradition. Abilities track a **level** (power),
 * **charges** (uses remaining), and inherit mastery level progression from
 * {@link MasteryLevelLogic}.
 *
 * Supported subtypes:
 * - Shamanic Rite: Perform a shamanic rite on target(s)
 * - Spirit Action: Spirit world interaction (Roaming, Sensing, Communing, etc.)
 * - Spirit Power: Channel spirit power (Ancestor, Totem, or Energy)
 * - Benediction: Bestow a blessing
 * - Divine Devotion: Request blessing or miracle from a deity
 * - Divine Incantation: Cast divine spells
 * - Arcane Incantation: Cast arcane spells
 * - Arcane Talent: Intrinsic spell-like arcane powers
 * - Spirit Talent: Intrinsic spell-like spirit powers
 * - Alchemy: Create alchemical elixirs or perform alchemical actions
 * - Divination: Foretell the future
 *
 * @typeParam TData - The MysticalAbility data interface.
 */
export class MysticalAbilityLogic<
    TData extends MysticalAbilityData = MysticalAbilityData,
>
    extends MasteryLevelLogic<TData>
    implements MysticalAbilityLogic<TData>
{
    assocSkill?: SkillLogic;
    mystery?: MysteryLogic;
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    initialize(): void {
        super.initialize();
        this.charges = {
            value: new ValueModifier({}, { parent: this }).setBase(
                this.data.charges.value,
            ),
            max: new ValueModifier({}, { parent: this }).setBase(
                this.data.charges.max,
            ),
        };

        this.level = new ValueModifier({}, { parent: this }).setBase(
            this.data.levelBase,
        );
    }

    /** @inheritdoc */
    evaluate(): void {
        super.evaluate();

        if (!this.actor) return;
        const allItemTypes = this.actor.itemTypes;

        this.mystery = allItemTypes.mystery.find(
            (it: SohlItem) => it.system.shortcode === this.data.mysteryCode,
        )?.logic as MysteryLogic;

        this.assocSkill = allItemTypes.skill.find(
            (it: SohlItem) => it.system.shortcode === this.data.assocSkillCode,
        )?.logic as SkillLogic;
    }

    /** @inheritdoc */
    finalize(): void {
        super.finalize();
    }
}

export interface MysticalAbilityData<
    TLogic extends MysticalAbilityLogic<MysticalAbilityData> =
        MysticalAbilityLogic<any>,
> extends MasteryLevelData<TLogic> {
    /** Ability type (Incantation, Rite, Talent, etc.) */
    subType: MysticalAbilitySubType;
    /** Shortcode of the skill used to activate this ability */
    assocSkillCode?: string;
    /** Whether this ability's mastery level can be improved */
    isImprovable: boolean;
    /** Shortcode of the mystery this ability belongs to */
    mysteryCode?: string;
    /** Power level of this ability */
    levelBase: number;
    /** Usage tracking: current charges and maximum */
    charges: {
        value: number;
        max: number | null;
    };
}
