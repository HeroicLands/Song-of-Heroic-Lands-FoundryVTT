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
 * `@heroiclands/package-build` — the shared toolchain for building and shipping
 * a HeroicLands **Foundry package**.
 *
 * It is the counterpart to `@heroiclands/content-build`, and the two split by
 * **input**, not by repository:
 *
 * - content-build reads `assets/content/**` and produces compendium packs, site
 *   content and the link manifest. It answers for what a package *says*.
 * - this package reads `lang/`, `styles/`, `src/`, `assets/` and the manifest
 *   template. It answers for what a package *is* — the parts Foundry loads
 *   whether or not the package ships any content at all.
 *
 * A module uses either, or both. An adventure module that ships only notes
 * needs no bundler; a variant module that ships only behavior needs no Markdown
 * pipeline. The coupling between the two packages runs one way — this one asks
 * content-build for the compiled `packs[]` block, never the reverse.
 *
 * **Everything exported here is pure.** Functions take source text and return
 * findings or values; discovery, I/O and reporting stay with the caller. That
 * is what lets one rule set serve a `lint` script, a build step and a unit test
 * without any of them having to agree on how files are found or how findings
 * are printed — and it is what makes the rules testable at all, which the
 * scripts these were extracted from were not.
 *
 * @module
 */

/** The Foundry package manifest: `system.json` / `module.json`. */
export * as manifest from "./manifest.mjs";

/** The code bundle, and whether the manifest agrees with how it parses. */
export * as bundle from "./bundle.mjs";

/** Assembling the build stage, and clearing it away again. */
export * as stage from "./stage.mjs";

/** The release archive a GitHub Release carries. */
export * as release from "./release.mjs";

/** Deploying a staged package into a Foundry data directory. */
export * as deploy from "./deploy.mjs";

/** Localization files: what a shippable `lang/*.json` must satisfy. */
export * as lang from "./lang.mjs";

/** Locating a literal inside an arbitrary text file, for positioned findings. */
export * as text from "./text.mjs";
