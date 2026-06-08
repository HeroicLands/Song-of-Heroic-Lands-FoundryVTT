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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { GearData } from "@src/document/item/logic/GearLogic";
import type { MysticalAbilityData } from "@src/document/item/logic/MysticalAbilityLogic";
import type { SkillData } from "@src/document/item/logic/SkillLogic";
import type { TraitData } from "@src/document/item/logic/TraitLogic";
import { ITEM_KIND, KIND_KEY } from "@src/utils/constants";

/** System data of an item whose proficiency is tracked as a mastery level. */
type MasteryLevelData = MysticalAbilityData | SkillData | TraitData;
import { SohlMap } from "@src/utils/collection/SohlMap";
import { fvttMergeObject, fvttResolveUuid } from "@src/core/FoundryHelpers";
import {
    getKindForCtor,
    getCtorForKind,
} from "@src/utils/kindRegistry";

/**
 * A value permitted in a SoHL world/client setting: a JSON-like scalar
 * (string, number, boolean, bigint, null, or undefined) or an array thereof.
 */
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

/**
 * Iterate an array sequentially, awaiting an async callback for each element
 * before moving to the next (unlike `Array.prototype.forEach`, which does not
 * await).
 *
 * @typeParam T - The element type of the array.
 * @param array - The array to iterate.
 * @param callback - Async callback invoked with each item, its index, and the array.
 */
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

/**
 * Build a choices map suitable for select inputs, mapping each value to a
 * localization key formed by prefixing it with `locPrefix`.
 *
 * @param values - Object whose values are the choice keys.
 * @param locPrefix - Localization-key prefix prepended (with a `.`) to each value.
 * @returns An object mapping each value to `"{locPrefix}.{value}"`.
 */
export function getChoicesMap(
    values: StrictObject<string>,
    locPrefix: string,
): StrictObject<string> {
    return Object.fromEntries(
        Object.values(values).map((i) => [i, `${locPrefix}.${i}`]),
    );
}

/**
 * Sort strings in place using a locale-aware collator for the active SoHL UI
 * language.
 *
 * @param ary - The strings to sort.
 * @returns The same array, sorted in place.
 */
export function sortStrings(...ary: string[]): string[] {
    const collator = new Intl.Collator(sohl.i18n.lang);
    ary.sort((a, b) => collator.compare(a, b));
    return ary;
}

/**
 * Chain multiple iterables into a single generator, yielding all elements of
 * each in order.
 *
 * @typeParam T - The element type.
 * @param iterators - The iterables to concatenate.
 * @returns A generator yielding every element of every input iterable in sequence.
 */
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
 * Produce a name that is unique among a set of siblings, appending a
 * parenthesized counter (e.g. `"Sword (2)"`) when `baseName` collides.
 *
 * @typeParam T - The sibling type, which must expose a `name` string.
 * @param baseName - The desired name.
 * @param siblings - Existing items whose `name` values are considered taken.
 * @returns A name not present among the siblings.
 * @throws Error if `baseName` is empty.
 */
export function createUniqueName<
    T extends {
        /** The base name to make unique. */
        name: string;
    },
>(
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

/** Error thrown when a value fails HTML validation. */
export class InvalidHtmlError extends Error {
    /**
     * @param message - Description of the validation failure.
     */
    constructor(message: string) {
        super(message);
        this.name = "InvalidHtmlError";
    }
}

/** Type guard narrowing `value` to `string`. */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/** Type guard narrowing `value` to a non-`NaN` `number`. */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

/** Type guard narrowing `value` to `boolean`. */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

/** Type guard narrowing `value` to a callable `Function`. */
export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

/** Type guard narrowing `value` to a non-null `object`. */
export function isObject(value: unknown): value is object {
    return typeof value === "object" && value !== null;
}

/** Type guard narrowing `value` to `undefined`. */
export function isUndefined(value: unknown): value is undefined {
    return typeof value === "undefined";
}

/** Type guard narrowing `value` to `null`. */
export function isNull(value: unknown): value is null {
    return value === null;
}

/** Type guard narrowing `value` to `symbol`. */
export function isSymbol(value: unknown): value is symbol {
    return typeof value === "symbol";
}

/** Type guard narrowing `value` to `bigint`. */
export function isBigInt(value: unknown): value is bigint {
    return typeof value === "bigint";
}

/** Signature of an async function produced by {@link AsyncFunction}. */
type AsyncFunctionType = (...args: any[]) => Promise<any>;

/**
 * The `AsyncFunction` constructor (not exposed as a global), obtained from the
 * prototype of an async function. Used to compile async function bodies from
 * source strings.
 */
export const AsyncFunction = Object.getPrototypeOf(async function () {})
    .constructor as {
    /** Compile an async function from parameter names plus a body string. */
    new (...args: string[]): AsyncFunctionType;
};

/** Branded string type representing a validated filesystem path. */
export type FilePath = string & {
    /** Nominal brand marker; never present at runtime. */
    __brand: "FilePath";
};

/** Regular expression accepting common file-path forms (POSIX, Windows, `file://`). */
export const FILE_PATH_REGEX =
    /^(file:\/\/\/?|[a-zA-Z]:[\\/]|[\\/])?[^<>:"|?*\n\r]+(?:[\\/][^<>:"|?*\n\r]+)*$/;

/** Type guard narrowing `value` to a {@link FilePath} via {@link FILE_PATH_REGEX}. */
export function isFilePath(value: string): value is FilePath {
    return FILE_PATH_REGEX.test(value);
}

/**
 * Assert that `value` is a valid file path and brand it as {@link FilePath}.
 *
 * @throws Error if `value` does not match {@link FILE_PATH_REGEX}.
 */
export function toFilePath(value: string): FilePath {
    if (!isFilePath(value)) throw new Error("Invalid file path format");
    return value as FilePath;
}

/** Branded string type representing a string validated as HTML markup. */
export type HTMLString = string & {
    /** Nominal brand marker; never present at runtime. */
    __brand: "HTMLString";
};

/**
 * Type guard narrowing `value` to {@link HTMLString}. Returns `true` only if
 * `value` is a string that, when parsed, contains at least one element node.
 */
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

/**
 * Assert that `value` is valid HTML markup and brand it as {@link HTMLString}.
 *
 * @throws Error if `value` is not recognized as HTML by {@link isHTMLString}.
 */
export function toHTMLString(value: string): HTMLString {
    if (!isHTMLString(value)) throw new Error("Invalid HTML string format");
    return value as HTMLString;
}

/**
 * Convert a string or {@link HTMLString} into a sanitized {@link HTMLString}.
 * Plain text is wrapped in the given element; markup is parsed and stripped of
 * disallowed tags (`script`, `iframe`, etc.), `on*` event-handler attributes,
 * and `javascript:` attribute values.
 *
 * @param value - Plain text or HTML markup to sanitize.
 * @param wrapperTag - Element used to wrap plain text input (default `"p"`).
 * @returns The sanitized HTML markup.
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
    "XMLHttpRequest",
    "fetch",
    "require",
    "import",
    "setTimeout",
    "setInterval",
    "setImmediate",
    "process",
    "Worker",
    "ServiceWorker",
    "SharedWorker",
    "WebSocket",
    "MessageChannel",
    "BroadcastChannel",
    "indexedDB",
    "localStorage",
    "sessionStorage",
    "navigator",
    "location",
    "parent",
    "top",
    "self",
    "Reflect",
    "Proxy",
    "atob",
    "btoa",
] as const;

// Pattern checks complement the keyword list: even with `Function` and `eval`
// blocked, `({}).constructor.constructor("...")()` reaches the Function
// constructor without naming it. These patterns block the standard escape
// vectors via property access on the prototype chain.
//
// Patterns are matched against the *original* script rather than the
// strings-stripped one, because `["constructor"]`/`["__proto__"]` access
// requires an actual string literal in the bracket position.
const DISALLOWED_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
    [/\.\s*constructor\b/, ".constructor"],
    [/\[\s*(['"`])constructor\1\s*\]/, '["constructor"]'],
    [/\.\s*__proto__\b/, ".__proto__"],
    [/\[\s*(['"`])__proto__\1\s*\]/, '["__proto__"]'],
];

const VALID_PARAM = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Strip line/block comments and string literals from a script so the keyword
 * scan doesn't false-positive on flagged words appearing inside strings or
 * comments (e.g. `"window-shopping"` or `// uses fetch`). Replacements keep
 * the original character positions roughly aligned.
 */
function stripStringsAndComments(script: string): string {
    return script
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ")
        .replace(/'(?:\\.|[^'\\])*'/g, "''")
        .replace(/"(?:\\.|[^"\\])*"/g, '""')
        .replace(/`(?:\\.|[^`\\])*`/g, "``");
}

/**
 * Validate a script source against the disallowed-keyword and disallowed-pattern
 * lists, throwing if any sandbox-escape vector is detected.
 *
 * @throws Error if a disallowed keyword or pattern is present.
 * @internal
 */
function checkScriptSafety(script: string): void {
    const stripped = stripStringsAndComments(script);
    for (const keyword of DISALLOWED_KEYWORDS) {
        const pattern = new RegExp(`\\b${keyword}\\b`);
        if (pattern.test(stripped)) {
            throw new Error(
                `Disallowed keyword detected in script: ${keyword}`,
            );
        }
    }
    for (const [pattern, label] of DISALLOWED_PATTERNS) {
        if (pattern.test(script)) {
            throw new Error(
                `Disallowed pattern detected in script: ${label}`,
            );
        }
    }
}

/**
 * Compile a string of script source into a live (optionally async) function,
 * after validating its parameters and rejecting unsafe constructs.
 *
 * @remarks
 * Parameter names must be plain identifiers (so default-value expressions cannot
 * be smuggled in), and the body is screened by {@link checkScriptSafety}. A body
 * that does not begin with a statement keyword is wrapped in `return (...)` so
 * expression bodies work; the function always runs in strict mode.
 *
 * @param script - The function body (or single expression) source.
 * @param args - Parameter names; each must be a valid identifier.
 * @param options - Options.
 * @param options.isAsync - Compile as an async function when `true`.
 * @returns The compiled `Function` (or async function).
 * @throws Error if a parameter name is invalid or the script fails the safety check.
 */
export function textToFunction(
    script: string,
    args: string[],
    { isAsync = false }: { isAsync?: boolean } = {},
): AsyncFunction | Function {
    // Reject anything that isn't a plain identifier so callers cannot smuggle
    // default-value expressions through the Function-constructor parameter
    // list (e.g. `args = ["x = sideEffect()"]`, which would execute at call
    // time).
    for (const arg of args) {
        if (!VALID_PARAM.test(arg)) {
            throw new Error(`Invalid parameter name: ${JSON.stringify(arg)}`);
        }
    }
    checkScriptSafety(script);
    const body = script.trim();
    // For the wrap-in-return heuristic, look at the body with strings and
    // comments removed so that a leading `// comment\nreturn x;` is still
    // recognised as a statement block.
    const bodyForCheck = stripStringsAndComments(body).trim();
    const compiled = `"use strict";\n${
        /^(return|{|if|for|while|switch|try)\b/.test(bodyForCheck) ?
            body
        :   `return (${body});`
    }`;
    return isAsync ?
            new AsyncFunction(...args, compiled)
        :   new Function(...args, compiled);
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

/**
 * Recursively revive a JSON-decoded value into live runtime objects — the
 * inverse of {@link defaultToJSON}.
 *
 * @remarks
 * Handles the encoding tags produced by {@link defaultToJSON}: `__bigint__:`,
 * `__date__:`, `__url__:`, and `__func__:` string prefixes, and `__type`-tagged
 * objects for `SohlMap`/`Map`/`Set`/`RegExp`/`Error`/`URL`/`ClientDocument`.
 * Objects carrying a registered-kind marker ({@link KIND_KEY}) are reconstructed
 * to their concrete class via {@link getCtorForKind}, with children revived
 * bottom-up and the owning logic supplied through `ctx.parent`.
 *
 * @param value - The parsed JSON value to revive.
 * @param ctx - Reconstruction context; `ctx.parent` becomes the owning logic for
 *   any revived registered instances.
 * @returns The revived value.
 */
export function defaultFromJSON(
    value: unknown,
    ctx?: { parent?: unknown },
): unknown {
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
        return value.map((v) => defaultFromJSON(v, ctx));
    }

    if (typeof value === "object" && value !== null) {
        const maybe = value as any;

        switch (maybe.__type) {
            case "SohlMap":
                return new SohlMap(
                    maybe.entries.map(([k, v]: [any, any]) => [
                        k,
                        defaultFromJSON(v, ctx),
                    ]),
                );
            case "Map":
                return new Map(
                    maybe.entries.map(([k, v]: [any, any]) => [
                        k,
                        defaultFromJSON(v, ctx),
                    ]),
                );
            case "Set":
                return new Set(
                    maybe.values.map((v: unknown) => defaultFromJSON(v, ctx)),
                );
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
                return fvttResolveUuid(maybe.uuid);
        }

        // Revive a registered domain-class instance. Children are revived
        // first (bottom-up) so the constructor receives live nested instances
        // (e.g. a SuccessTestResult's `roll` is already a SimpleRoll). The
        // owning logic is re-supplied via `ctx.parent`, not from the payload.
        const kind = maybe[KIND_KEY];
        if (typeof kind === "string") {
            const Ctor = getCtorForKind(kind);
            if (Ctor) {
                const data: Record<string, unknown> = {};
                for (const [key, val] of Object.entries(maybe)) {
                    if (key === KIND_KEY) continue;
                    data[key] = defaultFromJSON(val, ctx);
                }
                return new Ctor(data, { parent: ctx?.parent });
            }
        }

        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(maybe)) {
            result[key] = defaultFromJSON(val, ctx);
        }
        return result;
    }

    return value;
}

/**
 * Reconstruct a live class instance from its serialized form — the inverse of
 * {@link instanceToJSON} followed by `JSON.stringify`. Accepts either the JSON
 * string or the already-parsed object. Nested registered instances are revived
 * bottom-up; the owning {@link SohlLogic} is supplied via `parent` (every
 * modifier/result requires one) rather than carried in the payload.
 *
 * @typeParam T - The expected reconstructed type.
 * @param data - The serialized instance (JSON string or parsed object).
 * @param parent - The logic to own the reconstructed instance and its nested
 *   modifiers/results.
 */
export function instanceFromJSON<T>(
    data: PlainObject | string,
    parent?: unknown,
): T {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return defaultFromJSON(parsed, { parent }) as T;
}

/**
 * Recursively convert an arbitrary value into a JSON-safe representation that
 * {@link defaultFromJSON} can faithfully revive.
 *
 * @remarks
 * Scalars pass through; `bigint`, `Date`, `URL`, `SohlMap`, `Map`, `Set`,
 * `RegExp`, and `Error` are encoded with tagged forms. Foundry documents (those
 * with a `documentName`) are reduced to a `ClientDocument` reference by UUID.
 * Functions, symbols, and `undefined` are dropped (return `undefined`). Objects
 * with a `toJSON` method delegate to it; other objects are serialized key by key
 * (omitting keys whose values serialize to `undefined`).
 *
 * @param value - The value to serialize.
 * @returns A JSON-safe value, or `undefined` if the value is non-serializable.
 */
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

    if (Object.hasOwn(value, "documentName")) {
        return {
            __type: "ClientDocument",
            uuid: value.uuid,
        } as JsonValue;
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

/**
 * Serialize an object instance to a plain JSON-safe object.
 * Strips leading underscores from property names, skips functions,
 * and includes a `__kind` field for type identification.
 */
export function instanceToJSON(instance: object): PlainObject {
    const result: PlainObject = {};
    result[KIND_KEY] =
        getKindForCtor(instance.constructor) ??
        (instance.constructor as any).kind;

    for (const key of Object.keys(instance)) {
        // The `_parent` back-reference (e.g. ValueModifier/TestResult -> owning
        // SohlLogic) is transient and re-supplied via `options.parent` on
        // reconstruction. Serializing it bloats the payload and can recurse
        // through the logic graph, so it is never emitted.
        if (key === "_parent") continue;

        const value = (instance as any)[key];
        const nkey = key.startsWith("_") ? key.substring(1) : key;

        if (typeof value === "function") {
            const descriptor = Object.getOwnPropertyDescriptor(instance, key);
            if (!descriptor || typeof descriptor.value !== "function") continue;
        }

        result[nkey] = defaultToJSON(value);
    }

    return result;
}

/**
 * Create a deep copy of an object instance by serializing it and reviving it
 * through {@link defaultFromJSON}.
 *
 * Reviving (rather than handing the raw serialized JSON to the constructor) is
 * what makes the copy faithful: nested registered instances, `Set`/`Map`
 * fields, and modifier `ValueDelta`s come back as live objects instead of inert
 * plain data. Registered classes (see {@link registerKind}) are reconstructed
 * to their concrete type by `defaultFromJSON`; an unregistered top-level type
 * still has its children revived and is rebuilt via its own constructor.
 *
 * The owning logic (`parent`) defaults to the source's own parent, so
 * `modifier.clone()` reuses the same owner. `data` overrides are merged before
 * reviving.
 */
export function cloneInstance<T>(
    instance: object,
    data: PlainObject = {},
    options: PlainObject = {},
): T {
    // Prefer a custom toJSON (e.g. SohlSpeaker serializes documents as ids);
    // fall back to reflective serialization.
    const json =
        typeof (instance as any).toJSON === "function" ?
            (instance as any).toJSON()
        :   instanceToJSON(instance);
    const merged = fvttMergeObject(json, data) as PlainObject;
    const parent = (options as any).parent ?? (instance as any).parent;
    const revived = defaultFromJSON(merged, { parent });
    if (revived instanceof (instance.constructor as any)) {
        return revived as T;
    }
    return new (instance.constructor as any)(revived, {
        ...options,
        parent,
    }) as T;
}

/**
 * Serialize a function into the portable `"__func__:[args]body"` string consumed
 * by {@link deserializeFn}.
 *
 * @remarks
 * Supports standard function declarations and arrow functions with either block
 * or expression bodies; expression-body arrows are wrapped in a `return`.
 * Closures over variables are not captured — only the source text is preserved.
 *
 * @param fn - The function to serialize.
 * @returns The serialized function string.
 * @throws Error if the function's source form is unsupported.
 */
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
            // Expression arrow body needs a return statement
            body = `return (${match[2].trim()})`;
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

/** Type guard narrowing `value` to a Foundry {@link DocumentId} (16 alphanumeric chars). */
export function isDocumentId(value: unknown): value is DocumentId {
    return typeof value === "string" && /^[a-zA-Z0-9]{16}$/.test(value);
}

/**
 * Assert that `value` is a valid Foundry document id and brand it as {@link DocumentId}.
 *
 * @throws TypeError if `value` is not a 16-character alphanumeric id.
 */
export function toDocumentId(value: string): DocumentId {
    if (!isDocumentId(value))
        throw new TypeError(`Invalid FoundryID: ${value}`);
    return value as DocumentId;
}

/** Branded string type representing a validated Foundry document UUID. */
export type DocumentUuid = string & {
    /** Nominal brand marker; never present at runtime. */
    __brand: "DocumentUuid";
};

/** Matches a world (`Type.id`) or compendium (`Compendium.pack.Type.id`) document UUID. */
const uuidRegex =
    /^(?:[A-Z][a-zA-Z]+)\.[a-zA-Z0-9]{16}$|^Compendium\.[a-z0-9-_]+\.[A-Z][a-zA-Z]+\.[a-zA-Z0-9]{16}$/;

/** Type guard narrowing `value` to a {@link DocumentUuid}. */
export function isDocumentUuid(value: unknown): value is DocumentUuid {
    return typeof value === "string" && uuidRegex.test(value);
}

/**
 * Assert that `value` is a valid document UUID and brand it as {@link DocumentUuid}.
 *
 * @throws TypeError if `value` does not match the document-UUID format.
 */
export function toDocumentUuid(value: string): DocumentUuid {
    if (!isDocumentUuid(value)) {
        throw new TypeError(`Invalid DocumentUuid: "${value}"`);
    }
    return value as DocumentUuid;
}

/**
 * Identity helper that returns the constructor unchanged while preserving its
 * type — used to obtain the base class in mixin/extension chains.
 *
 * @typeParam T - The constructor type.
 * @param ctor - The constructor to pass through.
 * @returns `ctor` unchanged.
 */
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

/**
 * Type guard narrowing a {@link SohlItem} to one of the gear item kinds (armor,
 * concoction, container, misc, projectile, or weapon), exposing its
 * {@link GearData} system data.
 */
export function isGearItem(
    item: SohlItem,
): item is SohlItem & {
    /** Narrowed {@link GearData} system data. */
    system: GearData;
} {
    return GearKinds.includes(item.type);
}

const MasteryLevelKinds = [
    ITEM_KIND.MYSTICALABILITY,
    ITEM_KIND.SKILL,
    ITEM_KIND.TRAIT,
] as string[];

/**
 * Type guard narrowing a {@link SohlItem} to a mastery-level item (mystical
 * ability, skill, or trait), exposing its {@link MasteryLevelData} system data.
 */
export function isMasteryItem(
    item: SohlItem,
): item is SohlItem & {
    /** Narrowed {@link MasteryLevelData} system data. */
    system: MasteryLevelData;
} {
    return MasteryLevelKinds.includes(item.type);
}

const ItemSubTypeKinds = [
    ITEM_KIND.AFFLICTION,
    ITEM_KIND.CONCOCTIONGEAR,
    ITEM_KIND.MYSTERY,
    ITEM_KIND.MYSTICALABILITY,
    ITEM_KIND.PROJECTILEGEAR,
    ITEM_KIND.SKILL,
    ITEM_KIND.TRAIT,
] as string[];

/**
 * Type guard narrowing a {@link SohlItem} to one of the item kinds that carries a
 * `subType` field, optionally requiring a specific sub-type value.
 *
 * @param item - The item to test.
 * @param subType - When given, the item's `system.subType` must equal this value.
 */
export function isItemWithSubType(
    item: SohlItem,
    subType?: string,
): item is SohlItem & {
    /** Narrowed system data carrying a sub-type discriminator. */
    system: {
        /** The item's sub-type value. */
        subType: string;
    };
} {
    return (
        ItemSubTypeKinds.includes(item.type) &&
        (!subType || (item.system as any).subType === subType)
    );
}

/**
 * Compute the secondary attribute modifier for a given index, where each step
 * above the baseline of 5 adds +5 (and an index of 0 or below yields -25).
 *
 * @param index - The attribute index (truncated to an integer).
 * @returns The corresponding ±5-stepped modifier.
 */
export function secondaryModifier(index: number): number {
    if (index <= 0) return -25;
    index = Math.trunc(index);
    return (index - 5) * 5;
}

/**
 * Compute an attribute index from a score, i.e. the score divided by ten and
 * truncated (clamped to 0 for non-positive scores).
 *
 * @param value - The attribute score.
 * @returns The derived index.
 */
export function index(value: number): number {
    if (value <= 0) return 0;
    return Math.trunc(value / 10);
}
