/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The shortcode shape rule is stated twice, and the two copies must agree.
 *
 * It has to be stated twice. `@heroiclands/package-build` owns the build-time
 * rule — it lints every package's content tree, including the two this
 * repository does not contain — while the **runtime** enforces the same rule on
 * a live document (`resolveShortcodeKey`, and the migration that repairs legacy
 * keys). Shipped code cannot import a `devDependency`, so the runtime keeps its
 * own plain-ESM copy in `src/utils/shortcode-format.mjs`.
 *
 * Two copies of one rule is exactly the arrangement that drifts silently, and a
 * drift here is not cosmetic: the build would accept a key the runtime refuses
 * to save, or the runtime would accept one that breaks the `type-shortcode`
 * address whose parse needs the separating hyphen to be the only hyphen
 * (#1397). Nothing else compares them, so this test is the seam — the same job
 * `manifest-package-id.test.ts` does for the package id, and
 * `src-import-severance.test.ts` for the installed package's imports.
 *
 * It asserts against the **installed** package under `node_modules/`, not a
 * working copy, because that is the only form a consumer ever sees.
 */

import { describe, it, expect } from "vitest";

import {
    SHORTCODE_PATTERN as RUNTIME_PATTERN,
    isValidShortcode as runtimeIsValid,
} from "@src/utils/shortcode-format.mjs";

import {
    SHORTCODE_PATTERN as BUILD_PATTERN,
    isValidShortcode as buildIsValid,
} from "@heroiclands/package-build/engine/content-lint";

describe("the shortcode shape rule agrees across the boundary", () => {
    it("is the same pattern on both sides", () => {
        expect(RUNTIME_PATTERN.source).toBe(BUILD_PATTERN.source);
        expect(RUNTIME_PATTERN.flags).toBe(BUILD_PATTERN.flags);
    });

    // Comparing the sources alone would not catch a predicate that wrapped its
    // pattern differently — a blank-string allowance on one side, say.
    it.each([
        ["aconite", true],
        ["BCFl", true],
        ["weapon2", true],
        ["A", true],
        ["self-pro", false],
        ["B&CFl", false],
        ["two words", false],
        ["under_score", false],
        ["dotted.code", false],
        ["slash/code", false],
        ["café", false],
        ["", false],
    ])("agrees that %j is %s", (value, expected) => {
        expect(runtimeIsValid(value)).toBe(expected);
        expect(buildIsValid(value)).toBe(expected);
    });

    it("agrees on non-strings", () => {
        for (const value of [undefined, null, 42, {}, ["a"]]) {
            expect(runtimeIsValid(value as never)).toBe(false);
            expect(buildIsValid(value as never)).toBe(false);
        }
    });
});
