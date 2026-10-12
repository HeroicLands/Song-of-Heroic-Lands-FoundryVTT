/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    prepareGrabTrial,
    answerGrabTrial,
    type PendingGrabTrial,
    type GrabTrialChoice,
} from "@src/entity/strikemode/grabTrial";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { IMPACT_ASPECT } from "@src/utils/constants";
const mode = Object.create(StrikeModeBase.prototype) as StrikeModeBase;
mode.traits = {};
(mode as { impact: unknown }).impact = { aspectType: IMPACT_ASPECT.BLUNT };
const available = {
    partCodes: ["left", "right"],
    offSidePartCodes: ["left"],
    impactTacticalAdvantages: 2,
};
const choice: GrabTrialChoice = {
    manoeuvre: "hold",
    partCodes: ["right"],
    impactTacticalAdvantages: 0,
};
describe("Owner-selected Grab trial", () => {
    it("spends no Impact TA unless the owner chose a count", () => {
        expect(prepareGrabTrial(mode, choice, available).map((d) => d.value)).toEqual([-2]);
    });
    it("uses the mode TA value and stacks one-hand/off-hand trial costs", () => {
        expect(
            prepareGrabTrial(
                mode,
                { ...choice, partCodes: ["left"], impactTacticalAdvantages: 2 },
                available,
            ).map((d) => d.value),
        ).toEqual([6, -2, -3]);
    });
    it("committing both hands removes both grip costs", () => {
        expect(
            prepareGrabTrial(mode, { ...choice, partCodes: ["left", "right"] }, available),
        ).toEqual([]);
    });
    it.each(
        [[], ["left", "left"], ["occupied"], ["left", "right", "third"]].map((partCodes) => ({
            partCodes,
        })),
    )("rejects unavailable or duplicate hand choices: %j", ({ partCodes }) => {
        expect(() => prepareGrabTrial(mode, { ...choice, partCodes }, available)).toThrow(
            RangeError,
        );
    });
    it.each([-1, 0.5, 3, NaN])(
        "rejects invalid or excessive TA spend: %s",
        (impactTacticalAdvantages) => {
            expect(() =>
                prepareGrabTrial(mode, { ...choice, impactTacticalAdvantages }, available),
            ).toThrow(RangeError);
        },
    );
    it("revalidates a hand that became occupied after the card was posted", () => {
        expect(() => prepareGrabTrial(mode, choice, { ...available, partCodes: ["left"] })).toThrow(
            RangeError,
        );
    });
});

const pending: PendingGrabTrial = {
    id: "trial1",
    initiatorUuid: "Actor.initiator",
    targetUuid: "Actor.target",
    targetPartCode: "rarmpart",
    choice,
    initiator: {
        die: 4,
        strength: 10,
        modifiers: [{ name: "one hand", abbrev: "OneHnd", value: -2 }],
    },
    status: "awaiting-target",
};
describe("Addressed trial response", () => {
    it("the initiator must win: a tied or lost trial has no effect", () => {
        const tie = answerGrabTrial(pending, {
            targetUuid: pending.targetUuid,
            die: 2,
            strength: 10,
        });
        expect(tie.outcome).toMatchObject({ initiatorWins: false, margin: 0 });
        const loss = answerGrabTrial(pending, {
            targetUuid: pending.targetUuid,
            die: 3,
            strength: 10,
        });
        expect(loss.outcome.initiatorWins).toBe(false);
    });
    it("only the addressed target can answer", () => {
        expect(() =>
            answerGrabTrial(pending, { targetUuid: "Actor.bystander", die: 1, strength: 1 }),
        ).toThrow();
    });
    it("an answered trial cannot be answered again", () => {
        const settled = answerGrabTrial(pending, {
            targetUuid: pending.targetUuid,
            die: 1,
            strength: 10,
        });
        expect(settled.outcome.initiatorWins).toBe(true);
        expect(() =>
            answerGrabTrial(settled, { targetUuid: pending.targetUuid, die: 1, strength: 10 }),
        ).toThrow();
    });
    it.each([0, 7, 1.5, NaN])("rejects a forged d6 value: %s", (die) => {
        expect(() =>
            answerGrabTrial(pending, { targetUuid: pending.targetUuid, die, strength: 10 }),
        ).toThrow();
    });
});
