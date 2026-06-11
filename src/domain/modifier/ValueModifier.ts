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

import type { SohlLogic } from "@src/core/SohlLogic";
import {
    maxPrecision,
    instanceToJSON,
    cloneInstance,
} from "@src/utils/helpers";
import { ValueDelta } from "@src/domain/modifier/ValueDelta";
import {
    SYMBOL,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    type ValueDeltaInfo,
    VALUE_DELTA_OPERATOR,
    VALUE_DELTA_OPERATOR_ORDER,
    ValueDeltaOperator,
    isValueDeltaOperator,
} from "@src/utils/constants";

/**
 * A tracked numeric value composed of a **base** plus zero or more
 * **deltas** (modifiers), producing a fully auditable **effective** value.
 *
 * ## Effective value calculation
 *
 * `effective = base + deltas`, computed lazily when accessed:
 *
 * 1. Start with `base` (from {@link setBase}, or 0 if unset).
 * 2. Sort all {@link ValueDelta} entries by operator priority.
 * 3. Apply in order:
 *    - **ADD** — add to running total
 *    - **MULTIPLY** — multiply running total
 *    - **UPGRADE** (floor) — enforce a minimum value
 *    - **DOWNGRADE** (ceiling) — enforce a maximum value
 *    - **OVERRIDE** — replace with an explicit value
 *    - **CUSTOM** — delegate to {@link customFunction}
 * 4. Round to 3 significant digits.
 *
 * `modifier` returns `effective - base`, i.e., just the delta contribution.
 *
 * ## Disabled state
 *
 * A ValueModifier can be **disabled** by setting a reason string. When
 * disabled, `effective` is always 0 regardless of base or deltas. This
 * distinguishes "value is zero because of modifiers" from "value is
 * inapplicable" (e.g., a skill the character cannot use).
 *
 * ## Lifecycle
 *
 * ValueModifiers are created during {@link SohlLogic.initialize} with a
 * base from persisted data. Deltas are added during `evaluate`/`finalize`
 * by active effects, cross-item dependencies, or other logic. The entire
 * object is rebuilt on the next preparation cycle — deltas are never
 * persisted.
 *
 * ## Auditability
 *
 * Each delta has a `name` and `shortcode` identifying its source, so
 * the full breakdown of "why is this value X?" is always available via
 * the {@link deltas} array. Use {@link get}, {@link has}, and
 * {@link delete} to inspect or remove specific deltas by shortcode.
 */
export class ValueModifier {
    private _shortcode!: string;
    private dirty: boolean;
    private _effective!: number;
    private _parent: SohlLogic;
    /** Reason the value is disabled; empty string means enabled. See {@link disabled}. */
    disabledReason!: string;
    /** The base value before deltas (undefined until set; treated as 0 by {@link base}). */
    baseValue?: number;
    /** Handler invoked by a `CUSTOM` delta to compute a value, when one is used. */
    customFunction?: Function;
    /** The list of {@link ValueDelta} modifiers applied on top of the base. */
    deltas!: ValueDelta[];

    /**
     * @param data - Initial state; `baseValue`, `deltas`, `disabledReason`, and
     *   `customFunction` are all optional.
     * @param options - Must provide `options.parent`, the owning Logic.
     * @throws If no `parent` is provided.
     */
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
        this.dirty = true;
        this._apply();
    }

    /** Serialize this modifier (base, deltas, disabled state) to a plain object. */
    toJSON(): PlainObject {
        return instanceToJSON(this);
    }

    /**
     * Create a deep copy of this modifier, optionally overriding fields.
     *
     * @typeParam T - The concrete modifier type returned.
     * @param data - Field overrides applied to the clone.
     * @param options - Clone options (e.g. a new `parent`).
     * @returns The cloned modifier.
     */
    clone<T>(data: PlainObject = {}, options: PlainObject = {}): T {
        return cloneInstance<T>(this, data, options);
    }

    protected _apply(): void {
        if (!this.dirty) return;
        this.dirty = false;
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

            this._effective = this.baseValue ?? 0;

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

    /** The Logic that owns this modifier. */
    get parent(): SohlLogic {
        return this._parent;
    }

    /**
     * The computed effective value — the base with all deltas applied (always 0
     * when {@link disabled}). Recomputed lazily on access.
     */
    get effective(): number {
        this._apply();
        return this._effective;
    }

    /** The deltas' net contribution to the value — `effective − base`. */
    get modifier(): number {
        return this.effective - (this.base || 0);
    }

    /**
     * A compact, human-readable summary of the applied deltas (e.g.
     * `STR +2, ARM ×2`), or the disabled marker when {@link disabled}.
     */
    get shortcode(): string {
        this._apply();
        return this._shortcode;
    }

    /** A coarse index derived from the base value (`base / 10`, truncated). */
    get index(): number {
        return Math.trunc((this.baseValue || 0) / 10);
    }

    /** The disabled reason, or `""` when enabled. A non-empty value forces {@link effective} to 0. */
    get disabled(): string {
        return this.disabledReason ?? "";
    }

    /**
     * Disable with a reason string, or toggle via a boolean (passing `true`
     * applies a default reason; `false` clears it).
     */
    set disabled(reason: string | boolean) {
        if (typeof reason === "string") {
            this.disabledReason = reason;
        } else {
            if (!reason) this.disabledReason = "";
            else this.disabledReason = "SOHL.DELTAINFO.DISABLED";
        }
        this.dirty = true;
    }

    /** Chainable form of the {@link disabled} setter. */
    setDisabled(reason: string | boolean): this {
        this.disabled = reason;
        return this;
    }

    /** The base value (0 when unset). */
    get base(): number {
        return this.baseValue ?? 0;
    }

    /**
     * Set the base value.
     *
     * @param value - A number, or `undefined` to clear the base.
     * @returns `this`, for chaining.
     * @throws TypeError if `value` is neither numeric nor `undefined`.
     */
    setBase(value: unknown): this {
        if (typeof value === "number" || typeof value === "undefined") {
            this.baseValue = value;
        } else {
            throw new TypeError("value must be numeric or undefined");
        }
        this.dirty = true;
        return this;
    }

    /** Setter form of {@link setBase}. */
    set base(value: unknown) {
        this.setBase(value);
    }

    /** Whether a base value has been explicitly set. */
    get hasBase(): boolean {
        return this.baseValue !== undefined;
    }

    /** Whether no deltas have been applied. */
    get empty(): boolean {
        return !this.deltas.length;
    }

    /**
     * Core delta-mutation routine shared by {@link add}, {@link multiply},
     * {@link set}, {@link floor}, and {@link ceiling}.
     *
     * @internal
     */
    protected _oper(
        name: string,
        shortcode: string = "",
        value: string | number = 0,
        op: ValueDeltaOperator = VALUE_DELTA_OPERATOR.ADD,
        data: PlainObject = {},
    ): this {
        if (!isValueDeltaOperator(op)) {
            throw new TypeError("op is not valid");
        } else if (op === VALUE_DELTA_OPERATOR.CUSTOM && !this.customFunction) {
            throw new TypeError("custom handler is not defined");
        }
        // `name` / `shortcode` arrive already resolved by the public
        // operators: the `(shortcode, value)` form validates the shortcode
        // against the registry, while the `(name, shortcode, value)` form
        // passes both through as-is for ad-hoc deltas.

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

        this.dirty = true;
        return this;
    }

    /**
     * Find the delta with the given shortcode.
     *
     * @returns The matching {@link ValueDelta}, or `undefined`.
     * @throws TypeError if `shortcode` is not a string.
     */
    get(shortcode: string): ValueDelta | undefined {
        if (typeof shortcode !== "string")
            throw new TypeError("shortcode is not a string");
        return this.deltas.find((m) => m.shortcode === shortcode);
    }

    /**
     * Whether a delta with the given shortcode is present.
     *
     * @throws TypeError if `shortcode` is not a string.
     */
    has(shortcode: string): boolean {
        if (typeof shortcode !== "string")
            throw new TypeError("shortcode is not a string");
        return this.deltas.some((m) => m.shortcode === shortcode) || false;
    }

    /**
     * Remove the delta with the given shortcode, if present.
     *
     * @throws TypeError if `shortcode` is not a string.
     */
    delete(shortcode: string): void {
        if (typeof shortcode !== "string")
            throw new TypeError("shortcode is not a string");
        this.deltas = this.deltas.filter((m) => m.shortcode !== shortcode);
        this.dirty = true;
    }

    /**
     * Resolve operator arguments into a `{ name, shortcode, value }` triple.
     *
     * Two call forms, dispatched by argument count:
     *
     * - **`(shortcode, value)`** — the convenience form. `shortcode` must be
     *   a registered {@link VALUE_DELTA_INFO} value; its display name is
     *   resolved from {@link VALUE_DELTA_ID}. Throws when the shortcode is
     *   not registered — use the three-argument form for ad-hoc deltas.
     * - **`(name, shortcode, value)`** — the explicit form. `name` and
     *   `shortcode` are used verbatim, with no registry lookup or validation.
     *
     * @internal
     */
    private _resolveDeltaArgs(args: unknown[]): {
        name: string;
        shortcode: string;
        value: number;
    } {
        if (args.length <= 2) {
            const shortcode = args[0] as string;
            const info = VALUE_DELTA_ID[shortcode];
            if (!info) {
                throw new Error(
                    `ValueModifier: unknown value-delta shortcode "${shortcode}". ` +
                        `Pass a registered VALUE_DELTA_INFO shortcode, or use the ` +
                        `(name, shortcode, value) form for an ad-hoc delta.`,
                );
            }
            return {
                name: info.name,
                shortcode: info.shortcode,
                value: args[1] as number,
            };
        }
        return {
            name: args[0] as string,
            shortcode: args[1] as string,
            value: args[2] as number,
        };
    }

    /**
     * Add an additive (`+value`) delta. A new delta replaces any existing one
     * with the same shortcode.
     *
     * @remarks
     * Two forms: `(shortcode, value)` resolves the display name from the
     * {@link VALUE_DELTA_INFO} registry (and throws on an unknown shortcode);
     * `(name, shortcode, value)` supplies both explicitly for ad-hoc deltas.
     * @returns `this`, for chaining.
     */
    add(shortcode: ValueDeltaInfo, value: number): this;
    add(name: string, shortcode: string, value: number): this;
    add(...args: unknown[]): this {
        const { name, shortcode, value } = this._resolveDeltaArgs(args);
        return this._oper(name, shortcode, value, VALUE_DELTA_OPERATOR.ADD);
    }

    /**
     * Fold another modifier into this one.
     *
     * @param other - The modifier to merge from.
     * @param options - When `includeBase` is set, adopt `other`'s base value.
     * @returns `this`, for chaining.
     */
    addVM(
        other: ValueModifier,
        { includeBase }: { includeBase?: boolean } = {},
    ): ValueModifier {
        if (includeBase) this.base = other.base;
        return this;
    }

    /**
     * Add a multiplicative (`×value`) delta. Same argument forms as
     * {@link add}.
     *
     * @returns `this`, for chaining.
     */
    multiply(shortcode: ValueDeltaInfo, value: number): this;
    multiply(name: string, shortcode: string, value: number): this;
    multiply(...args: unknown[]): this {
        const { name, shortcode, value } = this._resolveDeltaArgs(args);
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.MULTIPLY,
        );
    }

    /**
     * Add an `OVERRIDE` delta that replaces the value, ignoring all other
     * modifiers. Same argument forms as {@link add}.
     *
     * @remarks
     * An override to a non-zero value discards other deltas; an override to zero
     * is sticky — once set, further modifications are ignored.
     * @returns `this`, for chaining.
     */
    set(shortcode: ValueDeltaInfo, value: number): this;
    set(name: string, shortcode: string, value: number): this;
    set(...args: unknown[]): this {
        const { name, shortcode, value } = this._resolveDeltaArgs(args);
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.OVERRIDE,
        );
    }

    /**
     * Add an `UPGRADE` (floor / minimum) delta: the effective value cannot drop
     * below `value`. Same argument forms as {@link add}.
     *
     * @returns `this`, for chaining.
     */
    floor(shortcode: ValueDeltaInfo, value: number): this;
    floor(name: string, shortcode: string, value: number): this;
    floor(...args: unknown[]): this {
        const { name, shortcode, value } = this._resolveDeltaArgs(args);
        return this._oper(name, shortcode, value, VALUE_DELTA_OPERATOR.UPGRADE);
    }

    /**
     * Add a `DOWNGRADE` (ceiling / maximum) delta: the effective value cannot
     * exceed `value`. Same argument forms as {@link add}.
     *
     * @returns `this`, for chaining.
     */
    ceiling(shortcode: ValueDeltaInfo, value: number): this;
    ceiling(name: string, shortcode: string, value: number): this;
    ceiling(...args: unknown[]): this {
        const { name, shortcode, value } = this._resolveDeltaArgs(args);
        return this._oper(
            name,
            shortcode,
            value,
            VALUE_DELTA_OPERATOR.DOWNGRADE,
        );
    }

    /** Render the deltas as an HTML breakdown (name + adjustment per row) for chat cards and tooltips; empty when disabled. */
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

    /**
     * Recompute the {@link shortcode} summary string from the current deltas.
     *
     * @internal
     */
    protected _calcAbbrev(): void {
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
    /** Registry key identifying this modifier kind for serialization. */
    export const Kind: string = "ValueModifier";

    /** Construction data for a {@link ValueModifier}. */
    export interface Data {
        /** Reason the value is disabled; `""` (or falsy) means enabled. */
        disabledReason: string;
        /** The base value before deltas (`null` to leave unset). */
        baseValue: number | null;
        /** Handler for a `CUSTOM` delta (`null` if unused). */
        customFunction: Function | null;
        /** The deltas applied on top of the base. */
        deltas: ValueDelta[];
    }

    /** Options for a {@link ValueModifier}. */
    export interface Options {
        /** The owning Logic (required; becomes {@link ValueModifier.parent}). */
        parent: SohlLogic;
    }
}
