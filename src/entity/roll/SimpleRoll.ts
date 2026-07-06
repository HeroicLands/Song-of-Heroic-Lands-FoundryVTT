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

import { SohlEntity } from "@src/entity/SohlEntity";
import { registerKind } from "@src/utils/kindRegistry";
import type { SohlLogic } from "@src/core/logic/SohlLogic";

/**
 * A Foundry-free dice primitive for structured `NdM+K` rolls.
 *
 * Unlike Foundry's Roll class, SimpleRoll requires no runtime environment,
 * supports deterministic testing via {@link setRolls}, and provides a
 * {@link median} calculation for statistical analysis.
 *
 * As a {@link SohlEntity}, a SimpleRoll is owned by a `parent` Logic (the
 * modifier/result/logic it belongs to) and serializes through the shared
 * entity `toJSON`/`clone` machinery.
 *
 * To convert a SimpleRoll to a Foundry Roll for chat display, use the
 * `toFoundryRoll()` shim in `FoundryHelpers.ts`.
 */
export class SimpleRoll extends SohlEntity {
    /** Number of dice to roll (the `N` in `NdM+K`). */
    numDice: number;
    /** Number of faces per die (the `M` in `NdM+K`). */
    dieFaces: number;
    /** Flat modifier added to the dice total (the `K` in `NdM+K`). */
    modifier: number;
    /** The individual die results; empty until {@link roll} or {@link setRolls} is called. */
    rolls: number[];

    /**
     * Construct a roll from partial data; any omitted field defaults to `0`
     * (or `[]` for `rolls`).
     * @param data Partial roll definition (`numDice`, `dieFaces`, `modifier`,
     *   `rolls`).
     * @param options Must provide `options.parent`, the owning Logic (base
     *   {@link SohlEntity}).
     * @throws If no `parent` is provided.
     */
    constructor(
        data: Partial<SimpleRoll.Data> = {},
        options: Partial<SimpleRoll.Options> = {},
    ) {
        super(data, options);
        this.numDice = data.numDice ?? 0;
        this.dieFaces = data.dieFaces ?? 0;
        this.modifier = data.modifier ?? 0;
        this.rolls = data.rolls ?? [];
    }

    /**
     * Serialize the roll to a plain object satisfying {@link SimpleRoll.Data}.
     * @returns A plain-object snapshot of this roll's fields.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            numDice: this.numDice,
            dieFaces: this.dieFaces,
            modifier: this.modifier,
            rolls: [...this.rolls],
        };
    }

    /**
     * Roll the dice randomly.
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
     * Returns the statistical median roll. Result is an integer.
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

    /**
     * A human-readable string showing the evaluated expression,
     * e.g. `"[3, 5] + 2"` for 2d6+2 with rolls of 3 and 5.
     */
    get result(): string {
        const parts: string[] = [];
        if (this.rolls.length > 0) {
            parts.push(
                this.rolls.length === 1 ?
                    `${this.rolls[0]}`
                :   `[${this.rolls.join(", ")}]`,
            );
        }
        if (this.modifier !== 0) {
            parts.push(
                (this.modifier > 0 && parts.length > 0 ? "+" : "") +
                    `${this.modifier}`,
            );
        }
        return parts.join(" ") || "0";
    }

    /**
     * The dice formula string, e.g. `"2d6+3"` or `"1d100"`.
     */
    get formula(): string {
        const parts: string[] = [];
        if (this.numDice > 0 && this.dieFaces > 0) {
            parts.push(`${this.numDice}d${this.dieFaces}`);
        }
        if (this.modifier !== 0) {
            parts.push(
                (this.modifier > 0 && parts.length > 0 ? "+" : "") +
                    `${this.modifier}`,
            );
        }
        return parts.join("") || "0";
    }

    /**
     * Parse a dice formula string into an unrolled {@link SimpleRoll}.
     *
     * Accepts forms like `"2d6+3"`, `"1d100"`, `"d20"` (implicit one die),
     * `"-2"` (modifier only), with optional whitespace around the modifier
     * sign.
     * @param formula The dice formula to parse.
     * @param parent The Logic that owns the resulting roll.
     * @returns A new {@link SimpleRoll} with no dice rolled yet.
     * @throws Error if `formula` does not match the `NdM+K` grammar.
     */
    static fromFormula(formula: string, parent: SohlLogic<any>): SimpleRoll {
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
        return new SimpleRoll(
            {
                numDice,
                dieFaces,
                modifier,
                rolls: [],
            },
            { parent },
        );
    }
}

export namespace SimpleRoll {
    /** Kind discriminator under which {@link SimpleRoll} is registered in the kind registry. */
    export const Kind = "SimpleRoll";

    /** The serializable shape of a {@link SimpleRoll}. */
    export interface Data extends SohlEntity.Data {
        /** Number of dice (the `N` in `NdM+K`). */
        numDice: number;
        /** Faces per die (the `M` in `NdM+K`). */
        dieFaces: number;
        /** Flat modifier (the `K` in `NdM+K`). */
        modifier: number;
        /** Individual die results, if already rolled. */
        rolls: number[];
    }

    /** Construction options for a {@link SimpleRoll}; see {@link SohlEntity.Options}. */
    export interface Options extends SohlEntity.Options {}
}

registerKind(SimpleRoll.Kind, SimpleRoll);
