/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Every package this toolchain imports at runtime must be declared in its own
 * `dependencies` (#1557).
 *
 * Inside this repository a missing declaration is invisible: the package is a
 * workspace, and npm hoists the root's `devDependencies` into the workspace
 * root's `node_modules/`, so `loglevel` or `yargs` resolves whether or not this
 * package ever asked for it. Installed from npm by another repository nothing
 * hoists, and the first import fails — the same class of "passes in situ, fails
 * when installed" defect that
 * `suite-is-self-contained.test.ts` guards from the other direction.
 *
 * So the check is a manifest-completeness one, run against the files the
 * package actually ships (its `files` field), and it is deliberately blunt: a
 * bare specifier in shipped code is either a Node builtin, this package
 * addressing itself, or a declared dependency. There is no fourth case.
 *
 * The reverse direction matters too: a shipped file may not import something
 * declared only as a `devDependency`, since a consumer installing the package
 * never gets those.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isBuiltin } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.dirname(HERE);

const manifest = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"),
) as {
    name: string;
    files: string[];
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

const declared = Object.keys(manifest.dependencies ?? {});
const declaredDev = Object.keys(manifest.devDependencies ?? {});

/**
 * `from "x"`, `import "x"`, `import("x")`, and `require("x")` — enough for this
 * package, which is plain ESM with no computed specifiers.
 *
 * The lookbehind keeps the keyword from matching inside a string literal:
 * `["from", "to"]` would otherwise read as importing `", "`.
 */
const SPECIFIER =
    /(?<!["'\w$.])\b(?:from|import|require)\b\s*\(?\s*["']([^"']+)["']/g;

/**
 * The npm package a specifier resolves to — `yargs/helpers` is `yargs`,
 * `@scope/name/deep` is `@scope/name`. Relative specifiers yield `undefined`.
 */
function packageOf(specifier: string): string | undefined {
    if (specifier.startsWith(".") || specifier.startsWith("/"))
        return undefined;
    if (isBuiltin(specifier)) return undefined;
    const parts = specifier.split("/");
    return specifier.startsWith("@") ?
            `${parts[0]}/${parts[1]}`
        :   (parts[0] as string);
}

/** Every `.mjs` under a path named in the manifest's `files` field. */
function shippedFiles(entry: string): string[] {
    const full = path.join(PKG_ROOT, entry);
    if (!fs.existsSync(full)) return [];
    if (fs.statSync(full).isFile()) return full.endsWith(".mjs") ? [full] : [];
    return fs
        .readdirSync(full, { withFileTypes: true })
        .flatMap((child) => shippedFiles(path.join(entry, child.name)));
}

const files = manifest.files.flatMap(shippedFiles);

/** The external packages a file imports, with the line each was seen on. */
function importsOf(file: string): { pkg: string; line: number }[] {
    const source = fs.readFileSync(file, "utf8");
    const seen: { pkg: string; line: number }[] = [];
    for (const match of source.matchAll(SPECIFIER)) {
        const pkg = packageOf(match[1] ?? "");
        if (!pkg) continue;
        const line = source.slice(0, match.index).split("\n").length;
        seen.push({ pkg, line });
    }
    return seen;
}

describe("the package declares what it imports", () => {
    it("finds the shipped files it is guarding", () => {
        // A broken walk would make every case below vacuously pass.
        expect(files.length).toBeGreaterThan(0);
    });

    it("declares runtime dependencies at all", () => {
        // The state #1557 fixed: no `dependencies` block whatsoever.
        expect(declared.length).toBeGreaterThan(0);
    });

    it.each(files.map((f) => path.relative(PKG_ROOT, f)))(
        "%s imports only builtins, itself, or a declared dependency",
        (relative) => {
            const undeclared = importsOf(path.join(PKG_ROOT, relative))
                .filter(
                    ({ pkg }) =>
                        pkg !== manifest.name && !declared.includes(pkg),
                )
                .map(({ pkg, line }) => `${relative}:${line} → ${pkg}`);

            expect(undeclared).toEqual([]);
        },
    );

    it.each(files.map((f) => path.relative(PKG_ROOT, f)))(
        "%s imports nothing that is only a devDependency",
        (relative) => {
            // A consumer installing the package never receives these.
            const devOnly = importsOf(path.join(PKG_ROOT, relative))
                .filter(
                    ({ pkg }) =>
                        declaredDev.includes(pkg) && !declared.includes(pkg),
                )
                .map(({ pkg, line }) => `${relative}:${line} → ${pkg}`);

            expect(devOnly).toEqual([]);
        },
    );

    it("declares vitest, which its own suite imports", () => {
        // The suite is not shipped, so vitest belongs in devDependencies —
        // but it must be declared somewhere, not borrowed from the root.
        expect(declaredDev).toContain("vitest");
    });

    it("declares no dependency it does not import", () => {
        const imported = new Set(
            files.flatMap((file) => importsOf(file).map(({ pkg }) => pkg)),
        );
        const unused = declared.filter((pkg) => !imported.has(pkg));

        expect(unused).toEqual([]);
    });
});
