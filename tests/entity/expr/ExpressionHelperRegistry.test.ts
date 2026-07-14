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

import { describe, it, expect, beforeEach } from "vitest";
import {
    expressionHelpers as reg,
    STANDARD_HELPERS,
} from "@src/entity/expr/ExpressionHelperRegistry";
import { SafeExpressionError } from "@src/entity/expr/SafeExpressionError";

describe("ExpressionHelperRegistry", () => {
    // The registry is a process-wide singleton; drop any custom helpers a prior
    // test installed so each case starts from the built-ins only.
    beforeEach(() => reg.clearCustom());

    describe("built-ins", () => {
        it("exposes the built-in helpers by default", () => {
            expect(reg.has("has")).toBe(true);
            expect(reg.has("len")).toBe(true);
            expect(reg.has("min")).toBe(true);
            expect(typeof reg.get("upper")).toBe("function");
        });

        it("returns the same function object as STANDARD_HELPERS", () => {
            expect(reg.get("upper")).toBe(STANDARD_HELPERS.upper);
        });

        it("reports unknown helpers as absent", () => {
            expect(reg.has("nope")).toBe(false);
            expect(reg.get("nope")).toBeUndefined();
        });
    });

    describe("string helpers (#448)", () => {
        const h = (name: string) =>
            STANDARD_HELPERS[name] as (...a: any[]) => any;

        it("str: coerces any value to its string form", () => {
            expect(h("str")(42)).toBe("42");
            expect(h("str")(true)).toBe("true");
            expect(h("str")(null)).toBe("null");
            expect(h("str")(undefined)).toBe("undefined");
            expect(h("str")("x")).toBe("x");
        });

        it("concat: joins the string forms of all arguments", () => {
            expect(h("concat")("a", "b", "c")).toBe("abc");
            expect(h("concat")("n=", 3)).toBe("n=3");
            expect(h("concat")()).toBe("");
        });

        it("slice: extracts a substring by index, with an optional end", () => {
            expect(h("slice")("hello", 1, 3)).toBe("el");
            expect(h("slice")("hello", 2)).toBe("llo");
            expect(h("slice")("hello", -2)).toBe("lo");
        });

        it("substr: extracts a substring by start and length", () => {
            expect(h("substr")("hello", 1, 3)).toBe("ell");
            expect(h("substr")("hello", 2)).toBe("llo");
            expect(h("substr")("hello", 0, 0)).toBe("");
        });

        it("split: splits a string into an array on a separator", () => {
            expect(h("split")("a,b,c", ",")).toEqual(["a", "b", "c"]);
            expect(h("split")("a,b,c", ",", 2)).toEqual(["a", "b"]);
            expect(h("split")("abc", "")).toEqual(["a", "b", "c"]);
        });

        it("join: joins an array's elements with a separator", () => {
            expect(h("join")(["a", "b", "c"], ", ")).toBe("a, b, c");
            expect(h("join")([1, 2, 3], "-")).toBe("1-2-3");
            expect(h("join")([], ",")).toBe("");
            expect(h("join")("notarray", ",")).toBe("");
        });

        it("trim: removes leading and trailing whitespace", () => {
            expect(h("trim")("  hi  ")).toBe("hi");
            expect(h("trim")("\tx\n")).toBe("x");
        });

        it("replace: replaces every occurrence of a literal substring", () => {
            expect(h("replace")("a-b-c", "-", "_")).toBe("a_b_c");
            expect(h("replace")("aaa", "a", "b")).toBe("bbb");
            expect(h("replace")("abc", "z", "!")).toBe("abc");
        });

        it("replace: treats the search as a literal, not a regex", () => {
            expect(h("replace")("a.b.c", ".", "-")).toBe("a-b-c");
        });

        it("indexOf: reports the first index of a substring, or -1", () => {
            expect(h("indexOf")("hello", "l")).toBe(2);
            expect(h("indexOf")("hello", "z")).toBe(-1);
            expect(h("indexOf")("hello", "l", 3)).toBe(3);
        });

        it("charAt: returns the character at an index", () => {
            expect(h("charAt")("hello", 0)).toBe("h");
            expect(h("charAt")("hello", 4)).toBe("o");
            expect(h("charAt")("hello", 9)).toBe("");
        });

        it("capitalize: uppercases the first character only", () => {
            expect(h("capitalize")("hello")).toBe("Hello");
            expect(h("capitalize")("HELLO")).toBe("HELLO");
            expect(h("capitalize")("")).toBe("");
        });

        it("padStart / padEnd: pad a string to a target length", () => {
            expect(h("padStart")("5", 3, "0")).toBe("005");
            expect(h("padEnd")("5", 3, ".")).toBe("5..");
            expect(h("padStart")("5", 3)).toBe("  5");
        });

        it("repeat: repeats a string a number of times", () => {
            expect(h("repeat")("ab", 3)).toBe("ababab");
            expect(h("repeat")("x", 0)).toBe("");
        });

        it("guards against memory-exhausting sizes", () => {
            expect(() => h("repeat")("x", 1e9)).toThrow(SafeExpressionError);
            expect(() => h("padStart")("x", 1e9)).toThrow(SafeExpressionError);
            expect(() => h("padEnd")("x", 1e9)).toThrow(SafeExpressionError);
        });
    });

    describe("hasUsableSkill (#64)", () => {
        const fn = () => STANDARD_HELPERS.hasUsableSkill;

        it("returns true when the actor logic has a skill with the given shortcode", () => {
            const actor = {
                logic: {
                    logicTypes: {
                        skill: [{ data: { shortcode: "dge" } }],
                    },
                },
            };
            expect(fn()(actor, "dge")).toBe(true);
        });

        it("returns false when no skill matches the shortcode", () => {
            const actor = {
                logic: {
                    logicTypes: { skill: [{ data: { shortcode: "swd" } }] },
                },
            };
            expect(fn()(actor, "dge")).toBe(false);
        });

        it("returns false when the actor has no logic", () => {
            expect(fn()(null, "dge")).toBe(false);
            expect(fn()(undefined, "dge")).toBe(false);
            expect(fn()({}, "dge")).toBe(false);
        });
    });

    describe("custom function helpers", () => {
        it("registers and invokes a function helper", () => {
            reg.register("double", (n) => (n as number) * 2);
            expect(reg.has("double")).toBe(true);
            expect(reg.get("double")!(4)).toBe(8);
        });
    });

    describe("custom source helpers", () => {
        it("compiles a source body with named args (explicit return)", () => {
            reg.registerSource("addOne", { args: ["n"], body: "return n + 1" });
            expect(reg.get("addOne")!(41)).toBe(42);
        });

        it("compiles an expression body (implicit return)", () => {
            reg.registerSource("triple", { args: ["n"], body: "n * 3" });
            expect(reg.get("triple")!(3)).toBe(9);
        });

        it("defaults args to none", () => {
            reg.registerSource("answer", { body: "return 42" });
            expect(reg.get("answer")!()).toBe(42);
        });

        it("rejects a body that references a disallowed global", () => {
            expect(() =>
                reg.registerSource("evil", { body: "return fetch('/x')" }),
            ).toThrow();
        });

        it("rejects an invalid parameter name", () => {
            expect(() =>
                reg.registerSource("bad", {
                    args: ["not a name"],
                    body: "return 1",
                }),
            ).toThrow();
        });
    });

    describe("clearCustom", () => {
        it("drops custom helpers but keeps built-ins", () => {
            reg.register("temp", () => 1);
            expect(reg.has("temp")).toBe(true);
            reg.clearCustom();
            expect(reg.has("temp")).toBe(false);
            expect(reg.has("has")).toBe(true);
        });
    });

    describe("loadLibrary", () => {
        it("installs valid helpers from a map and reports them", () => {
            const result = reg.loadLibrary({
                addOne: { args: ["n"], body: "return n + 1" },
                greet: { args: ["who"], body: "'hi ' + who" },
            });
            expect(result.installed.sort()).toEqual(["addOne", "greet"]);
            expect(result.skipped).toEqual([]);
            expect(reg.get("addOne")!(41)).toBe(42);
            expect(reg.get("greet")!("bob")).toBe("hi bob");
        });

        it("clears previously loaded custom helpers on each load", () => {
            reg.loadLibrary({ a: { body: "return 1" } });
            expect(reg.has("a")).toBe(true);
            reg.loadLibrary({ b: { body: "return 2" } });
            expect(reg.has("a")).toBe(false);
            expect(reg.has("b")).toBe(true);
            // Built-ins survive.
            expect(reg.has("has")).toBe(true);
        });

        it("skips entries with a missing or non-string body", () => {
            const result = reg.loadLibrary({
                ok: { body: "return 1" },
                noBody: { args: ["n"] },
                notObj: "return 2",
            });
            expect(result.installed).toEqual(["ok"]);
            expect(result.skipped.map((s) => s.name).sort()).toEqual([
                "noBody",
                "notObj",
            ]);
        });

        it("skips entries whose body fails safety screening", () => {
            const result = reg.loadLibrary({
                evil: { body: "return fetch('/x')" },
            });
            expect(result.installed).toEqual([]);
            expect(result.skipped[0].name).toBe("evil");
            expect(reg.has("evil")).toBe(false);
        });

        it("tolerates a non-object library (returns empty result)", () => {
            expect(reg.loadLibrary(null).installed).toEqual([]);
            expect(reg.loadLibrary("nope").installed).toEqual([]);
        });
    });
});
