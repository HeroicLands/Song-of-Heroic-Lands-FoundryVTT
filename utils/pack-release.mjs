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
 * Package the staged build into the two assets a Release carries.
 *
 * The work is `@heroiclands/package-build`'s — a Foundry package's release is
 * always `<artifact>.zip` plus the manifest beside it — so this is the entry
 * point that names *this* repository's artifact and reports the result.
 *
 * Usage:
 *   npm run build:pack-release   // node utils/pack-release.mjs
 *   node utils/pack-release.mjs  // direct invocation (no args)
 */

import { relative } from "path";

import { packRelease } from "@heroiclands/package-build/release";

const { zip, version, bytes } = await packRelease({ artifact: "system" });

console.log(
    `✅ Packaged ${version} for release: ${relative(".", zip)} ` +
        `(${(bytes / 1024 / 1024).toFixed(1)} MB)`,
);
