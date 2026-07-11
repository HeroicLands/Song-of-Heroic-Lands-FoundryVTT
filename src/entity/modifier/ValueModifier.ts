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

import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { entity, registerEntity } from "@src/entity/entityRegistry";
import {
    maxPrecision,
    cloneInstance,
    defaultToJSON,
    escapeHTML,
} from "@src/utils/helpers";
import type { ValueDelta } from "@src/entity/modifier/ValueDelta";
// Side-effect import so ValueDelta self-registers — this base class reaches the
// registry by import, not the runtime global (see header note).
import "@src/entity/modifier/ValueDelta";
import { registerKind } from "@src/utils/kindRegistry";
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
import { SohlEntity } from "../SohlEntity";

/*
 * ── Construction indirection: base class (#83) ───────────────────────────────
 * Registered entity classes are constructed through the registry so a variant
 * module can override them:
 *   - Inside SoHL:            `import { entity }` then `new entity.X(...)`
 *   - Outside SoHL (macros):  `new sohl.entity.X(...)`
 *
 * ValueModifier is a BASE class of other registered classes (ImpactModifier,
 * MasteryLevelModifier), so it imports the registry from the cycle-free leaf
 * `@src/entity/entityRegistry` (never the `registry.ts` barrel, which eagerly
 * loads the subclass tree and would evaluate a subclass's `extends ValueModifier`
 * mid-load → `TypeError: Class extends value undefined`). The bare side-effect
 * import above guarantees ValueDelta self-registers so `entity.ValueDelta`
 * resolves even in a bare unit test. See the "Entity class registry" section of
 * docs/reference/runtime-contracts.md.
 * ────────────────────────────────────────────────────────────────────────────
 */

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
export class ValueModifier extends SohlEntity {
    private _shortcode!: string;
    private dirty: boolean;
    private _effective!: number;
    /** Reason the value is disabled; empty string means enabled. See {@link disabled}. */
    disabledReason!: string;
    /** The base value before deltas (undefined until set; treated as 0 by {@link base}). */
    baseValue?: number;
    /** Handler invoked by a `CUSTOM` delta to compute a value, when one is used. */
    customFunction?: Function;
    /** The list of {@link ValueDelta} modifiers applied on top of the base. */
    deltas!: ValueDelta[];

    /**
     * Construct an empty modifier owned by `parent` — shorthand for
     * `new ValueModifier({}, { parent })`.
     * @param parent - The owning {@link SohlLogic}.
     */
    constructor(parent: SohlLogic<any>);
    /**
     * Construct a modifier from initial state and apply it.
     * @param data - Data to construct the modifier.
     * @param options - Options to construct the modifier (carrying `parent`).
     */
    constructor(
        data: Partial<ValueModifier.Data>,
        options: Partial<ValueModifier.Options>,
    );
    /**
     * Implementation backing the constructor overloads: normalizes the
     * `(parent)` shorthand and requires a resolved parent.
     * @param dataOrParent - Initial state, or the owning parent Logic (shorthand).
     * @param options - Options to construct the modifier.
     * @throws If no `parent` resolves.
     */
    constructor(
        dataOrParent: SohlEntity.DataOrParent<ValueModifier.Data> = {},
        options: Partial<ValueModifier.Options> = {},
    ) {
        super(
            SohlEntity.dataOf<ValueModifier.Data>(dataOrParent),
            SohlEntity.optionsOf<ValueModifier.Options>(dataOrParent, options),
        );
        const data = SohlEntity.dataOf<ValueModifier.Data>(dataOrParent);
        this.disabledReason = data.disabledReason ?? "";
        this.baseValue = data.baseValue ?? undefined;
        this.customFunction = data.customFunction ?? undefined;
        this.deltas = data.deltas ?? [];
        this.dirty = true;
        this._apply();
    }

    /**
     * Serialize this modifier (base, deltas, disabled state) to a plain object.
     *
     * @returns The plain-object representation.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            disabledReason: this.disabledReason,
            baseValue: this.baseValue,
            deltas: this.deltas.map((d) => d.toJSON()),
            customFunction: defaultToJSON(this.customFunction),
        };
    }

    /**
     * Recompute the effective value and abbreviation from the base and
     * deltas, but only when {@link dirty}. Called lazily by the value getters.
     *
     * @internal
     */
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

    /**
     * Chainable form of the {@link disabled} setter.
     *
     * @param reason - A reason string, or a boolean (`true` applies a default
     *   reason; `false` clears it).
     * @returns `this`, for chaining.
     */
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
     * @param name - The delta's display name (a localization key).
     * @param shortcode - The delta's identity shortcode; a new delta replaces
     *   any existing one with the same shortcode.
     * @param value - The delta's value.
     * @param op - The operator to apply (defaults to `ADD`).
     * @param data - Extra delta data; supplies a fallback `shortcode` when one
     *   is not given.
     * @returns `this`, for chaining.
     * @throws TypeError if `op` is not a valid operator, or if `op` is `CUSTOM`
     *   but no custom function has been set on this modifier.
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
                        new entity.ValueDelta(
                            { name, shortcode, op, value },
                            { parent: this.parent },
                        ),
                    ];
                }
            }
        } else {
            this.deltas = this.deltas.filter((m) => m.shortcode !== shortcode);
            this.deltas.push(
                new entity.ValueDelta(
                    { name, shortcode, op, value },
                    { parent: this.parent },
                ),
            );
        }

        this.dirty = true;
        return this;
    }

    /**
     * Find the delta with the given shortcode.
     *
     * @param shortcode - The delta shortcode to look up.
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
     * @param shortcode - The delta shortcode to test for.
     * @returns `true` if a matching delta exists.
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
     * @param shortcode - The delta shortcode to remove.
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
     * @param args - The operator arguments, in either of the two forms above.
     * @returns The resolved `{ name, shortcode, value }` triple.
     * @throws Error if the two-argument `(shortcode, value)` form is given a
     *   shortcode that is not a registered `VALUE_DELTA_INFO` value.
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
    /** @inheritDoc */
    add(name: string, shortcode: string, value: number): this;
    /** @inheritDoc */
    add(...args: unknown[]): this {
        const { name, shortcode, value } = this._resolveDeltaArgs(args);
        return this._oper(name, shortcode, value, VALUE_DELTA_OPERATOR.ADD);
    }

    /**
     * Fold another modifier into this one, preserving the full auditable
     * derivation: every labeled delta from `other` (its name, shortcode,
     * operator, and value) is replayed onto this modifier, so the merged result
     * keeps each source justification in its tooltip and this modifier can then
     * layer its own deltas on top.
     *
     * Deltas are **additive** — `other`'s are appended to whatever this modifier
     * already carries (each replayed through the internal `_oper`, so
     * same-shortcode replacement and OVERRIDE semantics apply, and the clones
     * are re-parented to this modifier). The **base is not additive** — a
     * modifier has exactly
     * one base — so `other`'s base is adopted only when `includeBase` is set,
     * and it *replaces* any existing base rather than adding to it. Omit
     * `includeBase` to take `other`'s modifiers while keeping this modifier's
     * own base.
     *
     * @param other - The modifier to merge from.
     * @param options - Merge options.
     * @param options.includeBase - When set, replace this modifier's base with
     *   `other`'s base.
     * @returns `this`, for chaining.
     */
    addVM(
        other: ValueModifier,
        { includeBase }: { includeBase?: boolean } = {},
    ): ValueModifier {
        if (includeBase) this.base = other.base;
        for (const delta of other.deltas) {
            this._oper(delta.name, delta.shortcode, delta.value, delta.op);
        }
        return this;
    }

    /**
     * Add a multiplicative (`×value`) delta. Same argument forms as
     * {@link add}.
     *
     * @returns `this`, for chaining.
     */
    multiply(shortcode: ValueDeltaInfo, value: number): this;
    /** @inheritDoc */
    multiply(name: string, shortcode: string, value: number): this;
    /** @inheritDoc */
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
    /** @inheritDoc */
    set(name: string, shortcode: string, value: number): this;
    /** @inheritDoc */
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
    /** @inheritDoc */
    floor(name: string, shortcode: string, value: number): this;
    /** @inheritDoc */
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
    /** @inheritDoc */
    ceiling(name: string, shortcode: string, value: number): this;
    /** @inheritDoc */
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
        /**
         * Format a single delta's adjustment for display (e.g. `+2`, `×2`).
         *
         * @param delta - The delta to format.
         * @returns The formatted adjustment string.
         */
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
            <span class="adj-name">${escapeHTML(m.name)}</span>
            <span class="adj-value">${escapeHTML(getValue(m))}</span></div>`;
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
    /**
     * Registry key identifying this modifier kind for serialization. Typed as
     * `string` (not the literal) so subclasses can override it with their own
     * kind without breaking static-side inheritance.
     */
    export const Kind: string = "ValueModifier";

    /** Construction data for a {@link ValueModifier}. */
    export interface Data extends SohlEntity.Data {
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
    export interface Options extends SohlEntity.Options {}
}

registerKind(ValueModifier.Kind, ValueModifier);
registerEntity("ValueModifier", ValueModifier);
