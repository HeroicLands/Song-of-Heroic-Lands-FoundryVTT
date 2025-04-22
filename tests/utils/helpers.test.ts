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

import { describe, it, expect } from "vitest";
import {
    SYMBOLS,
    cloneDeep,
    isEqualDeep,
    isClassDerived,
    findDefiningClass,
    createUniqueId,
    encodePath,
    unflattenObject,
    filterByTemplate,
    flattenNested,
    getClassHierarchy,
    describeType,
    hasPath,
    getPathValue,
    setPathValue,
    deletePath,
    isValueEmpty,
    deepMerge,
    escapeHtml,
    unescapeHtml,
    MergeOptions,
} from "@utils/helpers";

/** @summary Unit tests for utility functions with positive and negative test cases. */
describe("Utility Functions", () => {
    it("SYMBOLS constants should match Unicode characters", () => {
        expect(SYMBOLS.TIMES).toBe("×");
        expect(SYMBOLS.GREATERTHANOREQUAL).toBe("≥");
        expect(SYMBOLS.LESSTHANOREQUAL).toBe("≤");
        expect(SYMBOLS.INFINITY).toBe("∞");
        expect(SYMBOLS.STARF).toBe("★");
        expect(SYMBOLS.STAR).toBe("☆");
    });

    it("cloneDeep should deeply clone objects and handle circular refs", () => {
        const original = { a: 1, b: { c: 2 } };
        const circular: any = { a: 1 };
        circular.self = circular;
        const cloned = cloneDeep(original);
        const clonedCircular = cloneDeep(circular);
        expect(cloned).toEqual(original);
        expect(cloned.b).not.toBe(original.b);
        expect(clonedCircular.self).toBe(clonedCircular);
    });

    it("cloneDeep should throw on non-plain objects in strict mode", () => {
        class Foo {}
        const inst = new Foo();
        expect(() => cloneDeep({ x: inst }, { strict: true })).toThrow();
    });

    it("isEqualDeep should handle equal and non-equal inputs", () => {
        expect(isEqualDeep({ a: 1 }, { a: 1 })).toBe(true);
        expect(isEqualDeep({ a: 1 }, { a: 2 })).toBe(false);
        expect(isEqualDeep({ a: 1 }, ["a"])).toBe(false);
    });

    it("isClassDerived should detect subclasses and reject invalid inputs", () => {
        class A {}
        class B extends A {}
        expect(isClassDerived(B, A)).toBe(true);
        expect(isClassDerived({}, Function)).toBe(false);
    });

    it("findDefiningClass should resolve correct class or undefined", () => {
        class A {
            foo() {}
        }
        class B extends A {}
        const b = new B();
        expect(findDefiningClass(b, "foo")).toBe(A);
        expect(findDefiningClass(b, "bar")).toBeUndefined();
    });

    it("createUniqueId should generate unique IDs", () => {
        const ids = new Set<string>();
        for (let i = 0; i < 100; i++) {
            const id = createUniqueId();
            expect(id).toHaveLength(16);
            expect(ids.has(id)).toBe(false);
            ids.add(id);
        }
    });

    it("encodePath should encode path segments safely", () => {
        expect(encodePath("/foo bar/baz")).toBe("/foo%20bar/baz");
        expect(encodePath("path/with?query")).toBe("path/with%3Fquery");
    });

    it("unflattenObject should expand flat object", () => {
        const flat = { "a.b": 1, "a.c": 2 };
        expect(unflattenObject(flat)).toEqual({ a: { b: 1, c: 2 } });
        expect(unflattenObject({})).toEqual({});
    });

    it("filterByTemplate should keep matching keys", () => {
        const src = { a: 1, b: { x: 2, y: 3 }, z: 99 };
        const tpl = { a: 0, b: { y: 0 } };
        expect(filterByTemplate(src, tpl)).toEqual({ a: 1, b: { y: 3 } });
        expect(filterByTemplate({ x: 1 }, { y: 0 })).toEqual({});
    });

    it("flattenNested should handle complex and simple nesting", () => {
        expect(flattenNested({ a: { b: 1 } })).toEqual({ "a.b": 1 });
        expect(flattenNested({})).toEqual({});
        expect(flattenNested({ a: 1 })).toEqual({ a: 1 });
    });

    it("getClassHierarchy should walk prototype chain", () => {
        class A {}
        class B extends A {}
        expect(getClassHierarchy(B)).toContain(A);
        expect(getClassHierarchy(Function)).toEqual([]);
    });

    it("describeType should return correct type name", () => {
        expect(describeType(null)).toBe("null");
        expect(describeType([])).toBe("Array");
        expect(describeType(new Set())).toBe("Set");
        expect(describeType(undefined)).toBe("undefined");
        expect(describeType(NaN)).toBe("number");
    });

    it("hasPath should validate existence of nested keys", () => {
        expect(hasPath({ a: { b: 1 } }, "a.b")).toBe(true);
        expect(hasPath({ a: 1 }, "")).toBe(false);
    });

    it("getPathValue should retrieve nested value or undefined", () => {
        expect(getPathValue({ a: { b: 1 } }, "a.b")).toBe(1);
        expect(getPathValue({ a: 1 }, "a.b.c")).toBeUndefined();
    });

    it("setPathValue should set and overwrite nested properties", () => {
        const obj: any = {};
        expect(setPathValue(obj, "x.y.z", 5)).toBe(true);
        expect(obj.x.y.z).toBe(5);
        expect(setPathValue(obj, "x.y.z", 5)).toBe(false);
    });

    it("deletePath should remove property if present", () => {
        const obj = { a: { b: 2 } };
        expect(deletePath(obj, "a.b")).toBe(true);
        expect(obj).toEqual({ a: {} });
        expect(deletePath(obj, "a.b")).toBe(false);
    });

    it("isValueEmpty should detect various empty forms", () => {
        expect(isValueEmpty(null)).toBe(true);
        expect(isValueEmpty("")).toBe(true);
        expect(isValueEmpty([])).toBe(true);
        expect(isValueEmpty({})).toBe(true);
        expect(isValueEmpty(0)).toBe(false);
        expect(isValueEmpty([1])).toBe(false);
    });

    it("escapeHtml should encode HTML-sensitive characters", () => {
        expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
        expect(escapeHtml("&")).toBe("&amp;");
        expect(escapeHtml("'")).toBe("&#x27;");
    });

    it("escapeHtml should throw on non-string input", () => {
        expect(() => escapeHtml(null as any)).toThrow();
        expect(() => escapeHtml(undefined as any)).toThrow();
        expect(() => escapeHtml({} as any)).toThrow();
    });

    it("unescapeHtml should decode valid HTML entities", () => {
        expect(unescapeHtml("&lt;div&gt;&amp;")).toBe("<div>&");
        expect(unescapeHtml("hello world")).toBe("hello world");
    });

    it("unescapeHtml should not alter malformed entities", () => {
        expect(unescapeHtml("&unknown;")).toBe("&unknown;");
        expect(unescapeHtml("&ltgt;")).toBe("&ltgt;");
    });
});

/** @summary Unit tests for testableDeepMerge covering success, edge cases, and expected failures. */
const testableDeepMerge = deepMerge as (
    original: unknown,
    other: unknown,
    opts?: MergeOptions,
    _depth?: number,
) => unknown;

const testCases = [
    {
        description: "Basic object merge",
        original: { a: 1 },
        other: { b: 2 },
        options: {},
        expected: { a: 1, b: 2 },
    },
    {
        description: "Overwrite true",
        original: { a: 1 },
        other: { a: 2 },
        options: { overwrite: true },
        expected: { a: 2 },
    },
    {
        description: "Overwrite false",
        original: { a: 1 },
        other: { a: 2 },
        options: { overwrite: false },
        expected: { a: 1 },
    },
    {
        description: "Insert keys false",
        original: { a: 1 },
        other: { b: 2 },
        options: { insertKeys: false },
        expected: { a: 1 },
    },
    {
        description: "Insert values false",
        original: { a: { x: 1 } },
        other: { a: { y: 2 } },
        options: { insertValues: false },
        expected: { a: { x: 1 } },
    },
    {
        description: "Recursive false",
        original: { a: { x: 1 } },
        other: { a: { y: 2 } },
        options: { recursive: false },
        expected: { a: { y: 2 } },
    },
    {
        description: "Enforce types: same type",
        original: { a: 1 },
        other: { a: 2 },
        options: { enforceTypes: true },
        expected: { a: 2 },
    },
    {
        description: "Perform deletions: remove key",
        original: { a: 1, b: 2 },
        other: { "-=a": null },
        options: { performDeletions: true },
        expected: { b: 2 },
    },
    {
        description: "Perform deletions: replace key",
        original: { a: { x: 1 } },
        other: { "==a": { y: 2 } },
        options: { performDeletions: true },
        expected: { a: { y: 2 } },
    },
    {
        description: "Basic array merge",
        original: [1, 2],
        other: [undefined, 3],
        options: {},
        expected: [1, 3],
    },
    {
        description: "Array insert values",
        original: [1],
        other: [1, 2],
        options: { insertValues: true },
        expected: [1, 2],
    },
    {
        description: "Array no insert",
        original: [1],
        other: [1, 2],
        options: { insertValues: false },
        expected: [1],
    },
    {
        description: "Array overwrite false",
        original: [1],
        other: [2],
        options: { overwrite: false },
        expected: [1],
    },
    {
        description: "Nested deep merge",
        original: { a: { b: { c: 1 } } },
        other: { a: { b: { d: 2 } } },
        options: {},
        expected: { a: { b: { c: 1, d: 2 } } },
    },
    {
        description: "Array of objects",
        original: [{ x: 1 }],
        other: [{}, { y: 2 }],
        options: { insertValues: true },
        expected: [{ x: 1 }, { y: 2 }],
    },
    {
        description: "Overwrite array object",
        original: [{ x: 1 }],
        other: [{ x: 2 }],
        options: { overwrite: true },
        expected: [{ x: 2 }],
    },
];

describe("deepMerge", () => {
    for (const {
        description,
        original,
        other,
        options,
        expected,
    } of testCases) {
        it(description, () => {
            const result = testableDeepMerge(
                structuredClone(original) as unknown,
                structuredClone(other) as unknown,
                options,
            ) as typeof expected;
            expect(result).toEqual(expected);
        });
    }

    it("throws on mismatched types with enforceTypes", () => {
        expect(() =>
            testableDeepMerge({ a: 1 }, { a: "oops" }, { enforceTypes: true }),
        ).toThrow();
    });

    it("throws on non-null delete with performDeletions", () => {
        expect(() =>
            testableDeepMerge(
                { a: 1 },
                { "-=a": "bad" },
                { performDeletions: true },
            ),
        ).toThrow();
    });

    it("throws when trying to merge a Map", () => {
        const a = { a: 1 };
        const b = new Map([["b", 2]]);
        expect(() => testableDeepMerge(a, b as any)).toThrow();
    });

    it("throws when trying to merge a non-object value", () => {
        const a = { a: 1 };
        expect(() => testableDeepMerge(a, 42 as any)).toThrow();
        expect(() => testableDeepMerge(42 as any, a)).toThrow();
    });

    it("throws when trying to merge null values", () => {
        const a = { a: 1 };
        expect(() => testableDeepMerge(a, null as any)).toThrow();
        expect(() => testableDeepMerge(null as any, a)).toThrow();
    });

    it("throws when trying to merge class instances", () => {
        class CustomClass {
            constructor(public prop: string) {}
        }
        const a = new CustomClass("foo");
        const b = { prop: "bar" };
        expect(() => testableDeepMerge(a as any, b)).toThrow();
        expect(() => testableDeepMerge(b, a as any)).toThrow();
    });
});
