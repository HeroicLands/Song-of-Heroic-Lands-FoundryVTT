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

import { describe, it, expect, afterEach } from "vitest";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { BRAND, OPPOSED_TEST_RESULT_TIEBREAK } from "@src/utils/constants";

/** A leftover forced die value would leak into the next roll-off. */
afterEach(() => SimpleRoll.clearForced());

const speaker = {
    isOwner: true,
    name: "GM",
    toJSON: () => ({ name: "GM" }),
} as any;

function parentFor(name: string): any {
    return {
        id: `itm-${name}`,
        name,
        label: name,
        uuid: `Item.${name}`,
        actor: { uuid: `Actor.${name}` },
        data: { kind: "skill" },
        item: { logic: { availableFate: [] } },
        [BRAND.SohlLogic]: true,
    };
}

/**
 * A settled success test. `ml` is the effective mastery level the d100 is rolled
 * against, so `rollTotal <= ml` succeeds; crit digits and `successLevelMod`
 * place the result on (or past) the four-point scale.
 */
function makeResult(
    name: string,
    opts: {
        rollTotal: number;
        ml?: number;
        critSuccess?: number[];
        critFailure?: number[];
        successLevelMod?: number;
    },
): SuccessTestResult {
    const parent = parentFor(name);
    const mlMod = new MasteryLevelModifier(
        {
            baseValue: opts.ml ?? 55,
            critSuccessDigits: opts.critSuccess ?? [],
            critFailureDigits: opts.critFailure ?? [],
            successLevelMod: opts.successLevelMod ?? 0,
        } as any,
        { parent },
    );
    const roll = new SimpleRoll(
        {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [opts.rollTotal],
        } as any,
        { parent },
    );
    return new SuccessTestResult(
        { masteryLevelModifier: mlMod, roll, title: `${name} Test` } as any,
        { parent, chatSpeaker: speaker },
    );
}

function makeOpposed(
    source: SuccessTestResult,
    target: SuccessTestResult,
    data: Record<string, unknown> = {},
): OpposedTestResult {
    return new OpposedTestResult(
        { sourceTestResult: source, targetTestResult: target, ...data } as any,
        { parent: parentFor("Aldric") },
    );
}

/** Two Marginal Successes — the canonical tied contest. */
function tiedPair(
    opts: {
        sourceRoll?: number;
        targetRoll?: number;
        sourceMl?: number;
        targetMl?: number;
    } = {},
) {
    return {
        source: makeResult("Aldric", {
            rollTotal: opts.sourceRoll ?? 30,
            ml: opts.sourceMl ?? 55,
        }),
        target: makeResult("Bandit", {
            rollTotal: opts.targetRoll ?? 30,
            ml: opts.targetMl ?? 55,
        }),
    };
}

describe("Opposed tie-breaks (#1160)", () => {
    describe("without breakTies", () => {
        it("leaves a tie unbroken — no victor, no stars", async () => {
            const { source, target } = tiedPair({
                sourceRoll: 44,
                targetRoll: 12,
            });
            const opposed = makeOpposed(source, target);
            await opposed.evaluate();

            expect(opposed.isTied).toBe(true);
            expect(opposed.isTieBroken).toBe(false);
            expect(opposed.sourceWins).toBe(false);
            expect(opposed.targetWins).toBe(false);
            expect(opposed.victoryStars).toBe(0);
            expect(opposed.tieBreak).toBe(OPPOSED_TEST_RESULT_TIEBREAK.NONE);
        });
    });

    describe("with breakTies", () => {
        it("awards a one-star victory to the higher d100 roll", async () => {
            const { source, target } = tiedPair({
                sourceRoll: 44,
                targetRoll: 12,
            });
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.isTieBroken).toBe(true);
            expect(opposed.sourceWins).toBe(true);
            expect(opposed.targetWins).toBe(false);
            expect(opposed.victoryStars).toBe(1);
            expect(opposed.tieBreakReason).toBe("roll");
        });

        it("breaks a tie of two Critical Successes", async () => {
            const source = makeResult("Aldric", {
                rollTotal: 30,
                critSuccess: [0],
            });
            const target = makeResult("Bandit", {
                rollTotal: 20,
                critSuccess: [0],
            });
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.isTieBroken).toBe(true);
            expect(opposed.sourceWins).toBe(true);
            expect(opposed.victoryStars).toBe(1);
        });

        it("falls back to the higher mastery level when the rolls are equal", async () => {
            const { source, target } = tiedPair({ sourceMl: 60, targetMl: 55 });
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.sourceWins).toBe(true);
            expect(opposed.tieBreakReason).toBe("ml");
            expect(opposed.victoryStars).toBe(1);
        });

        it("falls back to a d10 roll-off when roll and mastery level are equal", async () => {
            SimpleRoll.forceValues(3, 8);
            const { source, target } = tiedPair();
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.targetWins).toBe(true);
            expect(opposed.sourceWins).toBe(false);
            expect(opposed.tieBreakReason).toBe("rolloff");
            expect(opposed.victoryStars).toBe(1);
        });

        it("re-rolls a tied roll-off until one side is higher", async () => {
            SimpleRoll.forceValues(5, 5, 9, 2);
            const { source, target } = tiedPair();
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.sourceWins).toBe(true);
            expect(opposed.tieBreakReason).toBe("rolloff");
            expect(SimpleRoll.forcedRemaining).toBe(0);
        });

        it("does not break a mutual failure — a victor must have succeeded", async () => {
            const source = makeResult("Aldric", { rollTotal: 95 });
            const target = makeResult("Bandit", { rollTotal: 80 });
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.bothFail).toBe(true);
            expect(opposed.isTieBroken).toBe(false);
            expect(opposed.sourceWins).toBe(false);
            expect(opposed.targetWins).toBe(false);
            expect(opposed.victoryStars).toBe(0);
        });

        it("leaves a decided contest alone", async () => {
            const source = makeResult("Aldric", { rollTotal: 30 });
            const target = makeResult("Bandit", { rollTotal: 95 });
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();

            expect(opposed.isTied).toBe(false);
            expect(opposed.isTieBroken).toBe(false);
            expect(opposed.sourceWins).toBe(true);
            expect(opposed.victoryStars).toBe(1);
            expect(opposed.tieBreakReason).toBe("");
        });

        it("is idempotent — re-evaluating keeps the same victor", async () => {
            SimpleRoll.forceValues(3, 8);
            const { source, target } = tiedPair();
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();
            const first = opposed.tieBreak;
            await opposed.evaluate();

            expect(opposed.tieBreak).toBe(first);
            expect(SimpleRoll.forcedRemaining).toBe(0);
        });

        it("honors a tie-break already decided by rule, without rolling", async () => {
            const { source, target } = tiedPair();
            const opposed = makeOpposed(source, target, {
                breakTies: true,
                tieBreak: OPPOSED_TEST_RESULT_TIEBREAK.TARGET,
            });
            await opposed.evaluate();

            expect(opposed.targetWins).toBe(true);
            expect(opposed.victoryStars).toBe(1);
        });

        it("survives the request → resume round trip", async () => {
            const { source, target } = tiedPair();
            const opposed = makeOpposed(source, target, { breakTies: true });
            const revived = new OpposedTestResult(opposed.toJSON() as any, {
                parent: parentFor("Aldric"),
            });

            expect(revived.breakTies).toBe(true);
        });
    });

    describe("victory stars", () => {
        it("draws the tester's stars filled and the target's hollow", async () => {
            // Source Critical Success (2) vs. target Critical Failure (−1).
            const win = makeOpposed(
                makeResult("Aldric", { rollTotal: 30, critSuccess: [0] }),
                makeResult("Bandit", { rollTotal: 95, critFailure: [5] }),
            );
            await win.evaluate();
            expect(win.sourceWins).toBe(true);
            expect(win.victoryStarText).toBe("★★★");

            // The mirror image: the target takes it by the same margin.
            const loss = makeOpposed(
                makeResult("Aldric", { rollTotal: 95, critFailure: [5] }),
                makeResult("Bandit", { rollTotal: 30, critSuccess: [0] }),
            );
            await loss.evaluate();
            expect(loss.targetWins).toBe(true);
            expect(loss.victoryStarText).toBe("☆☆☆");
        });

        it("draws no stars for a tie or a mutual failure", async () => {
            const { source, target } = tiedPair();
            const tie = makeOpposed(source, target);
            await tie.evaluate();
            expect(tie.victoryStarText).toBe("");
        });

        it("draws a broken tie as the winner's single star", async () => {
            const { source, target } = tiedPair({
                sourceRoll: 12,
                targetRoll: 44,
            });
            const opposed = makeOpposed(source, target, { breakTies: true });
            await opposed.evaluate();
            expect(opposed.targetWins).toBe(true);
            expect(opposed.victoryStarText).toBe("☆");
        });

        it("counts one star per step of success level", async () => {
            // Critical Success (2) against Critical Failure (−1) → three stars.
            const source = makeResult("Aldric", {
                rollTotal: 30,
                critSuccess: [0],
            });
            const target = makeResult("Bandit", {
                rollTotal: 95,
                critFailure: [5],
            });
            const opposed = makeOpposed(source, target);
            await opposed.evaluate();

            expect(opposed.victoryStars).toBe(3);
        });

        it("has no upper limit once a modifier shifts a success level", async () => {
            // Marginal Success (1) against a Critical Failure pushed to −2 by a
            // −1 success-level modifier → three steps, not the clamped two.
            const source = makeResult("Aldric", { rollTotal: 30 });
            const target = makeResult("Bandit", {
                rollTotal: 95,
                critFailure: [5],
                successLevelMod: -1,
            });
            const opposed = makeOpposed(source, target);
            await opposed.evaluate();

            expect(opposed.sourceWins).toBe(true);
            expect(opposed.victoryStars).toBe(3);
        });

        it("awards none when both sides fail", async () => {
            const source = makeResult("Aldric", { rollTotal: 95 });
            const target = makeResult("Bandit", {
                rollTotal: 99,
                critFailure: [9],
            });
            const opposed = makeOpposed(source, target);
            await opposed.evaluate();

            expect(opposed.bothFail).toBe(true);
            expect(opposed.victoryStars).toBe(0);
        });
    });
});
