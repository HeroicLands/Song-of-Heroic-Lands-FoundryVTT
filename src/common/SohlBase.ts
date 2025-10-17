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

import { SohlMap } from "@utils/collection/SohlMap";
import { KIND_KEY } from "@utils/constants";
import { defaultFromJSON, defaultToJSON } from "@utils/helpers";

export abstract class SohlBase {
    constructor(data: PlainObject = {}, options: PlainObject = {}) {}

    /**
     * Converts the current instance to a plain object suitable for JSON serialization.
     * This method is generic and ensures type safety for the data being converted.
     *
     * @returns A plain object that can be JSON stringified.
     */
    toJSON(): PlainObject {
        const result: PlainObject = {};
        result[KIND_KEY] = (this.constructor as any).kind;

        for (const key of Object.keys(this)) {
            const value = (this as any)[key];

            // Skip prototype methods (but allow arrow functions as properties)
            if (typeof value === "function") {
                const descriptor = Object.getOwnPropertyDescriptor(this, key);
                if (!descriptor || typeof descriptor.value !== "function")
                    continue;
            }

            result[key] = defaultToJSON(value);
        }

        return result;
    }

    static fromJSON<T extends SohlBase.Any>(
        data: any,
        options: PlainObject = {},
    ): InstanceType<T> {
        const kind = data[KIND_KEY];

        if (!kind) {
            throw new Error(
                `Data does not contain a "${KIND_KEY}" key: ${JSON.stringify(
                    data,
                )}`,
            );
        }

        let clazz: Constructor<SohlBase> | undefined;
        for (const docType of ["Result", "Modifier"]) {
            clazz = sohl.CONFIG[docType].classes[kind];
            if (clazz) break;
        }
        if (!clazz) {
            throw new Error(
                `No data model found for kind "${kind}" in sohl.CONFIG`,
            );
        }

        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        // Convert the data (which may be in JSON normalized form)
        // back to the original form, dropping the kind key.
        const newData: PlainObject = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === KIND_KEY) continue;
            // Remove leading underscore if present
            const nkey = key.startsWith("_") ? key.substring(1) : key;
            newData[nkey] = defaultFromJSON(value);
        }

        return new clazz(newData, options) as InstanceType<T>;
    }

    /**
     * Creates a deep copy of the instance of the subclass wholly independent
     * of the instance it is invoked on.
     *
     * @returns A new instance of the subclass.
     */
    clone<T extends abstract new (...args: any) => any>(
        data: PlainObject = {},
        options: PlainObject = {},
    ): InstanceType<T> {
        const original = this.toJSON() as PlainObject;
        const newObj = foundry.utils.mergeObject(original, data) as PlainObject;
        return new (this.constructor as any)(
            newObj,
            options,
        ) as InstanceType<T>;
    }
}

export namespace SohlBase {
    export const Kind: string = "SohlBase";

    /**
     * Represents the constructor type for any subclass of SohlBase.
     */
    export type Any = Constructor<SohlBase>;
}
