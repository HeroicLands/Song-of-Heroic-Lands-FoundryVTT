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

import type { SohlLogic } from "@src/common/core/SohlLogic";
import {
    maxPrecision,
    instanceToJSON,
    cloneInstance,
} from "@src/utils/helpers";
import { ValueDelta } from "@src/common/modifier/ValueDelta";
import {
    SYMBOL,
    VALUE_DELTA_INFO,
    VALUE_DELTA_OPERATOR,
    VALUE_DELTA_OPERATOR_ORDER,
    ValueDeltaOperator,
    isValueDeltaOperator,
} from "@src/utils/constants";

/**
 * Represents a value and its modifiers. This allows for a flexible system of
 * applying various adjustment to a base value, that can be subsequently
 * described in a standardized way. Also allows for specific adjustments to be
 * subsequently removed or modified.
 *
 * ValueModifiers can also be disabled, which will cause their effective value to
 * be zero regardless of any modifiers. This is useful for representing conditions
 * that would negate a value entirely, while making it possible to denote the difference
 * between a value that is zero due to modifiers and a value that is zero due to being disabled.
 */
export class ValueModifier {
    private _shortcode!: string;
    private _dirty: boolean;
    private _effective!: number;
    private _parent: SohlLogic;
    disabledReason!: string;
    baseValue?: number;
    customFunction?: Function;
    deltas!: ValueDelta[];

    constructor(
        data: Partial<ValueModifier.Data> = {},
        options?: Partial<ValueModifier.Options>,
    ) {
        if (!options?.parent) {
            throw new Error("ValueModifier must be constructed with a parent.");
        }
        this._parent = options.parent;
        this.disabledReason = data.disabledReason ?? "";
        this.baseValue = data.baseValue ?? undefined;
        this.customFunction = data.customFunction ?? undefined;
        this.deltas = data.deltas ?? [];
        this._dirty = true;
        this._apply();
    }

    toJSON(): PlainObject {
        return instanceToJSON(this);
    }

    clone<T>(data: PlainObject = {}, options: PlainObject = {}): T {
        return cloneInstance<T>(this, data, options);
    }

    protected _apply(): void {
        if (!this._dirty) return;
        this._dirty = false;
        if (this.disabled) {
            this._effective = 0;
        } else {
            const mods = this.deltas.concat();

            // Sort modifiers by processing order: add, multiply, upgrade, downgrade, override, custom
            mods.sort(
                (a, b) =>
                    VALUE_DELTA_OPERATOR_ORDER.indexOf(a.op as string) -
                    VALUE_DELTA_OPERATOR_ORDER.indexOf(b.op as string),
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
                        case VALUE_DELTA_OPERATOR.ADD:
                            this._effective += value;
                            break;

                        case VALUE_DELTA_OPERATOR.MULTIPLY:
                            this._effective *= value;
                            break;

                        case VALUE_DELTA_OPERATOR.UPGRADE:
                            // set minVal to the largest minimum value
                            minVal = Math.max(
                                minVal ?? Number.MIN_SAFE_INTEGER,
                                value,
                            );
                            break;

                        case VALUE_DELTA_OPERATOR.DOWNGRADE:
                            // set maxVal to the smallest maximum value
                            maxVal = Math.min(
                                maxVal ?? Number.MAX_SAFE_INTEGER,
                                value,
                            );
                            break;

                        case VALUE_DELTA_OPERATOR.OVERRIDE:
                            overrideVal = value;
                            break;
                    }
                } else if (typeof value === "boolean") {
                    switch (adj.op) {
                        case VALUE_DELTA_OPERATOR.ADD:
                            this._effective ||= value ? 1 : 0;
                            break;

                        case VALUE_DELTA_OPERATOR.MULTIPLY:
                            this._effective = value && this._effective ? 1 : 0;
                            break;

                        case VALUE_DELTA_OPERATOR.UPGRADE:
                            // set minVal to the largest minimum value
                            minVal = 0;
                            break;

                        case VALUE_DELTA_OPERATOR.DOWNGRADE:
                            // set maxVal to the smallest maximum value
                            maxVal = 1;
                            break;

                        case VALUE_DELTA_OPERATOR.OVERRIDE:
                            overrideVal = value ? 1 : 0;
                            break;
                    }
                } else if (typeof value === "string") {
                    switch (adj.op) {
                        case VALUE_DELTA_OPERATOR.CUSTOM:
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

    get parent(): SohlLogic {
        return this._parent;
    }

    get effective(): number {
        this._apply();
        return this._effective;
    }

    get modifier(): number {
        return this.effective - (this.base || 0);
    }

    get shortcode(): string {
        this._apply();
        return this._shortcode;
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
        this._dirty = true;
    }

    get base(): number {
        return this.baseValue ?? 0;
    }

    setBase(value: unknown): ValueModifier {
        if (typeof value === "number" || typeof value === "undefined") {
            this.baseValue = value;
        } else {
            throw new TypeError("value must be numeric or undefined");
        }
        this._dirty = true;
        return this;
    }

    set base(value: unknown) {
        this.setBase(value);
    }

    get hasBase(): boolean {
        return this.baseValue !== undefined;
    }

    get empty(): boolean {
        return !this.deltas.length;
    }

    _oper(
        name: string,
        shortcode: string = "",
        value: string | number = 0,
        op: ValueDeltaOperator = VALUE_DELTA_OPERATOR.ADD,
        data: PlainObject = {},
    ): ValueModifier {
        // TODO: Name prefix mismatch — _oper validates "SOHL.MOD." but ValueDelta
        // constructor requires "SOHL.INFO.". These are mutually exclusive, so
        // add()/multiply()/set()/floor()/ceiling() cannot currently create deltas.
        // Align the prefix conventions before using the modifier API.
        if (!isValueDeltaOperator(op)) {
            throw new TypeError("op is not valid");
        } else if (
            !(typeof name === "string" && name.startsWith("SOHL.MOD."))
        ) {
            throw new TypeError("name is not valid");
        } else if (op === VALUE_DELTA_OPERATOR.CUSTOM && !this.customFunction) {
            throw new TypeError("custom handler is not defined");
        }

        shortcode ||= data.shortcode;

        const existingOverride = this.deltas.find(
            (m) => m.op === VALUE_DELTA_OPERATOR.OVERRIDE,
        );
        if (existingOverride) {
            // If the operation is not override, then ignore it (leave current override in place)
            if (op === VALUE_DELTA_OPERATOR.OVERRIDE) {
                // If this ValueModifier already been overriden to zero, all other modifications are ignored.
                if (existingOverride.numValue !== 0) {
                    // If this ValueModifier is being overriden, throw out all other modifications
                    this.deltas = [
                        new ValueDelta({ name, shortcode, op, value }),
                    ];
                }
            }
        } else {
            this.deltas = this.deltas.filter((m) => m.shortcode !== shortcode);
            this.deltas.push(new ValueDelta({ name, shortcode, op, value }));
        }

        this._dirty = true;
        return this;
    }

    get(shortcode: string): ValueDelta | undefined {
        if (typeof shortcode !== "string")
            throw new TypeError("shortcode is not a string");
        return this.deltas.find((m) => m.shortcode === shortcode);
    }

    has(shortcode: string): boolean {
        if (typeof shortcode !== "string")
            throw new TypeError("shortcode is not a string");
        return this.deltas.some((m) => m.shortcode === shortcode) || false;
    }

    delete(shortcode: string): void {
        if (typeof shortcode !== "string")
            throw new TypeError("shortcode is not a string");
        this.deltas = this.deltas.filter((m) => m.shortcode !== shortcode);
        this._dirty = true;
    }

    add(...args: any[]): ValueModifier {
        let name, shortcode, value, data;
        if (typeof args[0] === "object") {
            [{ name, shortcode }, value, data = {}] = args;
        } else {
            [name, shortcode, value, data = {}] = args;
        }
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.ADD,
            data,
        );
    }

    addVM(
        other: ValueModifier,
        { includeBase }: { includeBase?: boolean } = {},
    ): ValueModifier {
        if (includeBase) this.base = other.base;
        return this;
    }

    multiply(...args: any[]): ValueModifier {
        let name, shortcode, value, data;
        if (typeof args[0] === "object") {
            [{ name, shortcode }, value, data = {}] = args;
        } else {
            [name, shortcode, value, data = {}] = args;
        }
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.MULTIPLY,
            data,
        );
    }
    /**
     * Sets the value to a specific number, overriding all other modifiers.
     * @param args - The arguments can be an object with name and shortcode, followed by value and optional data.
     */
    set(...args: any[]): ValueModifier {
        let name, shortcode, value, data;
        if (typeof args[0] === "object") {
            [{ name, shortcode }, value, data = {}] = args;
        } else {
            [name, shortcode, value, data = {}] = args;
        }
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.OVERRIDE,
            data,
        );
    }

    floor(...args: any[]): ValueModifier {
        let name, shortcode, value, data;
        if (typeof args[0] === "object") {
            [{ name, shortcode }, value, data = {}] = args;
        } else {
            [name, shortcode, value, data = {}] = args;
        }
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.UPGRADE,
            data,
        );
    }

    ceiling(...args: any[]): ValueModifier {
        let name, shortcode, value, data;
        if (typeof args[0] === "object") {
            name = args[0].name;
            shortcode = args[0].shortcode;
            value = args[1];
            data = args[2] || {};
        } else {
            name = args[0];
            shortcode = args[1];
            value = args[2];
            data = args[3] || {};
        }
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.DOWNGRADE,
            data,
        );
    }

    get chatHtml(): string {
        function getValue(delta: ValueDelta): string {
            switch (delta.op) {
                case VALUE_DELTA_OPERATOR.ADD:
                    return `${delta.numValue >= 0 ? "+" : ""}${delta.value}`;

                case VALUE_DELTA_OPERATOR.MULTIPLY:
                    return `${SYMBOL.TIMES}${delta.value}`;

                case VALUE_DELTA_OPERATOR.DOWNGRADE:
                    return `${SYMBOL.LESSTHANOREQUAL}${delta.value}`;

                case VALUE_DELTA_OPERATOR.UPGRADE:
                    return `${SYMBOL.GREATERTHANOREQUAL}${delta.value}`;

                case VALUE_DELTA_OPERATOR.OVERRIDE:
                    return `=${delta.value}`;

                case VALUE_DELTA_OPERATOR.CUSTOM:
                    return `${SYMBOL.STAR}${delta.value}`;

                default:
                    throw Error(
                        `SoHL | Specified mode "${delta.op}" not recognized while processing ${delta.shortcode}`,
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

    _calcAbbrev(): void {
        this._shortcode = "";
        if (this.disabled) {
            this._shortcode = VALUE_DELTA_INFO.DISABLED;
        } else {
            this.deltas.forEach((adj) => {
                if (this._shortcode) {
                    this._shortcode += ", ";
                }

                switch (adj.op) {
                    case VALUE_DELTA_OPERATOR.ADD:
                        this._shortcode += `${adj.shortcode} ${adj.numValue > 0 ? "+" : ""}${adj.value}`;
                        break;

                    case VALUE_DELTA_OPERATOR.MULTIPLY:
                        this._shortcode += `${adj.shortcode} ${SYMBOL.TIMES}${adj.value}`;
                        break;

                    case VALUE_DELTA_OPERATOR.DOWNGRADE:
                        this._shortcode += `${adj.shortcode} ${SYMBOL.LESSTHANOREQUAL}${adj.value}`;
                        break;

                    case VALUE_DELTA_OPERATOR.UPGRADE:
                        this._shortcode += `${adj.shortcode} ${SYMBOL.GREATERTHANOREQUAL}${adj.value}`;
                        break;

                    case VALUE_DELTA_OPERATOR.OVERRIDE:
                        this._shortcode += `${adj.shortcode} =${adj.value}`;
                        break;

                    case VALUE_DELTA_OPERATOR.CUSTOM:
                        if (adj.value === "disabled")
                            this._shortcode += `${adj.shortcode}`;
                        break;
                }
            });
        }
    }
}

export namespace ValueModifier {
    export const Kind: string = "ValueModifier";

    export interface Data {
        disabledReason: string;
        baseValue: number | null;
        customFunction: Function | null;
        deltas: ValueDelta[];
    }

    export interface Options {
        parent: SohlLogic;
    }
}
