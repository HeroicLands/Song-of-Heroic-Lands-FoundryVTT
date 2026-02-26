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

import type { SohlItem } from "@common/item/SohlItem";
import type { GearData } from "@common/item/Gear";
import type { MasteryLevelData } from "@common/item/MasteryLevel";
import { ITEM_KIND } from "@utils/constants";
import { SohlMap } from "@utils/collection/SohlMap";

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
    return foundry.utils.deleteProperty(globalThis.sohl, path);
}

export async function toHTMLWithTemplate(
    template: FilePath,
    data: PlainObject = {},
): Promise<HTMLString> {
    const html = await foundry.applications.handlebars.renderTemplate(
        template,
        data,
    );
    return toSanitizedHTML(html);
}

export async function toHTMLWithContent(
    content: HTMLString,
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

export class InvalidHtmlError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidHtmlError";
    }
}

export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

export function isObject(value: unknown): value is object {
    return typeof value === "object" && value !== null;
}

export function isUndefined(value: unknown): value is undefined {
    return typeof value === "undefined";
}

export function isNull(value: unknown): value is null {
    return value === null;
}

export function isSymbol(value: unknown): value is symbol {
    return typeof value === "symbol";
}

export function isBigInt(value: unknown): value is bigint {
    return typeof value === "bigint";
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

const DISALLOWED_KEYWORDS = [
    "window",
    "document",
    "globalThis",
    "Function",
    "eval",
    "new Function",
    "XMLHttpRequest",
    "fetch",
    "require",
    "import",
    "setTimeout",
    "setInterval",
] as const;

function checkScriptSafety(script: string): void {
    const lowered = script.toLowerCase();
    for (const keyword of DISALLOWED_KEYWORDS) {
        const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "g");
        if (pattern.test(lowered)) {
            throw new Error(
                `Disallowed keyword detected in script: ${keyword}`,
            );
        }
    }
}

export function textToFunction(
    script: string,
    args: string[],
    { isAsync = false }: { isAsync?: boolean } = {},
): AsyncFunction | Function {
    checkScriptSafety(script);
    let body = script.trim();
    if (!/^\s*(return|{|if|for|while|switch|try)\b/.test(body)) {
        // Looks like a bare expression, not a block — wrap it in return
        body = `return (${body});`;
    }
    args.push(`"use strict";\n${body}`);
    return isAsync ? new AsyncFunction(...args) : new Function(...args);
}

const HASH_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates 16-character Id from an input string.
 *
 * @remarks
 * Guarantees same input string always produces same output Id.
 *
 * Result has enough entropy to avoid collisions in typical use cases.
 *
 * @param input - The input string to hash.
 * @returns A 16-character Id string.
 */
export function hashToId(input: string): string {
    let hash = 0xcbf29ce484222325n; // 14695981039346656037
    const FNV_PRIME = 0x100000001b3n; // 1099511628211
    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input.charCodeAt(i));
        hash *= FNV_PRIME;
        hash &= 0xffffffffffffffffn; // keep 64 bits
    }
    let out = "";
    for (let i = 0; i < 16; i++) {
        const idx = Number(hash % 62n); // 0..61
        out += HASH_ALPHABET[idx];
        hash /= 62n;
    }

    return out;
}

export function defaultFromJSON(value: unknown): unknown {
    if (typeof value === "string") {
        if (value.startsWith("__bigint__:")) {
            return BigInt(value.slice("__bigint__:".length));
        }
        if (value.startsWith("__date__:")) {
            return new Date(value.slice("__date__:".length));
        }
        if (value.startsWith("__url__:")) {
            return new URL(value.slice("__url__:".length));
        }
        if (value.startsWith("__func__:")) {
            return deserializeFn(value);
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
            case "ClientDocument":
                return fromUuidSync(maybe.uuid);
        }

        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(maybe)) {
            result[key] = defaultFromJSON(val);
        }
        return result;
    }

    return value;
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

    if (Object.hasOwn(value, "documentName")) {
        return {
            __type: "ClientDocument",
            uuid: value.uuid,
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

export function serializeFn(fn: (...args: any[]) => any): string {
    function normalizeArrowParams(paramSrc: string): string {
        const s = paramSrc.trim();
        if (s.startsWith("(") && s.endsWith(")")) {
            return s.slice(1, -1).trim();
        }
        return s;
    }
    const src = fn.toString().trim();

    let argList = "";
    let body = "";

    // 1. Try standard function form: function name(a, b) { body }
    let match = src.match(/^function\s*[^(]*\(([^)]*)\)\s*{([\s\S]*)}$/);
    if (match) {
        argList = match[1].trim();
        body = match[2].trim();
    } else {
        // 2. Try arrow with block body: (a, b) => { body }  OR  a => { body }
        match = src.match(
            /^(\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>\s*{([\s\S]*)}$/,
        );
        if (match) {
            argList = normalizeArrowParams(match[1]);
            body = match[2].trim();
        } else {
            // 3. Arrow with expression body: (a, b) => expr  OR  a => expr
            match = src.match(
                /^(\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>\s*([\s\S]*)$/,
            );
            if (!match) {
                throw new Error(
                    "Unsupported function format for serialization.",
                );
            }
            argList = normalizeArrowParams(match[1]);
            body = match[2].trim();
        }
    }

    // Normalize args into "a,b,c"
    const args = argList
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
        .join(",");

    return `__func__:[${args}]${body}`;
}

/**
 * Deserialize a serialized function string in the format:
 *   "__func__:[arg1,arg2,...]body"
 * back into a live Function object.
 */
export function deserializeFn(serialized: string): (...args: any[]) => any {
    if (!serialized.startsWith("__func__:"))
        throw new Error("Invalid serialized function format.");

    // Extract argument list and body
    const match = serialized.match(/^__func__:\[([^\]]*)\](.*)$/s);
    if (!match) throw new Error("Malformed serialized function string.");

    const args = match[1].trim();
    const body = match[2].trim();

    // Construct the function
    try {
        return new Function(args, body) as (...args: any[]) => any;
    } catch (err) {
        throw new Error(
            `Failed to deserialize function: ${(err as Error).message}`,
        );
    }
}

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

const GearKinds = [
    ITEM_KIND.ARMORGEAR,
    ITEM_KIND.CONCOCTIONGEAR,
    ITEM_KIND.CONTAINERGEAR,
    ITEM_KIND.MISCGEAR,
    ITEM_KIND.PROJECTILEGEAR,
    ITEM_KIND.WEAPONGEAR,
] as string[];

export function isGearItem(
    item: SohlItem,
): item is SohlItem & { system: GearData } {
    return GearKinds.includes(item.type);
}

const MasteryLevelKinds = [
    ITEM_KIND.MYSTICALABILITY,
    ITEM_KIND.SKILL,
    ITEM_KIND.TRAIT,
] as string[];

export function isMasteryItem(
    item: SohlItem,
): item is SohlItem & { system: MasteryLevelData } {
    return MasteryLevelKinds.includes(item.type);
}

const ItemSubTypeKinds = [
    ITEM_KIND.AFFLICTION,
    ITEM_KIND.COMBATTECHNIQUESTRIKEMODE,
    ITEM_KIND.CONCOCTIONGEAR,
    ITEM_KIND.MELEEWEAPONSTRIKEMODE,
    ITEM_KIND.MISSILEWEAPONSTRIKEMODE,
    ITEM_KIND.MYSTERY,
    ITEM_KIND.MYSTICALABILITY,
    ITEM_KIND.MYSTICALDEVICE,
    ITEM_KIND.PHILOSOPHY,
    ITEM_KIND.PROJECTILEGEAR,
    ITEM_KIND.PROTECTION,
    ITEM_KIND.SKILL,
    ITEM_KIND.TRAIT,
] as string[];

export function isItemWithSubType(
    item: SohlItem,
    subType?: string,
): item is SohlItem & { system: { subType: string } } {
    return (
        ItemSubTypeKinds.includes(item.type) &&
        (!subType || (item.system as any).subType === subType)
    );
}

export function secondaryModifier(index: number): number {
    if (index <= 0) return -25;
    index = Math.trunc(index);
    return (index - 5) * 5;
}

export function index(value: number): number {
    if (value <= 0) return 0;
    return Math.trunc(value / 10);
}
