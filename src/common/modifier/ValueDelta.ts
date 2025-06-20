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

import { SohlBase } from "@common";
import { defineType } from "@utils";
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
        if (op === ValueDelta.OPERATOR.CUSTOM) {
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
        if (ValueDelta.isOperator(this.op)) {
            if (["true", "false"].includes(this.value as string)) {
                switch (this.op) {
                    case ValueDelta.OPERATOR.ADD:
                        return !!base || this.value === "true" ? 1 : 0;
                    case ValueDelta.OPERATOR.MULTIPLY:
                        return !!base && this.value === "true" ? 1 : 0;
                    case ValueDelta.OPERATOR.CUSTOM:
                    case ValueDelta.OPERATOR.UPGRADE:
                    case ValueDelta.OPERATOR.OVERRIDE:
                        return this.value === "true" ? 1 : 0;
                    case ValueDelta.OPERATOR.DOWNGRADE:
                        return this.value === "false" ? 0 : 1;
                }
            } else {
                switch (this.op) {
                    case ValueDelta.OPERATOR.ADD:
                        return base + Number(this.value); // ADD
                    case ValueDelta.OPERATOR.MULTIPLY:
                        return base * Number(this.value); // MULTIPLY
                    case ValueDelta.OPERATOR.CUSTOM:
                    case ValueDelta.OPERATOR.OVERRIDE:
                        return Number(this.value); // OVERRIDE
                    case ValueDelta.OPERATOR.UPGRADE:
                        return Math.min(base, Number(this.value)); // FLOOR
                    case ValueDelta.OPERATOR.DOWNGRADE:
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
    export const {
        kind: INFO,
        values: infos,
        isValue: isInfo,
    } = defineType("ValueDelta.INFO", {
        DISABLED: "Dsbl",
        NOMSLDEF: "NoMslDef",
        NOMODIFIERNODIE: "NMND",
        NOBLOCK: "NoBlk",
        NOCOUNTERSTRIKE: "NoCX",
        NOCHARGES: "NoChrg",
        NOUSECHARGES: "NoUseChrg",
        NOHEALRATE: "NoHeal",
        NOTNUMNOSCORE: "NoScore",
        NOTNUMNOML: "NoML",
        ARMORPROT: "ArmProt",
        DURABILITY: "Dur",
        FATEBNS: "FateBns",
        ITEMWT: "ItmWt",
        MAGIC: "Magic",
        MAGICMOD: "MagicMod",
        MAXVALUE: "MaxVal",
        MINVALUE: "MinVal",
        MLATTRBOOST: "MlAtrBst",
        MLDSBL: "MLDsbl",
        NOFATE: "NoFateAvail",
        NOTATTRNOML: "NotAttrNoML",
        OFFHAND: "OffHnd",
        OUTNUMBERED: "Outn",
        PLAYER: "SitMod",
        SSMOD: "SSMod",
    });
    export type Info = (typeof INFO)[keyof typeof INFO];
    export const ID: StrictObject<{ name: string; abbrev: string }> =
        infos.reduce(
            (acc, val: string) => {
                const name = `SOHL.INFO.${val}`;
                acc[val] = { name, abbrev: val };
                return acc;
            },
            {} as StrictObject<{ name: string; abbrev: string }>,
        );

    export const {
        kind: OPERATOR,
        values: Operators,
        isValue: isOperator,
    } = defineType("ValueDelta.OPERATOR", {
        CUSTOM: 0,
        MULTIPLY: 1,
        ADD: 2,
        DOWNGRADE: 3,
        UPGRADE: 4,
        OVERRIDE: 5,
    });
    export type Operator = (typeof OPERATOR)[keyof typeof OPERATOR];

    export type Value = string | number;
    export function isValue(value: unknown): value is Value {
        return (
            typeof value === "number" ||
            (typeof value === "string" && ["true", "false"].includes(value))
        );
    }

    export interface Data {
        name: string;
        abbrev: string;
        op: Operator;
        value: Value;
    }

    // Constructor type for ValueDelta and its subclasses
    export interface Constructor<T extends ValueDelta = ValueDelta> {
        new (data: Data): T;
    }
}
