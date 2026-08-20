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
 * The SoHL-specific half of the toolchain: the knowledge of the Song of Heroic
 * Lands data model that a generic content module must never receive.
 *
 * This barrel will re-export `ITEM_TYPES`, `BUILDERS`, and the items and
 * actors compilers as #1501 moves them here. It already carries the two
 * plain-ESM leaves the runtime shares with the build (#1510).
 *
 * Those two are also reachable as their own entry points —
 * `@heroiclands/content-build/sohl/default-item-art` and
 * `.../sohl/affiliation-standings`. The runtime imports them that way on
 * purpose: this barrel grows to hold compilers that read the filesystem, and a
 * client bundle must never pull those in to reach a constant map.
 *
 * @module
 */

export { DEFAULT_ITEM_ART, defaultItemArt } from "./default-item-art.mjs";
export { AFFILIATION_STANDINGS } from "./affiliation-standings.mjs";
