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

import { SohlActor } from "@foundry/actor";
import { SohlItem } from "@foundry/item";
import { foundryHelpers } from "@utils";

import {
    SohlMap,
    DataField,
    DataFieldElement,
    RegisterClass,
    defaultToJSON,
    getStatic,
    SohlMetadata,
} from "@utils";
import { SohlPerformer, SohlEntity } from "@logic/common/core";

export const KIND_KEY: string = "__kind" as const;
export const SCHEMA_VERSION_KEY: string = "__schemaVer" as const;

/**
 * Represents the constructor type for any subclass of SohlBase.
 */
export type AnySohlBaseConstructor = SohlBaseConstructor<SohlBase<any>>;

export interface SohlBaseParent {
    parent: unknown;
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
 * @template P - The type of the parent.
 */
@RegisterClass("SohlBase", "0.6.0")
export abstract class SohlBase<P extends SohlBaseParent = any> {
    readonly parent: P;

    @DataField("fieldName", { type: String })
    readonly fieldName?: string;

    @DataField("collectionKey", { type: String })
    readonly collectionKey?: string;

    @DataField("kind", {
        type: String,
        initial: (thisArg: SohlBase) => {
            (thisArg.constructor as AnySohlBaseConstructor)._metadata.name;
        },
    })
    readonly kind!: string;

    @DataField("schemaVersion", {
        type: String,
        initial: "0.0.0",
    })
    readonly schemaVersion!: string;

    constructor(parent: P, data: PlainObject = {}, options: PlainObject = {}) {
        this.parent = parent;
        if (this.schemaVersion !== data.schemaVersion) {
            data = SohlBase._migrateData(data);
        }
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
                const obj = defaultToJSON(current) as unknown;
                if (obj && typeof obj === "object") {
                    foundryHelpers.mergeObject(result, obj as PlainObject);
                }
                return result;
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
    protected static _migrateData(data: PlainObject = {}): PlainObject {
        const result: PlainObject = {};
        const metadata = getStatic(this, "_metadata") as SohlMetadata;

        /*
         * Final clean up of the data object, removing any
         * properties that are not in the schema, and adding
         * any properties that are missing with their default values.
         */

        // Create a default template based on the current schema,
        // migrating existing fields and initializing new ones.
        for (const [key, value] of Object.entries(metadata.dataFields)) {
            const prop = value as DataFieldElement;
            if (data[prop.dataName] !== undefined) {
                if (
                    prop.dataName === KIND_KEY ||
                    prop.dataName === SCHEMA_VERSION_KEY
                ) {
                    // Skip the kind and schemaVersion properties
                    continue;
                }
                // Migrate the data field to the new schema version
                result[prop.dataName] = this._migrateDataField(
                    data[prop.dataName],
                    prop.dataName,
                    String(prop.propName),
                    data.schemaVersion,
                );
            } else {
                result[prop.dataName] =
                    typeof prop.initial === "function" ?
                        prop.initial({
                            thisArg: this,
                            fieldName: prop.propName,
                        })
                    :   prop.initial;
            }
        }

        // After migration, the data object should always have
        // the kind and schemaVersion properties set to the
        // current schema version.
        result[KIND_KEY] = metadata.name;
        result[SCHEMA_VERSION_KEY] = metadata.schemaVersion;

        return result;
    }

    /**
     * @summary Simple migration of a single data field.
     *
     * @description
     * This method is used to migrate a single data field from one schema version
     * to another.
     * @remarks
     * This method must handle the following cases:
     *
     * - Migrating from an old schema to a new schema.
     * - Synthesizing a new value from one or more old values.
     * - Returning the same value if the data field is unchanged.
     *
     * This method is only called if the data field exists in both the old schema
     * and the new schema, so it should always return a valid value for the new
     * schema, even if it must synthesize it from other values in the old schema.
     *
     * @param data         The original data to be migrated.
     * @param dataName     The name of the property in the original data.
     * @param keyName      The name of the property in the new object.
     * @param dataVersion  The version of the original data.
     * @returns            The new value of the data field.
     */
    protected static _migrateDataField<T>(
        data: PlainObject,
        dataName: string,
        keyName: string,
        dataVersion: string,
    ): any {
        return data[dataName] as T;
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
        const newObj = foundryHelpers.mergeObject(
            original,
            data,
        ) as PlainObject;
        return new (this.constructor as AnySohlBaseConstructor)(
            this.parent,
            newObj,
            options,
        ) as InstanceType<T>;
    }
}
