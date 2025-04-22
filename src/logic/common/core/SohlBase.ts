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

import {
    deepMerge,
    defaultToJSON,
    deletePath,
    getPathValue,
    getStatic,
    hasPath,
    setPathValue,
    SohlMap,
    SohlMetadata,
} from "@utils";
import { DataField, DataFieldElement, RegisterClass } from "@utils/decorators";

export const KIND_KEY: string = "__kind" as const;
export const SCHEMA_VERSION_KEY: string = "__schemaVer" as const;

/**
 * Represents the constructor type for any subclass of SohlBase.
 */
export type AnySohlBaseConstructor = SohlBaseConstructor<SohlBase<any>>;

export interface SohlBaseParent {
    propertyPath: string;
    onChange(data: PlainObject): void;
    markForPersistence(
        fieldName: string,
        collectionKey?: string | number,
    ): void;
}

/**
 * Represents the constructor type for SohlBase and its subclasses.
 * This is used to define the structure of constructors for all subclasses.
 */
export interface SohlBaseConstructor<T extends SohlBase<any>> extends Function {
    readonly _metadata: SohlMetadata;

    new (parent: SohlBaseParent, data: PlainObject, options: PlainObject): T;

    toJSON(): PlainObject;

    clone<T>(data: PlainObject, options: PlainObject): T;

    migrateData(data: PlainObject): PlainObject;
}

/**
 * @summary Represents any subclass of SohlBase.
 */
export type AnySohlBase = InstanceType<AnySohlBaseConstructor>;

/**
 * @summary Represents a map of SohlBase subclass instances, keyed by a string.
 */
export type SohlBaseMap = SohlMap<string, AnySohlBase>;

/**
 * @summary Base class for all SoHL related logic.
 * @remarks
 * The SohlBase class serves as the foundational class for all
 * Sohl-related logic in the system. It provides a common
 * methods for serialization, deserialization, and dynamic subclass
 * registration. It provides a foundation for all Sohl-related
 * logic and ensures extensibility through a centralized registry.
 *
 * @template D - The type of the data structure for the class.
 * @template O - The type of the options that can be passed to the class.
 */
@RegisterClass("SohlBase", "0.6.0")
export abstract class SohlBase<P extends SohlBaseParent = any> {
    @DataField("parent", {
        type: Function,
        required: true,
        transient: true,
    })
    parent!: P;

    @DataField("fieldName", { type: String })
    fieldName?: string;

    @DataField("collectionKey", { type: String })
    collectionKey?: string;

    @DataField("kind", {
        type: String,
        initial: (thisArg: SohlBase) => {
            (thisArg.constructor as AnySohlBaseConstructor)._metadata.name;
        },
    })
    kind!: string;

    @DataField("schemaVersion", {
        type: String,
        initial: "0.0.0",
    })
    schemaVersion!: string;

    constructor(
        parent: SohlBaseParent,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {}

    get propertyPath(): string {
        return `${this.parent.propertyPath}.${this.fieldName}`;
    }

    onChange(data: PlainObject): void {
        if (!this.fieldName) return;
        const newData = deepMerge(this.toJSON(), data);
        this.parent.onChange({ [this.fieldName]: newData });
    }

    setTracking(
        parent: any,
        fieldName: string,
        collectionKey?: string | number,
    ): void {
        this.parent = parent;
        this.fieldName = fieldName;
        if (collectionKey) {
            this.collectionKey = String(collectionKey);
        }
    }

    markForPersistence(
        fieldName: string,
        collectionKey?: string | number,
    ): void {
        // e.g., queue a change, or immediately sync
        this.parent?.markForPersistence(fieldName, collectionKey);
    }

    /**
     * Converts the current instance to a plain object suitable for JSON serialization.
     * This method is generic and ensures type safety for the data being converted.
     *
     * @returns A plain object that can be JSON stringified.
     */
    toJSON(): PlainObject {
        const result: PlainObject = {};
        const visited = new Set<string>();
        const ctor = this.constructor as AnySohlBaseConstructor;
        result[KIND_KEY] = ctor._metadata.name;
        visited.add(KIND_KEY);
        result[SCHEMA_VERSION_KEY] = ctor._metadata.schemaVersion;
        visited.add(SCHEMA_VERSION_KEY);
        let current: any = this;
        while (current && current !== Object.prototype) {
            const metadata = (this.constructor as AnySohlBaseConstructor)
                ._metadata;
            // The class is not registered, so we simply generically
            // serialize the object.
            // This is useful for classes that are not part of the SoHL system.
            if (!metadata) {
                return deepMerge(result, defaultToJSON(current));
            }

            // If the class is registered, we use the registered serializer
            for (const ele of Object.values(metadata.dataFields)) {
                const prop = ele as DataFieldElement;
                if (!prop?.serializer) continue;

                // Avoid circular references by checking if the property
                // has already been visited.
                if (visited.has(prop.dataName)) continue;
                visited.add(prop.dataName);

                const value = prop.serializer(current[prop.propName], this);
                if (value !== undefined) {
                    result[prop.dataName] = value;
                }
            }
            current = Object.getPrototypeOf(current);
        }
        return result;
    }

    /**
     * @summary Migrate a data object to the current schema version.
     *
     * @description
     * This method is used to migrate a data object to the current schema version.
     * It removes any properties that are not in the schema and adds any properties
     * that are missing with their default values.
     *
     * @remarks
     * This method should be extended by subclasses to handle any
     * specific migration logic for different versions of the schema.
     *
     * This method must be idempoent when called on a data object that has already
     * been migrated. This means that calling this method multiple times on the same
     * data object should not change the result.
     */
    @DataField("migrateData", {
        type: Function,
        required: true,
    })
    static migrateData(data: PlainObject = {}): PlainObject {
        const result: PlainObject = {};
        const metadata = getStatic(this, "_metadata") as SohlMetadata;

        /*
         * Final clean up of the data object, removing any
         * properties that are not in the schema, and adding
         * any properties that are missing with their default values.
         */

        // Create a default template based on the schema
        for (const [key, value] of Object.entries(metadata.dataFields)) {
            const prop = value as DataFieldElement;
            result[prop.dataName] =
                typeof prop.initial === "function" ?
                    prop.initial({ thisArg: this, fieldName: prop.propName })
                :   prop.initial;
        }

        // Merge the data object, ignoring any properties that are not
        // in the template.
        deepMerge(result, data, {
            insertKeys: false,
            insertValues: false,
            overwrite: true,
            enforceTypes: true,
        });

        return result;
    }

    /**
     * @summary Simple migration of a data field from an old key to a new key.
     *
     * @remarks
     * If the new key does not exist and the old key does, it sets the value
     * from the old key to the new key.
     * If an apply function is provided, it will be used to modify the value before setting.
     *
     * @param data         The object containing the data to migrate.
     * @param oldKey       The property key to be migrated from.
     * @param newKey       The property key to be migrated to.
     * @param apply        An optional function to transform the value during migration.
     * @returns            `true` if migration performed successfully, `false` otherwise.
     */
    static _migrateDataField(
        data: PlainObject,
        oldKey: string,
        newKey: string,
        apply: (data: PlainObject) => any,
    ): boolean {
        if (!hasPath(data, newKey) && hasPath(data, oldKey)) {
            const prop = Object.getOwnPropertyDescriptor(data, oldKey);
            if (prop && !prop.writable) return false;
            setPathValue(
                data,
                newKey,
                apply ? apply(data) : getPathValue(data, oldKey),
            );
            deletePath(data, oldKey);
            return true;
        }
        return false;
    }

    /**
     * Creates a deep copy of the instance of the subclass wholly independent
     * of the instance it is invoked on.
     *
     * @returns A new instance of the subclass.
     */
    clone<T extends AnySohlBaseConstructor>(
        data: PlainObject = {},
        options: PlainObject = {},
    ): InstanceType<T> {
        const original = this.toJSON() as PlainObject;
        const newObj = sohl.utils.deepMerge(original, data) as PlainObject;
        return new (this.constructor as AnySohlBaseConstructor)(
            this.parent,
            newObj,
            options,
        ) as InstanceType<T>;
    }
}
