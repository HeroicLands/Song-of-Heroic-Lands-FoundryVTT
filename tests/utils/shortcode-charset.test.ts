/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    SHORTCODE_PATTERN,
    isValidShortcode,
} from "@src/utils/shortcode-charset.mjs";

describe("isValidShortcode", () => {
    it("accepts letters and digits in either case", () => {
        expect(isValidShortcode("arrow")).toBe(true);
        expect(isValidShortcode("BCFl")).toBe(true);
        expect(isValidShortcode("arrow2")).toBe(true);
        expect(isValidShortcode("A1")).toBe(true);
    });

    it("rejects the separators that break `type-shortcode` addressing", () => {
        // A hyphen is the wikilink qualifier's separator (#1398), so a shortcode
        // containing one makes the address ambiguous to parse.
        expect(isValidShortcode("self-pro")).toBe(false);
        expect(isValidShortcode("self_suf")).toBe(false);
        expect(isValidShortcode("a/b")).toBe(false);
    });

    it("rejects punctuation and whitespace", () => {
        expect(isValidShortcode("B&CFl")).toBe(false);
        expect(isValidShortcode("two words")).toBe(false);
        expect(isValidShortcode("dot.code")).toBe(false);
        expect(isValidShortcode("code!")).toBe(false);
    });

    it("rejects an empty or whitespace-only code", () => {
        expect(isValidShortcode("")).toBe(false);
        expect(isValidShortcode("   ")).toBe(false);
    });

    it("rejects non-ASCII letters", () => {
        // The key is an identifier, not prose: it is compared, sorted, and
        // embedded in wikilinks across two builds and a vault.
        expect(isValidShortcode("café")).toBe(false);
        expect(isValidShortcode("Jñana")).toBe(false);
    });

    it("rejects a non-string", () => {
        expect(isValidShortcode(undefined)).toBe(false);
        expect(isValidShortcode(null)).toBe(false);
        expect(isValidShortcode(42)).toBe(false);
    });

    it("is anchored, so an embedded newline cannot smuggle a bad code through", () => {
        expect(SHORTCODE_PATTERN.test("ok\nB&CFl")).toBe(false);
        expect(isValidShortcode("ok\nbad!")).toBe(false);
    });

    it("exposes a stateless pattern (no /g lastIndex carry-over)", () => {
        // A `/g` regex reused across calls alternates true/false on the same
        // input, which would make the guard pass every other document.
        expect(SHORTCODE_PATTERN.test("arrow")).toBe(true);
        expect(SHORTCODE_PATTERN.test("arrow")).toBe(true);
        expect(isValidShortcode("arrow")).toBe(true);
        expect(isValidShortcode("arrow")).toBe(true);
    });
});
