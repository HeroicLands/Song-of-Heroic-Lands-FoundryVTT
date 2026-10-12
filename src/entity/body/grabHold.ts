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

import type { SettledGrabTrial } from "@src/entity/strikemode/grabTrial";

/** Stable identity and lifecycle of one target-owned Hold condition. */
export interface GrabHoldState {
    traumaId: string;
    bodyLocationCode: string;
    status: "prepared" | "active" | "ending" | "ended";
    revision: number;
    lastTurnKey?: string;
    combatUuid?: string;
    dueRound?: number;
}

/**
 * Choose a real hit location of the struck part; never substitute another limb.
 * @returns A real location on the struck part, or undefined.
 * @param trial
 * @param parts
 */
export function holdLocation(
    trial: SettledGrabTrial,
    parts: readonly { shortcode: string; locations: readonly { shortcode: string }[] }[],
): string | undefined {
    if (!trial.outcome.initiatorWins || trial.choice.manoeuvre !== "hold") return undefined;
    return parts.find((part) => part.shortcode === trial.targetPartCode)?.locations[0]?.shortcode;
}

/**
 * A maintenance answer is bound to the current active condition and its revision.
 * @returns Whether this request may be answered now.
 * @param hold
 * @param request
 * @param request.revision
 * @param request.turnKey
 * @param currentTurnKey
 */
export function canAnswerHold(
    hold: GrabHoldState,
    request: { revision: number; turnKey: string },
    currentTurnKey: string | undefined,
): boolean {
    return (
        hold.status === "active" &&
        request.revision === hold.revision &&
        request.turnKey === currentTurnKey &&
        request.turnKey !== hold.lastTurnKey
    );
}

/**
 * Whether the next grabber turn has passed without a successful renewal.
 * @returns Whether this condition has outlasted its offered maintenance turn.
 * @param hold
 * @param combat
 */
export function holdExpired(
    hold: GrabHoldState,
    combat: { uuid: string; round: number; turn: number; sourceTurn: number } | undefined,
): boolean {
    if (!hold.combatUuid || hold.dueRound == null) return false;
    if (!combat || combat.uuid !== hold.combatUuid || combat.sourceTurn < 0) return true;
    return (
        combat.round > hold.dueRound ||
        (combat.round === hold.dueRound && combat.turn > combat.sourceTurn)
    );
}

/**
 * A counterstrike can establish a Hold before the grabber's turn in this round.
 * @param currentRound - Live combat round.
 * @param currentTurn - The combatant whose turn is in progress.
 * @param sourceTurn - The grabber's index in the current turn order.
 * @returns The round containing the next grabber turn.
 */
export function nextHoldMaintenanceRound(
    currentRound: number,
    currentTurn: number,
    sourceTurn: number,
): number {
    return currentRound + (sourceTurn > currentTurn ? 0 : 1);
}
