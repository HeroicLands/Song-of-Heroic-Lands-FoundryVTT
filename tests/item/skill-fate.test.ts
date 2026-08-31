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
import { MysteryLogic } from "@src/document/item/logic/MysteryLogic";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

/** Build a Fate Mystery logic embedded on `actor`. */
function makeFateMystery(
    actor: any,
    opts: {
        id: string;
        assocSkillCode?: string | null;
        value?: number | null;
        max?: number | null;
    },
): MysteryLogic {
    const mystery = makeItemLogic(
        MysteryLogic,
        "mystery",
        {
            subType: "fate",
            assocSkillCode: opts.assocSkillCode ?? null,
            levelBase: null,
            charges: {
                value: opts.value === undefined ? 1 : opts.value,
                max: opts.max === undefined ? 3 : opts.max,
            },
        },
        { actor, id: opts.id, name: opts.id, shortcode: opts.id },
    ) as MysteryLogic;
    mystery.initialize();
    return mystery;
}

/** Build a combat skill (shortcode "melee") embedded on `actor`, Fate enabled. */
function makeSkill(actor: any): SkillLogic {
    const skill = makeItemLogic(
        SkillLogic,
        "skill",
        {
            subType: "combat",
            skillBaseFormula: "sb(attr.str, attr.dex)",
            masteryLevelBase: 30,
            initSkillMult: 1,
        },
        { actor, id: "skill1", name: "Melee", shortcode: "melee" },
    ) as SkillLogic;
    skill.initialize();
    // Enable Fate directly; seeding it from an Aura attribute + the optionFate
    // setting is exercised elsewhere and is orthogonal to the spend flow.
    skill.fateMasteryLevel.setDisabled(false);
    skill.fateMasteryLevel.setBase(50);
    return skill;
}

/** A minimal stand-in for the rolled Fate test result at a given rung. */
function fakeFateResult(successLevel: number): any {
    return { successLevel };
}

/** Build the original success-test result the Fate bump applies to. */
function makeOriginal(skill: SkillLogic, successLevel: number): SuccessTestResult {
    return new SuccessTestResult({ successLevel, canFate: true }, { parent: skill });
}

describe("SkillLogic.fateTest — post-roll bump wiring (#854)", () => {
    let actor: any;
    let skill: SkillLogic;

    beforeEach(() => {
        actor = makeMockActor();
        // Post the Fate result card as a no-op; the card's content is asserted
        // separately via the template-render harness.
        vi.spyOn(SkillLogic.prototype as any, "postFateResultCard").mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("gates on an available Fate Point — warns and never rolls when none", async () => {
        skill = makeSkill(actor); // no fate mysteries on the actor
        const warn = vi.spyOn(sohl.log, "uiWarn").mockImplementation(() => {});
        const roll = vi.spyOn(skill.fateMasteryLevel, "successTest");

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
            }),
        );

        expect(roll).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
    });

    it("marginal success consumes one point and bumps the original +1", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: 2 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(MARGINAL_SUCCESS),
        );
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        const repost = vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate.data.update).toHaveBeenCalledWith({
            "system.charges.value": 1,
        });
        expect(original.successLevel).toBe(MARGINAL_SUCCESS);
        expect(repost).toHaveBeenCalledWith({ canFate: false });
    });

    it("critical failure consumes a point but does not bump", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: 2 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(CRITICAL_FAILURE),
        );
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        const repost = vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate.data.update).toHaveBeenCalledWith({
            "system.charges.value": 1,
        });
        expect(original.successLevel).toBe(MARGINAL_FAILURE);
        expect(repost).not.toHaveBeenCalled();
    });

    it("marginal failure neither consumes nor bumps", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: 2 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(MARGINAL_FAILURE),
        );
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        const repost = vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate.data.update).not.toHaveBeenCalled();
        expect(original.successLevel).toBe(MARGINAL_FAILURE);
        expect(repost).not.toHaveBeenCalled();
    });

    it("critical success — player chooses 'spend' → consume + bump +2", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: 2 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(CRITICAL_SUCCESS),
        );
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
            action: "spend",
            data: {},
        });
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate.data.update).toHaveBeenCalledWith({
            "system.charges.value": 1,
        });
        // MF (0) + 2 → clamped to Critical Success.
        expect(original.successLevel).toBe(CRITICAL_SUCCESS);
    });

    it("critical success — player chooses 'keep' → no consume, bump +1", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: 2 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(CRITICAL_SUCCESS),
        );
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
            action: "keep",
            data: {},
        });
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate.data.update).not.toHaveBeenCalled();
        expect(original.successLevel).toBe(MARGINAL_SUCCESS); // 0 + 1
    });

    it("critical success — dismissed choice cancels the whole spend", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: 2 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(CRITICAL_SUCCESS),
        );
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        const repost = vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate.data.update).not.toHaveBeenCalled();
        expect(original.successLevel).toBe(MARGINAL_FAILURE);
        expect(repost).not.toHaveBeenCalled();
    });

    it("consumes from the player-chosen Fate Mystery when more than one is eligible", async () => {
        const fate1 = makeFateMystery(actor, { id: "fate1", value: 2 });
        const fate2 = makeFateMystery(actor, { id: "fate2", value: 4 });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(MARGINAL_SUCCESS),
        );
        // Source dialog returns the second mystery.
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
            action: "ok",
            data: { mysteryId: "fate2" },
        });
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        expect(fate1.data.update).not.toHaveBeenCalled();
        expect(fate2.data.update).toHaveBeenCalledWith({
            "system.charges.value": 3,
        });
    });

    it("never decrements an infinite-charge Fate Mystery", async () => {
        const fate = makeFateMystery(actor, { id: "fate1", value: null });
        skill = makeSkill(actor);
        vi.spyOn(skill.fateMasteryLevel, "successTest").mockResolvedValue(
            fakeFateResult(MARGINAL_SUCCESS),
        );
        const original = makeOriginal(skill, MARGINAL_FAILURE);
        vi.spyOn(original, "toChat").mockResolvedValue(undefined);

        await skill.fateTest(
            new SohlActionContext({
                type: "fate",
                speaker: actor.getSpeaker(),
                scope: { priorTestResult: original },
            }),
        );

        // Infinite source: still eligible, still bumps, but nothing is written.
        expect(fate.data.update).not.toHaveBeenCalled();
        expect(original.successLevel).toBe(MARGINAL_SUCCESS);
    });
});

describe("SkillLogic.availableFate — eligibility (#854)", () => {
    it("returns general and matching skill-specific fate mysteries with charges", () => {
        const actor = makeMockActor();
        makeFateMystery(actor, { id: "general", assocSkillCode: null });
        makeFateMystery(actor, { id: "melee", assocSkillCode: "melee" });
        makeFateMystery(actor, { id: "init", assocSkillCode: "init" });
        makeFateMystery(actor, { id: "spent", assocSkillCode: null, value: 0 });
        const skill = makeSkill(actor);

        const ids = skill.availableFate.map((m) => m.id).sort();
        expect(ids).toEqual(["general", "melee"]);
    });

    it("is empty off an actor", () => {
        const skill = makeItemLogic(
            SkillLogic,
            "skill",
            {
                skillBaseFormula: "sb(attr.str, attr.dex)",
                masteryLevelBase: 30,
            },
            { id: "loose", shortcode: "melee" },
        ) as SkillLogic;
        skill.initialize();
        expect(skill.availableFate).toEqual([]);
    });
});

describe("SuccessTestResult.canFate — gated on availableFate + opt-in (#854)", () => {
    it("is true for a Fate-eligible skill's opt-in result", () => {
        const actor = makeMockActor();
        makeFateMystery(actor, { id: "fate1", value: 2 });
        const skill = makeSkill(actor);
        const result = new SuccessTestResult({ canFate: true }, { parent: skill });
        expect(result.canFate).toBe(true);
    });

    it("is false when the skill has no available Fate Point", () => {
        const actor = makeMockActor(); // no fate mysteries
        const skill = makeSkill(actor);
        const result = new SuccessTestResult({ canFate: true }, { parent: skill });
        expect(result.canFate).toBe(false);
    });

    it("is false when the test opts out (canFate: false) — e.g. the Fate test itself", () => {
        const actor = makeMockActor();
        makeFateMystery(actor, { id: "fate1", value: 2 });
        const skill = makeSkill(actor);
        const result = new SuccessTestResult({ canFate: false }, { parent: skill });
        expect(result.canFate).toBe(false);
    });
});
