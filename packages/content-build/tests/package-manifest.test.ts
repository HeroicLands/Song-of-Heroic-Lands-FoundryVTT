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

// Build-time pack helpers (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import {
    MANIFEST_TEMPLATES,
    assertPackageIdMatchesManifest,
    assertPackageIdMatchesManifestFile,
    readManifestPackageId,
} from "../../../utils/packs/package-manifest.mjs";
import { FOUNDRY_PACKAGE_ID } from "../../../utils/packs/content-package.mjs";

// Anchored on this file, not the working directory (see pack-config.test.ts).
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../..",
);

/** A throwaway `assets/templates`-shaped directory, `{ fileName: contents }`. */
function templateDir(files: Record<string, string>): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-manifest-"));
    for (const [name, body] of Object.entries(files)) {
        fs.writeFileSync(path.join(root, name), body, "utf8");
    }
    return root;
}

describe("assertPackageIdMatchesManifest — the pure guard", () => {
    it("accepts a configured id that matches the manifest", () => {
        expect(() =>
            assertPackageIdMatchesManifest("sohl", "sohl"),
        ).not.toThrow();
    });

    it("throws on drift, naming both values", () => {
        let message = "";
        try {
            assertPackageIdMatchesManifest("sohl", "sohl-thalorna");
        } catch (err) {
            message = (err as Error).message;
        }
        expect(message).toContain("sohl-thalorna");
        // The configured id must be named as its own token, not merely as a
        // substring of the manifest id.
        expect(message).toMatch(/"sohl"/);
    });

    it("names the manifest it read, when told which one", () => {
        expect(() =>
            assertPackageIdMatchesManifest("sohl", "thalorna", {
                manifestPath: "assets/templates/module.template.json",
            }),
        ).toThrow(/module\.template\.json/);
    });

    it("throws when the manifest declares no id at all", () => {
        // A manifest without an `id` cannot corroborate anything; treating it
        // as "no drift" would defeat the guard.
        expect(() => assertPackageIdMatchesManifest("sohl", undefined)).toThrow(
            /id/,
        );
        expect(() => assertPackageIdMatchesManifest("sohl", "")).toThrow(/id/);
    });

    it("throws when the configured package id is blank", () => {
        expect(() => assertPackageIdMatchesManifest("", "sohl")).toThrow(
            /FOUNDRY_PACKAGE_ID/,
        );
    });
});

describe("readManifestPackageId — whichever manifest this repository ships", () => {
    it("reads the id from a system manifest template", () => {
        const dir = templateDir({
            "system.template.json": JSON.stringify({ id: "sohl" }),
        });
        expect(readManifestPackageId(dir)).toMatchObject({ packageId: "sohl" });
    });

    it("reads the id from a module manifest template", () => {
        // A module repository (sohl-thalorna) ships module.template.json and
        // no system template; the same toolchain must check it.
        const dir = templateDir({
            "module.template.json": JSON.stringify({ id: "sohl-thalorna" }),
        });
        const result = readManifestPackageId(dir);
        expect(result.packageId).toBe("sohl-thalorna");
        expect(result.manifestPath).toContain("module.template.json");
    });

    it("throws when no manifest template exists", () => {
        // Absence is a defect, not a reason to skip: a repository that compiles
        // packs ships a Foundry package, and without its manifest there is
        // nothing the emitted UUIDs can be checked against.
        expect(() => readManifestPackageId(templateDir({}))).toThrow(
            /system\.template\.json/,
        );
    });

    it("throws on an unparseable manifest template", () => {
        const dir = templateDir({ "system.template.json": "{ not json" });
        expect(() => readManifestPackageId(dir)).toThrow();
    });

    it("looks for exactly the two manifest kinds Foundry defines", () => {
        expect(MANIFEST_TEMPLATES).toEqual([
            "system.template.json",
            "module.template.json",
        ]);
    });
});

describe("assertPackageIdMatchesManifestFile — the thin caller", () => {
    it("fails when the manifest on disk disagrees with the configured id", () => {
        const dir = templateDir({
            "system.template.json": JSON.stringify({ id: "not-sohl" }),
        });
        expect(() => assertPackageIdMatchesManifestFile("sohl", dir)).toThrow(
            /not-sohl/,
        );
    });

    it("passes when they agree", () => {
        const dir = templateDir({
            "system.template.json": JSON.stringify({ id: "sohl" }),
        });
        expect(() =>
            assertPackageIdMatchesManifestFile("sohl", dir),
        ).not.toThrow();
    });

    it("this repository's own manifest agrees with FOUNDRY_PACKAGE_ID", () => {
        // The regression the guard exists for (#1503): every compiled UUID takes
        // its first segment from FOUNDRY_PACKAGE_ID.
        expect(() =>
            assertPackageIdMatchesManifestFile(
                FOUNDRY_PACKAGE_ID,
                path.join(REPO_ROOT, "assets/templates"),
            ),
        ).not.toThrow();
    });
});
