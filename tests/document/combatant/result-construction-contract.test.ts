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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Helpers from "@src/core/FoundryHelpers";
import { buildAttackResult } from "@src/document/combatant/logic/SohlCombatantLogic";
import { AttackResult } from "@src/entity/result/AttackResult";
import { DefendResult } from "@src/entity/result/DefendResult";
import { CombatResult } from "@src/entity/result/CombatResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { makeCombatantLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { TEST_TYPE, ITEM_KIND } from "@src/utils/constants";

const resolved = new Map<string, any>();
beforeEach(() =>
    vi.spyOn(Helpers, "fvttLogicFromUuidSync").mockImplementation((uuid) => resolved.get(uuid)),
);
afterEach(() => {
    resolved.clear();
    vi.restoreAllMocks();
});
function fixture(id: string) {
    const actor = makeMockActor({ id });
    const speaker = new SohlSpeaker({ user: `${id}-owner` });
    actor.getSpeaker.mockReturnValue(speaker);
    const parent = makeCombatantLogic({ actor });
    parent.data.uuid = `Combatant.${id}`;
    const token: any = {
        uuid: `Scene.arena.Token.${id}`,
        actor,
        actorLogic: actor.logic,
        name: id,
    };
    resolved.set(parent.uuid, parent);
    resolved.set(token.uuid, token);
    const mode: any = Object.create(MeleeStrikeMode.prototype);
    const pointer = { itemUuid: `Actor.${id}.Item.weapon`, smId: "cut" };
    Object.assign(mode, {
        type: "melee",
        shortcode: "cut",
        traits: {},
        name: "Cut",
        attack: new MasteryLevelModifier(parent).setBase(50),
        defense: {
            block: new MasteryLevelModifier(parent).setBase(50),
            counterstrike: new MasteryLevelModifier(parent).setBase(50),
        },
    });
    Object.defineProperty(mode, "pointerData", { value: pointer });
    resolved.set(pointer.itemUuid, { kind: ITEM_KIND.WEAPONGEAR, strikeModes: [mode] });
    const impact = new ImpactModifier(
        { roll: { numDice: 1, dieFaces: 6 }, aspect: "edged" } as any,
        { parent },
    ).setBase(2);
    const roll = new SimpleRoll({ numDice: 1, dieFaces: 100 }, { parent }).setRolls([25]);
    const attack = () =>
        new AttackResult(
            {
                mode: pointer,
                combatantUuid: parent.uuid,
                tokenUuid: token.uuid,
                masteryLevelModifier: mode.attack,
                impact,
                roll,
                testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            } as any,
            { parent, chatSpeaker: speaker },
        );
    return { actor, parent, token, mode, pointer, impact, roll, speaker, attack };
}
describe("actual result constructors at automated combat boundaries", () => {
    it("builds an actual AttackResult with live mode/combatant/token and the bound speaker", () => {
        const f = fixture("attacker");
        const result = buildAttackResult({
            attackML: f.mode.attack,
            impact: f.impact,
            parent: f.parent,
            mode: f.pointer,
            tokenLogic: f.token,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            roll: f.roll,
            aimBodyPartCode: "leftarm",
            spread: 4,
        } as any);
        expect(result).toBeInstanceOf(AttackResult);
        expect(result.combatant).toBe(f.parent);
        expect(result.mode).toBe(f.mode);
        expect(result.token).toBe(f.token);
        expect(result.speaker).toBe(f.speaker);
        expect(result.toJSON()).toMatchObject({
            combatantUuid: f.parent.uuid,
            tokenUuid: f.token.uuid,
            mode: f.pointer,
        });
        expect(result.aimBodyPartCode).toBe("leftarm");
        expect(result.spread).toBe(4);
    });
    it("resumes a counterstrike from the canonical attacker without a target or speaker token", async () => {
        const source = fixture("attacker"),
            target = fixture("defender");
        Object.defineProperty(source.parent, "tokenLogic", { value: source.token });
        Object.defineProperty(target.parent, "tokenLogic", { value: target.token });
        source.actor.logic.body = { structure: { parts: [{ shortcode: "torso", locations: [] }] } };
        target.actor.logic.getUsableStrikeModes = () => [target.mode];
        Object.defineProperty(target.mode, "parent", { value: target.parent });
        Object.assign(target.mode, {
            impact: target.impact,
            spread: { effective: 0 },
            reach: { effective: 5 },
        });
        vi.spyOn(Helpers, "fvttRangeToTarget").mockReturnValue(0);
        vi.spyOn(CombatResult.prototype, "evaluate").mockResolvedValue(undefined as any);
        const composite = (await target.parent.automatedCounterstrikeResume({
            scope: { attackResult: source.attack() },
            speaker: target.speaker,
            skipDialog: true,
            noChat: true,
        } as any)) as unknown as CombatResult;
        expect(composite).toBeInstanceOf(CombatResult);
        expect(composite.defendResult).toBeInstanceOf(AttackResult);
        expect(composite.defendResult.testType).toBe(TEST_TYPE.COUNTERSTRIKE.id);
    });
    it.each(["automatedBlockResume", "automatedDodgeResume", "automatedIgnoreResume"])(
        "%s constructs a real defender result with the answering controller",
        async (method) => {
            const source = fixture("attacker"),
                target = fixture("defender");
            Object.defineProperty(target.parent, "tokenLogic", { value: target.token });
            const attack = source.attack();
            const dodge = new MasteryLevelModifier(target.parent).setBase(40);
            vi.spyOn(target.actor.logic, "getItemLogic").mockImplementation((...args: unknown[]) =>
                args[0] === "dge" ? ({ masteryLevel: dodge } as any) : undefined,
            );
            Object.defineProperty(target.actor.logic, "allLogics", {
                configurable: true,
                value: [
                    {
                        kind: "weapongear",
                        strikeModes: [target.mode],
                        data: { kind: "weapongear" },
                    },
                ],
            });
            // Preserve the actual CombatResult/DefendResult constructors; this check
            // targets the boundary data, not already-tested combat arithmetic.
            vi.spyOn(CombatResult.prototype, "evaluate").mockResolvedValue(undefined as any);
            const composite = await target.parent[method]({
                scope: { attackResult: attack },
                speaker: target.speaker,
                token: undefined,
                skipDialog: true,
                noChat: true,
            });
            expect(composite.defendResult).toBeInstanceOf(DefendResult);
            expect(composite.defendResult.combatant).toBe(target.parent);
            expect(composite.defendResult.token).toBe(target.token);
            expect(composite.defendResult.speaker).toBe(target.speaker);
            expect(composite.defendResult.toJSON()).toMatchObject({
                combatantUuid: target.parent.uuid,
                tokenUuid: target.token.uuid,
            });
        },
    );
});
