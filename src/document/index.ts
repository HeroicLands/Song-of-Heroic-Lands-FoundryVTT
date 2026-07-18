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

/** The Actor document family — Being, Vehicle, Structure, Cohort, and Assembly. */
export * as actor from "./actor";
/** Chat-card dispatch and gating for the system's chat messages. */
export * as chat from "./chat";
/** The Combat (encounter) document and its turn / round logic. */
export * as combat from "./combat";
/** The Combatant document, its logic, and configuration hooks. */
export * as combatant from "./combatant";
/** The Active Effect document, data model, sheet, and change-to-delta logic. */
export * as effect from "./effect";
/** The Item document family — skills, traits, gear, afflictions, mysteries, and the rest. */
export * as item from "./item";
/** The Scene document, its config, and logic. */
export * as scene from "./scene";
/** The Token document and its logic. */
export * as token from "./token";
