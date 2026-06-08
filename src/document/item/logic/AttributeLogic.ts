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
import { SohlItemBaseLogic, SohlItemData } from "../foundry/SohlItem";
import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";

/**
 * An innate characteristic.
 *
 * Attributes represent intrinsic properties of a character that are not learned
 * through training: physical attributes (Strength, Stamina, Dexterity),
 * mental attributes (Intelligence, Aura, Will), physical features (Height,
 * Frame), and special qualities (Flaws, Virtues).
 *
 * Attributes are foundational to the SoHL system: they form the skill base
 * formulas for skills, contribute to derived values like health and
 * encumbrance, and serve as prerequisites for abilities and actions.
 *
 * @typeParam TData - The Attribute data interface.
 */
export class AttributeLogic<
    TData extends AttributeData = AttributeData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The attribute's score as a {@link ValueModifier}, seeded from
     * {@link AttributeData.scoreBase}.
     */
    score!: ValueModifier;
    /**
     * Mastery level derived from this attribute, as a {@link MasteryLevelModifier}.
     * Its base is set in {@link AttributeLogic.finalize | finalize} to the
     * effective {@link AttributeLogic.score | score} multiplied by five.
     */
    masteryLevel!: MasteryLevelModifier;
    /** Fate-adjusted mastery level for this attribute, as a {@link MasteryLevelModifier}. */
    fateMasteryLevel!: MasteryLevelModifier;

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a value description entry to
     * {@link AttributeData.valueDesc}.
     *
     * @param entry - The label/maxValue pair to append.
     * @returns An `update()` payload writing the extended `system.valueDesc` array.
     */
    addValueDescUpdate(entry: {
        label: string;
        maxValue: number;
    }): PlainObject {
        return {
            "system.valueDesc": [...this.data.valueDesc, entry],
        };
    }

    /**
     * Build an `update()` payload that removes a value description from
     * {@link AttributeData.valueDesc} by its label.
     *
     * @param label - The label of the entry to remove.
     * @returns An `update()` payload writing `system.valueDesc` with the matching entry filtered out.
     */
    removeValueDescUpdate(label: string): PlainObject {
        return {
            "system.valueDesc": this.data.valueDesc.filter(
                (vd) => vd.label !== label,
            ),
        };
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.masteryLevel = new MasteryLevelModifier({}, { parent: this });
        this.score = new ValueModifier({}, { parent: this }).setBase(
            this.data.scoreBase,
        );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        this.masteryLevel.setBase(this.score.effective * 5);
    }
}

/**
 * Persisted data backing {@link AttributeLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 */
export interface AttributeData<
    TLogic extends AttributeLogic<AttributeData> = AttributeLogic<any>,
> extends SohlItemData<TLogic> {
    /** Base numeric value of the attribute */
    scoreBase: number;
    /** Labels mapping score ranges to descriptive names */
    valueDesc: {
        /** Descriptive name for this score band. */
        label: string;
        /** Highest score (inclusive) covered by this band. */
        maxValue: number;
    }[];
    /** Dice formula used for random generation of this attribute's score */
    initDiceFormula: string;
    /** Body roles whose injury impairs this attribute */
    impairedByRoles: string[];
}
