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
 * Base class for all SoHL domain entities (results, modifiers, rolls). Provides
 * a `kind` property for serialization and deserialization via
 * {@link defaultToJSON} / {@link defaultFromJSON}.
 *
 * Subclasses must override the static `Kind` property with a unique string.
 */
export abstract class SohlEntity {
    /** The Logic that owns this entity. */
    private _parent: SohlLogic<any>;

    /**
     * The "kind" tag used to serialize this class to JSON. Subclasses must
     * override this with a unique string.
     */
    get kind(): string {
        return (this.constructor as typeof SohlEntity).Kind;
    }

    /**
     * The Logic that owns this entity.
     */
    get parent(): SohlLogic<any> {
        return this._parent;
    }

    /**
     * Serialize this instance to a plain object suitable for JSON serialization.
     *
     * @remarks
     * Subclasses should override this method. This method should generate an
     * object consistent with the `Data` interface of the subclass, which represents
     * the serializable state of the instance.
     * @returns A plain object representing this instance, consistent with the
     * `Data` interface of the subclass.
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
     * Construct a new SohlEntity instance. Subclasses should call `super(data, options)` in their constructors.
     * @param data - The data to initialize the instance with.
     * @param options - Optional options, including a `parent` reference.
     */
    constructor(
        data: Partial<SohlEntity.Data> = {},
        options: Partial<SohlEntity.Options> = {},
    ) {
        if (!options.parent) {
            throw new Error("SohlEntity requires a parent");
        }
        this._parent = options.parent;
    }
}

export namespace SohlEntity {
    /**
     * Kind tag used by the kind registry and serialization. Typed as `string`
     * (not the `"SohlEntity"` literal) so subclasses can override it with their
     * own kind without breaking static-side inheritance.
     */
    export const Kind: string = "SohlEntity";

    export interface Options {
        parent: SohlLogic<any>;
    }

    export interface Data {
        /**
         * Discriminator kind, written on serialization ({@link SohlEntity.toJSON})
         * and read back on revival. Optional as constructor input — it is derived
         * from the concrete class, not supplied by callers.
         */
        [KIND_KEY]?: string;
    }
}
