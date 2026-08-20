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
 * The item-type registry and its builders, the items and actors compilers, the
 * default-art map, and the affiliation standings live here (#1512). Nothing in
 * `@heroiclands/content-build/engine` exports any of it, so an adventure module
 * that builds journals, macros, and scenes never receives `buildWeaponGear`.
 *
 * A consuming repository hands its own registry to the engine as configuration
 * — `itemBuilders` in `content-build.config.mjs` — which is how the engine
 * composes the one doc-carrying-type set without holding any package's data
 * model.
 *
 * Namespaced rather than flattened, for the reason the engine barrel gives.
 *
 * @module
 */

/** The item-type registry: every type that compiles into an Item, and its builder. */
export * as itemBuilders from "./item-builders.mjs";

/** The Item compiler. */
export * as items from "./items.mjs";

/** The Actor compiler. */
export * as actors from "./actors.mjs";

// Flat as well as namespaced: the Foundry runtime imports these by name through
// their own entry points, and they were this barrel's surface before the
// compilers arrived (#1510).
export { DEFAULT_ITEM_ART, defaultItemArt } from "./default-item-art.mjs";
export { AFFILIATION_STANDINGS } from "./affiliation-standings.mjs";
