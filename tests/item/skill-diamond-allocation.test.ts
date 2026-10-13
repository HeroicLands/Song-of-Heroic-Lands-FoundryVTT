/* SPDX-License-Identifier: GPL-3.0-or-later */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import * as allocation from "@src/entity/result/valueDiamondAllocation";

afterEach(() => vi.restoreAllMocks());
describe("Skill Success Value allocation consumer", () => {
    function fixture() {
        const skill = makeItemLogic(
            SkillLogic,
            ITEM_KIND.SKILL,
            {
                masteryLevelBase: 50,
                subType: "lore",
                skillBaseFormula: "",
                initSkillMult: 1,
                improveFlag: false,
                combatCategory: "none",
                parentSkillCode: null,
                adoptParentMasteryLevel: false,
            },
            { actor: makeMockActor() },
        );
        skill.initialize();
        const result = { valueDiamonds: 3 } as any;
        vi.spyOn(skill.masteryLevel, "successValueTest").mockResolvedValue(result);
        const offer = vi
            .spyOn(allocation, "offerValueDiamondAllocation")
            .mockResolvedValue(undefined);
        return { skill, result, offer };
    }
    it("offers caller-requested allocation only after the SV result exists, preserving its return contract", async () => {
        const f = fixture();
        const rules = { qualifier: { targetNumber: 4, effectLadder: [0, 1, 2, 3] } };
        const context = new SohlActionContext({
            speaker: new SohlSpeaker(),
            scope: { diamondAllocation: rules },
        });
        expect(await f.skill.successValueTest(context)).toBe(f.result);
        expect(f.offer).toHaveBeenCalledWith(f.result, rules);
    });
    it("does not introduce crafting choices into other SV consumers", async () => {
        const f = fixture();
        await f.skill.successValueTest(new SohlActionContext({ speaker: new SohlSpeaker() }));
        expect(f.offer).not.toHaveBeenCalled();
    });
    it("does not offer allocation when the originating test is cancelled", async () => {
        const f = fixture();
        vi.mocked(f.skill.masteryLevel.successValueTest).mockResolvedValue(undefined);
        await f.skill.successValueTest(
            new SohlActionContext({ speaker: new SohlSpeaker(), scope: { diamondAllocation: {} } }),
        );
        expect(f.offer).not.toHaveBeenCalled();
    });
    it("returns accepted no-chat choice through the same context without mutating the result", async () => {
        const f = fixture();
        const chosen = {
            earned: 3,
            qualifiers: 1,
            timeDiamonds: 2,
            timeReductionPercent: 20,
            unspent: 0,
            qualifierResult: { rolls: [4], successCount: 1, result: "fine" },
        };
        f.offer.mockResolvedValue(chosen);
        const context = new SohlActionContext({
            speaker: new SohlSpeaker(),
            scope: {
                diamondAllocation: { noChat: true },
                valueDiamondAllocation: {
                    earned: 1,
                    qualifiers: 0,
                    timeDiamonds: 1,
                    timeReductionPercent: 10,
                    unspent: 0,
                },
            },
        });
        const returned = await f.skill.successValueTest(context);
        expect(returned).toBe(f.result);
        expect(context.scope.valueDiamondAllocation).toEqual(chosen);
        expect(f.result).toEqual({ valueDiamonds: 3 });
    });
    it("clears stale accepted output when the allocation is cancelled", async () => {
        const f = fixture();
        const context = new SohlActionContext({
            speaker: new SohlSpeaker(),
            scope: {
                diamondAllocation: {},
                valueDiamondAllocation: {
                    earned: 1,
                    qualifiers: 0,
                    timeDiamonds: 1,
                    timeReductionPercent: 10,
                    unspent: 0,
                },
            },
        });
        await f.skill.successValueTest(context);
        expect(context.scope).not.toHaveProperty("valueDiamondAllocation");
    });
});
