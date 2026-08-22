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
 * The build **stage** — assembling the tree that becomes a Foundry package, and
 * clearing it away again.
 *
 * A Foundry package is a directory: a manifest, some assets, compiled packs,
 * and (if it ships code) a bundle. Every HeroicLands repository assembles that
 * directory the same way and then either deploys it or zips it, so the copying,
 * the cleaning and the archiving are one implementation with a per-repository
 * *list*, not per-repository code.
 *
 * They were two implementations. This module takes the better half of each:
 *
 * - the **transform hook** from the system repository, which themes bundled SVG
 *   icons for light and dark mode as they are staged;
 * - the **missing-source guard** from `sohl-thalorna`, which fails loudly on a
 *   listed path that does not exist. Without it a mistyped or moved source is a
 *   silent omission — a module that ships with no `lang/` and no warning, which
 *   is precisely the failure this project keeps finding in its own satellites.
 *
 * The rules are pure functions over data; the functions that touch disk are
 * named for the effect they have.
 *
 * @module
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Directories every HeroicLands repository regenerates and none commits.
 *
 * A repository adds its own — `sohl-thalorna` also clears the Hugo output
 * beneath `site/` — but these four are common to all of them because they come
 * from the shared toolchain rather than from any one package's layout.
 */
export const BUILD_ARTIFACT_DIRS = Object.freeze([
    "build",
    ".vite",
    ".vitepress",
    ".rollup.cache",
]);

/**
 * A source that does not exist, described for a human.
 *
 * Pure, and separate from the copying, so the whole list is reported at once.
 * Discovering missing sources one exception at a time means one fix, one
 * rebuild, one more exception.
 *
 * @param {ReadonlyArray<readonly [string, string]>} entries - `[source, dest]`
 *   pairs, sources relative to `cwd` or absolute.
 * @param {string} [cwd] - Resolved against this. Defaults to the process cwd.
 * @returns {string[]} Every source that is absent, in the order listed.
 */
export function missingSources(entries, cwd = process.cwd()) {
    return entries
        .map(([src]) => src)
        .filter((src) => !fs.existsSync(path.resolve(cwd, src)));
}

/**
 * Recursively copy `src` to `dest`.
 *
 * `transform(sourcePath)` may return a string to write **instead of** a byte
 * copy; returning `null` or `undefined` falls back to copying the bytes. That
 * is what lets a repository theme its icons, rewrite a config, or stamp a file
 * as it stages it, without this function knowing anything about why.
 *
 * @param {string} src - Source file or directory.
 * @param {string} dest - Destination path.
 * @param {object} [opts]
 * @param {(sourcePath: string) => string|null|undefined} [opts.transform] -
 *   Per-file transform.
 * @returns {number} How many files were written.
 */
export function copyTree(src, dest, { transform } = {}) {
    if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        let written = 0;
        for (const entry of fs.readdirSync(src)) {
            written += copyTree(path.join(src, entry), path.join(dest, entry), {
                transform,
            });
        }
        return written;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const transformed = transform ? transform(src) : null;
    if (transformed != null) fs.writeFileSync(dest, transformed);
    else fs.copyFileSync(src, dest);
    return 1;
}

/**
 * Copy every listed source into the stage, refusing to start if any is absent.
 *
 * **The guard is the point.** A listed path that does not exist is an error,
 * not a silent skip: a missing `lang/` ships a package with no localization and
 * nothing said so, and a missing `templates/` ships one whose every sheet fails
 * to render. Both are indistinguishable from a successful build in the log.
 *
 * The check runs over the whole list *before* anything is copied, so a bad list
 * leaves no half-populated stage behind.
 *
 * @param {ReadonlyArray<readonly [string, string]>} entries - `[source, dest]`
 *   pairs.
 * @param {object} [opts]
 * @param {string} [opts.cwd] - Sources and destinations resolve against this.
 * @param {(sourcePath: string) => string|null|undefined} [opts.transform] -
 *   Per-file transform, applied to every entry.
 * @returns {{entries: number, files: number}} What was staged.
 * @throws {Error} When any source is missing, naming all of them.
 */
export function stageAssets(entries, { cwd = process.cwd(), transform } = {}) {
    const missing = missingSources(entries, cwd);
    if (missing.length) {
        throw new Error(
            `Cannot stage assets — these paths do not exist:\n` +
                missing.map((p) => `   ${p}`).join("\n"),
        );
    }

    let files = 0;
    for (const [src, dest] of entries) {
        files += copyTree(path.resolve(cwd, src), path.resolve(cwd, dest), {
            transform,
        });
    }
    return { entries: entries.length, files };
}

/**
 * Remove the build artefacts a repository regenerates.
 *
 * A directory that is already gone is not an error — the command has to be safe
 * to run repeatedly, and "clean when already clean" is the ordinary case.
 *
 * @param {string} root - Repository root; every directory resolves against it.
 * @param {object} [opts]
 * @param {readonly string[]} [opts.extra] - Directories beyond
 *   {@link BUILD_ARTIFACT_DIRS} that this repository also regenerates.
 * @param {boolean} [opts.includeNodeModules] - Also remove `node_modules`, the
 *   `distclean` case.
 * @returns {string[]} The directories removed, as listed.
 */
export function cleanBuildArtifacts(
    root,
    { extra = [], includeNodeModules = false } = {},
) {
    const dirs = [
        ...BUILD_ARTIFACT_DIRS,
        ...extra,
        ...(includeNodeModules ? ["node_modules"] : []),
    ];
    const removed = [];
    for (const dir of dirs) {
        const target = path.resolve(root, dir);
        if (!fs.existsSync(target)) continue;
        fs.rmSync(target, { recursive: true, force: true });
        removed.push(dir);
    }
    return removed;
}
