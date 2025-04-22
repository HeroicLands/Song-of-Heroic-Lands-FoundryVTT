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
    AnySohlBaseConstructor,
    KIND_KEY,
    SCHEMA_VERSION_KEY,
    SohlBase,
    SohlBaseParent,
} from "@logic/common/core";
import { DataFieldElement } from "@utils/decorators";

/**
 * @summary Class metadata for a registered class.
 *
 * @description
 * The `SohlMetadata` interface defines the structure of metadata associated with a class
 * registered in the SoHL class registry.
 *
 * @remarks
 * This metadata is stored in the central class registry as well as on the class itself.
 * Objects should normally access the metadata stored locally, but the class registry
 * is used to access the metadata of classes that are not loaded yet.
 *
 * Much of the information in this metadata is used for serialization and deserialization,
 * as well as identification of the class. This information may not survive compilation,
 * minification, and bundling, so it is important to store the information in the metadata
 * so it is available at runtime.
 */
export interface SohlMetadata {
    name: string;
    schemaVersion: string;
    dataFields: StrictObject<DataFieldElement>;
}

/**
 * @summary Class registry element for a registered class.
 *
 * @description
 * The `SohlClassRegistryElement` class represents the metadata of a registered class
 * in the SoHL class registry. It contains information about the class name, schema version,
 * data fields, and the constructor of the class.
 *
 * @remarks
 * This class is used to store the metadata of a class in the class registry. The critical
 * extension of this beyond the `SohlMetadata` interface is the `ctor` property, which
 * stores the constructor of the class. This allows the class registry to create instances
 * of the class when needed.
 */
export class SohlClassRegistryElement implements SohlMetadata {
    name: string;
    schemaVersion: string;
    dataFields: StrictObject<DataFieldElement>;
    ctor?: AnySohlBaseConstructor;

    constructor(
        name: string,
        ctor?: AnySohlBaseConstructor,
        schemaVersion?: string,
        dataFields?: StrictObject<DataFieldElement>,
    ) {
        if (!name) {
            throw new Error("Class name cannot be empty");
        }
        this.name = name;
        this.ctor = ctor;
        this.schemaVersion = schemaVersion ?? "0.0.0";
        this.dataFields = dataFields ?? ({} as StrictObject<DataFieldElement>);
    }

    create(
        parent: SohlBaseParent,
        data: PlainObject = {},
        options: PlainObject = {},
    ): SohlBase {
        if (!this.ctor) {
            throw new Error(`Class ${this.name} is not registered`);
        }
        return new this.ctor(parent, data, options);
    }

    /**
     * @summary Walks up the prototype chain to find the highest schema version.
     */
    get highestSchemaVersion(): string {
        let result = this.schemaVersion;
        let proto = Object.getPrototypeOf(this.constructor);
        while (proto) {
            if (!proto || proto === Object) {
                break;
            }
            const element = sohl.classRegistry.get(proto.name);
            if (
                element &&
                element.schemaVersion &&
                sohl.utils.isNewerVersion(element.schemaVersion, result)
            ) {
                result = element.schemaVersion;
                break;
            }
        }
        return result;
    }
}

export class SohlClassRegistry {
    private static instance: SohlClassRegistry;
    private classRegistry: StrictObject<SohlClassRegistryElement> = {};

    private constructor() {}

    static getInstance(): SohlClassRegistry {
        if (!SohlClassRegistry.instance) {
            SohlClassRegistry.instance = new SohlClassRegistry();
        }
        return SohlClassRegistry.instance;
    }

    /**
     *
     * @param name
     * @returns
     */
    get(name: string): SohlClassRegistryElement {
        if (!name) {
            throw new Error("Class name cannot be empty");
        }
        return this.classRegistry[name] ?? new SohlClassRegistryElement(name);
    }

    set(element: SohlClassRegistryElement): void {
        if (!element) {
            throw new Error("Element cannot be empty");
        } else {
            this.classRegistry[element.name] = element;
        }
    }

    has(name: string): boolean {
        return Object.hasOwn(this.classRegistry, name);
    }

    delete(name: string): void {
        if (!name) {
            throw new Error("Class name cannot be empty");
        }
        delete this.classRegistry[name];
    }

    /**
     * @summary Create a new SohlBase instance from registered metadata.
     */
    createFromData(
        parent: SohlBaseParent,
        data: PlainObject = {},
        options: PlainObject = {},
    ): SohlBase {
        if (!data) {
            throw new TypeError("Data cannot be empty");
        }
        if (typeof data !== "object") {
            throw new TypeError("Data must be an object");
        }
        if (!Object.hasOwn(data, KIND_KEY) || !data.kind) {
            throw new TypeError(
                `Missing or invalid ${KIND_KEY} key in SohlBaseData.`,
            );
        }
        if (!Object.hasOwn(data, SCHEMA_VERSION_KEY) || !data.schemaVersion) {
            throw new TypeError(
                `Missing or invalid ${SCHEMA_VERSION_KEY} key in SohlBaseData.`,
            );
        }
        const classInfo = this.get(data[KIND_KEY]);
        if (!classInfo?.ctor) {
            throw new Error(
                `Class '${data[KIND_KEY]}' is not registered in SohlBaseRegistry.`,
            );
        }
        if (
            sohl.utils.isNewerVersion(
                classInfo.schemaVersion,
                data.schemaVersion,
            )
        ) {
            // If the class has a migration function, call it
            // to migrate the data to the latest version.
            data = classInfo.ctor?.migrateData?.(data);
        }

        return classInfo.create(parent, data, options);
    }
}
