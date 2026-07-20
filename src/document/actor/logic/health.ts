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
 * Being health derivation (#470) — impairment-based, banded.
 *
 * SoHL has **no hit points**: health is a banded assessment of capability, not a
 * pool. It is driven by **impaired body parts only** — an injury that impairs no
 * part has zero effect. Each impaired part sets a ceiling on overall health by
 * its state (impairment tier, or unusable) and whether it is **critical** (holds
 * a VITAL or CORE role); the physical health is the **minimum** ceiling across
 * all impaired parts (100 when nothing is impaired).
 *
 * `max` is always 100; `value` is that ceiling, floored at 1 for any living
 * being and 0 only when `dead`. The value maps to bands (Excellent … Dead).
 *
 * Stun/fatigue/fear/shock ceilings are deliberately out of scope here — they are
 * separate ceilings that will later compose by `min` with this physical one.
 *
 * Pure and Foundry-free; consumed by {@link BeingLogic}.
 */

import { BODY_PART_TIER, type BodyPartTier } from "@src/entity/body/impairment";

/** Maximum health is a fixed 100 (health is a percentage, not a pool). */
const MAX_HEALTH = 100;

/**
 * The per-part health ceiling by (critical?, state, count-in-that-bucket).
 * Non-critical parts are counted in 1 / 2 / 3+ columns; critical parts in 1 / 2+.
 * The physical ceiling is the minimum over every occupied bucket.
 */
const CEILINGS = {
    /** MANIPULATOR / LOCOMOTOR only. */
    noncritical: {
        minor: [80, 50, 30],
        serious: [50, 20, 20],
        grievous: [30, 10, 10],
        unusable: [20, 10, 10],
    },
    /** Holds VITAL or CORE. */
    critical: {
        minor: [50, 25],
        serious: [20, 10],
        grievous: [10, 10],
        unusable: [0, 0],
    },
} as const;

/**
 * A being's **Healing Base** — the average of its Endurance (END) and Will (WIL)
 * scores, with the fraction rounded **up when END > WIL** and **down otherwise**.
 *
 * The Healing Base, multiplied by a Healing Rate, is the mastery level of nearly
 * every recovery test in the system (the Injury Healing Test, the affliction
 * Course Test, the Infection Healing Test, and the Extended Shock / Coma course
 * tests).
 *
 * Pure and Foundry-free; the base of {@link BeingLogic.healingBase}.
 *
 * @param endurance - The being's effective Endurance score.
 * @param will - The being's effective Will score.
 * @returns The integer Healing Base.
 */
export function healingBaseFor(endurance: number, will: number): number {
    const average = (endurance + will) / 2;
    return endurance > will ? Math.ceil(average) : Math.floor(average);
}

/** Health bands — a doctor's qualitative read, not a number. */
export const HEALTH_BAND = {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    FAIR: "Fair",
    POOR: "Poor",
    MORBID: "Morbid",
    DEAD: "Dead",
} as const;

/** A qualitative health band. */
export type HealthBand = (typeof HEALTH_BAND)[keyof typeof HEALTH_BAND];

/** A body part's contribution to the health ceiling. */
export interface PartHealthInput {
    /** Impairment tier (from `bodyPartImpairment`). */
    tier: BodyPartTier;
    /** Whether the part is still usable. */
    usable: boolean;
    /** Whether the part is critical (holds a VITAL or CORE role). */
    critical: boolean;
}

/** Resolved inputs to the health derivation. */
export interface HealthInput {
    /** Every body part's health contribution. */
    parts: readonly PartHealthInput[];
    /** Whether the being carries the `dead` status. */
    dead: boolean;
}

/** Derived health. */
export interface Health {
    /** Always 100 (health is a percentage). */
    max: number;
    /** Current health `0…100`: the physical ceiling, floored at 1 unless dead. */
    value: number;
    /** The band `value` falls in. */
    band: HealthBand;
}

/**
 * The bucket state a part contributes: its tier, or `unusable`.
 * @param part - The part's health contribution.
 * @returns The bucket state key.
 */
function partState(part: PartHealthInput): string {
    return part.usable ? part.tier : "unusable";
}

/**
 * The physical-health ceiling: bucket impaired parts by (critical?, state),
 * count each bucket, read its ceiling, and take the minimum. `100` when no part
 * is impaired.
 *
 * @param parts - Every body part's health contribution.
 * @returns The physical ceiling in `[0, 100]`.
 */
export function physicalHealthCeiling(
    parts: readonly PartHealthInput[],
): number {
    const counts = new Map<string, number>();
    for (const part of parts) {
        const state = partState(part);
        if (state === BODY_PART_TIER.NONE) continue; // usable, unimpaired
        const key = `${part.critical ? "c" : "n"}:${state}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    if (counts.size === 0) return MAX_HEALTH;

    let ceiling = MAX_HEALTH;
    for (const [key, count] of counts) {
        const critical = key[0] === "c";
        const state = key.slice(2) as keyof typeof CEILINGS.critical;
        const row = (critical ? CEILINGS.critical : CEILINGS.noncritical)[
            state
        ];
        // Non-critical columns are 1 / 2 / 3+; critical are 1 / 2+.
        const col = Math.min(count, critical ? 2 : 3) - 1;
        ceiling = Math.min(ceiling, row[col]);
    }
    return ceiling;
}

/**
 * The band a health value falls in: `96–100` Excellent, `80–95` Good, `60–79`
 * Fair, `30–59` Poor, `1–29` Morbid, `0` Dead.
 *
 * @param value - Health value `0…100`.
 * @returns The band.
 */
export function healthBand(value: number): HealthBand {
    if (value <= 0) return HEALTH_BAND.DEAD;
    if (value >= 96) return HEALTH_BAND.EXCELLENT;
    if (value >= 80) return HEALTH_BAND.GOOD;
    if (value >= 60) return HEALTH_BAND.FAIR;
    if (value >= 30) return HEALTH_BAND.POOR;
    return HEALTH_BAND.MORBID;
}

/**
 * Derive a being's health from its body-part impairment and `dead` status.
 * `max` is always 100; `value` is the physical ceiling, floored at 1 for a
 * living being (0 only when dead).
 *
 * @param input - The resolved health inputs.
 * @returns The `{ max, value, band }` health.
 */
export function deriveHealth(input: HealthInput): Health {
    const value =
        input.dead ? 0 : Math.max(1, physicalHealthCeiling(input.parts));
    return { max: MAX_HEALTH, value, band: healthBand(value) };
}
