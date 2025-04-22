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

import { AnySohlBaseConstructor } from "@logic/common/core";

/**
 * @summary Marks the version where the schema was last modified.
 *
 * @remarks
 * This decorator is used to register the schema version of a class in the
 * class registry. It is important for tracking changes in the data schema
 * and ensuring compatibility with different versions of the system.
 */

export function RegisterClass(
    name: string,
    schemaVersion: string,
): ClassDecorator {
    if (typeof name !== "string") {
        throw new TypeError("name is required and must be a string");
    }
    if (typeof schemaVersion !== "string") {
        throw new TypeError("schemaVersion is required and must be a string");
    }
    return function (target: Function) {
        const ctor = target as AnySohlBaseConstructor;

        // Register class name and schema version
        const element = sohl.classRegistry.get(ctor.name);
        element.name = name;
        element.schemaVersion = schemaVersion;
        element.ctor = ctor;
        sohl.classRegistry.set(element);

        // Set the metadata on the class constructor
        ctor._metadata.name = name;
        ctor._metadata.schemaVersion = schemaVersion;
    };
}

/**
 * @summary Replacement for `instanceof` for use with dynamic subclass registration.
 *
 * @description
 * This method checks if the current instance or any of its ancestors
 * in its inheritance chain has the specified kind. It is a more flexible
 * alternative to `instanceof`, even working across mixins and other mechanisms
 * where the prototype chain may not be straightforward.
 *
 * @remarks
 * This function only works for classes that have been registered with the
 * `@RegisterClass` decorator. Note that this will return false if it encounters
 * any constructor that does not have the `_metadata` property before it finds
 * the class it is looking for.
 *
 * @param kind - The name of the class to match against.
 * @returns True if this object or any of its ancestors are of the specified class.
 * @example
 * ```ts
 * @RegisterClass({ name: "ParentClass" })
 * class ParentClass {}
 *
 * @RegisterClass({ name: "MyClass" })
 * class MyClass extends MyClass {}
 *
 * const obj = new MyClass();
 * console.log(obj.isKind("ParentClass")); // true
 * console.log(obj.isKind("MyClass")); // true
 * console.log(obj.isKind("NonExistentClass")); // false
 * ```
 */
export function isKind(obj: any, kind: string): boolean {
    if (obj === null) {
        return kind === "Null";
    }
    const objType = typeof obj;
    if (obj === undefined) {
        return kind === "Undefined";
    }
    if (objType === "undefined" && kind === "String") return true;
    if ((objType === "string" || obj instanceof String) && kind === "String")
        return true;
    if ((objType === "boolean" || obj instanceof Boolean) && kind === "Boolean")
        return true;
    if ((objType === "number" || obj instanceof Number) && kind === "Number")
        return true;
    if ((objType === "bigint" || obj instanceof BigInt) && kind === "BigInt")
        return true;
    if (objType !== "object") return false;
    let current: any = obj.constructor;
    while (current && typeof current === "function") {
        if (!current._metadata) return false;
        if (current._metadata.name === kind) return true;
        current = Object.getPrototypeOf(current);
    }
    return false;
}
