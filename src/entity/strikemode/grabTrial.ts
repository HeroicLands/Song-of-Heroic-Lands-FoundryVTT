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

import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import {
    grabTrialModifiers,
    resolveStrengthTrial,
    type StrengthTrialDelta,
    type StrengthTrialSide,
    type StrengthTrialOutcome,
} from "@src/entity/strikemode/strengthTrial";

/** The manoeuvre the initiating owner chooses before either trial roll. */
export type GrabManoeuvre = "take" | "hold";

/** Human choices bound into an owner-addressed Grab trial request. */
export interface GrabTrialChoice {
    /** Take disarms; Hold immobilizes without disarming. */
    manoeuvre: GrabManoeuvre;
    /** Stable shortcodes of the usable free limbs committed to the attempt. */
    partCodes: string[];
    /** Impact advantages chosen by the owner; never inferred as spent. */
    impactTacticalAdvantages: number;
}

/**
 * Validate an owner's Grab choices and compute the trial's named deltas.
 * Revalidating against live available limbs prevents a stale card from using a
 * hand that was occupied or disabled after the melee exchange.
 * @param mode - The actual initiating strike mode supplying its Impact TA value.
 * @param choice - The owner's manoeuvre, participating limbs and explicit TA spend.
 * @param available - Live usable/free limb codes, their off-side subset and earned TA count.
 * @param available.partCodes - Live usable participant limb codes.
 * @param available.offSidePartCodes - Non-primary subset of those limbs.
 * @param available.impactTacticalAdvantages - Earned TA budget.
 * @returns The named trial modifiers; this function rolls nothing and applies no effect.
 */
export function prepareGrabTrial(
    mode: StrikeModeBase,
    choice: GrabTrialChoice,
    available: {
        partCodes: readonly string[];
        offSidePartCodes: readonly string[];
        impactTacticalAdvantages: number;
    },
): StrengthTrialDelta[] {
    if (choice.manoeuvre !== "take" && choice.manoeuvre !== "hold")
        throw new RangeError("Choose Take or Hold");
    if (
        (mode.traits.hold && choice.manoeuvre !== "hold") ||
        (mode.traits.take && !mode.traits.hold && choice.manoeuvre !== "take")
    )
        throw new RangeError("This technique does not permit that manoeuvre");
    const parts = choice.partCodes;
    if (
        !Array.isArray(parts) ||
        parts.length < 1 ||
        parts.length > 2 ||
        new Set(parts).size !== parts.length ||
        parts.some((part) => !available.partCodes.includes(part))
    )
        throw new RangeError("Choose one or two usable free hands");
    const spent = choice.impactTacticalAdvantages;
    if (!Number.isSafeInteger(spent) || spent < 0 || spent > available.impactTacticalAdvantages)
        throw new RangeError("Choose an available Impact TA count");
    return grabTrialModifiers(mode, {
        impactTacticalAdvantages: spent,
        oneHanded: parts.length === 1,
        offHanded: parts.length === 1 && available.offSidePartCodes.includes(parts[0]!),
    });
}

/** Persisted, owner-addressed trial after the initiator has chosen and rolled. */
export interface PendingGrabTrial {
    /** Stable request id shared by both participant-owned records. */
    id: string;
    /** Initiating actor's UUID. */
    initiatorUuid: string;
    /** Resisting actor's UUID; only that actor may answer. */
    targetUuid: string;
    /** Target body part struck by the melee exchange. */
    targetPartCode: string;
    /** Human choice fixed before the trial. */
    choice: GrabTrialChoice;
    /** Initiator's committed die, Strength and named modifiers. */
    initiator: StrengthTrialSide;
    /** A answered trial cannot be rolled again. */
    status: "awaiting-target";
}

/** Settled trial; only a positive margin permits the chosen manoeuvre. */
export interface SettledGrabTrial extends Omit<PendingGrabTrial, "status"> {
    /** Durable terminal state for duplicate-click protection. */
    status: "settled";
    /** Target's owner-controlled roll and Strength. */
    target: StrengthTrialSide;
    /** Both totals and the initiator's win/loss. */
    outcome: StrengthTrialOutcome;
}

/**
 * Settle a committed Grab request using its addressed target's own response.
 * No target roll is made here; no effect is applied, including on ties/losses.
 * @param request - A live pending request from participant-owned state.
 * @param response - The answering actor, Strength and explicitly rolled d6.
 * @param response.targetUuid - Answering participant identity.
 * @param response.strength - Live Strength score.
 * @param response.die - Owner-confirmed d6 result.
 * @returns A terminal trial snapshot suitable for persisting before effect offers.
 */
export function answerGrabTrial(
    request: PendingGrabTrial | SettledGrabTrial,
    response: { targetUuid: string; strength: number; die: number },
): SettledGrabTrial {
    if (request.status !== "awaiting-target") throw new Error("This Grab trial is already settled");
    if (response.targetUuid !== request.targetUuid)
        throw new Error("This Grab trial addresses another actor");
    if (
        !Number.isInteger(response.die) ||
        response.die < 1 ||
        response.die > 6 ||
        !Number.isFinite(response.strength)
    ) {
        throw new RangeError("A Strength Trial requires a d6 and a finite Strength score");
    }
    const target = { strength: response.strength, die: response.die };
    return {
        ...request,
        status: "settled",
        target,
        outcome: resolveStrengthTrial({ initiator: request.initiator, target }),
    };
}

/**
 * Whether a melee mode invokes the Grab trial rather than a wound.
 * Press/Trip share strRoll but have distinct outcomes and are excluded.
 * @param mode - The live mode, possibly absent on a stale exchange.
 * @returns Whether this mode is a Grab or explicitly Take/Hold strength manoeuvre.
 */
export function isGrabTrialMode(mode: StrikeModeBase | undefined): boolean {
    return (
        !!mode?.isMelee &&
        !!mode.traits.strRoll &&
        (mode.shortcode === "grab" || !!mode.traits.take || !!mode.traits.hold)
    );
}
