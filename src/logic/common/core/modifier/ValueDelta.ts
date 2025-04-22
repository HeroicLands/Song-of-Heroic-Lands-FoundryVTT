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

import { SohlBase, SohlLogic } from "@logic/common/core";
import { DataField } from "@utils/decorators";
import { ValueModifier } from "./ValueModifier";

export enum DeltaInfo {
    DISABLED = "Dsbl",
    DURABILITY = "Dur",
    FATEBNS = "FateBns",
    ITEMWT = "ItmWt",
    MAGIC = "Magic",
    MAGICMOD = "MagicMod",
    MAXVALUE = "MaxVal",
    MINVALUE = "MinVal",
    MLATTRBOOST = "MlAtrBst",
    MLDSBL = "MLDsbl",
    NOFATE = "NoFateAvail",
    NOTATTRNOML = "NotAttrNoML",
    OFFHAND = "OffHnd",
    OUTNUMBERED = "Outn",
    PLAYER = "SitMod",
    SSMOD = "SSMod",
}

export enum ValueDeltaOperator {
    CUSTOM = 0,
    MULTIPLY = 1,
    ADD = 2,
    DOWNGRADE = 3,
    UPGRADE = 4,
    OVERRIDE = 5,
}

export type ValueModifierValue = string | number;

export interface ValueDeltaData {
    name: string;
    abbrev: string;
    op: ValueDeltaOperator;
    value: ValueModifierValue;
}

// Constructor type for ValueDelta and its subclasses
export interface ValueDeltaConstructor<T extends ValueDelta = ValueDelta> {
    new (data: ValueDeltaData): T;
}

/**
 * Represents a single change (delta) applied to a numeric value.
 */
export class ValueDelta extends SohlBase {
    @DataField("name", {
        type: String,
        required: true,
    })
    name!: string;

    @DataField("abbrev", {
        type: String,
        required: true,
    })
    abbrev!: string;

    @DataField("op", {
        type: Number,
        initial: ValueDeltaOperator.ADD,
        validator: (value: any) => isValueDeltaOperator(value),
    })
    op!: number;

    @DataField("value", {
        type: String,
        initial: "0",
        cast: (value: any) => String(value),
        validator: (value: any) => isValueModifierValue(value),
    })
    value!: string;

    get numValue(): number {
        if (this.value === "true") return 1;
        else if (this.value === "false") return 0;
        else return Number(this.value) || 0;
    }

    constructor(
        parent: ValueModifier,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {
        const { name, abbrev, op, value } = data as ValueDeltaData;
        const strValue = String(value);
        if (!parent) {
            throw new Error("ValueDelta requires a parent ValueModifier");
        }

        if (!abbrev) {
            throw new Error("ValueDelta requires an abbrev");
        }

        if (!name?.startsWith("SOHL.DELTAINFO."))
            throw new Error("ValueDelta name must start with SOHL.DELTAINFO.");
        super(parent, data, options);
        this.name = name;
        this.abbrev = abbrev;
        this.op = op;
        if (op === ValueDeltaOperator.CUSTOM) {
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
        if (!isValueDeltaOperator(this.op)) {
            throw new TypeError(
                `ValueDelta operator is not a valid ValueDeltaOperator: ${this.op}`,
            );
        }

        if (["true", "false"].includes(this.value as string)) {
            switch (this.op) {
                case ValueDeltaOperator.ADD:
                    return !!base || this.value === "true" ? 1 : 0;
                case ValueDeltaOperator.MULTIPLY:
                    return !!base && this.value === "true" ? 1 : 0;
                case ValueDeltaOperator.CUSTOM:
                case ValueDeltaOperator.UPGRADE:
                case ValueDeltaOperator.OVERRIDE:
                    return this.value === "true" ? 1 : 0;
                case ValueDeltaOperator.DOWNGRADE:
                    return this.value === "false" ? 0 : 1;
            }
        } else {
            switch (this.op) {
                case ValueDeltaOperator.ADD:
                    return base + Number(this.value); // ADD
                case ValueDeltaOperator.MULTIPLY:
                    return base * Number(this.value); // MULTIPLY
                case ValueDeltaOperator.CUSTOM:
                case ValueDeltaOperator.OVERRIDE:
                    return Number(this.value); // OVERRIDE
                case ValueDeltaOperator.UPGRADE:
                    return Math.min(base, Number(this.value)); // FLOOR
                case ValueDeltaOperator.DOWNGRADE:
                    return Math.max(base, Number(this.value)); // CEIL
            }
        }
    }
}

/**
 * Type guard to check if a value is an instance of ValueDelta.
 * @param value - The value to check.
 * @returns {boolean} - True if the value is a ValueDelta instance, false otherwise.
 */
export function isValueDelta(value: unknown): value is ValueDelta {
    const valueDelta = value as unknown as ValueDelta;
    return (
        typeof value === "object" &&
        value !== null &&
        "name" in value &&
        "abbrev" in value &&
        "op" in value &&
        "value" in value &&
        typeof valueDelta.name === "string" &&
        typeof valueDelta.abbrev === "string" &&
        typeof valueDelta.op === "number" &&
        (typeof valueDelta.value === "number" ||
            typeof valueDelta.value === "string")
    );
}

/**
 * Type guard to check if a value is a valid ValueDeltaOperator.
 * @param value - The value to check.
 * @returns {boolean} - True if the value is a valid ValueDeltaOperator, false otherwise.
 */
export function isValueDeltaOperator(
    value: unknown,
): value is ValueDeltaOperator {
    return typeof value === "number" && value in ValueDeltaOperator;
}

export function isValueModifierValue(value: unknown): value is ValueModifier {
    return (
        typeof value === "number" ||
        (typeof value === "string" && ['true", "false'].includes(value))
    );
}
