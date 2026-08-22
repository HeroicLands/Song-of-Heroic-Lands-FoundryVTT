/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
    BUILD_ARTIFACT_DIRS,
    cleanBuildArtifacts,
    copyTree,
    missingSources,
    stageAssets,
} from "../stage.mjs";

/** A throwaway tree, described as `{ relPath: contents }`. */
function tree(files: Record<string, string>): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pkg-stage-"));
    for (const [rel, body] of Object.entries(files)) {
        const abs = path.join(root, ...rel.split("/"));
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, body, "utf8");
    }
    return root;
}

/** Every file under `dir`, relative and POSIX-separated, sorted. */
function listed(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const out: string[] = [];
    const walk = (d: string) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, e.name);
            if (e.isDirectory()) walk(full);
            else out.push(path.relative(dir, full).split(path.sep).join("/"));
        }
    };
    walk(dir);
    return out.sort();
}

describe("copyTree", () => {
    it("copies a directory recursively and reports the file count", () => {
        const root = tree({
            "src/a.txt": "a",
            "src/nested/b.txt": "b",
            "src/nested/deep/c.txt": "c",
        });
        const written = copyTree(
            path.join(root, "src"),
            path.join(root, "stage"),
        );
        expect(written).toBe(3);
        expect(listed(path.join(root, "stage"))).toEqual([
            "a.txt",
            "nested/b.txt",
            "nested/deep/c.txt",
        ]);
    });

    it("copies a single file, creating its parent", () => {
        const root = tree({ "LICENSE.md": "text" });
        copyTree(
            path.join(root, "LICENSE.md"),
            path.join(root, "stage", "LICENSE.md"),
        );
        expect(
            fs.readFileSync(path.join(root, "stage/LICENSE.md"), "utf8"),
        ).toBe("text");
    });

    // The hook the system repository uses to theme icons as it stages them.
    it("writes a transform's result instead of the bytes", () => {
        const root = tree({ "src/icon.svg": "<svg/>", "src/data.bin": "raw" });
        copyTree(path.join(root, "src"), path.join(root, "stage"), {
            transform: (p) => (p.endsWith(".svg") ? "<svg themed/>" : null),
        });
        expect(fs.readFileSync(path.join(root, "stage/icon.svg"), "utf8")).toBe(
            "<svg themed/>",
        );
        // Returning null falls back to a byte copy.
        expect(fs.readFileSync(path.join(root, "stage/data.bin"), "utf8")).toBe(
            "raw",
        );
    });

    it("treats an undefined return as no transform", () => {
        const root = tree({ "src/a.txt": "a" });
        copyTree(path.join(root, "src"), path.join(root, "stage"), {
            transform: () => undefined,
        });
        expect(fs.readFileSync(path.join(root, "stage/a.txt"), "utf8")).toBe(
            "a",
        );
    });
});

describe("missingSources", () => {
    it("names every absent source, in the order listed", () => {
        const root = tree({ "lang/en.json": "{}" });
        expect(
            missingSources(
                [
                    ["lang", "stage/lang"],
                    ["templates", "stage/templates"],
                    ["styles", "stage/styles"],
                ],
                root,
            ),
        ).toEqual(["templates", "styles"]);
    });

    it("finds nothing when every source exists", () => {
        const root = tree({ "lang/en.json": "{}" });
        expect(missingSources([["lang", "stage/lang"]], root)).toEqual([]);
    });
});

describe("stageAssets", () => {
    it("stages every entry and reports what it did", () => {
        const root = tree({
            "lang/en.json": "{}",
            "templates/sheet.hbs": "x",
            "LICENSE.md": "l",
        });
        const result = stageAssets(
            [
                ["lang", "build/stage/lang"],
                ["templates", "build/stage/templates"],
                ["LICENSE.md", "build/stage/LICENSE.md"],
            ],
            { cwd: root },
        );
        expect(result).toEqual({ entries: 3, files: 3 });
        expect(listed(path.join(root, "build/stage"))).toEqual([
            "LICENSE.md",
            "lang/en.json",
            "templates/sheet.hbs",
        ]);
    });

    // A missing `lang/` ships a package with no localization and no warning.
    it("refuses a list with a missing source, naming all of them", () => {
        const root = tree({ "lang/en.json": "{}" });
        expect(() =>
            stageAssets(
                [
                    ["lang", "build/stage/lang"],
                    ["templates", "build/stage/templates"],
                    ["styles", "build/stage/styles"],
                ],
                { cwd: root },
            ),
        ).toThrow(/templates[\s\S]*styles/);
    });

    // A bad list must leave no half-populated stage to deploy by mistake.
    it("copies nothing at all when any source is missing", () => {
        const root = tree({ "lang/en.json": "{}" });
        expect(() =>
            stageAssets(
                [
                    ["lang", "build/stage/lang"],
                    ["nope", "build/stage/nope"],
                ],
                { cwd: root },
            ),
        ).toThrow();
        expect(listed(path.join(root, "build/stage"))).toEqual([]);
    });

    it("applies the transform across every entry", () => {
        const root = tree({ "a/one.svg": "1", "b/two.svg": "2" });
        stageAssets(
            [
                ["a", "stage/a"],
                ["b", "stage/b"],
            ],
            { cwd: root, transform: () => "themed" },
        );
        expect(
            fs.readFileSync(path.join(root, "stage/a/one.svg"), "utf8"),
        ).toBe("themed");
        expect(
            fs.readFileSync(path.join(root, "stage/b/two.svg"), "utf8"),
        ).toBe("themed");
    });
});

describe("cleanBuildArtifacts", () => {
    it("removes the shared artefact directories that exist", () => {
        const root = tree({
            "build/stage/system.json": "{}",
            ".vite/cache": "x",
            "src/keep.ts": "keep",
        });
        expect(cleanBuildArtifacts(root)).toEqual(["build", ".vite"]);
        expect(fs.existsSync(path.join(root, "build"))).toBe(false);
        expect(fs.existsSync(path.join(root, "src/keep.ts"))).toBe(true);
    });

    // `sohl-thalorna` also clears the Hugo output beneath `site/`.
    it("removes the repository's own extra directories", () => {
        const root = tree({ "site/public/index.html": "x", "build/a": "y" });
        expect(cleanBuildArtifacts(root, { extra: ["site/public"] })).toEqual([
            "build",
            "site/public",
        ]);
    });

    it("removes node_modules only for distclean", () => {
        const root = tree({ "node_modules/pkg/index.js": "x" });
        expect(cleanBuildArtifacts(root)).toEqual([]);
        expect(fs.existsSync(path.join(root, "node_modules"))).toBe(true);
        expect(cleanBuildArtifacts(root, { includeNodeModules: true })).toEqual(
            ["node_modules"],
        );
        expect(fs.existsSync(path.join(root, "node_modules"))).toBe(false);
    });

    // Cleaning an already-clean tree is the ordinary case, not an error.
    it("is safe to run repeatedly", () => {
        const root = tree({ "build/a": "x" });
        expect(cleanBuildArtifacts(root)).toEqual(["build"]);
        expect(cleanBuildArtifacts(root)).toEqual([]);
    });

    it("declares the shared set the toolchain produces", () => {
        expect(BUILD_ARTIFACT_DIRS).toContain("build");
        expect(Object.isFrozen(BUILD_ARTIFACT_DIRS)).toBe(true);
    });
});
