/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The package's suite must run on its own — `npm test -w
 * @heroiclands/content-build` loads no `tests/setup.ts`, installs no Foundry
 * globals, and offers no `@src` alias (#1511).
 *
 * That is not merely a convenience. The pack pipeline was severed from the
 * system source in #1510, and a test that quietly imported `@src/...` or poked
 * `globalThis.game` would re-couple the package to one particular consumer's
 * repository — passing in situ and failing the moment the package is installed
 * from npm, which is the whole point of extracting it.
 *
 * The system suite carries the same `globalThis.game` guard over `tests/`
 * (`tests/guards/no-foundry-globals.test.ts`); this is its counterpart for the
 * files that moved out from under it, written with no dependency beyond Node so
 * it still runs when the package stands alone.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Matches `globalThis.game` and `(globalThis as any).game` member access. */
const FOUNDRY_GLOBAL = /\bglobalThis\b[^\n]*?\.\s*game\b/;

/** An import of the consuming repository's system source. */
const SRC_IMPORT = /["'](?:@src\/|(?:\.\.\/)+src\/)/;

/** Every `.test.ts` in this suite except this file, recursively. */
function suiteFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return suiteFiles(full);
        if (!entry.isFile() || !entry.name.endsWith(".test.ts")) return [];
        return full === fileURLToPath(import.meta.url) ? [] : [full];
    });
}

const files = suiteFiles(HERE);

describe("the content-build suite needs nothing from a consuming repository", () => {
    it("finds the suite it is guarding", () => {
        // A broken walk would make every case below vacuously pass.
        expect(files.length).toBeGreaterThan(0);
    });

    it.each(files)("%s stays free of Foundry and of src/", (file) => {
        const offenders = fs
            .readFileSync(file, "utf8")
            .split("\n")
            .map((line, i) => ({ line: line.trim(), n: i + 1 }))
            .filter(
                ({ line }) =>
                    FOUNDRY_GLOBAL.test(line) || SRC_IMPORT.test(line),
            );
        expect(
            offenders,
            `${path.relative(HERE, file)} reaches a Foundry global or the ` +
                `system source. The package has neither when it is installed ` +
                `from npm; a test that needs them belongs in the repository's ` +
                `own tests/build/ suite:\n` +
                offenders.map((o) => `  L${o.n}: ${o.line}`).join("\n"),
        ).toEqual([]);
    });
});
