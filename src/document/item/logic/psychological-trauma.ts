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
 * Psyche Stress (PSY) — the shared inflictor for **Psyche Stress Levels**
 * ([Psychological Condition](https://kb.heroiclands.org/dev/reference/randomness/)).
 *
 * Psyche Stress rarely arises on its own — it spins off another trauma (a Fear or
 * Morale critical, an Aural Shock recovery failure). Each occurrence is recorded
 * as its own **`psycond`-subtype trauma** whose `levelBase` is its PSY level. This
 * module is the create-the-trauma primitive that the trauma tests call; the PSY
 * recovery test and behavioral effects are the Psychological Condition feature
 * (#560).
 */

import { fvttCreateEmbeddedItems } from "@src/core/FoundryHelpers";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { inflictWeaknessFatigue } from "@src/document/item/logic/fatigue";
import {
    CRITICAL_SUCCESS,
    MARGINAL_SUCCESS,
    MARGINAL_FAILURE,
    ITEM_KIND,
    TRAUMA_SUBTYPE,
} from "@src/utils/constants";

/** Weakness Fatigue Levels inflicted per Psyche Stress / Aural Shock level. */
export const WEAKNESS_FATIGUE_PER_LEVEL = 5;

/**
 * The **Psyche Stress Recovery Test** cadence — every **d6 days** (Psychological
 * Condition rules). A dice formula in seconds (`1d6 × 86400`).
 */
export const PSYCHE_RECOVERY_INTERVAL_FORMULA = "1d6 * 86400";

/**
 * The **Aural Shock recovery** cadence — **once per day** (Psychological Condition
 * rules — Aural Shock). A bare second count (`86400`).
 */
export const AURAL_SHOCK_RECOVERY_INTERVAL_FORMULA = "86400";

/**
 * A Psyche Stress Level's **presentation** (Psychological Condition rules): a
 * Quirk (PSY 1), an Impulse (PSY 2), or a Disorder (PSY 3+).
 */
export const PSYCHE_PRESENTATION = {
    /** No manifest condition. */
    NONE: 0,
    /** Quirk — a mild presentation (PSY 1). */
    QUIRK: 1,
    /** Impulse — a serious disorder noticeably affecting behavior (PSY 2). */
    IMPULSE: 2,
    /** Disorder — a manifest, character-defining disorder (PSY 3+). */
    DISORDER: 3,
} as const;

/**
 * The **permanence** of a psychological condition, stored in the trauma's
 * `category`. An indefinite condition recovers when its PSY reaches 0; a permanent
 * one does not (an empty category is treated as indefinite).
 */
export const PSYCHE_PERMANENCE = {
    /** Recovers when PSY reaches 0. */
    INDEFINITE: "indefinite",
    /** Does not recover at 0; a Critical Failure recovery test makes it so. */
    PERMANENT: "permanent",
} as const;

/**
 * The Weakness Fatigue a Psyche Stress / Aural Shock level inflicts —
 * {@link WEAKNESS_FATIGUE_PER_LEVEL} per level (Psychological Condition rules — "5
 * weakness fatigue per PSY / AS level").
 *
 * @param level - The PSY or AS level.
 * @returns The Weakness Fatigue Levels.
 */
export function weaknessFatigueForLevel(level: number): number {
    return Math.max(0, level) * WEAKNESS_FATIGUE_PER_LEVEL;
}

/**
 * The presentation for a Psyche Stress Level (Psychological Condition rules).
 *
 * @param level - The PSY level.
 * @returns A {@link PSYCHE_PRESENTATION} value.
 */
export function psychePresentation(level: number): number {
    if (level <= 0) return PSYCHE_PRESENTATION.NONE;
    if (level === 1) return PSYCHE_PRESENTATION.QUIRK;
    if (level === 2) return PSYCHE_PRESENTATION.IMPULSE;
    return PSYCHE_PRESENTATION.DISORDER;
}

/**
 * The outcome of a **Psyche Stress Recovery Test** (Psychological Condition rules):
 * `MS −1 PSY`, `CS −2 PSY`, `MF` no change, and `CF` a **Grievous Stress** — an
 * indefinite condition becomes permanent, or a permanent one gains **+1 PSY**.
 */
export interface PsycheRecoveryOutcome {
    /** Change to the condition's PSY (negative recovers). */
    psyDelta: number;
    /** Whether this is a Grievous Stress critical failure. */
    grievous: boolean;
}

/**
 * Resolve a **Psyche Stress Recovery Test** result to its outcome.
 *
 * @param normSuccessLevel - The recovery-test result (CF −1 … CS 2).
 * @returns The recovery outcome.
 */
export function psycheRecoveryOutcome(
    normSuccessLevel: number,
): PsycheRecoveryOutcome {
    if (normSuccessLevel >= CRITICAL_SUCCESS) {
        return { psyDelta: -2, grievous: false };
    }
    if (normSuccessLevel === MARGINAL_SUCCESS) {
        return { psyDelta: -1, grievous: false };
    }
    if (normSuccessLevel === MARGINAL_FAILURE) {
        return { psyDelta: 0, grievous: false };
    }
    return { psyDelta: 0, grievous: true };
}

/**
 * The outcome of an **Aural Shock recovery test** (Psychological Condition rules —
 * Aural Shock): `MS −1 AS`, `CS −2 AS`, `MF` no change, and `CF` no change plus
 * **+1 PSY**.
 */
export interface AuralShockRecoveryOutcome {
    /** Change to the Aural Shock total (negative recovers). */
    asDelta: number;
    /** Psyche Stress gained (a Critical Failure grants +1). */
    psyGain: number;
}

/**
 * Resolve an **Aural Shock recovery test** result to its outcome.
 *
 * @param normSuccessLevel - The recovery-test result (CF −1 … CS 2).
 * @returns The recovery outcome.
 */
export function auralShockRecoveryOutcome(
    normSuccessLevel: number,
): AuralShockRecoveryOutcome {
    if (normSuccessLevel >= CRITICAL_SUCCESS)
        return { asDelta: -2, psyGain: 0 };
    if (normSuccessLevel === MARGINAL_SUCCESS)
        return { asDelta: -1, psyGain: 0 };
    if (normSuccessLevel === MARGINAL_FAILURE)
        return { asDelta: 0, psyGain: 0 };
    return { asDelta: 0, psyGain: 1 };
}

/**
 * Inflict `levels` Psyche Stress Levels on `actorLogic` as a new
 * `psycond`-subtype trauma. A no-op for a non-positive `levels` or a missing
 * actor. Each call records a **separate** psyche-stress instance, as the rules
 * require ("each instance is recorded separately").
 *
 * @param actorLogic - The actor logic to add the psyche-stress trauma to.
 * @param levels - The Psyche Stress Levels to inflict.
 * @param name - The display name for the condition (typically its source).
 * @returns A promise that resolves once the psyche-stress trauma is created.
 */
export async function inflictPsycheStress(
    actorLogic: SohlActorLogic<any> | null | undefined,
    levels: number,
    name: string,
): Promise<void> {
    if (levels <= 0 || !actorLogic) return;
    await fvttCreateEmbeddedItems(actorLogic, [
        {
            type: ITEM_KIND.TRAUMA,
            name,
            system: {
                subType: TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
                levelBase: levels,
                category: PSYCHE_PERMANENCE.INDEFINITE,
            },
        },
    ]);
}

/**
 * Inflict `levels` of **Aural Shock** on `actorLogic` as a new `auralshock`-subtype
 * trauma. A no-op for a non-positive `levels` or a missing actor. Aural Shock
 * stacks into one running total; the accompanying Weakness Fatigue (5 per level,
 * {@link weaknessFatigueForLevel}) is inflicted here as well.
 *
 * @param actorLogic - The actor logic to add the Aural Shock trauma to.
 * @param levels - The Aural Shock levels to inflict (1–6).
 * @param name - The display name for the Aural Shock instance (its source).
 * @returns A promise that resolves once the Aural Shock trauma is created.
 */
export async function inflictAuralShock(
    actorLogic: SohlActorLogic<any> | null | undefined,
    levels: number,
    name: string,
): Promise<void> {
    if (levels <= 0 || !actorLogic) return;
    await fvttCreateEmbeddedItems(actorLogic, [
        {
            type: ITEM_KIND.TRAUMA,
            name,
            system: {
                subType: TRAUMA_SUBTYPE.AURALSHOCK,
                levelBase: levels,
            },
        },
    ]);
    // Aural Shock inflicts 5 Weakness Fatigue per level.
    await inflictWeaknessFatigue(
        actorLogic,
        weaknessFatigueForLevel(levels),
        name,
    );
}
