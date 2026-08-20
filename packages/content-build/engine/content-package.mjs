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
 * Which package's notes this repository compiles, and which Foundry package
 * ships them — read from the repository's `content-build.config.mjs`.
 *
 * Both values are **derived**, not declared: `config.mjs` is the single place
 * the configuration is resolved (#1508). This module survives as the import
 * path the link resolver and the compilers have always used, so that the values
 * can still be mocked in one place and so no consumer has to learn a new
 * spelling for them.
 */

import { packConfig } from "./pack-config.mjs";

/**
 * The **content** package: the distribution unit a note declares in its
 * `package:` frontmatter. The pack compilers select their entries by it.
 *
 * Stable across compilation targets. If this content were ever compiled for a
 * second game system, its notes would still declare `package: sohl` — only the
 * Foundry package below would differ.
 */
export const CONTENT_PACKAGE = packConfig.contentPackage;

/**
 * The **Foundry package** this repository's packs are shipped in — the `id` in
 * `assets/templates/system.template.json`, and the first segment of every
 * compendium UUID the compilers emit.
 *
 * Distinct from {@link CONTENT_PACKAGE}, and equal to it only by coincidence
 * here: a note says `package: sohl` and its documents are addressed as
 * `Compendium.sohl.<pack>.<Type>.<id>`. In `sohl-thalorna` the two differ
 * (`thalorna` vs `sohl-thalorna`), which is why they are separate values rather
 * than one — treating them as interchangeable is what #1498 was.
 *
 * Configured rather than read from the manifest so the link resolver stays
 * filesystem-free and unit-testable. `assertPackageIdMatchesManifestFile` in
 * `package-manifest.mjs` — called from `generatePacksJson`, before any entry is
 * written — fails the build if this value and the manifest's `id` ever drift.
 */
export const FOUNDRY_PACKAGE_ID = packConfig.foundryPackage;
