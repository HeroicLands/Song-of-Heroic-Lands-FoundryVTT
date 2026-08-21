/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import path from "node:path";

// The linters are plain ESM under `utils/`, outside the `@src` alias tree, so
// they are imported by relative path.
import {
    formatLocator,
    formatDiagnostic,
    reportDiagnostic,
    locateInText,
} from "../../utils/lint-diagnostics.mjs";

describe("formatDiagnostic — one parseable line per finding", () => {
    // A linter's output is a work list. `file:line:column: severity: message`
    // is what every C-family compiler, `tsc` and ESLint emit, so an error
    // matcher already resolves it and nothing has to be taught the layout.
    it("emits file:line:column: severity: message", () => {
        expect(
            formatDiagnostic({
                file: "assets/content/Capital.md",
                line: 43,
                column: 635,
                severity: "error",
                message: "dead wikilink [[Kenbet_Pat]]",
            }),
        ).toBe(
            "assets/content/Capital.md:43:635: error: dead wikilink [[Kenbet_Pat]]",
        );
    });

    it("drops a field it cannot establish rather than guessing one", () => {
        // Defaulting to 1:1 would send a reader to the frontmatter every time.
        const base = {
            file: "a.md",
            severity: "warning" as const,
            message: "m",
        };
        expect(formatDiagnostic({ ...base, line: 7 })).toBe(
            "a.md:7: warning: m",
        );
        expect(formatDiagnostic(base)).toBe("a.md: warning: m");
        expect(formatDiagnostic({ ...base, column: 4 })).toBe(
            "a.md: warning: m",
        );
    });

    it("is not indented — the path starts the line", () => {
        // Leading whitespace alone puts a finding outside what a standard
        // error matcher reads, which is what the old `  file:line:` form did.
        expect(
            formatDiagnostic({
                file: "a.md",
                line: 1,
                column: 1,
                severity: "error",
                message: "m",
            }),
        ).toMatch(/^[^\s]/);
    });

    it("reports a path relative to the repository root", () => {
        expect(
            formatLocator({
                file: path.join(process.cwd(), "src/x.ts"),
                line: 2,
            }),
        ).toBe("src/x.ts:2");
    });
});

describe("reportDiagnostic", () => {
    afterEach(() => vi.restoreAllMocks());

    it("writes findings to stderr, one per line", () => {
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        reportDiagnostic({
            file: "a.md",
            line: 3,
            severity: "error",
            message: "m",
        });
        expect(err).toHaveBeenCalledWith("a.md:3: error: m");
    });
});

describe("locateInText — recovering a position a linter already had", () => {
    const text = "alpha\nbeta [[Link]] gamma\n[[Link]] again\n";

    it("finds a literal's line and column, both 1-based", () => {
        expect(locateInText(text, "[[Link]]")).toEqual({ line: 2, column: 6 });
    });

    it("can be asked for a later occurrence, so repeats are distinguishable", () => {
        expect(locateInText(text, "[[Link]]", 2)).toEqual({
            line: 3,
            column: 1,
        });
    });

    it("returns undefined rather than a wrong position", () => {
        // The caller then reports the file alone — still better than a line
        // that is not the problem.
        expect(locateInText(text, "[[Absent]]")).toBeUndefined();
        expect(locateInText(text, "[[Link]]", 3)).toBeUndefined();
        expect(locateInText(undefined as any, "x")).toBeUndefined();
    });
});
