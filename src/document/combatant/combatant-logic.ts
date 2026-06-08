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

import { STATUS_EFFECT, type MovementMedium } from "@src/utils/constants";

/**
 * Pure relational predicate behind {@link SohlCombatant.isEnemyOf}.
 *
 * Under the SoHL combat invariant, two combatants are enemies iff they belong
 * to different {@link CombatantGroup}s. A combatant is never its own enemy.
 * Absent grouping (a `null`/`undefined` group id on either side) is treated
 * defensively as enemy.
 *
 * @param thisGroupId - The group id of the subject combatant.
 * @param otherGroupId - The group id of the other combatant.
 * @param isSelf - True when both ids refer to the same combatant.
 * @returns True if the two combatants are enemies.
 */
export function areCombatantsEnemies(
    thisGroupId: string | null | undefined,
    otherGroupId: string | null | undefined,
    isSelf: boolean,
): boolean {
    if (isSelf) return false;
    if (thisGroupId && otherGroupId && thisGroupId === otherGroupId) {
        return false;
    }
    return true;
}

/**
 * Foundry status-effect ids that incapacitate a combatant enough that it no
 * longer threatens its enemies. Uses Foundry's canonical ids (note `stun`,
 * not `stunned`). `dead`/defeat is handled separately via the DEFEATED
 * special status effect (`combatant.isDefeated`).
 */
export const THREAT_NEGATING_STATUSES = [
    STATUS_EFFECT.UNCONSCIOUS,
    STATUS_EFFECT.SLEEP,
    STATUS_EFFECT.STUN,
    STATUS_EFFECT.RESTRAINED,
    STATUS_EFFECT.PARALYZED,
    STATUS_EFFECT.FROZEN,
] as const;

/** The condition view consumed by {@link isThreatening}. */
export interface ThreatView {
    /** The candidate threatens the subject's allegiance (different group). */
    isEnemy: boolean;
    /** The candidate is defeated (DEFEATED special status). */
    isDefeated: boolean;
    /** The candidate carries a {@link THREAT_NEGATING_STATUSES} status. */
    isIncapacitated: boolean;
    /** The candidate is hidden from the subject. */
    isHidden: boolean;
    /** The candidate is within weapon reach of the subject. */
    reaches: boolean;
}

/**
 * Pure predicate behind {@link SohlCombatant.threatenedBy}: a candidate
 * combatant threatens the subject iff it is an enemy that is alive,
 * conscious, capable, visible, and within reach.
 */
export function isThreatening(view: ThreatView): boolean {
    return (
        view.isEnemy &&
        !view.isDefeated &&
        !view.isIncapacitated &&
        !view.isHidden &&
        view.reaches
    );
}

/** Minimal contract a combatant's actor logic must satisfy for move computation. */
export interface BeingLogicMoveView {
    /**
     * The actor's base move for a given medium.
     *
     * @param medium - The movement medium (e.g. ground, swimming, flying).
     * @returns An object whose `effective` is the base move rate.
     */
    effectiveBaseMove(medium: MovementMedium): {
        /** The effective base move rate for the medium. */
        effective: number;
    };
}

/**
 * Compute the effective tactical move for a combatant in the given medium.
 *
 * Returns `null` when the actor has no `BeingLogic` (e.g. a vehicle actor)
 * or when the actor's base move for this medium is 0 (creature cannot move
 * in this medium). Otherwise returns `effectiveBaseMove(medium) × moveFactor`.
 */
export function computeMove(
    beingLogic: BeingLogicMoveView | undefined | null,
    medium: MovementMedium,
    moveFactor: number,
): number | null {
    if (!beingLogic || typeof beingLogic.effectiveBaseMove !== "function") {
        return null;
    }
    const base = beingLogic.effectiveBaseMove(medium).effective;
    if (!base) return null;
    return base * moveFactor;
}

/**
 * Decide which medium a newly created combatant should display in the
 * combat tracker.
 *
 * Precedence: an explicit user-set medium > the actor's lineage default >
 * nothing (caller keeps the schema default).
 */
export function chooseInitialDisplayedMedium(
    userSetMedium: string | undefined | null,
    lineageDefault: string | undefined | null,
): string | null {
    if (userSetMedium) return userSetMedium;
    if (lineageDefault) return lineageDefault;
    return null;
}
