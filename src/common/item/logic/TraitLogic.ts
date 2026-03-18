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
} from "@src/common/item/logic/MasteryLevelLogic";
import type { TraitIntensity, TraitSubType } from "@src/utils/constants";

/**
 * Logic for the **Trait** item type — an innate characteristic, advantage,
 * or drawback.
 *
 * Traits represent intrinsic properties of a character that are not learned
 * through training: physical attributes (Strength, Stamina, Dexterity),
 * mental attributes (Intelligence, Aura, Will), physical features (Height,
 * Frame), and special qualities (Flaws, Virtues).
 *
 * Each trait has:
 * - A {@link TraitData.subType | subType} categorizing it (Physique, Endurance,
 *   Aura, etc.)
 * - An {@link TraitData.intensity | intensity} level (Trait, Flaw, or Virtue)
 * - Either a **numeric value** (with mastery level progression) or a
 *   **text value** for descriptive traits
 * - Optional {@link TraitData.valueDesc | value descriptions} mapping numeric
 *   ranges to labels (e.g., "Weak", "Average", "Strong")
 * - An optional **max** cap on the trait's value
 *
 * Traits are foundational to the SoHL system: they form the skill base
 * formulas for skills, contribute to derived values like health and
 * encumbrance, and serve as prerequisites for abilities and actions.
 *
 * Inherits mastery level progression from {@link MasteryLevelLogic}.
 *
 * @typeParam TData - The Trait data interface.
 */
export class TraitLogic<
    TData extends TraitData = TraitData,
> extends MasteryLevelLogic<TData> {
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

export interface TraitData<
    TLogic extends TraitLogic<TraitData> = TraitLogic<any>,
> extends MasteryLevelData<TLogic> {
    /** Trait category (Physique, Personality, Transcendent) */
    subType: TraitSubType;
    /** Descriptive value for non-numeric traits */
    textValue: string;
    /** Optional upper limit for this trait's value, or null for no limit */
    max: number | null;
    /** Whether this trait uses numeric rather than text values */
    isNumeric: boolean;
    /** Intensity level: Trait, Impulse, Disorder, or Attribute */
    intensity: TraitIntensity;
    /** Labels mapping numeric value ranges to descriptive names */
    valueDesc: {
        label: string;
        maxValue: number;
    }[];
    /** Predefined selection options for this trait */
    choices: StrictObject<string>;
    /** Dice formula used for random generation of this trait's value */
    diceFormula: string;
}
