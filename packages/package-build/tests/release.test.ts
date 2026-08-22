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
import { execFileSync } from "node:child_process";

import { packRelease } from "../release.mjs";

/** A throwaway stage, described as `{ relPath: contents }`. */
function stage(files: Record<string, string>): {
    root: string;
    stageDir: string;
    outDir: string;
} {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pkg-release-"));
    const stageDir = path.join(root, "build/stage");
    for (const [rel, body] of Object.entries(files)) {
        const abs = path.join(stageDir, ...rel.split("/"));
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, body, "utf8");
    }
    return { root, stageDir, outDir: path.join(root, "build/dist") };
}

/**
 * File entry names inside a zip, via the system `unzip`.
 *
 * Directory entries (trailing `/`) are dropped: a zip records them, but they
 * are not what any assertion here is about.
 */
function zipEntries(zipPath: string): string[] {
    const out = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
    return out
        .split("\n")
        .filter(Boolean)
        .filter((e) => !e.endsWith("/"))
        .sort();
}

describe("packRelease", () => {
    it("writes <artifact>.zip and the manifest beside it", async () => {
        const { stageDir, outDir } = stage({
            "system.json": JSON.stringify({ id: "sohl", version: "0.8.2" }),
            "sohl.js": "console.log(1)",
            "lang/en.json": "{}",
        });

        const result = await packRelease({
            stageDir,
            outDir,
            artifact: "system",
        });

        expect(path.basename(result.zip)).toBe("system.zip");
        expect(path.basename(result.manifest)).toBe("system.json");
        expect(result.version).toBe("0.8.2");
        expect(fs.existsSync(result.zip)).toBe(true);
        expect(JSON.parse(fs.readFileSync(result.manifest, "utf8")).id).toBe(
            "sohl",
        );
    });

    // Foundry unpacks the archive *into* the package directory, so an extra
    // top-level directory would nest the manifest deeper than it looks for it.
    it("archives the stage's contents with no wrapping directory", async () => {
        const { stageDir, outDir } = stage({
            "system.json": JSON.stringify({ version: "1.0.0" }),
            "lang/en.json": "{}",
        });
        const { zip } = await packRelease({ stageDir, outDir });
        expect(zipEntries(zip)).toEqual(["lang/en.json", "system.json"]);
    });

    // The archive is complete on return, not merely finalized: `finalize()`
    // resolves before the bytes have necessarily reached disk, and a caller
    // that uploads immediately would ship a truncated file.
    it("returns only once the archive is fully written", async () => {
        const files: Record<string, string> = {
            "system.json": JSON.stringify({ version: "1.0.0" }),
        };
        // Enough content that a premature return would be visible as a short file.
        for (let i = 0; i < 200; i++)
            files[`pack/f${i}.json`] = "x".repeat(2048);
        const { stageDir, outDir } = stage(files);

        const { zip, bytes } = await packRelease({ stageDir, outDir });
        expect(fs.statSync(zip).size).toBe(bytes);
        expect(zipEntries(zip)).toHaveLength(201);
    });

    it("names the module artifact for a module", async () => {
        const { stageDir, outDir } = stage({
            "module.json": JSON.stringify({ version: "0.1.0" }),
        });
        const { zip, manifest } = await packRelease({
            stageDir,
            outDir,
            artifact: "module",
        });
        expect(path.basename(zip)).toBe("module.zip");
        expect(path.basename(manifest)).toBe("module.json");
    });

    // An archive with no manifest installs as nothing.
    it("refuses a stage with no manifest", async () => {
        const { stageDir, outDir } = stage({ "sohl.js": "x" });
        await expect(packRelease({ stageDir, outDir })).rejects.toThrow(
            /nothing to release/,
        );
    });
});
