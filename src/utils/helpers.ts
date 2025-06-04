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

import { SohlBase } from "@common";
import { SohlMap } from "@utils/collection";

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
        if (value.startsWith("__func__:")) {
            return new URL(value.slice("__url__:".length));
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

/**
 * Register a value or object in the `sohl` global namespace.
 *
 * If a string path is provided, the value is set at that path.
 * If an object is provided, all flattened key paths are expanded and set.
 *
 * @param pathOrObject - The path string or object map to register.
 * @param value - The value to assign at the given path (only if path is a string).
 * @param descriptor - A property descriptor for the registered value.
 */
export function registerValue(
    pathOrObject: string | PlainObject,
    value?: any,
    descriptor: PropertyDescriptor = {
        writable: false,
        configurable: true,
        enumerable: false,
    },
): void {
    if (typeof pathOrObject === "string") {
        foundry.utils.setProperty(sohl, pathOrObject, value);
    } else if (typeof pathOrObject === "object") {
        const flattened = foundry.utils.flattenObject(pathOrObject);
        for (const [path, val] of Object.entries(flattened)) {
            foundry.utils.setProperty(sohl, path, val);
        }
    }
}

/**
 * Unregister a value from the `sohl` global namespace.
 *
 * @param path - The dot-path string to remove.
 * @returns True if the path was successfully removed.
 */
export function unregisterValue(path: string): boolean {
    return fvtt.utils.deleteProperty(globalThis.sohl, path);
}

export async function toHTMLWithTemplate(
    template: FilePath,
    data: PlainObject = {},
): Promise<HTMLString> {
    const html = await fvtt.applications.handlebars.renderTemplate(
        template,
        data,
    );
    return toSanitizedHTML(html);
}

export async function toHTMLWithContent(
    content: string,
    data: PlainObject = {},
): Promise<HTMLString> {
    const compiled = Handlebars.compile(content);
    const result = compiled(data, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
    });
    return toSanitizedHTML(result);
}

export function createUniqueName<T extends { name: string }>(
    baseName: string,
    siblings: Map<string, T>,
): string {
    if (!baseName) {
        throw new Error("Must provide baseName");
    }
    const takenNames = new Set<string>();
    for (const sib of siblings.values()) takenNames.add(sib.name);
    let name = baseName;
    let index = 1;
    while (takenNames.has(name)) name = `${baseName} (${++index})`;
    return name;
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
 * `@RegisterClass` decorator.
 *
 * @param value - The object to check.
 * @param cls - The class to match against.
 * @returns `true` if the `value` or any constructor in its prototype chain has a
 *     static `_metadata.kind` matching that of `cls`.
 * @example
 * ```ts
 * class UnregisteredClass {}
 *
 * @RegisterClass({ name: "ParentClass" })
 * class ParentClass extends UnregisteredClass {}
 *
 * @RegisterClass({ name: "MyClass" })
 * class MyClass extends MyClass {}
 *
 * const obj = new MyClass();
 * console.log(isOfKind(obj, ParentClass)); // true
 * console.log(isOfKind(obj, MyClass)); // true
 * console.log(isOfKind(obj, UnregisterdClass)); // false
 * ```
 */
export function isOfKind<T extends AnyConstructor>(
    value: unknown,
    cls: T,
): value is InstanceType<T> {
    if ((cls as any)._metadata?.name) {
        const clsKind = (cls as any)._metadata?.kind;
        if (typeof clsKind === "string") {
            let proto = Object.getPrototypeOf(value);

            while (proto && typeof proto.constructor === "function") {
                const ctor = proto.constructor as {
                    _metadata?: { kind: string };
                };

                if (ctor._metadata?.kind === clsKind) {
                    return true;
                }

                proto = Object.getPrototypeOf(proto);
            }
        }
    }
    return value instanceof cls;
}

export class InvalidHtmlError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidHtmlError";
    }
}

export function defineType<const T extends Record<string, unknown>>(
    prefix: string,
    def: T,
) {
    type KindValue = T[keyof T];

    const values = Object.values(def) as KindValue[];
    const isValue = (value: unknown): value is KindValue =>
        values.includes(value as KindValue);
    const labels = Object.fromEntries(
        Object.entries(def).map(([k, v]) => [k, `SOHL.${prefix}.${v}`]),
    );
    return {
        kind: def,
        values,
        isValue,
        labels,
        Type: null as unknown as KindValue, // utility only for inference
    };
}

type AsyncFunctionType = (...args: any[]) => Promise<any>;

export const AsyncFunction = Object.getPrototypeOf(async function () {})
    .constructor as new (...args: string[]) => AsyncFunctionType;

export type FilePath = string & { __brand: "FilePath" };

export const FILE_PATH_REGEX =
    /^(file:\/\/\/?|[a-zA-Z]:[\\/]|[\\/])?[^<>:"|?*\n\r]+(?:[\\/][^<>:"|?*\n\r]+)*$/;

export function isFilePath(value: string): value is FilePath {
    return FILE_PATH_REGEX.test(value);
}

export function toFilePath(value: string): FilePath {
    if (!isFilePath(value)) throw new Error("Invalid file path format");
    return value as FilePath;
}

export type HTMLString = string & { __brand: "HTMLString" };

export function isHTMLString(value: unknown): value is HTMLString {
    if (typeof value !== "string") return false;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(value, "text/html");

        // Consider it valid if it contains at least one element node
        return Array.from(doc.body.childNodes).some(
            (node) => node.nodeType === Node.ELEMENT_NODE,
        );
    } catch {
        return false;
    }
}

export function toHTMLString(value: string): HTMLString {
    if (!isHTMLString(value)) throw new Error("Invalid HTML string format");
    return value as HTMLString;
}

/**
 * Converts a string or HTMLString into a sanitized HTMLString.
 * If the input is plain text, wraps it in a specified HTML element (default: <p>).
 */
export function toSanitizedHTML(
    value: string | HTMLString,
    wrapperTag: "p" | "div" | "span" = "p",
): HTMLString {
    let raw: string;

    if (isHTMLString(value)) {
        raw = value;
    } else {
        const wrapper = document.createElement(wrapperTag);
        wrapper.textContent = value;
        raw = wrapper.outerHTML;
    }

    // DOM-based sanitization
    const template = document.createElement("template");
    template.innerHTML = raw;

    const disallowedTags = ["script", "iframe", "object", "embed", "style"];
    disallowedTags.forEach((tag) => {
        const elements = template.content.querySelectorAll(tag);
        elements.forEach((el) => el.remove());
    });

    const walker = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_ELEMENT,
    );
    while (walker.nextNode()) {
        const el = walker.currentNode as HTMLElement;
        for (const attr of Array.from(el.attributes)) {
            if (
                attr.name.startsWith("on") ||
                attr.value.toLowerCase().startsWith("javascript:")
            ) {
                el.removeAttribute(attr.name);
            }
        }
    }

    return template.innerHTML as HTMLString;
}

export type DocumentId = string & { __brand: "DocId" };

export function isDocumentId(value: unknown): value is DocumentId {
    return typeof value === "string" && /^[a-zA-Z0-9]{16}$/.test(value);
}

export function toDocumentId(value: string): DocumentId {
    if (!isDocumentId(value))
        throw new TypeError(`Invalid FoundryID: ${value}`);
    return value as DocumentId;
}

export type DocumentUuid = string & { __brand: "DocumentUuid" };

const uuidRegex =
    /^(?:[A-Z][a-zA-Z]+)\.[a-zA-Z0-9]{16}$|^Compendium\.[a-z0-9-_]+\.[A-Z][a-zA-Z]+\.[a-zA-Z0-9]{16}$/;

export function isDocumentUuid(value: unknown): value is DocumentUuid {
    return typeof value === "string" && uuidRegex.test(value);
}

export function toDocumentUuid(value: string): DocumentUuid {
    if (!isDocumentUuid(value)) {
        throw new TypeError(`Invalid DocumentUuid: "${value}"`);
    }
    return value as DocumentUuid;
}

export function baseClassOf<T extends abstract new (...args: any) => any>(
    ctor: T,
): T {
    return ctor;
}
