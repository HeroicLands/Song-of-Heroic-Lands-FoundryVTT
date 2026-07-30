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
 * Shock-state model (#550) — a being's transient shock state.
 *
 * The shock state **is** a set of status effects (Active Effects on the actor):
 * one per state — **Stunned**, **Incapacitated**, **Unconscious**, **Dead** — and
 * **None** when no shock status is present. There is no separate persisted field.
 * Normally exactly one is active; if more than one somehow is, the **most severe
 * (highest) one is the state**. A being reports its shock state as the highest
 * active shock status, and all changes go through a single set-shock-state
 * operation that clears every shock status then applies only the target's (none
 * for None) — keeping transitions clean in both directions and repairing any
 * stray multi-status situation.
 *
 * This module is the pure, Foundry-free core: the ordered states, their status
 * ids, and the derivation from an actor's active-status set. The Foundry-touching
 * getter/op live on {@link BeingLogic}. See the Shock rules
 * (`assets/content/Rules/Shock.md`, "Implementation").
 */

import {
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    STATUS_EFFECT,
} from "@src/utils/constants";

/**
 * The shock states as ascending severity levels — `NONE` (0) through `DEAD` (4).
 * Numeric so an effect can advance a being some number of steps and clamp.
 */
export const SHOCK_STATE = {
    /** No shock status active. */
    NONE: 0,
    /** Stunned — the mildest shock state. */
    STUNNED: 1,
    /** Incapacitated. */
    INCAPACITATED: 2,
    /** Unconscious. */
    UNCONSCIOUS: 3,
    /** Dead — the most severe shock state. */
    DEAD: 4,
} as const;

/** A shock-state level (`SHOCK_STATE` value). */
export type ShockState = (typeof SHOCK_STATE)[keyof typeof SHOCK_STATE];

/** The most severe shock state. */
export const MAX_SHOCK_STATE: number = SHOCK_STATE.DEAD;

/**
 * The status-effect id at each shock level, indexed by level. `NONE` (index 0)
 * has no status; the rest map to the Stunned / Incapacitated / Unconscious / Dead
 * status effects.
 */
export const SHOCK_STATUS_BY_LEVEL: readonly (string | null)[] = [
    null,
    STATUS_EFFECT.STUN,
    STATUS_EFFECT.INCAPACITATED,
    STATUS_EFFECT.UNCONSCIOUS,
    STATUS_EFFECT.DEAD,
];

/** The status-effect ids that represent a shock state (every non-`NONE` level). */
export const SHOCK_STATUS_IDS: readonly string[] = SHOCK_STATUS_BY_LEVEL.filter(
    (s): s is string => s != null,
);

/**
 * The shock-state level of the highest active shock status in `statuses`, or
 * `NONE` when none is present.
 *
 * @param statuses - The actor's active status-effect ids.
 * @returns The highest active shock-state level.
 */
export function shockStateFromStatuses(statuses: ReadonlySet<string>): number {
    let level: number = SHOCK_STATE.NONE;
    for (let i = 1; i < SHOCK_STATUS_BY_LEVEL.length; i++) {
        const sid = SHOCK_STATUS_BY_LEVEL[i];
        if (sid && statuses.has(sid)) level = i;
    }
    return level;
}

/**
 * The status-effect id for a shock level, or `null` for `NONE` / out of range.
 *
 * @param level - A shock-state level.
 * @returns The status-effect id, or `null`.
 */
export function shockStatusForLevel(level: number): string | null {
    return SHOCK_STATUS_BY_LEVEL[level] ?? null;
}

/**
 * Clamp (and round) a raw level into the valid shock range `[NONE, DEAD]`.
 *
 * @param level - A raw, possibly out-of-range level.
 * @returns The clamped shock-state level.
 */
export function clampShockState(level: number): number {
    return Math.max(
        SHOCK_STATE.NONE,
        Math.min(MAX_SHOCK_STATE, Math.round(level)),
    );
}

/**
 * Map a **Shock State Index (SSI)** to a shock-state level (Shock rules — Shock
 * State Index): `≤ 6 → None`, `7 → Stunned`, `8 → Incapacitated`,
 * `9 → Unconscious`, `≥ 10 → Dead`.
 *
 * @param index - The Shock State Index.
 * @returns The corresponding shock-state level.
 */
export function shockStateFromIndex(index: number): number {
    if (index <= 6) return SHOCK_STATE.NONE;
    if (index >= 10) return SHOCK_STATE.DEAD;
    // 7 → 1 (Stunned), 8 → 2, 9 → 3 — the index minus 6.
    return index - 6;
}

/**
 * The Shock State Index adjustment contributed by a **Shock Test** result
 * (Shock rules — Shock State Index): `CF +2`, `MF +1`, `MS 0`, `CS −1` — i.e.
 * `1 − normSuccessLevel`.
 *
 * @param normSuccessLevel - The Shock test result (CF −1 … CS 2).
 * @returns The SSI adjustment.
 */
export function shockIndexAdjustment(normSuccessLevel: number): number {
    return 1 - normSuccessLevel;
}

/**
 * The situational modifier on a **Shock Re-Test** (Shock rules — Shock Re-Test):
 * a Shock skill test at −20.
 */
export const SHOCK_RETEST_MODIFIER = -20;

/**
 * The delay before an **Unconscious** victim's Shock Re-Test comes due (Shock
 * rules — Shock Re-Test): ten minutes, in seconds. An Incapacitated victim
 * instead re-tests at the end of each combat turn (an event-driven cadence, not a
 * fixed delay), so it has no analogous constant. See issue #569.
 */
export const SHOCK_RETEST_UNCONSCIOUS_DELAY = 600;

/**
 * The gate for an **Incapacitated** victim's Shock Re-Test (issue #569): a
 * {@link sohl.entity.expr.SafeExpression} predicate that scopes the `turnEnd`
 * schedule to the end of the victim's **own** combat turn — the queue offers the
 * `[Perform]` card only when the combatant whose turn just ended is this being's,
 * not on every combatant's turn. `subscriberUuid` is the subscribed being's uuid,
 * bound by the event queue at dispatch (Shock rules — Shock Re-Test).
 */
export const SHOCK_RETEST_OWN_TURN_PREDICATE =
    "combatant.actor.uuid === subscriberUuid";

/**
 * The outcome of a **Shock Re-Test** (Shock rules — Shock Re-Test), by the
 * victim's current shock state and the test result:
 *
 * - `recover` (CS) — recovers from all shock.
 * - `improve` (MS) — improves to Stunned.
 * - `extendedShock` (MF, or a CF while Incapacitated) — falls into Extended Shock
 *   at Healing Rate `hr` (5 on MF; 4 on a CF while Incapacitated).
 * - `coma` (CF while Unconscious) — falls into a Coma.
 */
export type ShockReTestOutcome =
    | { kind: "recover" }
    | { kind: "improve"; state: number }
    | { kind: "extendedShock"; hr: number }
    | { kind: "coma" };

/**
 * Resolve a **Shock Re-Test** for an Incapacitated or Unconscious victim.
 *
 * @param state - The victim's current shock state (`INCAPACITATED` or `UNCONSCIOUS`).
 * @param normSuccessLevel - The Shock re-test result (CF −1 … CS 2).
 * @returns The re-test outcome.
 */
export function shockReTestOutcome(
    state: number,
    normSuccessLevel: number,
): ShockReTestOutcome {
    if (normSuccessLevel >= CRITICAL_SUCCESS) return { kind: "recover" };
    if (normSuccessLevel === MARGINAL_SUCCESS) {
        return { kind: "improve", state: SHOCK_STATE.STUNNED };
    }
    if (normSuccessLevel === MARGINAL_FAILURE) {
        return { kind: "extendedShock", hr: 5 };
    }
    // CF (−1): Incapacitated → Extended Shock HR 4; Unconscious → Coma.
    return state >= SHOCK_STATE.UNCONSCIOUS ?
            { kind: "coma" }
        :   { kind: "extendedShock", hr: 4 };
}

/**
 * The Healing Rate change from a shock/coma **Course Test** result (Shock rules —
 * Extended Shock / Coma Course Test): `CF −2`, `MF −1`, `MS +1`, `CS +2`.
 *
 * @param normSuccessLevel - The course-test result (CF −1 … CS 2).
 * @returns The signed change to the Healing Rate.
 */
export function shockCourseHrDelta(normSuccessLevel: number): number {
    return normSuccessLevel < MARGINAL_SUCCESS ?
            normSuccessLevel - 1
        :   normSuccessLevel;
}

/**
 * A **Coma**'s Healing Rate (Shock rules — Coma): `12 − Location Shock Value −
 * Injury Level`, using the location and injury that induced the coma.
 *
 * @param locationShockValue - The Shock Value of the inducing body location.
 * @param injuryLevel - The Injury Level of the inducing wound.
 * @returns The coma's Healing Rate.
 */
export function comaHealingRate(
    locationShockValue: number,
    injuryLevel: number,
): number {
    return 12 - locationShockValue - injuryLevel;
}
