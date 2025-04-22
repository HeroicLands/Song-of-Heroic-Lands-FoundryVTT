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

import { SohlMap } from "@utils";
/**
 * @summary Constant character symbols used throughout the system.
 */
export const SYMBOLS: StrictObject<string> = {
    TIMES: String.fromCharCode(0x00d7),
    GREATERTHANOREQUAL: String.fromCodePoint(0x2265),
    LESSTHANOREQUAL: String.fromCodePoint(0x2264),
    INFINITY: String.fromCodePoint(0x221e),
    STARF: String.fromCharCode(0x2605),
    STAR: String.fromCharCode(0x2606),
};

/**
 * @summary Creates a deep copy of any supported value.
 * @remarks Non-plain objects are skipped unless strict mode is enabled.
 * @param value - The value to clone.
 * @param options - Options for cloning.
 * @param options.strict - If true, throws an error for non-plain objects.
 * @returns A deep clone of the value.
 * @throws Error if strict mode is enabled and a non-plain object is encountered.
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const clone = cloneDeep(original);
 * console.log(clone); // { a: 1, b: { c: 2 } }
 */
export function cloneDeep<T>(value: T, options: PlainObject = {}): T {
    let strict = options.strict ?? false;

    const visited = new WeakMap();
    const clone = (val: any): any => {
        if (val === null || typeof val !== "object") return val;
        if (val instanceof Date) return new Date(val);
        if (Array.isArray(val)) return val.map(clone);
        if (val.constructor !== Object) {
            if (strict) throw new Error("Cannot clone non-plain objects");
            return val;
        }
        if (visited.has(val)) return visited.get(val);
        const result: any = {};
        visited.set(val, result);
        Object.entries(val).forEach(([k, v]) => {
            result[k] = clone(v);
        });
        return result;
    };
    return clone(value);
}

/**
 * @summary Compares two values for deep structural equality.
 * @remarks
 * This function uses a stack to handle circular references and nested objects.
 * It checks for strict equality first, then compares types and properties.
 * If the values are objects, it recursively checks their properties.
 * It returns false if any property is not equal or if the objects have different keys.
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns True if the values are deeply equal, false otherwise.
 * @example
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { a: 1, b: { c: 2 } };
 * console.log(isEqualDeep(obj1, obj2)); // true
 * const obj3 = { a: 1, b: { c: 3 } };
 * console.log(isEqualDeep(obj1, obj3)); // false
 */
export function isEqualDeep(a: any, b: any): boolean {
    const stack = [[a, b]];
    while (stack.length) {
        const [x, y] = stack.pop()!;
        if (x === y) continue;
        if (typeof x !== typeof y || x === null || y === null) return false;
        if (typeof x !== "object") return false;
        const xKeys = Object.keys(x);
        const yKeys = Object.keys(y);
        if (xKeys.length !== yKeys.length) return false;
        for (const key of xKeys) {
            if (!y.hasOwnProperty(key)) return false;
            stack.push([x[key], y[key]]);
        }
    }
    return true;
}

/**
 * @summary Checks if a function is a subclass of another.
 * @remarks
 * This function checks if the prototype chain of the first class includes
 * the second class. It does not check for instances or static methods.
 * @param cls - The class to check.
 * @param parent - The parent class to check against.
 * @returns True if cls is derived from parent, false otherwise.
 * @example
 * class A {}
 * class B extends A {}
 * console.log(isClassDerived(B, A)); // true
 * console.log(isClassDerived(A, B)); // false
 */
export function isClassDerived(cls: unknown, parent: Function): boolean {
    if (typeof cls !== "function") return false;
    let current = Object.getPrototypeOf(cls);
    while (current) {
        if (current === parent) return true;
        current = Object.getPrototypeOf(current);
    }
    return false;
}

/**
 * @summary Finds the class constructor that defines a specific property.
 * @remarks
 * This function traverses the prototype chain of the target object or class
 * to find the first class that defines the specified property. It returns
 * the constructor of that class or undefined if not found.
 * @param target - The object or class to search.
 * @param property - The property to search for.
 * @returns The constructor of the class that defines the property, or undefined.
 * @example
 * class A { prop = 1; }
 * class B extends A {}
 * console.log(findDefiningClass(B, "prop")); // A
 * console.log(findDefiningClass(B, "nonExistent")); // undefined
 * @example
 * class A { foo() {} }
 * class B extends A {}
 * const b = new B();
 * console.log(findDefiningClass(b, "foo")); // A
 * console.log(findDefiningClass(b, "bar")); // undefined
 */
export function findDefiningClass(
    target: object | Function,
    property: string,
): Function | undefined {
    let proto =
        typeof target === "function" ?
            target.prototype
        :   Object.getPrototypeOf(target);
    while (proto && proto !== Object.prototype) {
        if (Object.prototype.hasOwnProperty.call(proto, property)) {
            return proto.constructor;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return undefined;
}

/**
 * @summary Determine the internal type of a value.
 * @param value - Any value.
 * @returns A string name of its type.
 */
export function getValueType(value: unknown): string {
    if (value === null) return "null";
    if (Array.isArray(value)) return "Array";
    if (value instanceof Map) return "Map";
    if (value instanceof Set) return "Set";
    if (value instanceof Date) return "Date";
    return typeof value;
}

const _IDCACHE = new Set<string>();

/**
 * @summary Generates a unique 16-character alphanumeric identifier.
 * @remarks
 * This function caches generated IDs to ensure uniqueness.
 * If a duplicate is found, it generates a new ID until a unique one is created.
 * @returns A unique alphanumeric identifier.
 * @example
 * const id1 = createUniqueId();
 * const id2 = createUniqueId();
 * console.log(id1 !== id2); // true
 */
export function createUniqueId(): string {
    const base62 = [
        ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    ];
    const generate = (): string =>
        Array.from(
            { length: 16 },
            () => base62[Math.floor(sohl.game.twist.random() * base62.length)],
        ).join("");
    let id = generate();
    while (_IDCACHE.has(id)) id = generate();
    _IDCACHE.add(id);
    return id;
}

/**
 * @summary Tracks whether an ID has already been seen.
 *
 * @remarks
 * This function is useful for detecting and optionally recording duplicate IDs.
 * If the ID is already in the internal cache, it returns `true`. Otherwise, it
 * returns `false` and, if the `save` option is enabled, stores the ID.
 *
 * @param id - The string ID to check and potentially store.
 * @param options - Optional settings for caching behavior.
 * @param options.save - Whether to save the ID if it's not already present. Defaults to `true`.
 * @returns `true` if the ID has already been cached; otherwise `false`.
 */
export function inIdCache(id: string, options: PlainObject = {}): boolean {
    let save = options.save ?? true;

    if (_IDCACHE.has(id)) return true;
    if (save) _IDCACHE.add(id);
    return false;
}

/**
 * @summary Encodes each segment of a URL path.
 * @remarks
 * This function encodes each segment of the path using encodeURIComponent,
 * replacing single quotes with %27 to ensure safe URL encoding.
 * It does not encode slashes, allowing for proper path structure.
 * @param path - The URL path to encode.
 * @returns The encoded path.
 * @example
 * const encodedPath = encodePath("/foo bar/baz");
 * console.log(encodedPath); // "/foo%20bar/baz"
 * const encodedPath2 = encodePath("path/with?query");
 * console.log(encodedPath2); // "path/with%3Fquery"
 */
export function encodePath(path: string): string {
    return path
        .split("/")
        .map((p) => encodeURIComponent(p).replace(/'/g, "%27"))
        .join("/");
}

/**
 * @summary Expands a flattened object with dot-separated keys into a nested structure.
 * @remarks
 * This function takes a flat object with keys in the format "a.b.c" and
 * converts it into a nested object structure. It uses setPathValue to
 * assign values to the appropriate nested properties.
 * @param flat - The flat object to expand.
 * @returns The expanded nested object.
 * @example
 * const flat = { "a.b": 1, "a.c": 2 };
 * const nested = unflattenObject(flat);
 * console.log(nested); // { a: { b: 1, c: 2 } }
 * const empty = unflattenObject({});
 * console.log(empty); // {}
 */
export function unflattenObject(flat: PlainObject): PlainObject {
    const result: PlainObject = {};
    for (const [key, val] of Object.entries(flat)) {
        setPathValue(result, key, val);
    }
    return result;
}

/**
 * @summary Filters an object by a template shape.
 * @remarks
 * This function takes a source object and a template object, and returns
 * a new object that contains only the keys from the source that match
 * the keys in the template. If a key in the template is an object, it
 * recursively filters the corresponding key in the source object.
 * If a key in the template is not present in the source, it is ignored.
 * @param source - The source object to filter.
 * @param template - The template object that defines the shape to filter by.
 * @returns A new object containing only the keys from the source that match
 *          the keys in the template.
 * @example
 * const source = { a: 1, b: { x: 2, y: 3 }, z: 99 };
 * const template = { a: 0, b: { y: 0 } };
 * const filtered = filterByTemplate(source, template);
 * console.log(filtered); // { a: 1, b: { y: 3 } }
 * const empty = filterByTemplate({ x: 1 }, { y: 0 });
 * console.log(empty); // {}
 */
export function filterByTemplate(
    source: PlainObject,
    template: PlainObject,
): PlainObject {
    return Object.fromEntries(
        Object.entries(template).flatMap(([key, tmplVal]) => {
            const srcVal = source[key];
            if (srcVal === undefined) return [];
            if (typeof tmplVal === "object" && typeof srcVal === "object") {
                return [[key, filterByTemplate(srcVal, tmplVal)]];
            }
            return [[key, srcVal]];
        }),
    );
}

/**
 * @summary Flattens a nested object into dot-separated keys.
 * @remarks
 * This function takes a nested object and flattens it into a single-level
 * object with keys in the format "a.b.c". It uses recursion to handle
 * nested objects and arrays. The prefix parameter is used to build the
 * dot-separated keys. The result is a new object with the flattened structure.
 * @param obj - The nested object to flatten.
 * @param prefix - The prefix to use for the keys (used internally).
 * @param result - The result object to store the flattened key-value pairs.
 * @returns The flattened object.
 * @example
 * const nested = { a: { b: 1, c: { d: 2 } }, e: 3 };
 * const flat = flattenNested(nested);
 * console.log(flat); // { "a.b": 1, "a.c.d": 2, e: 3 }
 */
export function flattenNested(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    function recurse(current: any, path: string[] = []) {
        for (const [key, value] of Object.entries(current)) {
            const newPath = [...path, key];
            if (value && typeof value === "object" && !Array.isArray(value)) {
                recurse(value, newPath);
            } else {
                result[newPath.join(".")] = value;
            }
        }
    }
    recurse(obj);
    return result;
}

/**
 * @summary Expand a flattened object with dot-separated keys.
 * @param obj - Flattened object.
 * @returns Nested object.
 */
export function expandFlattened(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        const parts = key.split(".");
        let curr = result;
        for (let i = 0; i < parts.length - 1; i++) {
            curr[parts[i]] = curr[parts[i]] || {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = value;
    }
    return result;
}

/**
 * @summary Returns a list of all parent classes in the prototype chain.
 * @remarks
 * This function traverses the prototype chain of the given class and
 * returns an array of all parent classes, excluding Function.prototype.
 * It starts from the immediate parent and goes up to the root class.
 * @param cls - The class to inspect.
 * @returns An array of parent classes in the prototype chain.
 * @example
 * class A {}
 * class B extends A {}
 * class C extends B {}
 * console.log(getClassHierarchy(C)); // [B, A]
 */
export function getClassHierarchy(cls: Function): Function[] {
    const result: Function[] = [];
    let current = Object.getPrototypeOf(cls);
    while (current && current !== Function.prototype) {
        result.push(current);
        current = Object.getPrototypeOf(current);
    }
    return result;
}

/**
 * @summary Returns a descriptive name of the type of a value.
 * @remarks
 * This function checks the type of the value and returns a string
 * representing its type. It handles special cases for null, arrays,
 * sets, maps, and dates. For all other types, it returns the result
 * of the typeof operator.
 * @param value - The value to describe.
 * @returns A string representing the type of the value.
 * @example
 * console.log(describeType(null)); // "null"
 * console.log(describeType([])); // "Array"
 * console.log(describeType(new Set())); // "Set"
 * console.log(describeType(new Map())); // "Map"
 * console.log(describeType(new Date())); // "Date"
 * console.log(describeType(42)); // "number"
 * console.log(describeType("hello")); // "string"
 * console.log(describeType({})); // "object"
 * console.log(describeType(undefined)); // "undefined"
 */
export function describeType(value: unknown): string {
    if (value === null) return "null";
    if (Array.isArray(value)) return "Array";
    if (value instanceof Set) return "Set";
    if (value instanceof Map) return "Map";
    if (value instanceof Date) return "Date";
    return typeof value;
}

/**
 * @summary Checks if a nested property exists in an object using a dot-separated path.
 *
 * @param obj - The object to check.
 * @param key - The dot-separated path to the property.
 * @returns `true` if the property exists, `false` otherwise.
 *
 * @example
 * const obj = { a: { b: 1 } };
 * console.log(hasPath(obj, "a.b")); // true
 * console.log(hasPath(obj, "a.c")); // false
 */
export function hasPath(obj: any, key: string): boolean {
    return getPathValue(obj, key) !== undefined;
}

/**
 * @summary Retrieves a nested value from an object using a dot-separated path.
 *
 * @param obj - The object to search.
 * @param key - The dot-separated path to the value (e.g., "a.b.c").
 *
 * @returns The value at the specified path, or `undefined` if not
 * found or if input object is null.
 *
 * @example
 * ```ts
 * const obj = { a: { b: 1 } };
 * console.log(getPathValue(obj, "a.b")); // 1
 * console.log(getPathValue(obj, "a.c")); // undefined
 * ```
 */
export function getPathValue(obj: any, key: string): any {
    return key
        .split(".")
        .reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

/**
 * @summary Sets a nested value by dot-separated path.
 *
 * @remarks
 * The final property is defined using `Object.defineProperty`, allowing control over
 * descriptor flags. The function creates nested objects as needed.
 *
 * @param obj - The object to modify.
 * @param key - The dot-separated path (e.g., "a.b.c").
 * @param value - The value to set.
 * @param options - Optional property descriptor flags for the final property.
 * @param [options.writable=false] - Whether the property is writable.
 * @param [options.enumerable=false] - Whether the property is enumerable.
 * @param [options.configurable=true] - Whether the property is configurable.
 *
 * @returns `true` if the value was changed, `false` if it was already equal.
 *
 * @example
 * ```ts
 * const obj = {};
 * console.log(setPathValue(obj, "a.b.c", 1)); // true
 * console.log(obj); // { a: { b: { c: 1 } } }
 * console.log(setPathValue(obj, "a.b.c", 1)); // false
 * ```
 */
export function setPathValue(
    obj: any,
    key: string,
    value: any,
    options: PropertyDescriptor = {
        writable: false,
        configurable: true,
        enumerable: false,
    },
): boolean {
    const parts = key.split(".");
    let current = obj;

    while (parts.length > 1) {
        const part = parts.shift()!;
        if (!current[part] || typeof current[part] !== "object") {
            current[part] = {};
        }
        current = current[part];
    }

    const last = parts[0];
    const changed = current[last] !== value;

    Object.defineProperty(current, last, {
        value,
        ...options,
    });

    return changed;
}

/**
 * @summary Deletes a nested property by dot-separated path.
 *
 * @param obj - The object to modify.
 * @param key - The dot-separated path to the property (e.g., "a.b.c").
 *
 * @returns `true` if the property was deleted, `false` otherwise.
 *
 * @example
 * ```ts
 * const obj = { a: { b: 1 } };
 * console.log(deletePath(obj, "a.b")); // true
 * console.log(obj); // { a: {} }
 * console.log(deletePath(obj, "a.b")); // false
 * ```
 */
export function deletePath(obj: any, key: string): boolean {
    const parts = key.split(".");
    const last = parts.pop();
    const parent = parts.reduce((acc, part) => acc?.[part], obj);
    return !!(parent && last && delete parent[last]);
}

/**
 * @summary Inverts keys and values in an object.
 * @remarks
 * This function takes an object and returns a new object
 * where the keys and values are swapped. It throws an error
 * if any values are not unique, as this would create
 * ambiguity in the inverted object.
 * @param obj - The object to invert.
 * @returns A new object with keys and values swapped.
 * @throws Error if values are not unique.
 * @example
 * const obj = { a: 1, b: 2 };
 * const inverted = reverseObject(obj);
 * console.log(inverted); // { 1: "a", 2: "b" }
 * const obj2 = { x: 1, y: 1 };
 * console.log(reverseObject(obj2)); // Error: Values must be unique to invert
 */
export function invertKeyValue(
    obj: StrictObject<string>,
): StrictObject<string> {
    const result: StrictObject<string> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (result[v])
            throw new Error("Duplicate value detected while inverting.");
        result[v] = k;
    }
    return result;
}

/**
 * @summary Checks if a value is empty.
 * @remarks
 * This function checks if a value is empty. It considers null,
 * undefined, empty strings, empty arrays, empty objects,
 * empty maps, and empty sets as empty. It returns true if the
 * value is empty, and false otherwise. It does not check for
 * primitive values like numbers or booleans.
 * @param value - The value to check.
 * @returns True if the value is empty, false otherwise.
 * @example
 * console.log(isValueEmpty(null)); // true
 * console.log(isValueEmpty("")); // true
 * console.log(isValueEmpty([])); // true
 * console.log(isValueEmpty({})); // true
 * console.log(isValueEmpty(0)); // false
 * console.log(isValueEmpty([1])); // false
 * console.log(isValueEmpty(new Map())); // true
 * console.log(isValueEmpty(new Set())); // true
 */
export function isValueEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === "string" || Array.isArray(value))
        return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
}

export type MergeOptions = {
    /** Whether to insert new top-level keys not present in the original object. */
    insertKeys?: boolean;
    /** Whether to insert new nested values into existing nested objects. */
    insertValues?: boolean;
    /** Whether to overwrite existing values with those from the source. */
    overwrite?: boolean;
    /** Whether to merge nested objects recursively. */
    recursive?: boolean;
    /** Whether to apply changes to the original object directly. */
    inplace?: boolean;
    /** Whether to enforce that source and target types match before overwriting. */
    enforceTypes?: boolean;
    /** Whether to allow deletion or replacement using special key syntax. */
    performDeletions?: boolean;
};

function isPlainObject(value: unknown): value is PlainObject {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.getPrototypeOf(value) === Object.prototype
    );
}

function expandIfDotted(obj: PlainObject): PlainObject {
    const result: PlainObject = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key.includes(".")) {
            const keys = key.split(".");
            let current = result;
            while (keys.length > 1) {
                const part = keys.shift()!;
                current[part] = current[part] || {};
                current = current[part];
            }
            current[keys[0]] = value;
        } else {
            result[key] = value;
        }
    }
    return result;
}

function cloneShallow(obj: PlainObject | any[]): PlainObject | any[] {
    return Array.isArray(obj) ? [...obj] : Object.assign({}, obj);
}

function handleSpecialKeys(
    key: string,
    value: PlainObject,
    original: PlainObject,
): boolean {
    if (key.startsWith("==")) {
        original[key.slice(2)] = value;
        return true;
    }
    if (key.startsWith("-=")) {
        if (value !== null) {
            throw new Error("Removal via '-=' requires a null value.");
        }
        delete original[key.slice(2)];
        return true;
    }
    return false;
}

/**
 * @summary Deeply merges properties from a source object into a target object, with fine-grained control.
 *
 * @description
 * This function performs a recursive, configurable merge of two objects. It allows precise control over:
 * - Whether new keys or values are added
 * - Whether existing values are overwritten
 * - Whether merging happens recursively for nested objects
 * - Whether type consistency is enforced
 * - Whether updates happen in-place or on a shallow clone
 * - Whether special key prefixes (e.g., `==key`, `-=key`) trigger explicit replace/delete behavior
 *
 * Only plain objects (i.e., `{}` or objects created via object literals) are supported.
 *
 * @param original - The base object to be merged into.
 * @param other - The object whose properties should be merged into `original`.
 * @param options - Optional settings to control the merge behavior.
 * @param options.insertKeys - Whether to allow inserting new top-level keys. Defaults to true.
 * @param options.insertValues - Whether to allow inserting nested values. Defaults to true.
 * @param options.overwrite - Whether to overwrite existing values. Defaults to true.
 * @param options.recursive - Whether to merge recursively. Defaults to true.
 * @param options.inplace - Whether to modify the original object or return a clone. Defaults to true.
 * @param options.enforceTypes - Whether to enforce type matching. Defaults to false.
 * @param options.performDeletions - Whether to allow special key deletion/replacement. Defaults to false.
 * @param _depth - Internal parameter to track recursion depth (do not pass manually).
 *
 * @returns The result of the merge: either the original object (if `inplace` is `true`) or a modified shallow clone.
 *
 * @example Basic merge
 * ```ts
 * const a = { name: "Alice", age: 30 };
 * const b = { age: 32, city: "Paris" };
 * const result = deepMerge(a, b);
 * // result: { name: "Alice", age: 32, city: "Paris" }
 * ```
 *
 * @example Prevent overwriting existing keys
 * ```ts
 * const a = { name: "Alice" };
 * const b = { name: "Bob", city: "Paris" };
 * const result = deepMerge(a, b, { overwrite: false });
 * // result: { name: "Alice", city: "Paris" }
 * ```
 *
 * @example Merge nested structures recursively
 * ```ts
 * const a = { profile: { name: "Alice" } };
 * const b = { profile: { age: 30 } };
 * const result = deepMerge(a, b);
 * // result: { profile: { name: "Alice", age: 30 } }
 * ```
 *
 * @example Explicitly replace a nested object using a special key
 * ```ts
 * const a = { settings: { theme: "dark" } };
 * const b = { '==settings': { theme: "light" } };
 * const result = deepMerge(a, b, { performDeletions: true });
 * // result: { settings: { theme: "light" } }
 * ```
 *
 * @example Remove a key using a special syntax
 * ```ts
 * const a = { name: "Alice", city: "Paris" };
 * const b = { '-=city': null };
 * const result = deepMerge(a, b, { performDeletions: true });
 * // result: { name: "Alice" }
 * ```
 */
// Public overloads
export function deepMerge<T extends PlainObject>(
    original: T,
    other: Partial<T>,
    opts?: MergeOptions,
    _depth?: number,
): T;
export function deepMerge<T extends any[]>(
    original: T,
    other: Partial<T>,
    opts?: MergeOptions,
): T;

// Gobal Overload
export function deepMerge(original: any, other: any, opts?: MergeOptions): any {
    return _deepMerge(original, other, opts);
}

// Implementation
function _deepMerge(
    original: PlainObject | any[],
    other: PlainObject | any[],
    {
        insertKeys = true,
        insertValues = true,
        overwrite = true,
        recursive = true,
        inplace = true,
        enforceTypes = false,
        performDeletions = false,
    }: MergeOptions = {},
    _depth: number = 0,
): PlainObject | any[] {
    let target = inplace ? original : cloneShallow(original);
    const source = expandIfDotted(other);

    if (!inplace && _depth === 0) {
        target = expandIfDotted(target);
    } else if (_depth === 0 && inplace) {
        const expanded = expandIfDotted(original);
        if (Array.isArray(original)) {
            original.length = 0;
            original.push(...(expanded as any[]));
        } else {
            Object.keys(original).forEach((k) => delete original[k]);
            Object.assign(original, expanded);
        }
        target = original;
    }

    const merge = (target: any, source: any, depth: number): void => {
        if (Array.isArray(target) && Array.isArray(source)) {
            for (let i = 0; i < source.length; i++) {
                const value = source[i];
                const exists = i in target;

                if (exists && overwrite) {
                    const cloned =
                        (
                            recursive &&
                            (Array.isArray(value) || isPlainObject(value))
                        ) ?
                            deepMerge(
                                target[i],
                                value,
                                {
                                    insertKeys,
                                    insertValues,
                                    overwrite,
                                    recursive,
                                    inplace,
                                    enforceTypes,
                                    performDeletions,
                                },
                                depth + 1,
                            )
                        :   structuredClone(value);
                    target[i] = cloned;
                } else if (!exists && insertValues) {
                    target[i] =
                        (
                            recursive &&
                            (Array.isArray(value) || isPlainObject(value))
                        ) ?
                            _deepMerge(
                                Array.isArray(value) ? [] : {},
                                value,
                                {
                                    insertKeys,
                                    insertValues,
                                    overwrite,
                                    recursive,
                                    inplace,
                                    enforceTypes,
                                    performDeletions,
                                },
                                depth + 1,
                            )
                        :   structuredClone(value);
                }
            }
            return;
        }

        if (!isPlainObject(target) || !isPlainObject(source)) return;

        for (const [key, value] of Object.entries(source)) {
            if (
                isPlainObject(target) &&
                isPlainObject(value) &&
                handleSpecialKeys(key, value, target)
            )
                continue;
            const exists = Object.prototype.hasOwnProperty.call(target, key);
            const targetVal = target[key];
            const sourceType = typeof value;
            const targetType = typeof targetVal;
            const valueIsObject = isPlainObject(value);
            const targetIsObject = isPlainObject(targetVal);

            if (exists) {
                if (valueIsObject && targetIsObject && recursive) {
                    merge(targetVal, value, depth + 1);
                } else if (overwrite && sourceType !== "function") {
                    if (enforceTypes && targetType !== sourceType) {
                        throw new Error("Mismatched types in merge.");
                    }
                    try {
                        target[key] = structuredClone(value);
                    } catch {
                        target[key] = value;
                    }
                }
            } else {
                const allowInsert =
                    (depth === 0 && insertKeys) || (depth > 0 && insertValues);
                if (!allowInsert || sourceType === "function") continue;

                target[key] =
                    (valueIsObject || Array.isArray(value)) && recursive ?
                        _deepMerge(
                            Array.isArray(value) ? [] : {},
                            value,
                            {
                                insertKeys,
                                insertValues,
                                overwrite,
                                recursive,
                                inplace,
                                enforceTypes,
                                performDeletions,
                            },
                            depth + 1,
                        )
                    :   value;
            }
        }
    };

    merge(target, source, _depth);

    return target;
}

/**
 * @summary Escapes HTML special characters.
 */
export function escapeHtml(str: string): string {
    const replacements: StrictObject<string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
    };
    return str.replace(/[&<>"]|'/g, (ch) => replacements[ch]);
}

/**
 * @summary Unescapes HTML special characters.
 */
export function unescapeHtml(str: string): string {
    const replacements: StrictObject<string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#x27;": "'",
    };
    return str.replace(/&(amp|lt|gt|quot|#x27);/g, (m) => replacements[m]);
}

/**
 * Return whether a target version (v1) is more advanced than some other reference version (v0).
 * Supports either numeric or string version comparison with version parts separated by periods.
 * @param v1 - The target version
 * @param v0 - The reference version
 * @returns True if v1 is a more advanced version than v0
 */
export function isNewerVersion(
    v1: number | string,
    v0: number | string,
): boolean {
    if (typeof v1 === "number" && typeof v0 === "number") return v1 > v0;

    const parseParts = (v: string | number): (number | string)[] =>
        String(v)
            .split(".")
            .map((part) => (Number.isNaN(Number(part)) ? part : Number(part)));

    const a = parseParts(v1);
    const b = parseParts(v0);

    const length = Math.max(a.length, b.length);

    for (let i = 0; i < length; i++) {
        const partA = a[i];
        const partB = b[i];

        // If v0 is missing a part, v1 is newer
        if (partB === undefined) return true;
        if (partA === undefined) return false;

        // Compare numbers numerically
        if (typeof partA === "number" && typeof partB === "number") {
            if (partA !== partB) return partA > partB;
        } else {
            // Fallback to string comparison
            const strA = String(partA);
            const strB = String(partB);
            if (strA !== strB) return strA > strB;
        }
    }

    // Versions are equal
    return false;
}

export type SohlSettingValue =
    | string
    | number
    | boolean
    | bigint
    | null
    | undefined
    | SohlSettingValue[];

/**
 * @summary Get a static property from a class instance.
 * @remarks
 * This function retrieves a static property from the class of the
 * given instance. It traverses the prototype chain to find the property
 * in the class constructor. If the property is not found, it throws an
 * error.
 * @param instance - The instance of the class.
 * @param key - The name of the static property to retrieve.
 * @returns The value of the static property.
 * @throws Error if the property is not found.
 * @example
 * class MyClass {
 *     static myStaticProperty = "Hello, world!";
 *     static get myProperty() {
 *         return this.myStaticProperty;
 *     }
 * }
 * const instance = new MyClass();
 * const value = getStatic(instance, "myStaticProperty");
 * console.log(value); // "Hello, world!"
 * const method = getStatic(instance, "myProperty");
 * console.log(method); // "Hello, world!"
 * const notFound = getStatic(instance, "nonExistent"); // Error: Static property "nonExistent" not found in prototype chain.
 */
export function getStatic<T extends object>(instance: T, key: string): any {
    let ctor = instance.constructor as any;

    while (ctor) {
        if (Object.prototype.hasOwnProperty.call(ctor, key)) {
            return ctor[key];
        }
        ctor = Object.getPrototypeOf(ctor);
    }

    throw new Error(`Static property "${key}" not found in prototype chain.`);
}

export function defaultToJSON(value: any): JsonValue | undefined {
    if (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return value;
    }

    if (typeof value === "bigint") {
        return `__bigint__:${value.toString()}`;
    }

    if (value instanceof Date) {
        return `__date__:${value.toISOString()}`;
    }

    if (value instanceof URL) {
        return { __type: "URL", href: value.href };
    }

    if (value instanceof SohlMap) {
        return {
            __type: "SohlMap",
            entries: Array.from(value.entries()).map(([k, v]) => [
                k,
                defaultToJSON(v),
            ]),
        };
    }

    if (value instanceof Map) {
        return {
            __type: "Map",
            entries: Array.from(value.entries()).map(([k, v]) => [
                k,
                defaultToJSON(v),
            ]),
        };
    }

    if (value instanceof Set) {
        return {
            __type: "Set",
            values: Array.from(value.values()).map(defaultToJSON),
        } as JsonValue;
    }

    if (value instanceof RegExp) {
        return {
            __type: "RegExp",
            pattern: value.source,
            flags: value.flags,
        } as JsonValue;
    }

    if (value instanceof Error) {
        return {
            __type: "Error",
            name: value.name,
            message: value.message,
            stack: value.stack,
        } as JsonValue;
    }

    if (
        typeof value === "function" ||
        typeof value === "symbol" ||
        value === undefined
    ) {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value.map(defaultToJSON) as JsonValue[];
    }

    if (typeof value === "object" && value !== null) {
        if (typeof (value as any).toJSON === "function") {
            return (value as any).toJSON();
        }

        const result: Record<string, JsonValue> = {};
        for (const [key, val] of Object.entries(value)) {
            const jsonVal = defaultToJSON(val);
            if (jsonVal !== undefined) result[key] = jsonVal;
        }
        return result;
    }

    return value;
}

export function defaultFromJSON(value: unknown): unknown {
    if (typeof value === "string") {
        if (value.startsWith("__bigint__:")) {
            return BigInt(value.slice("__bigint__:".length));
        }
        if (value.startsWith("__date__:")) {
            return new Date(value.slice("__date__:".length));
        }
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(defaultFromJSON);
    }

    if (typeof value === "object" && value !== null) {
        const maybe = value as any;

        switch (maybe.__type) {
            case "SohlMap":
                return new SohlMap(
                    maybe.entries.map(([k, v]: [any, any]) => [
                        k,
                        defaultFromJSON(v),
                    ]),
                );
            case "Map":
                return new Map(
                    maybe.entries.map(([k, v]: [any, any]) => [
                        k,
                        defaultFromJSON(v),
                    ]),
                );
            case "Set":
                return new Set(maybe.values.map(defaultFromJSON));
            case "RegExp":
                return new RegExp(maybe.pattern, maybe.flags);
            case "Error":
                const err = new Error(maybe.message);
                err.name = maybe.name;
                err.stack = maybe.stack;
                return err;
            case "URL":
                return new URL(maybe.href);
        }

        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(maybe)) {
            result[key] = defaultFromJSON(val);
        }
        return result;
    }

    return value;
}

/**
 * Serializes all enumerable properties (own and inherited) of an object
 * using `defaultToJSON`, returning a plain JSON-compatible object.
 *
 * @param target The object to serialize.
 * @returns A plain object with serialized properties.
 */
export function serializePlainObject(target: PlainObject): PlainObject {
    const result: PlainObject = {};
    const visited = new Set<string>();

    let current = target;
    while (current && current !== Object.prototype) {
        for (const key of Object.keys(current)) {
            if (visited.has(key)) continue;
            visited.add(key);

            const value = target[key];
            const serialized = defaultToJSON(value);
            if (serialized !== undefined) {
                result[key] = serialized;
            }
        }
        current = Object.getPrototypeOf(current);
    }

    return result;
}

/**
 * Convert an integer into a roman numeral.  Taken from:
 * http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
 *
 * @param {Integer} num
 */
export function romanize(num: number): string {
    if (isNaN(num)) return NaN as any;
    const digits = String(+num).split("") || [];
    const key = [
        "",
        "C",
        "CC",
        "CCC",
        "CD",
        "D",
        "DC",
        "DCC",
        "DCCC",
        "CM",
        "",
        "X",
        "XX",
        "XXX",
        "XL",
        "L",
        "LX",
        "LXX",
        "LXXX",
        "XC",
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
    ];
    let roman = "";
    let i = 3;
    while (i--) {
        const digit = digits.pop() || "0";
        roman = (key[+digit + i * 10] || "") + roman;
    }
    return Array(+digits.join("") + 1).join("M") + roman;
}

export async function asyncForEach<T>(
    array: T[],
    callback: (item: T, index: number, array: T[]) => Promise<void>,
): Promise<void> {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

/**
 * Creates a 16-digit sequence of hexadecimal digits, suitable for use as
 * an ID, but such that the same input string will produce the same output
 * every time.
 *
 * @param {string} str Input string to convert to hash
 * @returns Sequence of 16 hexadecimal digits as a string
 */
export function createHash16(str: string): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const ary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < str.length; i++) {
        ary[i % 16] += str.codePointAt(i) ?? 0;
    }
    let id = "";
    for (let i = 0; i < 16; i++) id += chars[ary[i] % chars.length];
    return id;
}

export function getChoicesMap(
    values: StrictObject<string>,
    locPrefix: string,
): StrictObject<string> {
    return Object.fromEntries(
        Object.values(values).map((i) => [i, `${locPrefix}.${i}`]),
    );
}

export function sortStrings(...ary: string[]): string[] {
    const collator = new Intl.Collator(sohl.i18n.lang);
    ary.sort((a, b) => collator.compare(a, b));
    return ary;
}

export function* combine<T>(...iterators: Iterable<T>[]): Generator<T> {
    for (let it of iterators) yield* it;
}

/**
 * @summary Hashes a string into a 53-bit integer.
 * @description
 * A fast and simple 53-bit string hash function with decent collision resistance.
 *
 * @remarks
 * This is a non-cryptographic hash function, suitable for hash tables and
 * similar applications. It is not suitable for cryptographic purposes.
 *
 * cyrb53 (c) 2018 bryc (github.com/bryc)
 * License: Public domain (or MIT if needed). Attribution appreciated.
 * Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
 * https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 *
 * @param str The string to hash.
 * @param seed An optional seed value to initialize the hash.
 * @returns A 53-bit integer hash of the input string.
 * @example
 * const hash = cyrb53("Hello, world!");
 * console.log(hash); // 1234567890123456789
 * const hashWithSeed = cyrb53("Hello, world!", 42);
 * console.log(hashWithSeed); // 9876543210987654321
 */
export function cyrb53(str: string, seed = 0): number {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Coerces value to the specified maximum precision.  If the value has greater than
 * the specified precision, then rounds the value to the specified precision.  If
 * the value has less than or equal to the specified precision, the value is unchanged.
 *
 * @param value Source value to be evaluated
 * @param precision Maximum number of characters after decimal point
 * @returns value rounded to the specified precision
 */
export function maxPrecision(value: number, precision: number = 0): number {
    return +parseFloat(value.toString()).toFixed(precision);
}
