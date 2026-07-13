/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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

/** Standalone applications — the settings, calendar, and domain-manager UIs — and their Foundry-free view logic. */
export * as apps from "./apps";
/** System wiring and foundations: registration, config, the SohlLogic / SohlSpeaker / SohlSystem core, and the FoundryHelpers boundary. */
export * as core from "./core";
/** Foundry document types — actors, items, active effects, combat, scenes, and tokens — each with its Foundry-facing documents, data models, and sheets plus its Foundry-free logic. */
export * as document from "./document";
/** Foundry-free domain entities that macros and modules construct: modifiers, test and combat results, strike modes, actions, body modeling, expressions, and the event queue. */
export * as entity from "./entity";
/** Foundry-free utilities: constants, collection types, and general helpers. */
export * as utils from "./utils";
