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

import { SohlBase } from "@common/SohlBase";
import {
    VALUE_DELTA_OPERATOR,
    ValueDeltaOperator,
    isValueDeltaOperator,
    ValueDeltaValue,
} from "@utils/constants";
const kValueDelta = Symbol("ValueDelta");

/**
 * Represents a single change (delta) applied to a numeric value.
 */
export class ValueDelta extends SohlBase {
    name: string;
    abbrev: string;
    op: number;
    value: string;
    readonly [kValueDelta] = true;

    static isA(obj: unknown): obj is ValueDelta {
        return typeof obj === "object" && obj !== null && kValueDelta in obj;
    }

    get numValue(): number {
        if (this.value === "true") return 1;
        else if (this.value === "false") return 0;
        else return Number(this.value) || 0;
    }

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        const { name, abbrev, op, value } = data as ValueDelta.Data;
        const strValue = String(value);

        if (!abbrev) {
            throw new Error("ValueDelta requires an abbrev");
        }

        if (!name?.startsWith("SOHL.INFO."))
            throw new Error("ValueDelta name must start with SOHL.INFO.");
        super(data, options);
        this.name = name;
        this.abbrev = abbrev;
        this.op = op;
        if (op === VALUE_DELTA_OPERATOR.CUSTOM) {
            if (typeof strValue !== "string") {
                throw new TypeError(
                    "ValueDelta value must be a string for CUSTOM operator",
                );
            } else if (strValue.toLowerCase() === "true") {
                this.value = "true";
            } else if (strValue.toLowerCase() === "false") {
                this.value = "false";
            }
        } else {
            if (typeof strValue !== "number") {
                throw new TypeError("ValueDelta value must be a number");
            }
        }
        this.value ??= strValue;
    }

    /**
     * Apply this delta to a numeric base value.
     * @param {number} base
     * @returns {number}
     */
    apply(base: number): number {
        if (isValueDeltaOperator(this.op)) {
            if (["true", "false"].includes(this.value as string)) {
                switch (this.op) {
                    case VALUE_DELTA_OPERATOR.ADD:
                        return !!base || this.value === "true" ? 1 : 0;
                    case VALUE_DELTA_OPERATOR.MULTIPLY:
                        return !!base && this.value === "true" ? 1 : 0;
                    case VALUE_DELTA_OPERATOR.CUSTOM:
                    case VALUE_DELTA_OPERATOR.UPGRADE:
                    case VALUE_DELTA_OPERATOR.OVERRIDE:
                        return this.value === "true" ? 1 : 0;
                    case VALUE_DELTA_OPERATOR.DOWNGRADE:
                        return this.value === "false" ? 0 : 1;
                }
            } else {
                switch (this.op) {
                    case VALUE_DELTA_OPERATOR.ADD:
                        return base + Number(this.value); // ADD
                    case VALUE_DELTA_OPERATOR.MULTIPLY:
                        return base * Number(this.value); // MULTIPLY
                    case VALUE_DELTA_OPERATOR.CUSTOM:
                    case VALUE_DELTA_OPERATOR.OVERRIDE:
                        return Number(this.value); // OVERRIDE
                    case VALUE_DELTA_OPERATOR.UPGRADE:
                        return Math.min(base, Number(this.value)); // FLOOR
                    case VALUE_DELTA_OPERATOR.DOWNGRADE:
                        return Math.max(base, Number(this.value)); // CEIL
                }
            }
        }

        throw new TypeError(
            `ValueDelta operator is not a valid ValueDeltaOperator: ${this.op}`,
        );
    }
}

export namespace ValueDelta {
    export const Kind = "ValueDelta";

    export interface Data {
        name: string;
        abbrev: string;
        op: ValueDeltaOperator;
        value: ValueDeltaValue;
    }

    // Constructor type for ValueDelta and its subclasses
    export interface Constructor<T extends ValueDelta = ValueDelta> {
        new (data: Data): T;
    }
}
