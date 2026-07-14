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
 * Being health derivation (#463).
 *
 * A being's health is a `{ value, max }` pair. `max` is `endurance × 3` (or a
 * flat 100 when the being has no Endurance attribute). `value` starts at `max`,
 * loses `shock × injuryLevel` for each injury (the location's inherent shock
 * times the injury level), and is then capped by the **most restrictive** of the
 * applicable ceilings before being floored at 0:
 *
 * - a body part impaired **≤ −10** (but not unusable) → **75%** of max
 * - an **unusable** body part → **50%**
 * - **stunned** → **25%**
 * - **incapacitated / unconscious** → **10%**
 * - **dead** → **0**
 *
 * Pure and Foundry-free; consumed by {@link BeingLogic} to populate its health
 * ValueModifiers for the sheet header bar.
 */

import { STATUS_EFFECT } from "@src/utils/constants";
import type { BodyPartImpairment } from "@src/entity/body/impairment";

/** Fallback max health when the being has no (or zero) Endurance. */
const DEFAULT_MAX = 100;
/** Health-per-point-of-Endurance multiplier. */
const ENDURANCE_MULTIPLIER = 3;
/** The body-part impairment magnitude that begins capping health. */
const MAJOR_IMPAIRMENT = -10;

/** Resolved inputs to the health derivation. */
export interface HealthInput {
    /** Endurance attribute score; `0` (or absent) → the flat-100 fallback. */
    enduranceScore: number;
    /** Per-injury `shock × injuryLevel` products (already resolved). */
    injuryShocks: readonly number[];
    /** Per-body-part impairment (from `bodyPartImpairment`). */
    partImpairments: readonly Pick<
        BodyPartImpairment,
        "impairment" | "unusable"
    >[];
    /** The being's active status-effect ids (`stun` / `incapacitated` / …). */
    statuses: ReadonlySet<string>;
}

/** Derived health points. */
export interface Health {
    /** Maximum health points. */
    max: number;
    /** Current health points, after injuries, ceilings, and the 0 floor. */
    value: number;
}

/**
 * Derive a being's current/max health from its endurance, injuries, body-part
 * impairment, and incapacitating statuses. See the module doc for the rules.
 *
 * @param input - The resolved health inputs.
 * @returns The `{ value, max }` health points.
 */
export function deriveHealth(input: HealthInput): Health {
    const max =
        input.enduranceScore > 0 ?
            input.enduranceScore * ENDURANCE_MULTIPLIER
        :   DEFAULT_MAX;

    let value = max;
    for (const shock of input.injuryShocks) value -= shock;

    let anyMajor = false;
    let anyUnusable = false;
    for (const part of input.partImpairments) {
        if (part.unusable) anyUnusable = true;
        else if (part.impairment <= MAJOR_IMPAIRMENT) anyMajor = true;
    }

    // Each applicable condition imposes a ceiling; the most restrictive wins.
    const ceilings: number[] = [];
    if (anyMajor) ceilings.push(Math.floor(max * 0.75));
    if (anyUnusable) ceilings.push(Math.floor(max * 0.5));
    if (input.statuses.has(STATUS_EFFECT.STUN))
        ceilings.push(Math.floor(max * 0.25));
    if (
        input.statuses.has(STATUS_EFFECT.INCAPACITATED) ||
        input.statuses.has(STATUS_EFFECT.UNCONSCIOUS)
    )
        ceilings.push(Math.floor(max * 0.1));
    if (input.statuses.has(STATUS_EFFECT.DEAD)) ceilings.push(0);

    if (ceilings.length) value = Math.min(value, ...ceilings);
    return { max, value: Math.max(0, value) };
}
