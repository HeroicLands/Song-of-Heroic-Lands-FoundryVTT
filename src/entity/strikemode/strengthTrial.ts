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
 * The **Strength Trial** — the direct contest of strength a manoeuvre is
 * settled by.
 *
 * A Grab, a Press and a Trip do not wound, so winning the exchange with one of
 * them earns only the attempt. What settles it is a Strength Trial: both
 * combatants roll `d6 + Strength`, the higher total wins, and the margin between
 * the two carries how decisively (Unarmed Combat rules, the Strength Trial).
 *
 * It is not a d100 test and not an Opposed Test — "test" is the d100 family and
 * "contest" is the term of art for the d100 opposed outcome, whose margin is
 * Victory Stars. A Trial has its own name because it is its own mechanic.
 *
 * ## The die does not scale with the creature
 *
 * {@link STRENGTH_TRIAL_DIE} is a `d6` for a mouse and for a dragon. It models
 * chance in the moment — footing, leverage, timing — which does not grow with
 * mass; size is already the `+ Strength` term. A scaled die would also wreck the
 * margin, which is a mechanical output a manoeuvre reads its outcome off: two
 * identical oxen rolling a scaled die could come out wildly apart, a nonsense
 * measure of decisiveness between equals.
 *
 * It follows that a Strength advantage of {@link STRENGTH_TRIAL_SETTLED_BY}
 * cannot be overturned, the widest swing two dice can produce being one less.
 * An Aurochs pressing a person is not a contest, and the rules say so.
 *
 * ## The initiator must win it
 *
 * Only the combatant who **initiated** a manoeuvre and won the Melee test may
 * inflict its effect, and only one Trial is made per exchange. Losing the Trial
 * produces **no effect at all** — not a reduced one — so a tie is a loss for the
 * initiator, who had to win it.
 *
 * ## Grab's modifiers
 *
 * {@link grabTrialModifiers} assembles the grabber's side as **named deltas**, so
 * the Trial's arithmetic can be read back rather than arriving as a single
 * number:
 *
 * | Modifier                 | Value                                      |
 * | ------------------------ | ------------------------------------------ |
 * | per Impact Tactical Advantage | the mode's Impact TA value            |
 * | one hand on the target   | {@link GRAB_ONE_HANDED_TRIAL_MODIFIER}     |
 * | that hand the off one    | {@link GRAB_OFF_HANDED_TRIAL_MODIFIER}     |
 *
 * The Impact Tactical Advantage term is **not a Grab constant**. It is the
 * mode's own {@link sohl.entity.strikemode.impactTacticalAdvantageValue} — the
 * aspect default unless the mode authors an `impTA` of its own — and a grab is
 * blunt, which is where its printed value comes from. Spending several
 * multiplies.
 *
 * **Nothing here spends a Tactical Advantage, and nothing rolls a die.** How
 * many advantages are spent is the player's decision and the referee's award,
 * and both sides of the Trial are rolled by their own combatant's controlling
 * player. So every function takes the spend and the rolled dice as arguments and
 * answers only the arithmetic.
 */

import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import {
    IMPACT_TA_ABBREV,
    impactTacticalAdvantageValue,
} from "@src/entity/strikemode/impactTacticalAdvantage";

/**
 * The die each side of a Strength Trial rolls — the same for every creature the
 * system can represent.
 */
export const STRENGTH_TRIAL_DIE = 6;

/**
 * The Strength advantage at which a Trial stops being a contest. The widest
 * swing two dice can produce is one less than a die's face count, so a gap this
 * wide cannot be overturned however the dice fall.
 */
export const STRENGTH_TRIAL_SETTLED_BY = STRENGTH_TRIAL_DIE;

/** What a Grab's Trial costs the grabber with only one hand on the target. */
export const GRAB_ONE_HANDED_TRIAL_MODIFIER = -2;

/** What it costs further when that hand is the off one. */
export const GRAB_OFF_HANDED_TRIAL_MODIFIER = -3;

/** Delta abbreviation identifying the one-handed cost on a Grab's Trial. */
export const GRAB_ONE_HANDED_TRIAL_ABBREV = "OneHnd";

/**
 * Delta abbreviation identifying the off-handed cost on a Grab's Trial. It is
 * labelled and abbreviated as the off-hand reduction on an impact breakdown is,
 * being the same circumstance read by a different rule.
 */
export const GRAB_OFF_HANDED_TRIAL_ABBREV = "OffHnd";

/**
 * A named contribution to one side of a Strength Trial, in the shape every
 * modifier in the system takes: a localization key, a short abbreviation for the
 * breakdown, and the value.
 */
export interface StrengthTrialDelta {
    /** Localization key naming the contribution. */
    name: string;
    /** Short abbreviation identifying it in a breakdown. */
    abbrev: string;
    /** The value it adds, which may be negative. */
    value: number;
}

/** One combatant's side of a Strength Trial. */
export interface StrengthTrialSide {
    /** The combatant's effective Strength score. */
    strength: number;
    /** The {@link STRENGTH_TRIAL_DIE} the combatant's player rolled. */
    die: number;
    /** Named contributions to this side, if any. */
    modifiers?: readonly StrengthTrialDelta[];
}

/** How a Grab is being attempted, for {@link grabTrialModifiers}. */
export interface GrabTrialOptions {
    /**
     * How many Tactical Advantages the grabber is spending on Impact. Defaults
     * to none, which is the only state the system assumes.
     */
    impactTacticalAdvantages?: number;
    /** Whether the grabber has only one hand on the target. */
    oneHanded?: boolean;
    /** Whether the hand on the target is the grabber's off hand. */
    offHanded?: boolean;
}

/** The settled outcome of a Strength Trial. */
export interface StrengthTrialOutcome {
    /** The initiator's `die + Strength + modifiers`. */
    initiatorTotal: number;
    /** The target's. */
    targetTotal: number;
    /**
     * Whether the initiator won it, and so may inflict the manoeuvre. A tie is
     * a loss: the initiator had to win.
     */
    initiatorWins: boolean;
    /**
     * The initiator's total less the target's — how decisively, which a
     * manoeuvre reads its own outcome off. Zero or less is no effect at all.
     */
    margin: number;
}

/**
 * Whether a Strength Trial is settled by the Strength scores alone, the gap
 * between them being wider than the dice can bridge.
 *
 * @param strength - One combatant's Strength score.
 * @param otherStrength - The other's.
 * @returns `true` when the dice cannot change the outcome.
 */
export function strengthTrialIsSettledByStrength(strength: number, otherStrength: number): boolean {
    return Math.abs(Math.floor(strength) - Math.floor(otherStrength)) >= STRENGTH_TRIAL_SETTLED_BY;
}

/**
 * One side's total: the rolled die, the combatant's Strength, and every named
 * delta on that side.
 *
 * A fractional Strength floors to the weaker band, as every other reader of a
 * Strength score does.
 *
 * @param side - The combatant's Strength, rolled die, and modifiers.
 * @returns That side's total.
 */
export function strengthTrialSideTotal(side: StrengthTrialSide): number {
    const modifiers = (side.modifiers ?? []).reduce((sum, d) => sum + d.value, 0);
    return side.die + Math.floor(side.strength) + modifiers;
}

/**
 * Assemble the grabber's side of a Grab's Strength Trial as named deltas.
 *
 * A contribution worth nothing is left out rather than added as a zero, so the
 * breakdown states only what actually applied. The order is fixed — the
 * advantage spent, then the cost of the grip — so the breakdown reads the same
 * way every time.
 *
 * @param sm - The strike mode making the grab, read for its Impact TA value.
 * @param options - How many advantages are spent, and how the grab is gripped.
 * @returns The named deltas, in breakdown order.
 */
export function grabTrialModifiers(
    sm: StrikeModeBase,
    options: GrabTrialOptions,
): StrengthTrialDelta[] {
    const deltas: StrengthTrialDelta[] = [];

    const spent = Math.floor(options.impactTacticalAdvantages ?? 0);
    if (spent > 0) {
        const perAdvantage = impactTacticalAdvantageValue(sm) ?? 0;
        if (perAdvantage) {
            deltas.push({
                name: "SOHL.INFO.ImpactTA",
                abbrev: IMPACT_TA_ABBREV,
                value: spent * perAdvantage,
            });
        }
    }
    if (options.oneHanded) {
        deltas.push({
            name: "SOHL.INFO.OneHand",
            abbrev: GRAB_ONE_HANDED_TRIAL_ABBREV,
            value: GRAB_ONE_HANDED_TRIAL_MODIFIER,
        });
    }
    if (options.offHanded) {
        deltas.push({
            name: "SOHL.INFO.OffHand",
            abbrev: GRAB_OFF_HANDED_TRIAL_ABBREV,
            value: GRAB_OFF_HANDED_TRIAL_MODIFIER,
        });
    }
    return deltas;
}

/**
 * Settle a Strength Trial from both sides' rolled dice, Strength scores and
 * modifiers.
 *
 * @param contest - The initiator's side and the target's.
 * @param contest.initiator - The combatant who began the manoeuvre and must win.
 * @param contest.target - The combatant resisting it.
 * @returns Both totals, who won, and the margin.
 */
export function resolveStrengthTrial(contest: {
    initiator: StrengthTrialSide;
    target: StrengthTrialSide;
}): StrengthTrialOutcome {
    const initiatorTotal = strengthTrialSideTotal(contest.initiator);
    const targetTotal = strengthTrialSideTotal(contest.target);
    return {
        initiatorTotal,
        targetTotal,
        initiatorWins: initiatorTotal > targetTotal,
        margin: initiatorTotal - targetTotal,
    };
}
