/* SPDX-License-Identifier: GPL-3.0-or-later */
import { afterEach, describe, expect, it, vi } from "vitest";
import * as Helpers from "@src/core/FoundryHelpers";
import { makeCombatantLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { buildCombatCardData } from "@src/document/combatant/logic/SohlCombatantLogic";
import { TEST_TYPE } from "@src/utils/constants";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { buildActionScope, defaultToJSON } from "@src/utils/helpers";
import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
afterEach(() => vi.restoreAllMocks());
function fixture() {
    const actor = makeMockActor({ id: "source" });
    const speaker = new SohlSpeaker({ user: "source-owner" });
    actor.getSpeaker.mockReturnValue(speaker);
    const logic = makeCombatantLogic({ actor });
    logic.data.uuid = "Combatant.source";
    const pointer = { itemUuid: "Actor.source.Item.weapon", smId: "cut" };
    const mode = {
        shortcode: "cut",
        pointerData: pointer,
        parent: { actor },
        traits: {},
        impact: { aspectType: "blunt" },
        fullLabel: "Sword Cut",
    };
    const target = {
        kind: "token",
        uuid: "Scene.arena.Token.target",
        name: "Target",
        actor: { uuid: "Actor.target" },
        actorLogic: { uuid: "Actor.target" },
    };
    vi.spyOn(Helpers, "fvttLogicFromUuidSync").mockImplementation((uuid) =>
        uuid === pointer.itemUuid ?
            ({ kind: "weapongear", strikeModes: [mode] } as any)
        :   (target as any),
    );
    vi.spyOn(Helpers, "fvttCurrentUser").mockReturnValue({ id: "source-owner" } as any);
    const dialog = vi.spyOn(Helpers, "dialog").mockResolvedValue({ data: { spent: 2 } });
    const chat = vi.spyOn(speaker, "toChat").mockResolvedValue(undefined);
    const impact = new ImpactResult(
        {
            speaker,
            impactModifier: new ImpactModifier(
                { baseValue: 2, aspect: "blunt", roll: { numDice: 1, dieFaces: 6 } } as any,
                { parent: logic },
            ),
            roll: new SimpleRoll(
                { numDice: 1, dieFaces: 6, modifier: 2, rolls: [4] },
                { parent: logic },
            ),
        },
        { parent: logic },
    );
    const context: any = {
        speaker,
        scope: {
            sourceCombatantUuid: logic.uuid,
            mode: pointer,
            impactResult: impact,
            targetTokenUuid: target.uuid,
            available: 2,
            injuryScope: { targetZoneNumber: 3, zoneDie: 1, bodyLocationCode: "arm" },
        },
    };
    return { actor, logic, speaker, impact, context, dialog, chat, mode, target };
}
describe("source-controlled optional Impact TA choice", () => {
    it.each(["attacker", "counterstrike"])(
        "addresses the optional %s choice to its landing source combatant",
        (route) => {
            const f = fixture();
            const side = {
                label: "Attack",
                token: f.target,
                combatant: f.logic,
                mode: f.mode,
                masteryLevelModifier: { constrainedEffective: 50, deltas: [] },
                roll: { total: 25 },
                normSuccessLevel: 1,
                isSuccess: true,
                mishaps: new Set(),
                testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            };
            const exchange = {
                attackResult: side,
                defendResult: { ...side, testType: TEST_TYPE.DODGE.id },
                attackerImpact: f.impact,
                tacticalAdvantages: { side: "attacker", count: 2 },
                margin: 1,
                attackerLandsBlow: true,
                defenderLandsBlow: false,
                blockingLimbLocationCode: "arm",
            };
            if (route === "counterstrike") {
                exchange.defendResult.testType = TEST_TYPE.COUNTERSTRIKE.id;
                exchange.defendResult.combatant = {
                    uuid: "Combatant.counter",
                    name: "Counter",
                    actorLogic: { id: "counter" },
                } as any;
                exchange.tacticalAdvantages.side = "defender";
                Object.assign(exchange, { cxImpact: f.impact });
            }
            const cards = buildCombatCardData(exchange as any);
            const card = route === "attacker" ? cards.atkCardData : cards.cxCardData!;
            expect(card.impactTAHandlerUuid).toBe(
                route === "attacker" ? f.logic.uuid : "Combatant.counter",
            );
            expect(card.impactTAScope).toMatchObject({
                sourceCombatantUuid: route === "attacker" ? f.logic.uuid : "Combatant.counter",
                available: 2,
                targetTokenUuid: f.target.uuid,
            });
        },
    );
    it("posts adjusted damage and target-owned injury with unchanged dice/location", async () => {
        const f = fixture();
        const result = await (f.logic as any).spendImpactTAs(f.context);
        expect(result.impact).toBe(12);
        expect(result.handlerUuid).toBe("Actor.target");
        expect(result.scopeData).toMatchObject({
            impact: 12,
            targetZoneNumber: 3,
            zoneDie: 1,
            bodyLocationCode: "arm",
        });
        expect(f.impact.total).toBe(6);
        expect(f.dialog.mock.calls[0]![0]!.data).toMatchObject({ spent: 0, value: 3 });
        expect(f.chat).toHaveBeenCalledOnce();
    });
    it.each(["controller", "ownership", "participant"])(
        "refuses incorrect %s before dialog or chat",
        async (reason) => {
            const f = fixture();
            if (reason === "controller")
                vi.mocked(Helpers.fvttCurrentUser).mockReturnValue({ id: "other-owner" } as any);
            if (reason === "ownership") f.actor.isOwner = false;
            if (reason === "participant") f.context.scope.sourceCombatantUuid = "Combatant.other";
            await (f.logic as any).spendImpactTAs(f.context);
            expect(f.dialog).not.toHaveBeenCalled();
            expect(f.chat).not.toHaveBeenCalled();
        },
    );
    it.each([-1, 1.5, "bad"])("refuses invalid chosen count %s without posting", async (spent) => {
        const f = fixture();
        f.dialog.mockResolvedValue({ data: { spent } });
        await (f.logic as any).spendImpactTAs(f.context);
        expect(f.chat).not.toHaveBeenCalled();
    });
    it("accepts zero and does not cap referee-granted advantages to the calculated award", async () => {
        const f = fixture();
        f.dialog.mockResolvedValueOnce({ data: { spent: 0 } });
        expect((await (f.logic as any).spendImpactTAs(f.context)).impact).toBe(6);
        f.dialog.mockResolvedValueOnce({ data: { spent: 4 } });
        expect((await (f.logic as any).spendImpactTAs(f.context)).impact).toBe(18);
    });
    it("rechecks the controller after the dialog", async () => {
        const f = fixture();
        f.dialog.mockImplementation(async () => {
            vi.mocked(Helpers.fvttCurrentUser).mockReturnValue({ id: "other-owner" } as any);
            return { data: { spent: 2 } };
        });
        await (f.logic as any).spendImpactTAs(f.context);
        expect(f.chat).not.toHaveBeenCalled();
    });
    it("cancellation preserves the original and posts nothing", async () => {
        const f = fixture();
        f.dialog.mockResolvedValue(null);
        await (f.logic as any).spendImpactTAs(f.context);
        expect(f.chat).not.toHaveBeenCalled();
        expect(f.impact.total).toBe(6);
    });
    it("revives a real serialized card under its source actor then dispatches recorded damage without drawing dice", async () => {
        const f = fixture();
        SimpleRoll.forceValues(6);
        const dataset = {
            action: "spendImpactTAs",
            scope: JSON.stringify(defaultToJSON(f.context.scope)),
        };
        const scope = buildActionScope(dataset, f.logic.actorLogic) as any;
        expect(scope.impactResult).toBeInstanceOf(ImpactResult);
        expect(scope.impactResult.parent.uuid).toBe("Actor.source");
        expect(scope.impactResult.total).toBe(6);
        await dispatchChatCardAction(f.logic, { dataset, textContent: "Spend Impact TAs" } as any);
        expect(f.dialog).toHaveBeenCalledOnce();
        expect(f.chat).toHaveBeenCalledOnce();
        expect(f.chat.mock.calls[0]![1]).toMatchObject({
            impact: 12,
            handlerUuid: "Actor.target",
            scopeData: { bodyLocationCode: "arm" },
        });
        expect(f.impact.parent.uuid).toBe("Combatant.source");
        expect(f.impact.total).toBe(6);
        expect(SimpleRoll.forcedRemaining).toBe(1);
    });
    it("refuses a serialized impact revived under a foreign actor", async () => {
        const f = fixture();
        const foreign = makeMockActor({ id: "foreign" });
        const scope = buildActionScope(
            { scope: JSON.stringify(defaultToJSON(f.context.scope)) },
            foreign.logic,
        );
        await f.logic.spendImpactTAs({ ...f.context, scope });
        expect(f.dialog).not.toHaveBeenCalled();
        expect(f.chat).not.toHaveBeenCalled();
    });
});
