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
import { KIND_KEY, isA } from "@src/utils/constants";
import { cloneInstance } from "@src/utils/helpers";

/**
 * Abstract base class for all SoHL domain entities — test/combat results
 * ({@link SuccessTestResult}, {@link AttackResult}, …), modifiers
 * ({@link ValueModifier}, …), strike modes, and dice. It establishes the shapes
 * and machinery every entity shares: a constructor-input
 * {@link SohlEntity.Data | Data} bag, an {@link SohlEntity.Options | Options} bag
 * carrying the owning `parent`, the `kind` discriminator, and the `toJSON` /
 * {@link clone} round-trip used by {@link defaultToJSON} / {@link defaultFromJSON}.
 *
 * Two invariants every subclass inherits:
 *
 * - **The `parent` Logic is required and transient.** The constructor throws
 *   without `options.parent`; `parent` is never serialized (it is not emitted by
 *   {@link toJSON}) and is re-supplied on revival. This is the "reference on the
 *   wire, live object in memory" rule — see the Entity serialization contract in
 *   the Runtime Contracts reference.
 * - **`Kind` identifies the concrete class for revival.** Each subclass
 *   overrides the static {@link SohlEntity.Kind | Kind} with a unique string and
 *   self-registers it (`registerKind(X.Kind, X)`); without that,
 *   {@link defaultFromJSON} leaves the serialized form as inert data instead of
 *   reviving the concrete class.
 */
export abstract class SohlEntity {
    /** The Logic that owns this entity. */
    private _parent: SohlLogic<any>;

    /**
     * The serialization discriminator for this instance — the concrete class's
     * static {@link SohlEntity.Kind | Kind}. Written into the JSON by
     * {@link toJSON} under the kind key and read back by {@link defaultFromJSON}
     * to select the constructor. Derived from the class, never stored per-instance.
     */
    get kind(): string {
        return (this.constructor as typeof SohlEntity).Kind;
    }

    /**
     * The Logic that owns this entity. Always present (the constructor rejects a
     * missing parent) and transient — it is not serialized and is re-supplied
     * when the entity is revived or {@link clone | cloned}.
     */
    get parent(): SohlLogic<any> {
        return this._parent;
    }

    /**
     * Serialize this instance to a plain object suitable for JSON serialization.
     *
     * @remarks
     * The base emits only the {@link kind} tag. A subclass that adds state
     * overrides this, chaining `...super.toJSON()`, and emits keys matching its
     * own `Data` interface in **persisted** form (a uuid/shortcode where the live
     * object holds a resolved reference). The governing rule: `toJSON()` output
     * must be valid `data` for the constructor. The transient {@link parent} is
     * deliberately **not** emitted — it is re-supplied on revival.
     * @returns A plain object representing this instance, consistent with the
     *   `Data` interface of the subclass.
     */
    toJSON(): PlainObject {
        const result: PlainObject = {
            [KIND_KEY]: this.kind,
        };
        return result;
    }

    /**
     * Deep-copy this entity, re-parenting the copy under `parent` with no other
     * changes. Shorthand for `clone({}, { parent })`.
     *
     * @param parent - The Logic to own the cloned entity.
     * @returns The cloned entity.
     */
    clone(parent: SohlLogic<any>): this;

    /**
     * Deep-copy this entity, optionally overriding fields and clone options.
     *
     * @param data - Field overrides applied to the clone.
     * @param options - Clone options (e.g. a new `parent`).
     * @returns The cloned entity.
     */
    clone(data: PlainObject, options: Partial<SohlEntity.Options>): this;

    /**
     * Deep-copy this entity, optionally overriding fields and clone options.
     * @param dataOrParent - Either a plain object of field overrides, or a new parent Logic.
     * @param options - Clone options (e.g. a new `parent`).
     * @returns The cloned entity.
     */
    clone(
        // `data` is an intentional tier-2 open bag (`PlainObject`): it carries
        // arbitrary subclass field overrides the base class cannot enumerate.
        // `options` is a known shape, so it is typed `Partial<SohlEntity.Options>`.
        dataOrParent: PlainObject | SohlLogic<any> = {},
        options: Partial<SohlEntity.Options> = {},
    ): this {
        let data: PlainObject;
        if (isA(dataOrParent, "SohlLogic")) {
            data = {};
            options = { ...options, parent: dataOrParent };
        } else {
            data = dataOrParent;
        }
        return cloneInstance<this>(this, data, options);
    }

    /**
     * Normalize the overloaded first constructor/`clone` argument to a **data**
     * bag: an empty object when it is a parent Logic (the `(parent)` shorthand),
     * otherwise the data object itself. Generic so a subclass recovers its own
     * `Data` type. Uses the {@link isA} symbol-brand guard, so a plain data bag
     * that merely carries a `parent` **key** is not mistaken for a Logic.
     *
     * @param dataOrParent - Either a data bag or a parent Logic.
     * @returns The data bag (`{}` in the shorthand form).
     */
    protected static dataOf<D extends SohlEntity.Data = SohlEntity.Data>(
        dataOrParent: SohlEntity.DataOrParent<D>,
    ): Partial<D> {
        return isA(dataOrParent, "SohlLogic") ?
                ({} as Partial<D>)
            :   (dataOrParent as Partial<D>);
    }

    /**
     * Normalize the overloaded constructor/`clone` arguments to an **options**
     * bag: when the first argument is a parent Logic (the `(parent)` shorthand),
     * inject it as `options.parent`; otherwise return `options` unchanged.
     * Generic so a subclass recovers its own `Options` type.
     *
     * @param dataOrParent - Either a data bag or a parent Logic.
     * @param options - The explicit options bag (empty in the shorthand form).
     * @returns The options bag, with `parent` injected in the shorthand form.
     */
    protected static optionsOf<
        O extends SohlEntity.Options = SohlEntity.Options,
    >(
        dataOrParent: SohlEntity.DataOrParent<SohlEntity.Data>,
        options: Partial<O>,
    ): Partial<O> {
        return isA(dataOrParent, "SohlLogic") ?
                ({ ...options, parent: dataOrParent } as Partial<O>)
            :   options;
    }

    /**
     * Construct an empty entity owned by `parent` — shorthand for
     * `new X({}, { parent })`. The second argument must be absent.
     * @param parent - The Logic that owns the entity.
     */
    constructor(parent: SohlLogic<any>);
    /**
     * Construct a new SohlEntity instance from persisted state. Subclasses call
     * `super(data, options)` first, then rehydrate their own fields from `data`.
     * @param data - Persisted state for the instance; every field is optional and
     *   defaulted (the base reads none of it — the `kind` tag is derived, not
     *   supplied). Subclasses interpret it per their own `Data` interface.
     * @param options - Construction options; `options.parent` (the owning Logic)
     *   is **required**.
     */
    constructor(
        data: Partial<SohlEntity.Data>,
        options: Partial<SohlEntity.Options>,
    );
    /**
     * Implementation backing the constructor overloads: normalizes the
     * `(parent)` shorthand and requires a resolved parent.
     * @param dataOrParent - Either persisted state, or the owning parent Logic
     *   (the `(parent)` shorthand).
     * @param options - Construction options; `options.parent` is **required** in
     *   the data form.
     * @throws Error if no `parent` resolves — every entity must have an owning Logic.
     */
    constructor(
        dataOrParent: SohlEntity.DataOrParent<SohlEntity.Data> = {},
        options: Partial<SohlEntity.Options> = {},
    ) {
        const opts = SohlEntity.optionsOf(dataOrParent, options);
        if (!opts.parent) {
            throw new Error("SohlEntity requires a parent");
        }
        this._parent = opts.parent;
    }
}

export namespace SohlEntity {
    /**
     * The overloaded first argument accepted by the {@link SohlEntity}
     * constructor (and {@link SohlEntity.clone | clone}): either a data bag of
     * type `D`, or a parent Logic (the `(parent)` shorthand). Subclasses pass
     * their own `Data` type as `D`.
     */
    export type DataOrParent<D extends SohlEntity.Data = SohlEntity.Data> =
        | Partial<D>
        | SohlLogic<any>;

    /**
     * Kind tag used by the kind registry and serialization. Typed as `string`
     * (not the `"SohlEntity"` literal) so subclasses can override it with their
     * own kind without breaking static-side inheritance.
     */
    export const Kind: string = "SohlEntity";

    /**
     * Construction/revival options shared by every {@link SohlEntity}, and the
     * base each subclass's own `Options` extends. Carries the transient owning
     * Logic — supplied at construction and again on revival, never serialized.
     */
    export interface Options {
        /**
         * The Logic that owns the entity. Required (the constructor throws
         * without it) and transient — held in memory, never written to JSON.
         */
        parent: SohlLogic<any>;
    }

    /**
     * The serialized shape shared by every {@link SohlEntity}, and the base each
     * subclass's own `Data` extends. An entity's `toJSON()` output is valid
     * `Data` for its constructor, so `new Ctor(x.toJSON(), { parent })`
     * reconstructs `x`.
     */
    export interface Data {
        /**
         * Discriminator kind, written on serialization ({@link SohlEntity.toJSON})
         * and read back on revival. Optional as constructor input — it is derived
         * from the concrete class, not supplied by callers.
         */
        [KIND_KEY]?: string;
    }
}
