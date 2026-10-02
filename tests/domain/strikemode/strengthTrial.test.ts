/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    GRAB_OFF_HANDED_TRIAL_MODIFIER,
    GRAB_ONE_HANDED_TRIAL_MODIFIER,
    STRENGTH_TRIAL_DIE,
    STRENGTH_TRIAL_SETTLED_BY,
    grabTrialModifiers,
    resolveStrengthTrial,
    strengthTrialIsSettledByStrength,
    strengthTrialSideTotal,
} from "@src/entity/strikemode/strengthTrial";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { IMPACT_ASPECT } from "@src/utils/constants";

/**
 * A strike mode carrying only the aspect and traits the trial reads, built
 * through `Object.create` so no entity registry is needed.
 */
function mode(aspect: string, traits: Record<string, unknown> = {}) {
    const sm = Object.create(StrikeModeBase.prototype) as StrikeModeBase;
    sm.traits = traits;
    (sm as { impact: unknown }).impact = { aspectType: aspect };
    return sm;
}

/** A blunt manoeuvre, as every unarmed manoeuvre is. */
function blunt(traits: Record<string, unknown> = {}) {
    return mode(IMPACT_ASPECT.BLUNT, traits);
}

/** The value of one named delta in a modifier list. */
function delta(deltas: Array<{ abbrev: string; value: number }>, abbrev: string) {
    return deltas.find((d) => d.abbrev === abbrev)?.value;
}

describe("the die", () => {
    it("is a d6 for every creature, however large", () => {
        // The die models chance in the moment — footing, leverage, timing —
        // which does not grow with mass. Size is already the `+ Strength` term,
        // and a scaled die would also wreck the margin, which is a mechanical
        // output compared on one scale from a mouse to a dragon.
        expect(STRENGTH_TRIAL_DIE).toBe(6);
    });

    it("cannot overturn a Strength advantage as wide as its own face count", () => {
        // The widest swing two d6 can produce is five, so a six-point gap is
        // beyond the dice.
        expect(STRENGTH_TRIAL_SETTLED_BY).toBe(STRENGTH_TRIAL_DIE);
        expect(strengthTrialIsSettledByStrength(17, 11)).toBe(true);
        expect(strengthTrialIsSettledByStrength(11, 17)).toBe(true);
        expect(strengthTrialIsSettledByStrength(16, 11)).toBe(false);
        expect(strengthTrialIsSettledByStrength(11, 11)).toBe(false);
    });
});

describe("a side's total", () => {
    it("is the die plus Strength when nothing modifies it", () => {
        expect(strengthTrialSideTotal({ strength: 11, die: 4 })).toBe(15);
    });

    it("adds every named delta", () => {
        expect(
            strengthTrialSideTotal({
                strength: 11,
                die: 4,
                modifiers: [
                    { name: "a", abbrev: "A", value: 6 },
                    { name: "b", abbrev: "B", value: -2 },
                ],
            }),
        ).toBe(19);
    });

    it("floors a fractional Strength to the weaker band", () => {
        expect(strengthTrialSideTotal({ strength: 11.9, die: 1 })).toBe(12);
    });
});

describe("Grab's trial modifiers", () => {
    it("are nothing at all when the grabber spends nothing and has both hands on", () => {
        expect(grabTrialModifiers(blunt(), {})).toEqual([]);
    });

    it("are worth the mode's Impact TA value per advantage spent", () => {
        // Blunt is worth 3, which is where Grab's printed "+3 per Impact TA"
        // comes from — it is the aspect's value, not a Grab constant.
        expect(delta(grabTrialModifiers(blunt(), { impactTacticalAdvantages: 1 }), "ImpTA")).toBe(
            3,
        );
        expect(delta(grabTrialModifiers(blunt(), { impactTacticalAdvantages: 2 }), "ImpTA")).toBe(
            6,
        );
    });

    it("take an authored Impact TA value over the aspect's", () => {
        expect(
            delta(
                grabTrialModifiers(blunt({ impTA: 6 }), { impactTacticalAdvantages: 2 }),
                "ImpTA",
            ),
        ).toBe(12);
    });

    it("never assume a spend", () => {
        expect(delta(grabTrialModifiers(blunt(), { impactTacticalAdvantages: 0 }), "ImpTA")).toBe(
            undefined,
        );
        expect(delta(grabTrialModifiers(blunt(), { impactTacticalAdvantages: -1 }), "ImpTA")).toBe(
            undefined,
        );
    });

    it("cost two for one hand on the target and three for the off hand", () => {
        expect(delta(grabTrialModifiers(blunt(), { oneHanded: true }), "OneHnd")).toBe(
            GRAB_ONE_HANDED_TRIAL_MODIFIER,
        );
        expect(GRAB_ONE_HANDED_TRIAL_MODIFIER).toBe(-2);
        expect(delta(grabTrialModifiers(blunt(), { offHanded: true }), "OffHnd")).toBe(
            GRAB_OFF_HANDED_TRIAL_MODIFIER,
        );
        expect(GRAB_OFF_HANDED_TRIAL_MODIFIER).toBe(-3);
    });

    it("charge both for a one-handed grab made with the off hand", () => {
        const deltas = grabTrialModifiers(blunt(), { oneHanded: true, offHanded: true });
        expect(delta(deltas, "OneHnd")).toBe(-2);
        expect(delta(deltas, "OffHnd")).toBe(-3);
    });

    it("keep each modifier a named delta, so the trial can be audited", () => {
        const deltas = grabTrialModifiers(blunt(), {
            impactTacticalAdvantages: 1,
            oneHanded: true,
        });
        expect(deltas.map((d) => d.abbrev)).toEqual(["ImpTA", "OneHnd"]);
        for (const d of deltas) expect(d.name).toMatch(/^SOHL\./);
    });
});

describe("resolving the trial", () => {
    it("is won by the higher total, with the margin between them", () => {
        const outcome = resolveStrengthTrial({
            initiator: { strength: 13, die: 5 },
            target: { strength: 11, die: 2 },
        });
        expect(outcome.initiatorTotal).toBe(18);
        expect(outcome.targetTotal).toBe(13);
        expect(outcome.initiatorWins).toBe(true);
        expect(outcome.margin).toBe(5);
    });

    it("gives the initiator nothing on a loss", () => {
        const outcome = resolveStrengthTrial({
            initiator: { strength: 11, die: 1 },
            target: { strength: 13, die: 6 },
        });
        expect(outcome.initiatorWins).toBe(false);
        expect(outcome.margin).toBe(-7);
    });

    it("gives the initiator nothing on a tie — the initiator must win it", () => {
        const outcome = resolveStrengthTrial({
            initiator: { strength: 11, die: 3 },
            target: { strength: 12, die: 2 },
        });
        expect(outcome.initiatorTotal).toBe(outcome.targetTotal);
        expect(outcome.initiatorWins).toBe(false);
        expect(outcome.margin).toBe(0);
    });

    it("folds the initiator's modifiers into their side alone", () => {
        const outcome = resolveStrengthTrial({
            initiator: {
                strength: 11,
                die: 1,
                modifiers: grabTrialModifiers(blunt(), { impactTacticalAdvantages: 2 }),
            },
            target: { strength: 11, die: 6 },
        });
        expect(outcome.initiatorTotal).toBe(18);
        expect(outcome.targetTotal).toBe(17);
        expect(outcome.initiatorWins).toBe(true);
    });

    it("cannot be lost by a grabber six points of Strength ahead", () => {
        // The worst roll against the best still wins, which is why the rules
        // say a Strength gap this wide is not a contest.
        const outcome = resolveStrengthTrial({
            initiator: { strength: 17, die: 1 },
            target: { strength: 11, die: STRENGTH_TRIAL_DIE },
        });
        expect(outcome.initiatorWins).toBe(true);
    });
});
