/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The `defineType` rule is stated twice, and the two copies must agree.
 *
 * `defineType(prefix, def, labelKeys?)` in `src/utils/constants.ts` mints a
 * localization key per member of an enum, and `utils/lang-references.mjs`
 * reproduces that rule from the TypeScript AST so
 * `package-build lang coverage` can require those keys to exist. Nothing else
 * compares the two: the shared guard cannot know a convention this repository
 * invented, and the helper cannot see `lang/en.json`. A drift between them is
 * silent in exactly the way that matters — the contributor stops contributing,
 * every `defineType` prefix reports as a missing key, and the reflex is to
 * suppress the guard rather than to fix the reader.
 *
 * The same seam `shortcode-format-agreement.test.ts` holds for the shortcode
 * rule and `src-import-severance.test.ts` for the installed package's imports.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

import { references } from "../../utils/lang-references.mjs";

const ROOT = path.resolve(__dirname, "../..");

/** One scanned source, in the shape `package-build lang coverage` supplies. */
type ScannedFile = { path: string; text: string };

/**
 * Run the contributor over a synthetic tree.
 *
 * @param files - The sources, as `{ path, text }`.
 * @returns What the contributor reports.
 */
function run(files: ScannedFile[]) {
    return references({ files });
}

/** The real `src/` tree, read the way the coverage command reads it. */
function realSources(): ScannedFile[] {
    return globSync("src/**/*.{ts,mjs}", { cwd: ROOT })
        .sort()
        .map((relative) => ({
            path: relative,
            text: fs.readFileSync(path.join(ROOT, relative), "utf8"),
        }));
}

describe("the defineType key rule", () => {
    it("mints the value when it is a plain identifier, the key otherwise", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const { labels } = defineType("SOHL.Demo", {
                        LORE: "lore",
                        DOTTED: "has.a.dot",
                        COLONED: "has:a:colon",
                    });
                    use(labels);
                `,
            },
        ]);
        expect(result.keys.map((k) => k.key)).toEqual([
            "SOHL.Demo.lore",
            "SOHL.Demo.DOTTED",
            "SOHL.Demo.COLONED",
        ]);
    });

    it("resolves a definition passed by name", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const DEF = { ALPHA: "alpha" } as const;
                    const { labels } = defineType("SOHL.Demo", DEF);
                    use(labels);
                `,
            },
        ]);
        expect(result.keys.map((k) => k.key)).toEqual(["SOHL.Demo.alpha"]);
    });

    it("takes a borrowed key from the third argument, spread included", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const SHARED = { BETA: "SOHL.Elsewhere.beta" };
                    const { labels } = defineType(
                        "SOHL.Demo",
                        { ALPHA: "alpha", BETA: "beta", GAMMA: "gamma" },
                        { ...SHARED, GAMMA: "SOHL.Elsewhere.gamma" },
                    );
                    use(labels);
                `,
            },
        ]);
        expect(result.keys.map((k) => k.key)).toEqual([
            "SOHL.Demo.alpha",
            "SOHL.Elsewhere.beta",
            "SOHL.Elsewhere.gamma",
        ]);
    });

    // The prefix names a family whose leaves are the generated keys; counting
    // it as a key in its own right would report all 34 of them missing.
    it("reports the prefix as a namespace, never as a key", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `const t = defineType("SOHL.Demo", { A: "a" });`,
            },
        ]);
        expect(result.namespaces).toEqual(["SOHL.Demo"]);
        expect(result.keys).toEqual([]);
    });
});

describe("whether a bundle's labels are required", () => {
    it("requires them when `labels` is destructured and used", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const { labels } = defineType("SOHL.Demo", { A: "a" });
                    render(labels);
                `,
            },
        ]);
        expect(result.keys.map((k) => k.key)).toEqual(["SOHL.Demo.a"]);
    });

    it("requires them when the result is read as `.choices`", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const demo = defineType("SOHL.Demo", { A: "a" });
                    field({ choices: demo.choices });
                `,
            },
        ]);
        expect(result.keys.map((k) => k.key)).toEqual(["SOHL.Demo.a"]);
    });

    // The common shape: an enum that exports only `kind`/`values` and localizes
    // its entries through a dynamic `${prefix}.${value}`. Its label keys are a
    // byproduct, and requiring them would demand ~1,300 keys nobody reads.
    it("does not require them when only kind/values are taken", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const { kind, values } = defineType("SOHL.Demo", { A: "a" });
                    export type Demo = typeof kind;
                `,
            },
        ]);
        expect(result.keys).toEqual([]);
    });

    // A renamed binding that is never mentioned again is not consumption; the
    // declaration itself is the only occurrence of the name.
    it("does not require them for a renamed binding nothing uses", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const { labels: demoLabels } = defineType("SOHL.Demo", {
                        A: "a",
                    });
                `,
            },
        ]);
        expect(result.keys).toEqual([]);
    });

    // Consumption is a fact about the tree, not about one file: a bundle is
    // declared in constants.ts and consumed from a DataModel somewhere else.
    it("resolves consumption across files", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const { labels: demoLabels } = defineType("SOHL.Demo", {
                        A: "a",
                    });
                    export { demoLabels };
                `,
            },
            { path: "src/b.ts", text: `field({ choices: demoLabels });` },
        ]);
        expect(result.keys.map((k) => k.key)).toEqual(["SOHL.Demo.a"]);
    });
});

describe("what the contributor says about itself", () => {
    it("marks generated keys exact, so nothing beneath them vouches", () => {
        const [key] = run([
            {
                path: "src/a.ts",
                text: `
                    const { labels } = defineType("SOHL.Demo", { A: "a" });
                    use(labels);
                `,
            },
        ]).keys;
        expect(key).toMatchObject({
            key: "SOHL.Demo.a",
            file: "src/a.ts",
            exact: true,
            origin: "defineType generates",
        });
        expect(key.line).toBeGreaterThan(0);
    });

    it("warns rather than failing on a call it cannot resolve", () => {
        const result = run([
            {
                path: "src/a.ts",
                text: `
                    const { labels } = defineType(PREFIX, { A: "a" });
                    const other = defineType("SOHL.Demo", buildDef());
                    use(labels);
                `,
            },
        ]);
        expect(result.keys).toEqual([]);
        expect(result.findings.map((f) => f.severity)).toEqual([
            "warning",
            "warning",
        ]);
        expect(result.findings.map((f) => f.message)).toEqual([
            "defineType call is not statically resolvable: non-literal prefix",
            "defineType call is not statically resolvable: unresolved def",
        ]);
    });

    // `.mjs` sources are scanned too, and carry no `defineType` call — the
    // helper is TypeScript. Parsing them here would only duplicate the shared
    // scan, so they are skipped rather than half-read.
    it("ignores a non-TypeScript source", () => {
        const result = run([
            {
                path: "src/a.mjs",
                text: `const t = defineType("SOHL.Demo", { A: "a" });`,
            },
        ]);
        expect(result).toEqual({
            keys: [],
            namespaces: [],
            patterns: [],
            findings: [],
        });
    });
});

describe("against the real tree", () => {
    // Not a snapshot of a number for its own sake: a contributor that silently
    // stops finding anything still returns a well-formed empty set, and the
    // coverage command would then report every prefix missing. Something has to
    // assert that it found the tree at all, and that it found it cleanly.
    it("resolves every defineType call in src/", () => {
        const result = run(realSources());
        expect(result.findings).toEqual([]);
        expect(result.namespaces.length).toBeGreaterThan(50);
        expect(result.keys.length).toBeGreaterThan(100);
    });

    it("generates only keys lang/en.json declares", () => {
        const declared = new Set(
            Object.keys(
                JSON.parse(
                    fs.readFileSync(path.join(ROOT, "lang/en.json"), "utf8"),
                ) as Record<string, string>,
            ),
        );
        const undeclared = [
            ...new Set(
                run(realSources())
                    .keys.map((k) => k.key)
                    .filter((key) => !declared.has(key)),
            ),
        ];
        expect(undeclared).toEqual([]);
    });
});
