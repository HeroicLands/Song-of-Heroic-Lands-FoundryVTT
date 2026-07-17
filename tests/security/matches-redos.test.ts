/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Security regression tests for issue #166:
 * ReDoS in the `matches()` expression helper.
 *
 * `MAX_PATTERN_LENGTH` guards on length, not backtracking complexity. A
 * nested-quantifier pattern like `(a+)+` under 200 chars can hang the JS
 * engine for seconds. The fix rejects patterns that contain nested quantifiers
 * or backreferences by static analysis before calling `new RegExp(...)`.
 */
import { describe, it, expect } from "vitest";
import { STANDARD_HELPERS } from "@src/entity/expr/ExpressionHelperRegistry";
import { SafeExpressionError } from "@src/entity/expr/SafeExpressionError";

const helpers = STANDARD_HELPERS;

describe("matches() — ReDoS hardening (#166)", () => {
    describe("legitimate patterns continue to work", () => {
        it("matches a simple literal pattern", () => {
            expect(helpers.matches("hello world", "hello")).toBe(true);
        });

        it("returns false when the pattern does not match", () => {
            expect(helpers.matches("hello", "^z")).toBe(false);
        });

        it("respects the 'i' flag for case-insensitive matching", () => {
            expect(helpers.matches("Hello", "^h", "i")).toBe(true);
        });

        it("accepts a character class pattern", () => {
            expect(helpers.matches("abc123", "[0-9]+")).toBe(true);
        });

        it("accepts a non-capturing group without outer quantifier", () => {
            expect(helpers.matches("foobar", "(?:foo|bar)")).toBe(true);
        });

        it("accepts a simple quantified segment (not a group)", () => {
            expect(helpers.matches("aaa", "a+")).toBe(true);
        });

        it("accepts a word-boundary assertion", () => {
            expect(helpers.matches("skill", "\\bskill\\b")).toBe(true);
        });

        it("accepts anchored match with non-nested quantifier", () => {
            expect(helpers.matches("abc", "^[a-z]+$")).toBe(true);
        });
    });

    describe("invalid patterns are still rejected", () => {
        it("rejects an unpaired bracket", () => {
            expect(() => helpers.matches("x", "[")).toThrow(
                SafeExpressionError,
            );
        });

        it("rejects a pattern over MAX_PATTERN_LENGTH", () => {
            expect(() => helpers.matches("x", "a".repeat(201))).toThrow(
                SafeExpressionError,
            );
        });
    });

    describe("catastrophic patterns are rejected before execution", () => {
        it("rejects nested quantifier (a+)+ — classic ReDoS", () => {
            expect(() =>
                helpers.matches("a".repeat(30) + "b", "(a+)+"),
            ).toThrow(SafeExpressionError);
        });

        it("rejects nested quantifier (.+)+ against a long input", () => {
            expect(() =>
                helpers.matches("a".repeat(30) + "b", "(.+)+"),
            ).toThrow(SafeExpressionError);
        });

        it("rejects nested quantifier ([a-z]+\\d)+ ", () => {
            expect(() =>
                helpers.matches("abc1def2ghi3", "([a-z]+\\d)+"),
            ).toThrow(SafeExpressionError);
        });

        it("rejects backreference \\1 in pattern", () => {
            expect(() => helpers.matches("aa", "(a)\\1")).toThrow(
                SafeExpressionError,
            );
        });
    });
});
