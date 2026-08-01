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

import { describe, it, expect, vi, afterEach } from "vitest";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/**
 * The Skill Value Test (#848) is exposed as a human-triggered intrinsic action
 * whose executor delegates to the graded {@link MasteryLevelModifier.successValueTest}
 * path — "special results are data (the svTable), not new code".
 */
function makeSkill(): SkillLogic {
    const skill = makeItemLogic(
        SkillLogic,
        "skill",
        {
            subType: "craft",
            skillBaseFormula: "@str",
            masteryLevelBase: 50,
            initSkillMult: 1,
        },
        {
            actor: makeMockActor(),
            id: "skill1",
            name: "Weaponcraft",
            shortcode: "wcraft",
        },
    ) as SkillLogic;
    skill.initialize();
    return skill;
}

describe("SkillLogic Skill Value Test action (#848)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("registers a human-triggered successValueTest intrinsic action", () => {
        const actions = SkillLogic.defineIntrinsicActions();
        const sv = actions.find((a) => a.executor === "successValueTest");
        expect(sv, "successValueTest action is registered").toBeTruthy();
        expect(sv?.subType).toBe("intrinsic");
        // A concrete title key and a menu group, like the other skill actions.
        expect(sv?.title).toBe("SOHL.Skill.Action.successValueTest");
        expect(sv?.group).toBeTruthy();
    });

    it("falls back to the skill's speaker when the dispatched context has none", async () => {
        // A menu/card dispatch can hand successValueTest a context without a
        // speaker; it must still build its sv-test context (not throw
        // "requires a speaker") by falling back to the owning logic's speaker.
        const skill = makeSkill();
        const spy = vi
            .spyOn(skill.masteryLevel, "successTest")
            .mockResolvedValue(undefined as any);
        await skill.masteryLevel.successValueTest({ scope: {} } as any);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0].speaker).toBeTruthy();
    });

    it("its executor delegates to masteryLevel.successValueTest with the same context", async () => {
        const skill = makeSkill();
        const spy = vi
            .spyOn(skill.masteryLevel, "successValueTest")
            .mockResolvedValue(undefined as any);
        const ctx = new SohlActionContext({
            type: "successValueTest",
            speaker: new SohlSpeaker({ alias: "GM" }),
            skipDialog: true,
            scope: {},
        });

        await skill.successValueTest(ctx);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(ctx);
    });
});
