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

import { classRegistry, maxPrecision } from "@utils";
import {
    DELTAINFO,
    DeltaInfo,
    isValueDeltaOperator,
    isValueModifierValue,
    ValueDelta,
    VALUEDELTA_OPERATOR,
    ValueDeltaOperator,
} from "@common/modifier";
import {
    SohlBase,
    SohlBaseOptions,
    SohlBaseParent,
    SohlPerformer,
} from "@common";
import { SYMBOL } from "@utils/constants";

/**
 * Represents a value and its modifying deltas.
 */
export class ValueModifier extends SohlBase<SohlPerformer> {
    disabledReason!: string;
    baseValue?: number;
    customFunction?: Function;
    deltas!: ValueDelta[];
    private _abbrev!: string;
    private _dirty!: boolean;
    private _effective!: number;

    constructor(
        data: PlainObject = {},
        options: Partial<SohlBaseOptions> = {},
    ) {
        super(data, options);
        this._apply();
    }

    protected _apply(): void {
        this._dirty = false;
        if (this.disabled) {
            this._effective = 0;
        } else {
            const mods = this.deltas.concat();

            // Sort modifiers so that we process Adds first, then Mults, then Floor, then Ceil
            mods.sort((a, b) =>
                a.op < b.op ? -1
                : a.op > b.op ? 1
                : 0,
            );

            let minVal: number | null = null;
            let maxVal: number | null = null;
            let overrideVal: number | null = null;

            this._effective = 0;

            // Process each modifier
            mods.forEach((adj) => {
                let value = adj.numValue;

                if (typeof value === "number") {
                    value ||= 0;
                    switch (adj.op) {
                        case VALUEDELTA_OPERATOR.ADD:
                            this._effective += value;
                            break;

                        case VALUEDELTA_OPERATOR.MULTIPLY:
                            this._effective *= value;
                            break;

                        case VALUEDELTA_OPERATOR.UPGRADE:
                            // set minVal to the largest minimum value
                            minVal = Math.max(
                                minVal ?? Number.MIN_SAFE_INTEGER,
                                value,
                            );
                            break;

                        case VALUEDELTA_OPERATOR.DOWNGRADE:
                            // set maxVal to the smallest maximum value
                            maxVal = Math.min(
                                maxVal ?? Number.MAX_SAFE_INTEGER,
                                value,
                            );
                            break;

                        case VALUEDELTA_OPERATOR.OVERRIDE:
                            overrideVal = value;
                            break;
                    }
                } else if (typeof value === "boolean") {
                    switch (adj.op) {
                        case VALUEDELTA_OPERATOR.ADD:
                            this._effective ||= value ? 1 : 0;
                            break;

                        case VALUEDELTA_OPERATOR.MULTIPLY:
                            this._effective = value && this._effective ? 1 : 0;
                            break;

                        case VALUEDELTA_OPERATOR.UPGRADE:
                            // set minVal to the largest minimum value
                            minVal = 0;
                            break;

                        case VALUEDELTA_OPERATOR.DOWNGRADE:
                            // set maxVal to the smallest maximum value
                            maxVal = 1;
                            break;

                        case VALUEDELTA_OPERATOR.OVERRIDE:
                            overrideVal = value ? 1 : 0;
                            break;
                    }
                } else if (typeof value === "string") {
                    switch (adj.op) {
                        case VALUEDELTA_OPERATOR.CUSTOM:
                            overrideVal = 0;
                    }
                }
            });

            this._effective =
                minVal === null ?
                    this._effective
                :   Math.max(minVal, this._effective);
            this._effective =
                maxVal === null ?
                    this._effective
                :   Math.min(maxVal, this._effective);
            this._effective = overrideVal ?? this._effective;
            this._effective ||= 0;

            // All values must be rounded to no more than 3 significant digits.
            this._effective = maxPrecision(this._effective, 3);
        }

        this._calcAbbrev();
    }

    get effective(): number {
        return this._effective;
    }

    get modifier(): number {
        return this.effective - (this.base || 0);
    }

    get abbrev(): string {
        return this.abbrev;
    }

    get index(): number {
        return Math.trunc((this.baseValue || 0) / 10);
    }

    get disabled(): string {
        return this.disabledReason ?? "";
    }

    set disabled(reason: string | boolean) {
        if (typeof reason === "string") {
            this.disabledReason = reason;
        } else {
            if (!reason) this.disabledReason = "";
            else this.disabledReason = "SOHL.DELTAINFO.DISABLED";
        }
        this._apply();
    }

    get base(): number {
        return this.baseValue || 0;
    }

    set base(value) {
        if (value !== undefined) {
            value = Number(value);
            if (Number.isNaN(value))
                throw new TypeError("value must be numeric or null");
        }
        this.baseValue = value;
        this._apply();
    }

    get hasBase(): boolean {
        return this.baseValue !== undefined;
    }

    get empty(): boolean {
        return !this.deltas.length;
    }

    _oper(
        name: string,
        abbrev: string = "",
        value: string | number = 0,
        op: ValueDeltaOperator = VALUEDELTA_OPERATOR.ADD,
        data: PlainObject = {},
    ): ValueModifier {
        if (!isValueModifierValue(value)) {
            throw new TypeError("value is not valid");
        } else if (!isValueDeltaOperator(op)) {
            throw new TypeError("op is not valid");
        } else if (
            !(typeof name === "string" && name.startsWith("SOHL.MOD."))
        ) {
            throw new TypeError("name is not valid");
        } else if (op === VALUEDELTA_OPERATOR.CUSTOM && !this.customFunction) {
            throw new TypeError("custom handler is not defined");
        }

        abbrev ||= data.abbrev;

        const existingOverride = this.deltas.find(
            (m) => m.op === VALUEDELTA_OPERATOR.OVERRIDE,
        );
        if (existingOverride) {
            // If the operation is not override, then ignore it (leave current override in place)
            if (op === VALUEDELTA_OPERATOR.OVERRIDE) {
                // If this ValueModifier already been overriden to zero, all other modifications are ignored.
                if (existingOverride.numValue !== 0) {
                    // If this ValueModifier is being overriden, throw out all other modifications
                    this.deltas = [
                        new ValueDelta(this, { name, abbrev, op, value }),
                    ];
                    this._apply();
                }
            }
        } else {
            const deltas = this.deltas.filter((m) => m.abbrev !== abbrev);
            deltas.push(new ValueDelta(this, { name, abbrev, op, value }));
            this._apply();
        }

        return this;
    }

    get(abbrev: string) {
        if (typeof abbrev !== "string")
            throw new TypeError("abbrev is not a string");
        return this.deltas.find((m) => m.abbrev === abbrev);
    }

    has(abbrev: string) {
        if (typeof abbrev !== "string")
            throw new TypeError("abbrev is not a string");
        return this.deltas.some((m) => m.abbrev === abbrev) || false;
    }

    delete(abbrev: string) {
        if (typeof abbrev !== "string")
            throw new TypeError("abbrev is not a string");
        const newMods = this.deltas.filter((m) => m.abbrev !== abbrev) || [];
        this._apply();
    }

    add(...args: any[]) {
        let name, abbrev, value, data;
        if (typeof args[0] === "object") {
            [{ name, abbrev }, value, data = {}] = args;
        } else {
            [name, abbrev, value, data = {}] = args;
        }
        return this._oper(name, abbrev, value, VALUEDELTA_OPERATOR.ADD, data);
    }

    multiply(...args: any[]) {
        let name, abbrev, value, data;
        if (typeof args[0] === "object") {
            [{ name, abbrev }, value, data = {}] = args;
        } else {
            [name, abbrev, value, data = {}] = args;
        }
        return this._oper(
            name,
            abbrev,
            value,
            VALUEDELTA_OPERATOR.MULTIPLY,
            data,
        );
    }

    set(...args: any[]) {
        let name, abbrev, value, data;
        if (typeof args[0] === "object") {
            [{ name, abbrev }, value, data = {}] = args;
        } else {
            [name, abbrev, value, data = {}] = args;
        }
        return this._oper(
            name,
            abbrev,
            value,
            VALUEDELTA_OPERATOR.OVERRIDE,
            data,
        );
    }

    floor(...args: any[]) {
        let name, abbrev, value, data;
        if (typeof args[0] === "object") {
            [{ name, abbrev }, value, data = {}] = args;
        } else {
            [name, abbrev, value, data = {}] = args;
        }
        return this._oper(
            name,
            abbrev,
            value,
            VALUEDELTA_OPERATOR.UPGRADE,
            data,
        );
    }

    ceiling(...args: any[]) {
        let name, abbrev, value, data;
        if (typeof args[0] === "object") {
            name = args[0].name;
            abbrev = args[0].abbrev;
            value = args[1];
            data = args[2] || {};
        } else {
            name = args[0];
            abbrev = args[1];
            value = args[2];
            data = args[3] || {};
        }
        return this._oper(
            name,
            abbrev,
            value,
            VALUEDELTA_OPERATOR.DOWNGRADE,
            data,
        );
    }

    get chatHtml(): string {
        function getValue(delta: ValueDelta): string {
            switch (delta.op) {
                case VALUEDELTA_OPERATOR.ADD:
                    return `${delta.numValue >= 0 ? "+" : ""}${delta.value}`;

                case VALUEDELTA_OPERATOR.MULTIPLY:
                    return `${SYMBOL.TIMES}${delta.value}`;

                case VALUEDELTA_OPERATOR.DOWNGRADE:
                    return `${SYMBOL.LESSTHANOREQUAL}${delta.value}`;

                case VALUEDELTA_OPERATOR.UPGRADE:
                    return `${SYMBOL.GREATERTHANOREQUAL}${delta.value}`;

                case VALUEDELTA_OPERATOR.OVERRIDE:
                    return `=${delta.value}`;

                case VALUEDELTA_OPERATOR.CUSTOM:
                    return `${SYMBOL.STAR}${delta.value}`;

                default:
                    throw Error(
                        `SoHL | Specified mode "${delta.op}" not recognized while processing ${delta.abbrev}`,
                    );
            }
        }

        if (this.disabled) return "";
        const fragHtml = `<div class="adjustment">
        <div class="flexrow">
            <span class="label adj-name">${sohl.i18n.format("SOHL.ValueModifier.Adjustment")}</span>
            <span class="label adj-value">${sohl.i18n.format("SOHL.ValueModifier.Value")}</span>    
        </div>${this.deltas
            .map((m) => {
                return `<div class="flexrow">
            <span class="adj-name">${m.name}</span>
            <span class="adj-value">${getValue(m)}</span></div>`;
            })
            .join("")}</div>`;

        return fragHtml;
    }

    _calcAbbrev() {
        this._abbrev = "";
        if (this.disabled) {
            this._abbrev = DELTAINFO.DISABLED;
        } else {
            this.deltas.forEach((adj) => {
                if (this._abbrev) {
                    this._abbrev += ", ";
                }

                switch (adj.op) {
                    case VALUEDELTA_OPERATOR.ADD:
                        this._abbrev += `${adj.abbrev} ${adj.numValue > 0 ? "+" : ""}${adj.value}`;
                        break;

                    case VALUEDELTA_OPERATOR.MULTIPLY:
                        this._abbrev += `${adj.abbrev} ${SYMBOL.TIMES}${adj.value}`;
                        break;

                    case VALUEDELTA_OPERATOR.DOWNGRADE:
                        this._abbrev += `${adj.abbrev} ${SYMBOL.LESSTHANOREQUAL}${adj.value}`;
                        break;

                    case VALUEDELTA_OPERATOR.UPGRADE:
                        this._abbrev += `${adj.abbrev} ${SYMBOL.GREATERTHANOREQUAL}${adj.value}`;
                        break;

                    case VALUEDELTA_OPERATOR.OVERRIDE:
                        this._abbrev += `${adj.abbrev} =${adj.value}`;
                        break;

                    case VALUEDELTA_OPERATOR.CUSTOM:
                        if (adj.value === "disabled")
                            this._abbrev += `${adj.abbrev}`;
                        break;
                }
            });
        }
    }
}
