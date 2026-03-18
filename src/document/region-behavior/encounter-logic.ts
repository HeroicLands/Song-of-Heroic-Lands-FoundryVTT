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
 * The trigger state fields used by encounter scheduling logic.
 * Mirrors the trigger sub-schema of {@link SohlEncounterDataModel}.
 */
export interface TriggerState {
    /** Maximum number of times this encounter can trigger (0 = unlimited). */
    max: number;
    /** Number of times triggered so far. */
    count: number;
    /** Minimum seconds between successful triggers. */
    cooldown: number;
    /** Seconds between encounter checks, aligned to world time boundaries. */
    interval: number;
    /** World time of the most recent successful trigger. */
    lastOccured: number;
    /** Probability of triggering per check (0–1). */
    probability: number;
}

/**
 * Calculates the next interval boundary strictly after `currentTime`.
 *
 * Boundaries are multiples of `interval`. For example, with interval=14400:
 * - currentTime=0 → 14400
 * - currentTime=14399 → 14400
 * - currentTime=14400 → 28800
 */
export function calculateNextCheckTime(
    currentTime: number,
    interval: number,
): number {
    return (Math.floor(currentTime / interval) + 1) * interval;
}

/**
 * Returns true if a new check should be scheduled — i.e. the encounter is not
 * disabled and has not reached its maximum trigger count.
 */
export function shouldScheduleCheck(
    disabled: boolean,
    max: number,
    count: number,
): boolean {
    if (disabled) return false;
    if (max > 0 && count >= max) return false;
    return true;
}

/**
 * Returns true if the cooldown period is still active (not enough time has
 * elapsed since the last successful trigger).
 *
 * A `lastOccured` value of 0 means the encounter has never triggered, so the
 * cooldown is not active.
 */
export function isCooldownActive(
    lastOccured: number,
    cooldown: number,
    time: number,
): boolean {
    if (lastOccured === 0) return false;
    return time - lastOccured < cooldown;
}

/**
 * Returns true if a random roll (0–1) should trigger the encounter.
 * Triggers when `roll <= trigger.probability`.
 */
export function evaluateTrigger(
    trigger: TriggerState,
    _time: number,
    roll: number,
): boolean {
    return roll <= trigger.probability;
}

/**
 * Returns the time for the next check after a successful trigger.
 *
 * Skips forward past the cooldown period to the first interval boundary at or
 * after `time + cooldown`.
 */
export function nextCheckTimeAfterTrigger(
    trigger: TriggerState,
    time: number,
): number {
    return calculateNextCheckTime(time + trigger.cooldown, trigger.interval);
}
