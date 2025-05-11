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

import { maxPrecision } from "@utils";
import { SohlMap } from "@utils/collection";
import {
    DeltaInfo,
    isValueDelta,
    isValueDeltaOperator,
    isValueModifierValue,
    ValueDelta,
    ValueDeltaOperator,
} from "@logic/common/core/modifier";
import { SohlBase, SohlPerformer } from "@logic/common/core";
import { CollectionType, DataField, RegisterClass } from "@utils";

export type ValueModifierMap = SohlMap<string, ValueModifier>;

/**
 * Represents a value and its modifying deltas.
 */
@RegisterClass("ValueModifier", "0.6.0")
export abstract class ValueModifier extends SohlBase {
    @DataField("disabledReason", { type: String, initial: "" })
    disabledReason!: string;

    @DataField("baseValue", { type: Number })
    baseValue?: number;

    @DataField("customFunction", { type: Function })
    customFunction?: Function;

    @DataField("deltas", {
        type: ValueDelta,
        collection: CollectionType.ARRAY,
        validator: isValueDelta,
    })
    deltas!: ValueDelta[];

    @DataField("_abbrev", { type: String, transient: true, initial: "" })
    private _abbrev!: string;

    @DataField("_dirty", { type: Boolean, transient: true, initial: true })
    private _dirty!: boolean;

    @DataField("_effective", { type: Number, transient: true, initial: 0 })
    private _effective!: number;

    constructor(
        parent: SohlPerformer,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
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
                        case ValueDeltaOperator.ADD:
                            this._effective += value;
                            break;

                        case ValueDeltaOperator.MULTIPLY:
                            this._effective *= value;
                            break;

                        case ValueDeltaOperator.UPGRADE:
                            // set minVal to the largest minimum value
                            minVal = Math.max(
                                minVal ?? Number.MIN_SAFE_INTEGER,
                                value,
                            );
                            break;

                        case ValueDeltaOperator.DOWNGRADE:
                            // set maxVal to the smallest maximum value
                            maxVal = Math.min(
                                maxVal ?? Number.MAX_SAFE_INTEGER,
                                value,
                            );
                            break;

                        case ValueDeltaOperator.OVERRIDE:
                            overrideVal = value;
                            break;
                    }
                } else if (typeof value === "boolean") {
                    switch (adj.op) {
                        case ValueDeltaOperator.ADD:
                            this._effective ||= value ? 1 : 0;
                            break;

                        case ValueDeltaOperator.MULTIPLY:
                            this._effective = value && this._effective ? 1 : 0;
                            break;

                        case ValueDeltaOperator.UPGRADE:
                            // set minVal to the largest minimum value
                            minVal = 0;
                            break;

                        case ValueDeltaOperator.DOWNGRADE:
                            // set maxVal to the smallest maximum value
                            maxVal = 1;
                            break;

                        case ValueDeltaOperator.OVERRIDE:
                            overrideVal = value ? 1 : 0;
                            break;
                    }
                } else if (typeof value === "string") {
                    switch (adj.op) {
                        case ValueDeltaOperator.CUSTOM:
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
        op: ValueDeltaOperator = ValueDeltaOperator.ADD,
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
        } else if (op === ValueDeltaOperator.CUSTOM && !this.customFunction) {
            throw new TypeError("custom handler is not defined");
        }

        abbrev ||= data.abbrev;

        const existingOverride = this.deltas.find(
            (m) => m.op === ValueDeltaOperator.OVERRIDE,
        );
        if (existingOverride) {
            // If the operation is not override, then ignore it (leave current override in place)
            if (op === ValueDeltaOperator.OVERRIDE) {
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
        return this._oper(name, abbrev, value, ValueDeltaOperator.ADD, data);
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
            ValueDeltaOperator.MULTIPLY,
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
            ValueDeltaOperator.OVERRIDE,
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
            ValueDeltaOperator.UPGRADE,
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
            ValueDeltaOperator.DOWNGRADE,
            data,
        );
    }

    get chatHtml(): string {
        function getValue(delta: ValueDelta): string {
            switch (delta.op) {
                case ValueDeltaOperator.ADD:
                    return `${delta.numValue >= 0 ? "+" : ""}${delta.value}`;

                case ValueDeltaOperator.MULTIPLY:
                    return `${sohl.utils.SYMBOL.TIMES}${delta.value}`;

                case ValueDeltaOperator.DOWNGRADE:
                    return `${sohl.utils.SYMBOL.LESSTHANOREQUAL}${delta.value}`;

                case ValueDeltaOperator.UPGRADE:
                    return `${sohl.utils.SYMBOL.GREATERTHANOREQUAL}${delta.value}`;

                case ValueDeltaOperator.OVERRIDE:
                    return `=${delta.value}`;

                case ValueDeltaOperator.CUSTOM:
                    return `${sohl.utils.SYMBOL.STAR}${delta.value}`;

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
            this._abbrev = DeltaInfo.DISABLED;
        } else {
            this.deltas.forEach((adj) => {
                if (this._abbrev) {
                    this._abbrev += ", ";
                }

                switch (adj.op) {
                    case ValueDeltaOperator.ADD:
                        this._abbrev += `${adj.abbrev} ${adj.numValue > 0 ? "+" : ""}${adj.value}`;
                        break;

                    case ValueDeltaOperator.MULTIPLY:
                        this._abbrev += `${adj.abbrev} ${sohl.utils.SYMBOL.TIMES}${adj.value}`;
                        break;

                    case ValueDeltaOperator.DOWNGRADE:
                        this._abbrev += `${adj.abbrev} ${sohl.utils.SYMBOL.LESSTHANOREQUAL}${adj.value}`;
                        break;

                    case ValueDeltaOperator.UPGRADE:
                        this._abbrev += `${adj.abbrev} ${sohl.utils.SYMBOL.GREATERTHANOREQUAL}${adj.value}`;
                        break;

                    case ValueDeltaOperator.OVERRIDE:
                        this._abbrev += `${adj.abbrev} =${adj.value}`;
                        break;

                    case ValueDeltaOperator.CUSTOM:
                        if (adj.value === "disabled")
                            this._abbrev += `${adj.abbrev}`;
                        break;
                }
            });
        }
    }
}
