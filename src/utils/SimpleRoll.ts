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

import { SohlBase, SohlBaseParent, SohlLogic } from "@logic/common/core";
import { RegisterClass, DataField, CollectionType } from "./decorators";

/**
 * A simplified dice roller that only supports formulas like "2d6+10",
 * where the dice term (e.g. 2d6) and the modifier (+10) are both optional.
 */

export interface SimpleRollData {
    numDice: number;
    dieFaces: number;
    modifier: number;
    rolls: number[];
}

@RegisterClass("SimpleRoll", "0.6.0")
export class SimpleRoll extends SohlBase<SohlLogic> {
    @DataField("numDice", { type: Number, initial: 0 })
    numDice!: number;

    @DataField("dieFaces", { type: Number, initial: 0 })
    dieFaces!: number;

    @DataField("modifier", { type: Number, initial: 0 })
    modifier!: number;

    @DataField("rolls", {
        type: Number,
        collection: CollectionType.ARRAY,
    })
    rolls!: number[];

    /**
     * @summary Roll the dice randomly.
     * @remarks
     * If roll has already been made, this method will return the total without rolling again.
     * @returns The total of the rolls plus the modifier.
     */
    roll(): number {
        if (!this.rolls.length) {
            this.rolls = Array.from({ length: this.numDice }, () =>
                Math.ceil(Math.random() * this.dieFaces),
            );
        }
        return this.total;
    }

    /**
     * Reset to allow another roll.
     */
    reset(): void {
        this.rolls = [];
    }

    /**
     * Set specific results for the dice instead of rolling randomly.
     * @param values - The array of die results to use.
     */
    setRolls(values: number[]): void {
        if (values.length !== this.numDice) {
            throw new Error(
                `Expected ${this.numDice} roll values, got ${values.length}`,
            );
        }
        this.rolls = values;
    }

    /**
     * @summary Returns the statistical median roll. Result is an integer.
     *
     * @returns {number} an integer representing the median impact
     */
    get median(): number {
        let diceMedian = 0;
        if (this.numDice > 0 && this.dieFaces > 0) {
            diceMedian = this.numDice * ((1 + this.dieFaces) / 2);
            if (this.dieFaces % 2 === 0) {
                diceMedian = this.numDice * (this.dieFaces / 2 + 0.5);
            } else {
                diceMedian = this.numDice * ((this.dieFaces + 1) / 2);
            }
        }

        return Math.round(diceMedian) + this.modifier;
    }

    /**
     * Compute the total result.
     */
    get total(): number {
        return this.rolls.reduce((sum, r) => sum + r, 0) + this.modifier;
    }

    static fromFormula(parent: SohlBaseParent, formula: string): SimpleRoll {
        const match = formula
            .trim()
            .match(/^(?:(\d*)d(\d+))?(?:\s*([+-]\s*\d+))?$/i);
        if (!match) {
            throw new Error(`Invalid formula: ${formula}`);
        }

        let [, numDiceStr, dieFacesStr, modifierStr] = match;
        const numDice =
            numDiceStr ? parseInt(numDiceStr)
            : dieFacesStr ? 1
            : 0;
        const dieFaces = dieFacesStr ? parseInt(dieFacesStr) : 0;
        const modifier =
            modifierStr ? parseInt(modifierStr.replace(/\s+/g, "")) : 0;
        return new SimpleRoll(parent, {
            numDice,
            dieFaces,
            modifier,
            rolls: [],
        });
    }
}
