/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// Build-time pack library (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import {
    compilePacks,
    unpackPacks,
    cleanPacks,
} from "../engine/compendiums.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
const LIBRARY = path.resolve(HERE, "../engine/compendiums.mjs");
const LIBRARY_URL = pathToFileURL(LIBRARY).href;
// The configuration contract and the manifest reader, for the guard-order test
// below: it induces package-id drift through configuration (#1508), since the
// manifest is no longer located by the working directory.
const CONFIG_URL = pathToFileURL(path.resolve(HERE, "../config.mjs")).href;
const MANIFEST_URL = pathToFileURL(
    path.resolve(HERE, "../engine/package-manifest.mjs"),
).href;
// Resolved here, not in the child: the child runs from an empty temp
// directory, where a bare `loglevel` specifier has no `node_modules` to find.
const LOGLEVEL_URL = pathToFileURL(
    createRequire(import.meta.url).resolve("loglevel"),
).href;

/**
 * Import the library in a child process rooted at `cwd` — the only honest way
 * to observe module-scope side effects, since they happen once per process and
 * vitest has already imported the module.
 *
 * @param cwd     Working directory the child runs in.
 * @param script  Module source appended after the import, printing its findings.
 * @param argv    Arguments handed to the child, to catch stray argv parsing.
 */
function importInCwd(
    cwd: string,
    script: string,
    argv: string[] = [],
): { status: number | null; stdout: string; stderr: string } {
    const source = `const lib = await import(${JSON.stringify(LIBRARY_URL)});\n${script}`;
    const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", source, ...argv],
        { cwd, encoding: "utf8" },
    );
    return {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
    };
}

/** {@link importInCwd} in a throwaway empty directory, returned for inspection. */
function importInEmptyCwd(
    script: string,
    argv: string[] = [],
): { cwd: string; status: number | null; stdout: string; stderr: string } {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-compendiums-"));
    return { cwd, ...importInCwd(cwd, script, argv) };
}

describe("the compendium library is importable", () => {
    it("exports compilePacks, unpackPacks, and cleanPacks", () => {
        expect(compilePacks).toBeTypeOf("function");
        expect(unpackPacks).toBeTypeOf("function");
        expect(cleanPacks).toBeTypeOf("function");
    });

    it("creates nothing in the caller's working directory", () => {
        const { cwd, status, stderr } = importInEmptyCwd(
            `process.stdout.write(Object.keys(lib).sort().join(","));`,
        );
        expect(stderr).toBe("");
        expect(status).toBe(0);
        // No `build/tmp/packs`, no stray anything: a library that is merely
        // imported must not touch the filesystem of whoever imported it.
        expect(fs.readdirSync(cwd)).toEqual([]);
    });

    it("imports from a tree with no Foundry package manifest", () => {
        // The hardest edge (#1507): a *module* repository ships
        // `module.json`, not `system.template.json`, and an empty directory
        // ships neither. Importing the library must not go looking for one in
        // the caller's tree — the eager `./assets/templates/system.template.json`
        // read used to throw here before the CLI took it over.
        //
        // (`helpers.mjs` still resolves that manifest by a *module*-relative
        // path, so this proves the caller's tree is untouched, not that the
        // pipeline is manifest-free. Hoisting that read into configuration is
        // #1508.)
        const { status, stdout, stderr } = importInEmptyCwd(
            `process.stdout.write(typeof lib.compilePacks);`,
        );
        expect(stderr).toBe("");
        expect(status).toBe(0);
        expect(stdout).toBe("function");
    });

    it("does not reconfigure the shared loglevel singleton", () => {
        const { status, stdout, stderr } = importInEmptyCwd(
            `const log = (await import(${JSON.stringify(LOGLEVEL_URL)})).default;
             process.stdout.write(String(log.getLevel()));`,
        );
        expect(stderr).toBe("");
        expect(status).toBe(0);
        // loglevel's untouched default is WARN (3). An import that configures
        // the singleton would leave INFO (2) behind for the whole process.
        expect(stdout).toBe("3");
    });

    it("does not parse argv or run a command", () => {
        const { cwd, status, stdout, stderr } = importInEmptyCwd(
            `process.stdout.write("imported");`,
            ["package", "compile", "--help"],
        );
        expect(stderr).toBe("");
        expect(status).toBe(0);
        // yargs would have printed usage and (for `compile`) started a build.
        expect(stdout).toBe("imported");
        expect(fs.readdirSync(cwd)).toEqual([]);
    });
});

describe("compilePacks runs the package-id guard before it generates anything", () => {
    it("writes no pack output at all when the configured id has drifted", () => {
        // The order of the two build-failure guards in `generatePacksJson` is
        // load-bearing and arrived at by two independent changes merging, so
        // nothing in the code announces it: the package-id check (#1503) runs
        // *before* any pack is generated, and the empty-pass check (#1502)
        // folds in after. Reversed, the build still exits non-zero — but only
        // after emitting a whole tree of documents addressing a package that
        // does not ship them.
        //
        // The drift is induced through the **configuration** the library reads,
        // not through the child's working directory. Since #1508 the manifest is
        // located by `paths.packageManifest`, so a sandbox manifest that merely
        // sat in the cwd would be ignored — correctly, since that is the whole
        // point of resolving it by configuration rather than by accident of
        // launch directory. Handing `compilePacks` a config rooted at the
        // sandbox is the seam a consuming repository uses, and it is the seam
        // this asserts against.
        const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-drift-"));
        fs.mkdirSync(path.join(repo, "assets/templates"), { recursive: true });
        fs.writeFileSync(
            path.join(repo, "assets/templates/system.template.json"),
            `${JSON.stringify(
                {
                    id: "not-sohl",
                    packs: [],
                    // Valid in every respect *except* the id, so a reversed
                    // guard order fails on the "nothing was written" assertion
                    // below rather than tripping over an incomplete manifest
                    // first. The floor is this sandbox package's own; the
                    // `_stats` stamp is not what is under test here.
                    compatibility: { minimum: "14.0" },
                },
                null,
                2,
            )}\n`,
            "utf8",
        );
        // A real content tree, so a guard that ran after generation would
        // genuinely have written packs by the time it threw — which is what
        // makes the "nothing was written" assertion below mean something.
        fs.symlinkSync(
            path.join(REPO_ROOT, "assets/content"),
            path.join(repo, "assets/content"),
        );

        // Every output path is inside the sandbox, so a late guard writes
        // *there* — visible to the assertions, and never into the real build.
        const stageDest = path.join(repo, "build/stage/packs");
        const { stdout, stderr } = importInCwd(
            repo,
            `const { defineConfig } = await import(${JSON.stringify(CONFIG_URL)});
             const config = defineConfig({
                 rootDir: ${JSON.stringify(repo)},
                 contentPackage: "sohl",
                 // Agrees with nothing the sandbox manifest declares — the drift.
                 foundryPackage: "sohl",
                 packageKind: "systems",
                 stats: {
                     systemId: "sohl",
                     systemVersion: "0.0.0",
                     lastModifiedBy: "sohlbuilder00000",
                 },
                 skipDirectories: ["Templates"],
                 packs: [
                     { name: "items", type: "Item", folders: "item-folders.yaml" },
                     { name: "macros", type: "Macro", folders: "macro-folders.yaml" },
                 ],
             });
             try {
                 await lib.compilePacks({ config, packName: "macros" });
                 process.stdout.write("resolved without throwing");
             } catch (err) {
                 process.stdout.write(err.message);
             }`,
        );

        expect(stderr).toBe("");
        expect(stdout).toMatch(/Foundry package id drift/);
        // It read the *configured* manifest, not this repository's.
        expect(stdout).toMatch(/not-sohl/);
        // Nothing generated, nothing compiled: the guard fired first.
        expect(fs.existsSync(path.join(repo, "build/packs-json"))).toBe(false);
        expect(fs.existsSync(stageDest)).toBe(false);
    });

    it("reads the manifest from configuration, not from the working directory", () => {
        // The companion half of the rewrite above, stated as its own fact so a
        // reader is not left wondering why the sandbox manifest stopped being
        // consulted: a drifted manifest sitting in the cwd is *ignored*, because
        // `paths.packageManifest` is what locates it. Without this, the test
        // above could be misread as a weakened version of the original.
        const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-cwd-"));
        fs.mkdirSync(path.join(repo, "assets/templates"), { recursive: true });
        fs.writeFileSync(
            path.join(repo, "assets/templates/system.template.json"),
            `${JSON.stringify({ id: "not-sohl", packs: [] }, null, 2)}\n`,
            "utf8",
        );

        const { stdout, stderr } = importInCwd(
            repo,
            `const { readManifestPackageId } = await import(
                 ${JSON.stringify(MANIFEST_URL)}
             );
             process.stdout.write(readManifestPackageId().packageId);`,
        );

        expect(stderr).toBe("");
        // This repository's own manifest, reached from a cwd holding a different
        // one — cwd cannot decide which package a build addresses.
        expect(stdout).toBe("sohl");
    });
});
