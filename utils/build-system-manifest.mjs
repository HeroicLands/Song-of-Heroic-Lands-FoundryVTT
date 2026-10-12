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
 * Generate SoHL's Foundry manifest while keeping map source packs build-only.
 * The package-build compiler still reads the complete pack graph; only the
 * tutorial Adventure is published for the new tutorial content.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { loadPackageBuildConfig } from "@heroiclands/package-build/config";
import { compilesFoundryDocuments } from "@heroiclands/package-build/content-config";
import { loadPackConfig, packConfigPath } from "@heroiclands/package-build/engine/pack-config";
import { writeManifest } from "@heroiclands/package-build/manifest";

async function main() {
    const buildConfig = loadPackageBuildConfig();
    const shared = loadPackConfig();

    // Match package-build's `manifest` command: load the repository environment
    // only inside the command, and refuse to emit a Foundry manifest for a
    // documentation-only package.
    const dotenv = await import("dotenv");
    dotenv.config({ path: path.join(buildConfig.rootDir, ".env.local"), quiet: true });
    dotenv.config({ path: path.join(buildConfig.rootDir, ".env"), quiet: true });
    if (!compilesFoundryDocuments(shared)) {
        throw new Error(
            `packageKind: ${shared.packageKind} ships no Foundry package, so there is no manifest to generate.`,
        );
    }

    const compileOnlyPacks = new Set(["scenes", "adventures"]);
    const publishedPackTree = (pack) => {
        if (compileOnlyPacks.has(pack.name)) return [];
        return [
            {
                ...pack,
                companions: (pack.companions ?? []).flatMap(publishedPackTree),
            },
        ];
    };
    const publishedPacks = shared.packs.flatMap(publishedPackTree);
    const publishedNames = new Set(
        publishedPacks.flatMap((pack) => [
            pack.name,
            ...(pack.companions ?? []).map((companion) => companion.name),
        ]),
    );
    const packFolders = (shared.packageBuild?.manifest?.packFolders ?? [])
        .map((folder) => ({
            ...folder,
            packs: (folder.packs ?? []).filter((name) => publishedNames.has(name)),
        }))
        .filter((folder) => folder.packs.length);
    const manifestConfig = {
        ...shared,
        packs: publishedPacks,
        packageBuild: {
            ...shared.packageBuild,
            manifest: {
                ...shared.packageBuild?.manifest,
                packFolders,
            },
        },
    };

    let flags;
    if (buildConfig.manifestFlags) {
        const module = await import(pathToFileURL(buildConfig.manifestFlags).href);
        if (typeof module.flags !== "function") {
            throw new Error(
                `packageBuild.manifestFlags (${buildConfig.manifestFlags}) exports no flags(config) function.`,
            );
        }
        flags = await module.flags(shared);
    }

    const packageJson = JSON.parse(
        fs.readFileSync(path.join(buildConfig.rootDir, "package.json"), "utf8"),
    );
    const { path: written, manifest } = await writeManifest({
        config: manifestConfig,
        packageJson,
        artifact: buildConfig.artifact,
        outDir: path.join(buildConfig.rootDir, buildConfig.stageDir),
        flags,
        configFile: packConfigPath(),
    });
    console.log(
        `✅ Wrote ${path.relative(buildConfig.rootDir, written)} ` +
            `(${Object.keys(manifest).length} keys, ${manifest.packs.length} packs).`,
    );
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
