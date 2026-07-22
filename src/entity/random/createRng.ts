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

import type { Rng } from "@src/entity/random/Rng";
import { Sfc32Rng } from "@src/entity/random/Sfc32Rng";

/**
 * Construct the default SoHL generator ({@link sohl.entity.random.Sfc32Rng}).
 * With no seed it draws entropy; with a seed it is fully reproducible.
 *
 * Production constructs the {@link sohl.random} singleton from entropy via this
 * factory; unit tests construct their own isolated, per-test-seeded instances
 * and inject them. **Never** pass a fixed seed through a play path — fixed seeds
 * are strictly a test/e2e affordance.
 * @param seed - Optional string / number / four-word seed.
 * @returns A fresh, independent {@link sohl.entity.random.Rng} stream.
 */
export function createRng(seed?: string | number | number[]): Rng {
    return new Sfc32Rng(seed);
}

/**
 * The shared, ambient generator — the {@link sohl.random} singleton. This is the
 * **default-injected** source for {@link sohl.entity.roll.SimpleRoll},
 * hit-location selection, and the `rand()` expression helper when no `Rng` is
 * passed explicitly.
 *
 * @remarks It is one **shared** stream: safe for atomic synchronous draws, but
 * not isolated. A flow that must not perturb (or be perturbed by) another should
 * inject its own {@link createRng} instance instead of relying on this. Accessed
 * lazily at call time (never at module load) so the logic layer stays
 * Foundry-free and unit tests can install their own singleton.
 * @returns The process-wide singleton generator.
 */
export function defaultRng(): Rng {
    return globalThis.sohl.random;
}
