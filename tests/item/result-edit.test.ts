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
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { VALUE_DELTA_INFO } from "@src/utils/constants";

/** A minimal owned speaker for the action context. */
const speaker = new SohlSpeaker({ alias: "GM" });

/**
 * GM result-edit (#856): the test-card edit pencil re-evaluates a settled test
 * on its **frozen roll** — adjusting the situational and/or success-level
 * modifier — without a re-roll or a Fate cost. These tests drive the shared
 * `resultEdit` executor through the `skipDialog` path (situational/success-level
 * values supplied in scope), so the dialog is bypassed and the re-evaluation is
 * asserted directly.
 */

/** A frozen, already-rolled d100 (total `total`) — supplying it means no re-roll. */
function frozenRoll(total: number, parent: any): SimpleRoll {
    return new SimpleRoll(
        { numDice: 1, dieFaces: 100, modifier: 0, rolls: [total] } as any,
        { parent },
    );
}

/**
 * A settled success test result parented to `skill`, target `base`, rolled
 * `roll`, owned so `evaluate()` resolves it. Evaluated once to establish the
 * baseline level, with `toChat` spied to a no-op (the repost is asserted via the
 * render harness elsewhere).
 */
async function makePriorResult(skill: any, base: number, roll: number) {
    const mlMod = new MasteryLevelModifier({ baseValue: base } as any, {
        parent: skill,
    });
    const result = new SuccessTestResult(
        {
            masteryLevelModifier: mlMod,
            roll: frozenRoll(roll, skill),
            title: "Skill Test",
        } as any,
        {
            parent: skill,
            chatSpeaker: {
                isOwner: true,
                name: "GM",
                toJSON: () => ({ name: "GM" }),
            } as any,
        },
    );
    await result.evaluate();
    const toChat = vi
        .spyOn(result, "toChat")
        .mockResolvedValue(undefined as any);
    return { result, mlMod, toChat };
}

/** The action context an edit dispatch builds: prior result + supplied edits. */
function editCtx(
    result: SuccessTestResult,
    scope: { situationalModifier?: number; successLevelMod?: number } = {},
): SohlActionContext {
    return new SohlActionContext({
        type: "resultEdit",
        speaker,
        skipDialog: true,
        scope: { priorTestResult: result, ...scope },
    } as any);
}

describe("SohlItemBaseLogic.resultEdit — GM result-edit on the frozen roll (#856)", () => {
    let skill: SkillLogic;

    beforeEach(() => {
        const actor = makeMockActor();
        skill = makeItemLogic(
            SkillLogic,
            "skill",
            {
                subType: "combat",
                skillBaseFormula: "sb(attr.str)",
                masteryLevelBase: 50,
                initSkillMult: 1,
            },
            { actor, id: "skill1", name: "Melee", shortcode: "melee" },
        ) as SkillLogic;
        skill.initialize();
        // Default the client to a GM for the happy-path tests.
        vi.spyOn(FoundryHelpersMock, "fvttIsCurrentUserGM").mockReturnValue(
            true,
        );
    });

    afterEach(() => vi.restoreAllMocks());

    it("refuses for a non-GM — warns, never re-evaluates, never reposts", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttIsCurrentUserGM").mockReturnValue(
            false,
        );
        const { result, toChat } = await makePriorResult(skill, 50, 23);
        const warn = vi.spyOn(sohl.log, "uiWarn").mockImplementation(() => {});
        const before = result.successLevel;

        const ret = await skill.resultEdit(
            editCtx(result, { situationalModifier: -45 }),
        );

        expect(warn).toHaveBeenCalled();
        expect(toChat).not.toHaveBeenCalled();
        expect(result.successLevel).toBe(before); // untouched
        expect(ret).toBeUndefined();
    });

    it("is a no-op when the modifiers are unchanged — no repost", async () => {
        const { result, mlMod, toChat } = await makePriorResult(skill, 50, 23);
        const before = result.successLevel;
        // Supply the same values the result already carries.
        const priorSit = mlMod.get(VALUE_DELTA_INFO.PLAYER)?.numValue ?? 0;

        await skill.resultEdit(
            editCtx(result, {
                situationalModifier: priorSit,
                successLevelMod: mlMod.successLevelMod,
            }),
        );

        expect(toChat).not.toHaveBeenCalled();
        expect(result.successLevel).toBe(before);
    });

    it("never re-rolls — the frozen die total is preserved across an edit", async () => {
        const { result } = await makePriorResult(skill, 50, 23);
        await skill.resultEdit(editCtx(result, { situationalModifier: -45 }));
        expect(result.roll.total).toBe(23);
    });

    it("a situational-modifier edit re-derives the level on the frozen roll", async () => {
        // 23 vs 50 → a pass. Drop the target to 5 (situational −45): 23 > 5 →
        // the same frozen roll now fails. The level re-derives; no re-roll.
        const { result, toChat } = await makePriorResult(skill, 50, 23);
        expect(result.isSuccess).toBe(true);

        await skill.resultEdit(editCtx(result, { situationalModifier: -45 }));

        expect(result.roll.total).toBe(23);
        expect(result.isSuccess).toBe(false);
        expect(toChat).toHaveBeenCalledTimes(1);
    });

    it("replaces the situational delta on the modifier (not stacking) and updates the target", async () => {
        const { result, mlMod } = await makePriorResult(skill, 50, 23);

        await skill.resultEdit(editCtx(result, { situationalModifier: 7 }));
        expect(mlMod.get(VALUE_DELTA_INFO.PLAYER)?.numValue).toBe(7);
        expect(mlMod.effective).toBe(57);

        // Re-edit to a different value: the SitMod delta is replaced, not added.
        await skill.resultEdit(editCtx(result, { situationalModifier: -3 }));
        expect(mlMod.get(VALUE_DELTA_INFO.PLAYER)?.numValue).toBe(-3);
        expect(mlMod.effective).toBe(47);
    });

    it("clearing the situational modifier to 0 removes the delta (target back to base)", async () => {
        const { result, mlMod } = await makePriorResult(skill, 50, 23);
        await skill.resultEdit(editCtx(result, { situationalModifier: 7 }));
        expect(mlMod.has(VALUE_DELTA_INFO.PLAYER)).toBe(true);

        await skill.resultEdit(editCtx(result, { situationalModifier: 0 }));
        expect(mlMod.has(VALUE_DELTA_INFO.PLAYER)).toBe(false);
        expect(mlMod.effective).toBe(50);
    });

    it("a success-level-modifier edit shifts the derived level, still on the frozen roll", async () => {
        // 23 vs 50 passes; a large negative success-level mod forces a failure.
        const { result } = await makePriorResult(skill, 50, 23);
        expect(result.isSuccess).toBe(true);

        await skill.resultEdit(editCtx(result, { successLevelMod: -5 }));

        expect(result.roll.total).toBe(23);
        expect(result.masteryLevelModifier.successLevelMod).toBe(-5);
        expect(result.isSuccess).toBe(false);
    });

    it("does nothing when no priorTestResult is supplied", async () => {
        const warn = vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
        const ret = await skill.resultEdit(
            new SohlActionContext({
                type: "resultEdit",
                speaker,
                skipDialog: true,
                scope: {},
            } as any),
        );
        expect(ret).toBeUndefined();
        expect(warn).toHaveBeenCalled();
    });
});
