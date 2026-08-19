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
 * identity, and the pack list — arrives from the repository's
 * `content-build.config.mjs` (#1508).
 *
 * This is the seam the extraction turns around. Today the configuration is a
 * static import of a file at a known place in *this* repository; once the
 * toolchain is installed as `@heroiclands/content-build` (#1510/#1512) the same
 * export is resolved from the consuming repository's own config file, and no
 * other module has to change — which is precisely why every consumer reads the
 * configuration through here rather than importing the config file directly.
 *
 * Reading it costs no I/O: `defineConfig` only validates and freezes, so
 * importing this module remains as side-effect-free as the pack library it
 * serves.
 *
 * @module
 */

import config from "../../content-build.config.mjs";

/**
 * The repository's resolved, frozen configuration.
 *
 * @type {import("../../packages/content-build/config.mjs").ContentBuildConfig}
 */
export const packConfig = config;
