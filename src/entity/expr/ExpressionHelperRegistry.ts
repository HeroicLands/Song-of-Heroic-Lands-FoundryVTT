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

import { textToFunction } from "@src/utils/helpers";
import { SafeExpressionError } from "./SafeExpressionError";

/** A helper function callable from an expression; receives evaluated args. */
export type ExpressionHelper = (...args: unknown[]) => unknown;

/** A read-only map of helper name to implementation. */
export type HelperRegistry = Readonly<Record<string, ExpressionHelper>>;

/**
 * A world-authored custom helper, defined as a compiled function body plus its
 * parameter names. Loaded from the world's expression-helper JSON and compiled
 * into an {@link ExpressionHelper} via {@link textToFunction}.
 */
export interface HelperSource {
    /** Parameter names for the compiled function. Defaults to none. */
    args?: string[];
    /** The function body (or a bare expression, which is implicitly returned). */
    body: string;
}

/** Upper bound on a `matches()` regular-expression pattern, as a ReDoS guard. */
const MAX_PATTERN_LENGTH = 200;

/**
 * Return true when `source` contains constructs known to cause catastrophic
 * backtracking: backreferences (`\1`–`\9`) or a capturing/non-capturing group
 * that contains a quantifier and is itself followed by a quantifier
 * (`(a+)+`, `(.*)* `, `([a-z]+\d)+`, etc.).
 * @param source - The regular-expression source text to screen.
 * @returns `true` if a ReDoS-prone construct is present.
 */
function hasCatastrophicPattern(source: string): boolean {
    // Backreferences (\1–\9) cause exponential backtracking.
    if (/\\[1-9]/.test(source)) return true;

    // Nested quantifiers: `\(…+…\)[+*{]` or `\(…*…\)[+*{]`.
    // Matches a group whose body contains `+` or `*` (inner quantifier) and
    // whose close-paren is immediately followed by `+`, `*`, `?`, or `{`
    // (outer quantifier). `[^)]*` skips over everything inside except `)`,
    // so nested parens are handled by substring matching.
    if (/\([^)]*[+*][^)]*\)[+*?{]/.test(source)) return true;

    return false;
}

/**
 * Count the elements of an array/string or the own keys of an object.
 * @param value The collection to measure.
 * @returns The element/key count; 0 for `null`, `undefined`, or non-collections.
 */
function collectionSize(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (Array.isArray(value) || typeof value === "string") {
        return value.length;
    }
    if (typeof value === "object") return Object.keys(value).length;
    return 0;
}

/**
 * The built-in helper library — pure, null-tolerant utility functions for
 * collection membership, string and numeric operations, and type checks.
 *
 * Helpers are the only callable values in the expression language. These
 * built-ins are always present in the {@link expressionHelpers} registry;
 * worlds may add further helpers from a JSON file (see {@link HelperSource}).
 */
export const STANDARD_HELPERS: HelperRegistry = Object.freeze({
    /**
     * Test membership: array element, or own key of an object.
     * @param value The value (or key) to look for.
     * @param collection The array or object to search.
     * @returns Whether `value` is in `collection`.
     */
    has(value: unknown, collection: unknown): boolean {
        if (Array.isArray(collection)) return collection.includes(value);
        if (collection !== null && typeof collection === "object") {
            return Object.prototype.hasOwnProperty.call(
                collection,
                value as PropertyKey,
            );
        }
        return false;
    },

    /**
     * Element/key count of a collection.
     * @param collection An array, string, or object.
     * @returns The count, or 0 for nullish/non-collection values.
     */
    len(collection: unknown): number {
        return collectionSize(collection);
    },

    /**
     * Whether a collection has no elements/keys.
     * @param collection An array, string, or object.
     * @returns `true` when empty or nullish.
     */
    empty(collection: unknown): boolean {
        return collectionSize(collection) === 0;
    },

    /**
     * Lowercase a value's string form.
     * @param value The value to lowercase.
     * @returns The lowercased string.
     */
    lower(value: unknown): string {
        return String(value).toLowerCase();
    },

    /**
     * Uppercase a value's string form.
     * @param value The value to uppercase.
     * @returns The uppercased string.
     */
    upper(value: unknown): string {
        return String(value).toUpperCase();
    },

    /**
     * Whether a string starts with a prefix.
     * @param value The string to test.
     * @param prefix The prefix to look for.
     * @returns Whether `value` starts with `prefix`.
     */
    startsWith(value: unknown, prefix: unknown): boolean {
        return String(value).startsWith(String(prefix));
    },

    /**
     * Whether a string ends with a suffix.
     * @param value The string to test.
     * @param suffix The suffix to look for.
     * @returns Whether `value` ends with `suffix`.
     */
    endsWith(value: unknown, suffix: unknown): boolean {
        return String(value).endsWith(String(suffix));
    },

    /**
     * Whether a string contains a substring.
     * @param value The string to search.
     * @param sub The substring to look for.
     * @returns Whether `value` contains `sub`.
     */
    contains(value: unknown, sub: unknown): boolean {
        return String(value).includes(String(sub));
    },

    /**
     * Test a string against a regular expression supplied as a string.
     * @param value The string to test.
     * @param pattern The regular-expression pattern (a string).
     * @param flags Optional regular-expression flags.
     * @returns Whether the pattern matches.
     * @throws {SafeExpressionError} If the pattern is too long or invalid.
     */
    matches(value: unknown, pattern: unknown, flags?: unknown): boolean {
        const source = String(pattern);
        if (source.length > MAX_PATTERN_LENGTH) {
            throw new SafeExpressionError(
                "matches(): regular-expression pattern is too long",
            );
        }
        if (hasCatastrophicPattern(source)) {
            throw new SafeExpressionError(
                "matches(): pattern contains nested quantifiers or backreferences that may cause catastrophic backtracking",
            );
        }
        let regex: RegExp;
        try {
            regex = new RegExp(
                source,
                flags === undefined || flags === null ? "" : String(flags),
            );
        } catch (err) {
            throw new SafeExpressionError(
                "matches(): invalid regular expression",
                { cause: err },
            );
        }
        return regex.test(String(value));
    },

    /**
     * Smallest of the given numbers.
     * @param values The numbers to compare.
     * @returns The minimum value.
     */
    min(...values: unknown[]): number {
        return Math.min(...(values as number[]));
    },

    /**
     * Largest of the given numbers.
     * @param values The numbers to compare.
     * @returns The maximum value.
     */
    max(...values: unknown[]): number {
        return Math.max(...(values as number[]));
    },

    /**
     * Round a number to the nearest integer.
     * @param value The number to round.
     * @returns The rounded value.
     */
    round(value: unknown): number {
        return Math.round(value as number);
    },

    /**
     * Round a number down to an integer.
     * @param value The number to floor.
     * @returns The floored value.
     */
    floor(value: unknown): number {
        return Math.floor(value as number);
    },

    /**
     * Round a number up to an integer.
     * @param value The number to ceil.
     * @returns The ceiled value.
     */
    ceil(value: unknown): number {
        return Math.ceil(value as number);
    },

    /**
     * Absolute value of a number.
     * @param value The number.
     * @returns The absolute value.
     */
    abs(value: unknown): number {
        return Math.abs(value as number);
    },

    /**
     * Whether a value is a real number (not `NaN`).
     * @param value The value to test.
     * @returns Whether `value` is a number.
     */
    isNumber(value: unknown): boolean {
        return typeof value === "number" && !Number.isNaN(value);
    },

    /**
     * Whether a value is a string.
     * @param value The value to test.
     * @returns Whether `value` is a string.
     */
    isString(value: unknown): boolean {
        return typeof value === "string";
    },

    /**
     * Whether a value is an array.
     * @param value The value to test.
     * @returns Whether `value` is an array.
     */
    isArray(value: unknown): boolean {
        return Array.isArray(value);
    },

    /**
     * Whether a value is neither `undefined` nor `null`.
     * @param value The value to test.
     * @returns Whether `value` is defined.
     */
    defined(value: unknown): boolean {
        return value !== undefined && value !== null;
    },

    /**
     * Whether a SohlActor has a skill with the given shortcode in its logic.
     * Used in context-menu conditions to gate skill-dependent actions.
     * @param actor The SohlActor (as exposed by the condition context).
     * @param shortcode The skill shortcode to look for (e.g. `"dge"` for Dodge).
     * @returns Whether the actor has a skill with that shortcode.
     */
    hasUsableSkill(actor: unknown, shortcode: unknown): boolean {
        const skills = (actor as any)?.logic?.logicTypes?.["skill"] ?? [];
        return (skills as any[]).some(
            (s: any) => s?.data?.shortcode === String(shortcode),
        );
    },
});

/** Outcome of loading a custom-helper library — what installed and what did not. */
export interface LoadLibraryResult {
    /** Names of helpers successfully installed. */
    installed: string[];
    /** Entries that were skipped, each with a reason. */
    skipped: {
        /** The helper name of the skipped entry. */
        name: string;
        /** Why it was skipped (e.g. an invalid or unsafe definition). */
        reason: string;
    }[];
}

/** The live registry: built-ins plus any custom helpers installed at runtime. */
const registry = new Map<string, ExpressionHelper>(
    Object.entries(STANDARD_HELPERS),
);

/** Reset the registry to the built-in helpers only (drops all custom ones). */
function resetToBuiltins(): void {
    registry.clear();
    for (const [name, fn] of Object.entries(STANDARD_HELPERS)) {
        registry.set(name, fn);
    }
}

/**
 * The global, process-wide helper library that every {@link SafeExpression}
 * consults. Seeded with the {@link STANDARD_HELPERS} built-ins; a world may
 * layer additional helpers on top (see {@link registerSource}), typically
 * loaded from a GM-chosen JSON file at world init.
 *
 * It is a singleton by design: helpers are language-level, not per-expression,
 * so an expression never carries its own copy.
 */
export const expressionHelpers = {
    /**
     * Look up a helper by name.
     * @param name The helper name.
     * @returns The helper function, or `undefined` if not registered.
     */
    get(name: string): ExpressionHelper | undefined {
        return registry.get(name);
    },

    /**
     * Whether a helper with the given name is registered.
     * @param name The helper name.
     * @returns `true` if the helper exists.
     */
    has(name: string): boolean {
        return registry.has(name);
    },

    /**
     * The names of all registered helpers (built-in and custom).
     * @returns The helper names.
     */
    names(): string[] {
        return [...registry.keys()];
    },

    /**
     * Install a helper implementation directly.
     * @param name The helper name (as called from an expression).
     * @param fn The helper implementation.
     */
    register(name: string, fn: ExpressionHelper): void {
        registry.set(name, fn);
    },

    /**
     * Compile a world-authored helper from its source and install it.
     *
     * The body is compiled with {@link textToFunction}, which applies static
     * safety screening but is a sandbox, not a hard security boundary — the
     * source is expected to come from a GM-chosen (trusted) world file.
     * @param name The helper name (as called from an expression).
     * @param source The helper's parameter names and function body.
     * @throws If a parameter name is invalid or the body fails safety screening.
     */
    registerSource(name: string, source: HelperSource): void {
        const fn = textToFunction(
            source.body,
            source.args ?? [],
        ) as ExpressionHelper;
        registry.set(name, fn);
    },

    /**
     * Replace all custom helpers with a world-authored library.
     *
     * Resets to the built-ins, then compiles and installs each valid entry.
     * Invalid or unsafe entries are skipped (not thrown) so one bad helper
     * cannot block the rest; the result reports what installed and what did
     * not. Call whenever the world's helper file changes.
     * @param raw The parsed library: a map of helper name to {@link HelperSource}.
     * @returns Which helpers installed and which were skipped (with reasons).
     */
    loadLibrary(raw: unknown): LoadLibraryResult {
        resetToBuiltins();
        const installed: string[] = [];
        const skipped: { name: string; reason: string }[] = [];
        if (!raw || typeof raw !== "object") return { installed, skipped };
        for (const [name, entry] of Object.entries(
            raw as Record<string, unknown>,
        )) {
            if (!entry || typeof entry !== "object") {
                skipped.push({ name, reason: "entry is not an object" });
                continue;
            }
            const { args, body } = entry as HelperSource;
            if (typeof body !== "string") {
                skipped.push({ name, reason: "missing string 'body'" });
                continue;
            }
            if (
                args !== undefined &&
                (!Array.isArray(args) ||
                    args.some((a) => typeof a !== "string"))
            ) {
                skipped.push({ name, reason: "'args' must be a string array" });
                continue;
            }
            try {
                registry.set(
                    name,
                    textToFunction(body, args ?? []) as ExpressionHelper,
                );
                installed.push(name);
            } catch (err) {
                skipped.push({
                    name,
                    reason: err instanceof Error ? err.message : String(err),
                });
            }
        }
        return { installed, skipped };
    },

    /**
     * Remove all custom helpers, restoring the registry to the built-ins only.
     * Used when reloading a world's helper file (and to isolate unit tests).
     */
    clearCustom(): void {
        resetToBuiltins();
    },
};
