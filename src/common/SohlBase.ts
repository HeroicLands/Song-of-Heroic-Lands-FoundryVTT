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

import { defaultFromJSON, SohlClassRegistry } from "@utils";
import { defaultToJSON } from "@utils";
import { SohlActor } from "./actor";
import { SohlPerformer } from "@common";
import { SohlItem } from "./item";
const { ArrayField, ObjectField } = foundry.data.fields;

/**
 * @summary Base class for all SoHL related logic.
 * @remarks
 * The SohlBase class serves as the foundational class for all
 * Sohl-related logic in the system. It provides a common
 * methods for serialization, deserialization, and dynamic subclass
 * registration. It provides a foundation for all Sohl-related
 * logic and ensures extensibility through a centralized registry.
 *
 * @template P - The type of the parent.
 */
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
        result[SohlBase.KIND_KEY] = (this.constructor as any)._metadata.kind;

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
        const kind = data[SohlBase.KIND_KEY];

        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        // Convert the data (which may be in JSON normalized form)
        // back to the original form, dropping the kind key.
        const newData: PlainObject = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === SohlBase.KIND_KEY) continue;
            newData[key] = defaultFromJSON(value);
        }

        return sohl.classRegistry.create(
            kind,
            newData,
            options,
        ) as InstanceType<T>;
    }

    /**
     * Creates a deep copy of the instance of the subclass wholly independent
     * of the instance it is invoked on.
     *
     * @returns A new instance of the subclass.
     */
    clone<T extends SohlBase.Any>(
        data: PlainObject = {},
        options: PlainObject = {},
    ): InstanceType<T> {
        const original = this.toJSON() as PlainObject;
        const newObj = fvtt.utils.mergeObject(original, data) as PlainObject;
        return new (this.constructor as SohlBase.Any)(
            newObj,
            options,
        ) as InstanceType<T>;
    }
}

export namespace SohlBase {
    export const KIND_KEY: string = "__kind" as const;
    export const SCHEMA_VERSION_KEY: string = "__schemaVer" as const;

    /**
     * Represents the constructor type for any subclass of SohlBase.
     */
    export type Any = Constructor<SohlBase>;
}
