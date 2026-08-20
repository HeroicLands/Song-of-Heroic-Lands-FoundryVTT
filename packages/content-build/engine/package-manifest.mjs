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
 * The Foundry-package-id drift guard.
 *
 * {@link FOUNDRY_PACKAGE_ID} is *configured* in `content-build.config.mjs`
 * rather than read from the manifest, so the link resolver stays filesystem-free and
 * unit-testable — which means nothing keeps it in step with the `id` the
 * repository actually ships. Every compendium UUID the compilers emit takes its
 * first segment from that constant, so a drifted value emits a whole pack of
 * documents addressing a package that does not ship them: links that look
 * resolvable and fail at runtime (#1498, #1503).
 *
 * The check is split the same way for the same reason: {@link
 * assertPackageIdMatchesManifest} is a pure comparison of two strings, and
 * {@link readManifestPackageId} is the thin caller that feeds it from disk.
 *
 * The module has no import-time side effects, so it can be imported by the pack
 * library, by a CLI, or by a test without pulling a build along with it.
 */

import fs from "node:fs";
import path from "node:path";

import { packConfig } from "./pack-config.mjs";
import { FOUNDRY_PACKAGE_ID } from "./content-package.mjs";

/**
 * The manifest templates a repository may ship, in resolution order. Foundry
 * defines exactly two package kinds, and a repository is one of them: this
 * system repository ships `system.template.json`, a module repository (e.g.
 * `sohl-thalorna`) ships `module.template.json`.
 */
export const MANIFEST_TEMPLATES = [
    "system.template.json",
    "module.template.json",
];

/**
 * Where the manifest template lives — **the** configured location, resolved to
 * an absolute path against the consuming repository's root.
 *
 * Hoisted once, not twice (#1508): the package-id guard below and the
 * `_stats.coreVersion` stamp in `helpers.mjs` both resolve their manifest
 * through {@link resolvePackageManifestPath}, so the two can never end up
 * reading different files. It replaces a working-directory-relative literal
 * here and a *module*-relative path there — the latter of which would have
 * pointed inside `node_modules/@heroiclands/content-build/` once the toolchain
 * is installed rather than vendored.
 */
export const DEFAULT_TEMPLATE_DIR = packConfig.paths.packageManifest;

/**
 * The manifest template this repository ships, as an absolute path.
 *
 * The single resolution every consumer of the manifest funnels through, so
 * "where is the manifest" has one answer per build.
 *
 * @param {string} [templateDir] - Directory holding the manifest template.
 * @returns {string} The resolved manifest path.
 * @throws {Error} If neither manifest kind is present. Absence is a defect, not
 *   a skip: a repository that compiles packs ships a Foundry package, and
 *   without its manifest neither the emitted UUIDs nor the stamped core version
 *   can be corroborated. Failing loudly is the feature — a silent fallback is
 *   how every pack came to ship `coreVersion: "14"` (#1533).
 */
export function resolvePackageManifestPath(templateDir = DEFAULT_TEMPLATE_DIR) {
    const dir = path.resolve(templateDir);
    const manifestPath = MANIFEST_TEMPLATES.map((name) =>
        path.join(dir, name),
    ).find((candidate) => fs.existsSync(candidate));

    if (!manifestPath) {
        throw new Error(
            `No Foundry package manifest template found in ${dir} — looked for ` +
                `${MANIFEST_TEMPLATES.join(" and ")}. The pack compilers address ` +
                "every document by the shipped package's id and stamp its " +
                "supported core version, neither of which can be verified " +
                "without its manifest.",
        );
    }
    return manifestPath;
}

/**
 * Read and parse the shipped Foundry package manifest.
 *
 * @param {string} [templateDir] - Directory holding the manifest template.
 * @returns {{ manifestPath: string, manifest: Record<string, any> }}
 * @throws {Error} If no manifest template exists, or one exists but is unreadable.
 */
export function readPackageManifest(templateDir = DEFAULT_TEMPLATE_DIR) {
    const manifestPath = resolvePackageManifestPath(templateDir);
    try {
        return {
            manifestPath,
            manifest: JSON.parse(fs.readFileSync(manifestPath, "utf8")),
        };
    } catch (err) {
        throw new Error(
            `Could not read the package manifest ${manifestPath}: ${err.message}`,
        );
    }
}

/**
 * Fail unless the configured Foundry package id is the one the shipped manifest
 * declares.
 *
 * Pure: it compares two strings and knows nothing about the filesystem, so the
 * drift rule can be exercised directly in a unit test.
 *
 * @param {string} configuredId - `foundryPackage` from `content-build.config.mjs`.
 * @param {string|undefined} manifestId - The `id` field of the package manifest.
 * @param {object} [opts]
 * @param {string} [opts.manifestPath] - The manifest to name in the error.
 * @throws {Error} If either value is blank, or the two disagree.
 */
export function assertPackageIdMatchesManifest(
    configuredId,
    manifestId,
    { manifestPath = "the package manifest" } = {},
) {
    if (!configuredId) {
        throw new Error(
            "FOUNDRY_PACKAGE_ID is empty — set `foundryPackage` in " +
                "content-build.config.mjs. " +
                "It is the first segment of every compendium UUID the pack " +
                "compilers emit and must name the shipped Foundry package.",
        );
    }
    if (!manifestId) {
        throw new Error(
            `${manifestPath} declares no "id", so the configured ` +
                `FOUNDRY_PACKAGE_ID ("${configuredId}") cannot be corroborated. ` +
                "Give the manifest template the id of the Foundry package this " +
                "repository ships.",
        );
    }
    if (configuredId !== manifestId) {
        throw new Error(
            `Foundry package id drift: FOUNDRY_PACKAGE_ID is "${configuredId}" ` +
                `(\`foundryPackage\` in content-build.config.mjs), but ` +
                `${manifestPath} declares "${manifestId}". Every compendium UUID ` +
                "takes its first segment from FOUNDRY_PACKAGE_ID, so compiling " +
                "now would emit documents addressing a package this repository " +
                "does not ship. " +
                "Make the two agree before building.",
        );
    }
}

/**
 * Read the Foundry package id out of whichever manifest template this
 * repository ships.
 *
 * The thin filesystem half of the guard — everything it learns is handed to
 * {@link assertPackageIdMatchesManifest} as plain strings.
 *
 * @param {string} [templateDir] - Directory holding the manifest template.
 * @returns {{ manifestPath: string, packageId: string|undefined }}
 * @throws {Error} If no manifest template exists, or one exists but is unreadable.
 */
export function readManifestPackageId(templateDir = DEFAULT_TEMPLATE_DIR) {
    const { manifestPath, manifest } = readPackageManifest(templateDir);
    return { manifestPath, packageId: manifest.id };
}

/**
 * Fail the build unless the configured Foundry package id matches the manifest
 * template on disk. The one call a build entry point makes.
 *
 * @param {string} [configuredId] - Defaults to {@link FOUNDRY_PACKAGE_ID}.
 * @param {string} [templateDir] - Defaults to {@link DEFAULT_TEMPLATE_DIR}.
 * @throws {Error} On drift, or when the manifest cannot be read.
 */
export function assertPackageIdMatchesManifestFile(
    configuredId = FOUNDRY_PACKAGE_ID,
    templateDir = DEFAULT_TEMPLATE_DIR,
) {
    const { manifestPath, packageId } = readManifestPackageId(templateDir);
    assertPackageIdMatchesManifest(configuredId, packageId, { manifestPath });
}
