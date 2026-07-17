/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLy VTT).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Security regression tests for issue #165:
 * Catastrophic ReDoS in FILE_PATH_REGEX.
 *
 * The original inner character class `[^<>:"|?*\n\r]` also matched `/` and `\`,
 * which overlapped with the adjacent `(?:[\\/]...)` group. For an invalid
 * path of N segments ending in a forbidden character, the regex engine had to
 * explore O(2^N) backtracking paths.
 *
 * The fix excludes `/` and `\` from the inner char classes so each position
 * is consumed by exactly one arm — no overlap, O(N) execution.
 */
import { describe, it, expect } from "vitest";
import { FILE_PATH_REGEX, isFilePath } from "@src/utils/helpers";

/** Run regex against input and require completion under `limitMs` milliseconds. */
function assertFastMatch(
    input: string,
    limitMs: number = 100,
): RegExpMatchArray | null {
    const start = performance.now();
    const result = FILE_PATH_REGEX.exec(input);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(limitMs);
    return result;
}

describe("FILE_PATH_REGEX — ReDoS hardening (#165)", () => {
    describe("valid paths still accepted", () => {
        it("accepts a simple relative path", () => {
            expect(isFilePath("foo/bar.png")).toBe(true);
        });

        it("accepts an absolute POSIX path", () => {
            expect(isFilePath("/usr/local/share/icons/my.svg")).toBe(true);
        });

        it("accepts a Windows-style drive path", () => {
            expect(isFilePath("C:\\Users\\Tom\\file.txt")).toBe(true);
        });

        it("accepts a file:// URL", () => {
            expect(isFilePath("file:///home/user/data.json")).toBe(true);
        });

        it("accepts a path with dots", () => {
            expect(isFilePath("systems/sohl/assets/img/icon.png")).toBe(true);
        });
    });

    describe("invalid paths are rejected", () => {
        it("rejects a path with < in a segment", () => {
            expect(isFilePath("foo/<bar>")).toBe(false);
        });

        it("rejects a path ending in a forbidden character", () => {
            expect(isFilePath("foo/bar*")).toBe(false);
        });

        it("rejects an empty string", () => {
            expect(isFilePath("")).toBe(false);
        });
    });

    describe("catastrophic backtracking eliminated", () => {
        it("rejects a long path of slashes ending in a bad char in < 100 ms", () => {
            // Before the fix: 30 segments × 2 choices = 2^30 paths explored.
            const segments = Array.from({ length: 30 }, (_, i) => `seg${i}`);
            const evilInput = segments.join("/") + "*";
            assertFastMatch(evilInput);
        });

        it("handles backslash-separated path of 30 segments with bad tail in < 100 ms", () => {
            const segments = Array.from({ length: 30 }, (_, i) => `dir${i}`);
            const evilInput = segments.join("\\") + "*";
            assertFastMatch(evilInput);
        });

        it("handles mixed-separator 30-segment invalid path in < 100 ms", () => {
            const parts: string[] = [];
            for (let i = 0; i < 30; i++) {
                parts.push(i % 2 === 0 ? `seg${i}/` : `seg${i}\\`);
            }
            const evilInput = parts.join("") + "<bad>";
            assertFastMatch(evilInput);
        });
    });
});
