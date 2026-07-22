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

// Namespace barrel — hand-maintained. `npm run lint` (check-ns-barrels)
// verifies every sibling module and subfolder here is re-exported.

/** The action model — SohlAction and its execution context. */
export * as action from "./action";
/** Archetype discovery — the Foundry-free rules behind the Create-dialog archetype picker. */
export * as archetype from "./archetype";
/** Body modeling — structure, parts, locations, armor aggregation, and injury resolution. */
export * as body from "./body";
/** The domain registry and the built-in domains. */
export * as domain from "./domain";
/** The event queue and event triggers. */
export * as event from "./event";
/** SafeExpression — the sandboxed expression evaluator and its helper registry. */
export * as expr from "./expr";
/** The calculation pipeline — value and mastery-level modifiers and deltas. */
export * as modifier from "./modifier";
/** Seedable, Foundry-free PRNGs — the reproducible RNG streams backing dice and hit-location selection (`sohl.entity.random.*`, `sohl.random`). */
export * as random from "./random";
/** Movement helpers. */
/** Test and combat result objects — success / opposed tests and attack / defend / impact / combat results. */
export * as result from "./result";
/** Dice-roll wrappers. */
export * as roll from "./roll";
/** Strike modes — the melee and missile attack profiles on a weapon. */
export * as strikemode from "./strikemode";

export * from "./SohlEntity";
export * from "./entityRegistry";
export * from "./registry";
