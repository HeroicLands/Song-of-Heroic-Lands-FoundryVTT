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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { makeActorLogic } from "@tests/mocks/logicHarness";
import { ACTOR_KIND, VALUE_DELTA_INFO } from "@src/utils/constants";

/**
 * GM re-edit of a **settled opposed contest** (#1082) — the edit pencil in the
 * Opposed Action Result card's header. It is the two-sided counterpart to the
 * standard card's `resultEdit` (#856): each side's situational and
 * success-level modifiers are re-opened, the contest is re-evaluated on both
 * **frozen** rolls (never a re-roll), and the result card is reposted.
 *
 * These drive the executor through its `skipDialog` path (each side's new values
 * supplied in scope), so the dialogs are bypassed and the re-evaluation is
 * asserted directly; the dialog/cancel semantics get their own cases with
 * `dialog` stubbed.
 */

const speaker = new SohlSpeaker({ alias: "GM" });

/** An owned chat speaker, so `evaluate()` is never refused for permissions. */
const ownedSpeaker = {
    isOwner: true,
    name: "GM",
    toJSON: () => ({ name: "GM" }),
} as any;

/** A frozen, already-rolled d100 — supplying it means `evaluate()` never re-rolls. */
function frozenRoll(total: number, parent: any): SimpleRoll {
    return new SimpleRoll(
        { numDice: 1, dieFaces: 100, modifier: 0, rolls: [total] } as any,
        { parent },
    );
}

/** A settled success test: target `base`, frozen roll `roll`, already evaluated. */
async function makeSide(
    parent: any,
    base: number,
    roll: number,
    title: string,
): Promise<SuccessTestResult> {
    const result = new SuccessTestResult(
        {
            masteryLevelModifier: new MasteryLevelModifier(
                { baseValue: base } as any,
                { parent },
            ),
            roll: frozenRoll(roll, parent),
            title,
        } as any,
        { parent, chatSpeaker: ownedSpeaker },
    );
    await result.evaluate();
    return result;
}

/** The action context an edit dispatch builds: the contest + per-side edits. */
function editCtx(
    opposed: OpposedTestResult | undefined,
    scope: {
        source?: { situationalModifier?: number; successLevelMod?: number };
        target?: { situationalModifier?: number; successLevelMod?: number };
    } = {},
    opts: { skipDialog?: boolean } = {},
): SohlActionContext {
    return new SohlActionContext({
        type: "opposedResultEdit",
        speaker,
        skipDialog: opts.skipDialog ?? true,
        scope: { opposedTestResult: opposed, ...scope },
    } as any);
}

describe("SohlActorBaseLogic.opposedResultEdit — GM re-edit of a settled contest (#1082)", () => {
    let being: BeingLogic;
    let opposed: OpposedTestResult;
    let toChat: any;

    beforeEach(async () => {
        being = makeActorLogic(
            BeingLogic,
            ACTOR_KIND.BEING,
            {},
            {
                id: "actor1",
                name: "Aldric",
            },
        ) as BeingLogic;
        vi.spyOn(FoundryHelpersMock, "fvttIsCurrentUserGM").mockReturnValue(
            true,
        );

        // Source: 23 vs 50 → a pass. Target: 80 vs 50 → a miss. Source wins.
        const source = await makeSide(being, 50, 23, "Stealth Test");
        const target = await makeSide(being, 50, 80, "Awareness Test");
        opposed = new OpposedTestResult(
            { sourceTestResult: source, targetTestResult: target } as any,
            { parent: being },
        );
        toChat = vi
            .spyOn(opposed, "toChat")
            .mockResolvedValue(undefined as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("refuses for a non-GM — warns, never re-evaluates, never reposts", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttIsCurrentUserGM").mockReturnValue(
            false,
        );
        const warn = vi.spyOn(sohl.log, "uiWarn").mockImplementation(() => {});
        const before = opposed.sourceTestResult.successLevel;

        const ret = await being.opposedResultEdit(
            editCtx(opposed, { source: { situationalModifier: -45 } }),
        );

        expect(ret).toBeUndefined();
        expect(warn).toHaveBeenCalled();
        expect(toChat).not.toHaveBeenCalled();
        expect(opposed.sourceTestResult.successLevel).toBe(before);
    });

    it("does nothing when no opposedTestResult is supplied", async () => {
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
        const ret = await being.opposedResultEdit(editCtx(undefined));
        expect(ret).toBeUndefined();
        expect(warn).toHaveBeenCalled();
    });

    it("is a no-op when neither side's modifiers change — no repost", async () => {
        const ret = await being.opposedResultEdit(
            editCtx(opposed, {
                source: { situationalModifier: 0, successLevelMod: 0 },
                target: { situationalModifier: 0, successLevelMod: 0 },
            }),
        );
        expect(ret).toBe(opposed);
        expect(toChat).not.toHaveBeenCalled();
    });

    it("never re-rolls — both frozen die totals survive an edit", async () => {
        await being.opposedResultEdit(
            editCtx(opposed, {
                source: { situationalModifier: -30 },
                target: { situationalModifier: 40 },
            }),
        );
        expect(opposed.sourceTestResult.roll.total).toBe(23);
        expect(opposed.targetTestResult.roll.total).toBe(80);
    });

    it("re-derives both sides on their frozen rolls and can flip the winner", async () => {
        expect(opposed.sourceWins).toBe(true);
        expect(opposed.targetWins).toBe(false);

        // Source target drops to 5 (23 > 5 → now fails); target rises to 90
        // (80 ≤ 90 → now passes). The contest reverses, with no new dice.
        await being.opposedResultEdit(
            editCtx(opposed, {
                source: { situationalModifier: -45 },
                target: { situationalModifier: 40 },
            }),
        );

        expect(opposed.sourceTestResult.isSuccess).toBe(false);
        expect(opposed.targetTestResult.isSuccess).toBe(true);
        expect(opposed.sourceWins).toBe(false);
        expect(opposed.targetWins).toBe(true);
    });

    it("reposts the opposed RESULT card (not the request card) once changed", async () => {
        await being.opposedResultEdit(
            editCtx(opposed, { source: { situationalModifier: -45 } }),
        );
        expect(toChat).toHaveBeenCalledTimes(1);
        const data = toChat.mock.calls[0][0] as any;
        expect(data.template).toBe(
            "systems/sohl/templates/chat/opposed-result-card.hbs",
        );
        expect(data.title).toBeTruthy();
    });

    it("replaces each side's situational delta rather than stacking it", async () => {
        const srcMod = opposed.sourceTestResult.masteryLevelModifier;

        await being.opposedResultEdit(
            editCtx(opposed, { source: { situationalModifier: 7 } }),
        );
        expect(srcMod.get(VALUE_DELTA_INFO.PLAYER)?.numValue).toBe(7);
        expect(srcMod.effective).toBe(57);

        await being.opposedResultEdit(
            editCtx(opposed, { source: { situationalModifier: -3 } }),
        );
        expect(srcMod.get(VALUE_DELTA_INFO.PLAYER)?.numValue).toBe(-3);
        expect(srcMod.effective).toBe(47);

        // Clearing to 0 removes the delta entirely.
        await being.opposedResultEdit(
            editCtx(opposed, { source: { situationalModifier: 0 } }),
        );
        expect(srcMod.has(VALUE_DELTA_INFO.PLAYER)).toBe(false);
        expect(srcMod.effective).toBe(50);
    });

    it("a success-level-modifier edit shifts a side's derived level", async () => {
        await being.opposedResultEdit(
            editCtx(opposed, { target: { successLevelMod: 5 } }),
        );
        expect(
            opposed.targetTestResult.masteryLevelModifier.successLevelMod,
        ).toBe(5);
        expect(opposed.targetTestResult.roll.total).toBe(80);
    });

    describe("dialog path", () => {
        it("opens one dialog per side, pre-filled with that side's current modifiers", async () => {
            const dlg = vi
                .spyOn(FoundryHelpersMock, "dialog")
                .mockResolvedValue({
                    situationalModifier: 0,
                    successLevelMod: 0,
                } as any);
            opposed.sourceTestResult.masteryLevelModifier.add(
                VALUE_DELTA_INFO.PLAYER,
                6,
            );

            await being.opposedResultEdit(
                editCtx(opposed, {}, { skipDialog: false }),
            );

            expect(dlg).toHaveBeenCalledTimes(2);
            expect((dlg.mock.calls[0][0] as any).data.situationalModifier).toBe(
                6,
            );
            expect((dlg.mock.calls[1][0] as any).data.situationalModifier).toBe(
                0,
            );
        });

        it("a dismissed dialog cancels the edit — nothing re-evaluated, nothing reposted", async () => {
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(
                undefined as any,
            );
            const before = opposed.sourceTestResult.successLevel;

            const ret = await being.opposedResultEdit(
                editCtx(opposed, {}, { skipDialog: false }),
            );

            expect(ret).toBeUndefined();
            expect(toChat).not.toHaveBeenCalled();
            expect(opposed.sourceTestResult.successLevel).toBe(before);
        });
    });
});
