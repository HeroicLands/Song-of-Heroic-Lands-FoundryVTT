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
import { fileURLToPath } from "node:url";

// Build-time pack configuration (plain ESM, no Foundry). Imported by relative
// path because the pack-build scripts live outside the `@src` alias tree.
import { packConfig } from "../../../utils/packs/config.mjs";
import {
    CONTENT_PACKAGE,
    FOUNDRY_PACKAGE_ID,
} from "../../../utils/packs/content-package.mjs";
import {
    resolvePackageManifestPath,
    readPackageManifest,
    readManifestPackageId,
} from "../../../utils/packs/package-manifest.mjs";
import { supportedCoreVersion } from "../../../utils/packs/helpers.mjs";

// Anchored on this file, not the working directory: the package's own test
// script runs from `packages/content-build/`, and the repository build runs
// from the root — the same paths have to resolve from either.
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../..",
);
const MANIFEST = JSON.parse(
    fs.readFileSync(
        path.join(REPO_ROOT, "assets/templates/system.template.json"),
        "utf8",
    ),
);

/** A throwaway `assets/templates`-shaped directory, `{ fileName: contents }`. */
function templateDir(files: Record<string, unknown>): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-packcfg-"));
    for (const [name, body] of Object.entries(files)) {
        fs.writeFileSync(path.join(root, name), JSON.stringify(body), "utf8");
    }
    return root;
}

describe("this repository's resolved pack configuration", () => {
    it("names the content package and the Foundry package it ships", () => {
        expect(packConfig.contentPackage).toBe("sohl");
        expect(packConfig.foundryPackage).toBe("sohl");
        expect(packConfig.packageKind).toBe("systems");
    });

    it("is the single source the legacy constants are derived from", () => {
        // `content-package.mjs` survives as a derived re-export so the link
        // resolver keeps its filesystem-free import path — but it must not be a
        // second place the values are written.
        expect(CONTENT_PACKAGE).toBe(packConfig.contentPackage);
        expect(FOUNDRY_PACKAGE_ID).toBe(packConfig.foundryPackage);
    });

    it("resolves every path against the configured root, not the cwd", () => {
        for (const [key, value] of Object.entries(packConfig.paths)) {
            expect(path.isAbsolute(value as string), key).toBe(true);
            expect(String(value).startsWith(REPO_ROOT), key).toBe(true);
        }
        expect(packConfig.paths.content).toBe(
            path.join(REPO_ROOT, "assets/content"),
        );
        expect(packConfig.paths.packJson).toBe(
            path.join(REPO_ROOT, "build/packs-json"),
        );
    });

    it("derives the Foundry asset root from the package kind and id", () => {
        // A module consumer must emit `modules/<id>/assets/…`; nothing in the
        // pipeline may spell `systems/sohl` itself.
        expect(packConfig.assetRoot).toBe("systems/sohl/assets");
    });
});

describe("the one pack list (#1508 — SOURCE_PACKS and PACK_CONFIGS merged)", () => {
    it("declares every pack directory the build compiles, in compile order", () => {
        // The actors pass reads the items pass's output, so order is load-bearing.
        expect(packConfig.packDirectories).toEqual([
            "items",
            "journals",
            "actors",
            "macros",
            "scenes",
            "adventures",
        ]);
    });

    it("agrees with the packs the shipped manifest declares", () => {
        // The two lists that used to be maintained separately are now one, and
        // this is the third list they must still match: what Foundry ships.
        const declared = [
            ...packConfig.packs.flatMap((pack) => [
                { name: pack.name, type: pack.type },
                ...pack.companions.map(
                    (companion: { name: string; type: string }) => ({
                        name: companion.name,
                        type: companion.type,
                    }),
                ),
            ]),
        ];
        expect(declared).toEqual(
            MANIFEST.packs.map((p: { name: string; type: string }) => ({
                name: p.name,
                type: p.type,
            })),
        );
    });

    it("gives each generated pack its folder-hierarchy file", () => {
        expect(packConfig.packs.map((p) => [p.name, p.folders])).toEqual([
            ["items", "item-folders.yaml"],
            ["journals", "journal-folders.yaml"],
            ["actors", "actor-folders.yaml"],
            ["macros", "macro-folders.yaml"],
            ["scenes", "scene-folders.yaml"],
        ]);
    });

    it("skips the Obsidian scaffolding directory by configuration", () => {
        // `Templates/` was a hardcoded Obsidian convention inside the generic
        // tree walker; a consumer whose vault does not use it says so here.
        expect(packConfig.skipDirectories).toEqual(["Templates"]);
    });
});

describe("the manifest location is hoisted once, not twice (#1508)", () => {
    it("is the one path both the id guard and the core-version stamp read", () => {
        const dir = templateDir({
            "system.template.json": {
                id: "sohl",
                compatibility: { minimum: "14.401" },
            },
        });
        const resolved = resolvePackageManifestPath(dir);

        expect(readManifestPackageId(dir).manifestPath).toBe(resolved);
        expect(readPackageManifest(dir).manifestPath).toBe(resolved);
        // The stamp reads the same file, so the two can never name different
        // manifests — the drift this issue exists to remove.
        expect(supportedCoreVersion(dir)).toBe("14.401");
    });

    it("tolerates a module repository's module.template.json", () => {
        const dir = templateDir({
            "module.template.json": {
                id: "sohl-thalorna",
                compatibility: { minimum: "14.377" },
            },
        });
        expect(supportedCoreVersion(dir)).toBe("14.377");
        expect(readManifestPackageId(dir).packageId).toBe("sohl-thalorna");
    });

    it("defaults to the configured manifest directory", () => {
        expect(resolvePackageManifestPath()).toBe(
            path.join(packConfig.paths.packageManifest, "system.template.json"),
        );
        expect(supportedCoreVersion()).toBe(MANIFEST.compatibility.minimum);
    });
});

describe("the core version is a path in config, never a captured value", () => {
    it("follows a manifest that declares a different floor", () => {
        // The acceptance test for the hoist: config says *where* the manifest
        // is; the value is always read from it. A literal in config would make
        // both of these read the same number.
        const older = templateDir({
            "system.template.json": {
                id: "sohl",
                compatibility: { minimum: "14.359" },
            },
        });
        const newer = templateDir({
            "system.template.json": {
                id: "sohl",
                compatibility: { minimum: "14.900" },
            },
        });
        expect(supportedCoreVersion(older)).toBe("14.359");
        expect(supportedCoreVersion(newer)).toBe("14.900");
    });

    it("carries no core version anywhere in the configuration", () => {
        // If the floor were captured, a PR moving it would silently stop
        // reaching the pack stamp. Nothing in config may hold the number.
        expect(JSON.stringify(packConfig)).not.toContain(
            MANIFEST.compatibility.minimum,
        );
    });

    it("throws rather than falling back when there is no manifest", () => {
        // Blocker #1: the loud failure is the feature. A silent fallback is how
        // every pack came to ship `coreVersion: "14"` (#1533).
        const empty = fs.mkdtempSync(
            path.join(os.tmpdir(), "sohl-nomanifest-"),
        );
        expect(() => supportedCoreVersion(empty)).toThrow();
    });

    it("throws when the manifest declares no compatibility floor", () => {
        const dir = templateDir({ "system.template.json": { id: "sohl" } });
        expect(() => supportedCoreVersion(dir)).toThrow(
            /compatibility\.minimum/,
        );
    });
});
