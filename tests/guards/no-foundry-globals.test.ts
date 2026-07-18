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
 * Boundary guard (issue #125): unit tests are scoped to the logic layer and must
 * reach Foundry only through the mock-swapped `FoundryHelpers` shim — never by
 * poking `globalThis.game`. Foundry-global setup belongs solely in
 * `tests/setup.ts` and `tests/mocks/`.
 *
 * When a test needs to drive Foundry-dependent behavior, spy the `fvtt*` shim
 * the source actually calls — e.g.
 * `vi.spyOn(FoundryHelpers, "fvttCurrentUser").mockReturnValue({ isGM: true })`
 * — rather than mutating the raw global.
 */
import { describe, it, expect } from "vitest";
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

// Matches `globalThis.game` and `(globalThis as any).game` member access.
const FORBIDDEN = /\bglobalThis\b[^\n]*?\.\s*game\b/;

const files = globSync("**/*.test.ts", {
    cwd: testsRoot,
    absolute: true,
}).filter(
    (f) =>
        !f.includes(`${path.sep}mocks${path.sep}`) &&
        !f.endsWith("no-foundry-globals.test.ts"),
);

describe("unit tests stay within the logic-layer boundary (issue #125)", () => {
    it.each(files)("%s does not reach globalThis.game", (file) => {
        const offenders = readFileSync(file, "utf8")
            .split("\n")
            .map((line, i) => ({ line: line.trim(), n: i + 1 }))
            .filter(({ line }) => FORBIDDEN.test(line));
        expect(
            offenders,
            `${path.relative(testsRoot, file)} reaches globalThis.game directly. ` +
                `Spy the FoundryHelpers shim the source calls instead:\n` +
                offenders.map((o) => `  L${o.n}: ${o.line}`).join("\n"),
        ).toEqual([]);
    });
});
