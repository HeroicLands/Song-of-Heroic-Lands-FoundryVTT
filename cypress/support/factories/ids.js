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

/**
 * Test-isolation primitives.
 *
 * The E2E world is a single persistent LevelDB shared across specs, so isolation
 * is enforced by test code: every world-level document a spec creates is named
 * with a per-run tag, and `cleanupWorld()` deletes exactly the tagged documents.
 * `RUN_TAG` is unique per spec file per run, so even a crashed spec that skips its
 * `afterEach` leaves artifacts a later `before` sweep (matching the broader
 * `isE2EArtifact` predicate) can still reclaim.
 */

/** Unique per spec-file, per run. Prefixes every world-level document's name. */
export const RUN_TAG = `e2e-${Cypress.spec?.name ?? "spec"}-${Date.now()}`;

/** Prefix a display name with this run's tag. */
export const tagName = (name) => `[${RUN_TAG}] ${name}`;

/** True if `doc`'s name carries THIS run's tag. */
export const isTagged = (doc) => (doc?.name ?? "").startsWith(`[${RUN_TAG}]`);

/** True if `doc`'s name carries ANY E2E run's tag (for defensive cross-run cleanup). */
export const isE2EArtifact = (doc) => /^\[e2e-/.test(doc?.name ?? "");
