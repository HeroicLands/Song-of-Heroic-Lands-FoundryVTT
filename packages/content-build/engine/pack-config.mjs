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
 * The resolved content-build configuration the pack pipeline reads.
 *
 * One module, one import: everything the compilers used to hard-code — the
 * content package, the Foundry package and its kind, every path, the `_stats`
 * identity, the item-type membership, and the pack list — arrives from the
 * consuming repository's `content-build.config.mjs` (#1508).
 *
 * **Located by walking up from this module, not from the working directory.**
 * The config file sits at the root of the repository that installed the
 * toolchain, so climbing out of `node_modules/@heroiclands/content-build/engine/`
 * — or, in this repository, out of `packages/content-build/engine/` — lands on
 * it either way. Resolving it against `process.cwd()` instead would make the
 * build read a different tree depending on where it was launched from, which is
 * the very property #1508 removed. `CONTENT_BUILD_CONFIG` names the file
 * explicitly when a consumer keeps it somewhere else.
 *
 * **A consumer's config file must import `defineConfig` from
 * `@heroiclands/content-build/config`, never from the package root barrel.**
 * The barrel pulls in the compilers, the compilers read this module, and this
 * module loads the config file — so a config that reaches for the barrel closes
 * a cycle around its own evaluation. The leaf entry point performs no I/O and
 * imports nothing but `node:path`, so it cannot.
 *
 * Reading it costs no I/O beyond loading that one file: `defineConfig` only
 * validates and freezes, so importing this module remains as side-effect-free
 * as the pack library it serves.
 *
 * @module
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** The file name every consuming repository declares its build in. */
export const CONFIG_FILENAME = "content-build.config.mjs";

/**
 * The nearest {@link CONFIG_FILENAME} at or above a directory.
 *
 * @param {string} from - The directory to start from.
 * @returns {string|undefined} Its absolute path, or `undefined` if the walk
 *   reaches the filesystem root without finding one.
 */
export function findConfigFile(from) {
    let dir = path.resolve(from);
    for (;;) {
        const candidate = path.join(dir, CONFIG_FILENAME);
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) return undefined;
        dir = parent;
    }
}

const explicit = process.env.CONTENT_BUILD_CONFIG;
const configPath =
    explicit ? path.resolve(explicit) : findConfigFile(import.meta.dirname);

if (!configPath || !fs.existsSync(configPath)) {
    throw new Error(
        `content-build: no ${CONFIG_FILENAME} found at or above ` +
            `${import.meta.dirname}. A consuming repository declares its build ` +
            `in one file at its root; set CONTENT_BUILD_CONFIG to name it ` +
            `elsewhere.`,
    );
}

/**
 * The consuming repository's resolved, frozen configuration.
 *
 * @type {import("../config.mjs").ContentBuildConfig}
 */
export const packConfig = (await import(pathToFileURL(configPath).href))
    .default;
