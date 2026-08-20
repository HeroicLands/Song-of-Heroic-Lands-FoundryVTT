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
 * The affiliation standings an authored `relation` map may use — one
 * affiliation's stance toward another (#1404).
 *
 * Plain ESM for the same reason `./default-item-art.mjs` is: the pack scripts
 * run under bare `node`, so they cannot read the runtime's TypeScript
 * `AFFILIATION_STANDING`. This module is where the pipeline reads the list
 * from, rather than restating it inside a compiler (#1510).
 *
 * The runtime keeps its own `defineType("SOHL.Affiliation.Standing", { … })`
 * declaration in `src/utils/constants.ts`, because that literal is *parsed out
 * of the source* by two build guards — the generated type catalog
 * (`utils/build-type-catalog.mjs`) and the localization-coverage check
 * (`utils/check-lang-coverage.mjs`) — and replacing it with an imported
 * reference would blind both. The two lists are held identical by a test
 * (`tests/build/src-import-severance.test.ts`), so the drift the
 * duplication would otherwise allow is a failing build rather than an
 * affiliation whose authored hostility quietly became neutrality.
 *
 * @type {readonly string[]}
 */
export const AFFILIATION_STANDINGS = Object.freeze([
    // Allied or friendly toward that affiliation.
    "aligned",
    // Neutral — no particular standing. The default for an unlisted affiliation.
    "unaligned",
    // In competition; opposed but not implacable.
    "rival",
    // Actively hostile.
    "nemesis",
]);
