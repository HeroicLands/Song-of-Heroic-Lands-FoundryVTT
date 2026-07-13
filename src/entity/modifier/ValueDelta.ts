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

import { registerKind } from "@src/utils/kindRegistry";
import { registerEntity } from "@src/entity/entityRegistry";
import {
    VALUE_DELTA_OPERATOR,
    ValueDeltaOperator,
    isValueDeltaOperator,
    ValueDeltaValue,
} from "@src/utils/constants";
import { SohlEntity } from "../SohlEntity";

/**
 * A single change (delta) applied to a {@link ValueModifier} — an operator plus
 * a value, tagged with source labels for auditability.
 *
 * @remarks
 * The {@link op} selects how {@link apply} combines this delta with a running
 * value (add, multiply, floor, ceiling, override, or custom). Boolean-like
 * values (`"true"` / `"false"`) are supported for flag-style modifiers; every
 * other operator requires a numeric value.
 */
export class ValueDelta extends SohlEntity {
    /** Human-readable name of the delta's source, for display. */
    name: string;
    /** Short identity code for the delta's source (used to find or replace it). */
    shortcode: string;
    /** The operator selecting how this delta combines with the running value. */
    op: ValueDeltaOperator;
    /** The delta's value as a string — numeric, or `"true"`/`"false"` for flags. */
    value: string;

    /** The {@link value} as a number — `"true"`→1, `"false"`→0, otherwise the parsed number (0 if NaN). */
    get numValue(): number {
        if (this.value === "true") return 1;
        else if (this.value === "false") return 0;
        else return Number(this.value) || 0;
    }

    /**
     * Constructs a value delta, normalizing `value` to a string and validating
     * that non-`CUSTOM` operators receive a numeric value.
     * @param data - Delta construction data.
     * @param data.name - Human-readable name of the delta's source.
     * @param data.shortcode - Short identity code for the delta's source.
     * @param data.op - The operator selecting how the delta combines with the value.
     * @param data.value - The delta's value (numeric, or a boolean flag).
     * @param options - Construction options.
     * @param options.parent - The owning {@link sohl.core.logic.SohlLogic}.
     * @throws TypeError if a non-`CUSTOM` operator is given a non-numeric value.
     */
    constructor(
        data: Partial<ValueDelta.Data> = {},
        options: Partial<ValueDelta.Options> = {},
    ) {
        super(data, options);
        const { name, shortcode, op, value } = data as ValueDelta.Data;
        const strValue = String(value);

        // `name` / `shortcode` are passed through as-is (display / identity
        // labels, not validated localization keys).
        this.name = name;
        this.shortcode = shortcode;
        this.op = op;
        if (op === VALUE_DELTA_OPERATOR.CUSTOM) {
            if (strValue.toLowerCase() === "true") {
                this.value = "true";
            } else if (strValue.toLowerCase() === "false") {
                this.value = "false";
            } else {
                this.value = strValue;
            }
        } else {
            if (isNaN(Number(strValue))) {
                throw new TypeError(
                    `ValueDelta value must be numeric for operator ${op}, got "${strValue}"`,
                );
            }
            this.value = strValue;
        }
    }

    /**
     * Serialize this delta to a plain object.
     * @returns A plain-object representation of this delta.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            name: this.name,
            shortcode: this.shortcode,
            op: this.op,
            value: this.value,
        };
    }

    /**
     * Apply this delta to a base value according to its {@link op}.
     *
     * @param base - The running value to modify.
     * @returns The resulting value.
     * @throws TypeError if {@link op} is not a valid operator.
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
                        return Math.max(base, Number(this.value)); // FLOOR
                    case VALUE_DELTA_OPERATOR.DOWNGRADE:
                        return Math.min(base, Number(this.value)); // CEIL
                }
            }
        }

        throw new TypeError(
            `ValueDelta operator is not a valid ValueDeltaOperator: ${this.op}`,
        );
    }
}

export namespace ValueDelta {
    /** Registry key identifying this kind for serialization. */
    export const Kind: string = "ValueDelta";

    /** Construction data for a {@link ValueDelta}. */
    export interface Data extends SohlEntity.Data {
        /** Human-readable name of the delta's source. */
        name: string;
        /** Short identity code for the delta's source. */
        shortcode: string;
        /** The operator selecting how the delta combines with the value. */
        op: ValueDeltaOperator;
        /** The delta's value (numeric, or a boolean flag). */
        value: ValueDeltaValue;
    }

    /** Options for constructing a {@link ValueDelta}. */
    export interface Options extends SohlEntity.Options {}
}

registerKind(ValueDelta.Kind, ValueDelta);
registerEntity("ValueDelta", ValueDelta);
