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
 * Remove the generated build and cache directories.
 *
 * The set every HeroicLands repository regenerates — `build`, `.vite`,
 * `.vitepress`, `.rollup.cache` — comes from `@heroiclands/package-build`,
 * since it is produced by the shared toolchain rather than by this repository's
 * layout. This system adds none of its own; `sohl-thalorna` adds its Hugo
 * output.
 *
 * A directory that is already gone is not an error, so the command is safe to
 * run repeatedly.
 *
 * Usage:
 *   npm run clean                        // node utils/clean.mjs
 *   npm run distclean                    // node utils/clean.mjs --distclean
 *   node utils/clean.mjs [--distclean]   // direct invocation
 */

import path from "path";
import { fileURLToPath } from "url";

import { cleanBuildArtifacts } from "@heroiclands/package-build/stage";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

const removed = cleanBuildArtifacts(repoRoot, {
    includeNodeModules: process.argv.includes("--distclean"),
});

for (const dir of removed) console.log(`Removed ${dir}`);
if (!removed.length) console.log("Nothing to clean.");
