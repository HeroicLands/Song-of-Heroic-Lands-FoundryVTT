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

import { describe, it, expect } from "vitest";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { IMMOBILIZED_CODE } from "@src/entity/body/impairment";
import { ACTOR_KIND, ITEM_KIND, TRAUMA_SUBTYPE } from "@src/utils/constants";
import { makeActorLogic, makeBodyData, makeItemLogic } from "@tests/mocks/logicHarness";
import { partData, zoneData, locationData } from "@tests/mocks/bodyFixture";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
function heldBeing() {
    const being = makeActorLogic(BeingLogic, ACTOR_KIND.BEING, {
        body: makeBodyData({
            structure: {
                zones: [zoneData("zone", 4)],
                parts: [
                    partData("arm", "zone", 20, {
                        canHoldItem: true,
                        heldItemId: "sword",
                        roles: ["manipulator"],
                    }),
                ],
                locations: [locationData("hand", "arm", 5)],
            },
        }),
    });
    being.initialize();
    const trauma = makeItemLogic(
        TraumaLogic,
        ITEM_KIND.TRAUMA,
        {
            subType: TRAUMA_SUBTYPE.PHYSICAL_CONDITION,
            category: "impediment",
            bodyLocationCode: "hand",
        },
        { actor: being.actor, shortcode: IMMOBILIZED_CODE },
    );
    trauma.initialize();
    return being;
}
describe("Hold role restriction without disarming", () => {
    it("the actual Immobilized Trauma removes its role while preserving grip", () => {
        const being = heldBeing();
        const part = being.body.structure.parts[0]!;
        expect(being.unusableRoles().has("manipulator")).toBe(true);
        expect(part.immobilized).toBe(true);
        expect(part.isUnusable).toBe(false);
        expect(part.canHoldItem).toBe(true);
        expect(part.heldItemId).toBe("sword");
        part.immobilized = false;
        expect(being.unusableRoles().has("manipulator")).toBe(false);
        expect(part.heldItemId).toBe("sword");
    });
    it("a role-gated test actually returns Critical Failure while the limb remains gripping", async () => {
        const being = heldBeing();
        const skill = makeItemLogic(SkillLogic, ITEM_KIND.SKILL, {
            skillBaseFormula: "",
            masteryLevelBase: 50,
            impairedByRoles: ["manipulator"],
        });
        Object.defineProperty(skill, "actorLogic", { get: () => being, configurable: true });
        const mastery = new MasteryLevelModifier({ baseValue: 50 }, { parent: skill });
        const speaker = new SohlSpeaker({ alias: "owner" });
        Object.defineProperty(speaker, "isOwner", { get: () => true });
        const result = (await mastery.successTest(
            new SohlActionContext({ speaker, skipDialog: true }),
        )) as SuccessTestResult;
        expect(result.isCritical).toBe(true);
        expect(result.isSuccess).toBe(false);
        expect(being.body.structure.parts[0]!.canHoldItem).toBe(true);
        expect(being.body.structure.parts[0]!.heldItemId).toBe("sword");
    });
});
