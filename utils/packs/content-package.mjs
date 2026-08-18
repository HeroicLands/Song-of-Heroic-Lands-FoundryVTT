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
 * ships them.
 *
 * The counterpart of `sohl-thalorna`'s file of the same name. Naming both values
 * here, once, is what keeps the rest of `utils/packs/` a straight copy that can
 * be diffed between the two repositories.
 */

/**
 * The **content** package: the distribution unit a note declares in its
 * `package:` frontmatter. The pack compilers select their entries by it.
 *
 * Stable across compilation targets. If this content were ever compiled for a
 * second game system, its notes would still declare `package: sohl` — only the
 * Foundry package below would differ.
 */
export const CONTENT_PACKAGE = "sohl";

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
 * Declared here rather than read from the manifest so the link resolver stays
 * filesystem-free and unit-testable. `assertPackageIdMatchesManifest` in
 * `build-compendiums.mjs` fails the build if the two ever drift.
 */
export const FOUNDRY_PACKAGE_ID = "sohl";
