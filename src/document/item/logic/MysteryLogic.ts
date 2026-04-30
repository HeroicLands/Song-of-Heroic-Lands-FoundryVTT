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

import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/document/item/foundry/SohlItem";
import { MysterySubType } from "@src/utils/constants";

/**
 * Logic for the **Mystery** item type — a passive or charge-based mystical
 * power associated with a character or object.
 *
 * Mysteries represent supernatural gifts, blessings, and connections that
 * influence a character's capabilities. Unlike {@link MysticalAbilityLogic | Mystical Abilities}
 * (which are actively cast), mysteries are often passive or limited-use
 * powers that enhance skills, grant re-rolls, or provide divine favor.
 *
 * Each mystery tracks a **level** and optional **charges** (value and max),
 * where charges of −1 indicate infinite uses. Mysteries link to a
 * a domain and/or specific {@link SkillLogic | Skills}
 * that they affect.
 *
 * Mysteries are organized by category:
 * - **Skill** — Enhance a character's success with specific skills
 * - **Creature** — Tied to a specific creature type
 * - **Divine** — Granted by a divine entity or force
 *
 * Supported subtypes:
 * - Grace (Divine): Divine favor manifesting as a granted wish
 * - Piety (Divine): Deep religious devotion
 * - Fate (Skill): Ability to influence random outcomes (re-rolls)
 * - FateBonus (Skill): Temporary bonus to fate rolls
 * - FatePointBonus: Increase in available fate points
 * - Blessing (Divine): Religious fervor boosting a skill's mastery level
 * - Ancestor Spirit Power (Skill): Ancestral connection boosting a skill
 * - Totem Spirit Power (Creature): Animal spirit connection granting skill bonuses
 *
 * @typeParam TData - The Mystery data interface.
 */
export class MysteryLogic<
    TData extends MysteryData = MysteryData,
> extends SohlItemBaseLogic<TData> {
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();

        if (this.data.charges.max !== null) {
            this.charges = {
                value: new ValueModifier({}, { parent: this }).setBase(
                    this.data.charges.value,
                ),
                max: new ValueModifier({}, { parent: this }).setBase(
                    this.data.charges.max,
                ),
            };
        } else {
            this.charges = {
                value: new ValueModifier({}, { parent: this }).setDisabled(
                    "This mystery doesn't use charges",
                ),
                max: new ValueModifier({}, { parent: this }).setDisabled(
                    "This mystery doesn't use charges",
                ),
            };
        }
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

export interface MysteryData<
    TLogic extends MysteryLogic<MysteryData> = MysteryLogic<any>,
> extends SohlItemData<TLogic> {
    /** Usage tracking: current charges and maximum */
    charges: {
        value: number;
        max: number;
    };
}
