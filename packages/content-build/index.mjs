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
 * `@heroiclands/content-build` — the shared toolchain that compiles a
 * HeroicLands content tree into Foundry VTT compendium packs.
 *
 * The public surface is deliberately small:
 *
 * - {@link defineConfig} — the per-repository configuration contract. A
 *   consumer's whole build is one `content-build.config.mjs` calling it.
 * - {@link engine} — package-agnostic machinery: the content walk, frontmatter,
 *   tables, wikilinks, ids, folders, the link manifest and web-address rule,
 *   `BasePackCompiler`, and the generic Foundry document compilers.
 * - {@link sohl} — SoHL data-model knowledge: item types, builders, the items
 *   and actors compilers, and default art. Isolated behind its own namespace so
 *   an adventure module never receives `buildWeaponGear`.
 *
 * Both namespaces are barrels that grow as the extraction proceeds (#1501);
 * they export nothing yet.
 *
 * @module
 */

export { defineConfig, PACKAGE_KINDS, PACK_DOCUMENT_TYPES } from "./config.mjs";

/** Package-agnostic content-tree and Foundry-document machinery. */
export * as engine from "./engine/index.mjs";

/** SoHL data-model knowledge — item types, builders, compilers, default art. */
export * as sohl from "./sohl/index.mjs";
