/* SPDX-License-Identifier: GPL-3.0-or-later */
import { beforeEach, describe, expect, it, vi } from "vitest";
const port = vi.hoisted(() => ({
    user: "source-owner",
    actors: new Map<string, any>(),
    dialog: vi.fn(),
    card: vi.fn(),
    die: vi.fn(),
    mode: undefined as any,
    seq: 0,
}));
vi.mock("@src/core/FoundryHelpers", () => ({
    dialog: port.dialog,
    fvttCurrentUser: () => ({ id: port.user }),
    fvttResolveUuid: (id: string) => port.actors.get(id),
    fvttRandomId: () => `destination${++port.seq}`,
}));
vi.mock("@src/document/chat/action-card", () => ({ postActionCard: port.card }));
vi.mock("@src/entity/roll/SimpleRoll", () => ({
    SimpleRoll: class {
        roll() {
            return port.die();
        }
    },
}));
vi.mock("@src/entity/strikemode/StrikeModeBase", () => ({
    StrikeModeBase: { fromPointerData: () => port.mode },
}));
import {
    offerGrabTrial,
    beginGrabTrial,
    respondGrabTrial,
    releaseGrabTake,
    acceptGrabTake,
} from "@src/document/actor/logic/grab-actions";
function destinationDocument(data: any) {
    return {
        id: data._id,
        ...data,
        getFlag: (scope: string, key: string) => data.flags?.[scope]?.[key],
    };
}
function participant(id: string) {
    const records = new Map<string, any>();
    const items = new Map<string, any>();
    const parts = ["left", "right"].map((shortcode, index) => ({
        shortcode,
        index,
        name: shortcode,
        canHoldItem: true,
        heldItemId: null as string | null,
        immobilized: false,
        roles: ["hand"],
        side: shortcode,
    }));
    const actor: any = {
        uuid: `Actor.${id}`,
        id,
        type: "being",
        documentName: "Actor",
        name: id,
        isOwner: true,
        items,
        getFlag: (_: string, key: string) => records.get(key),
        setFlag: vi.fn(async (_: string, key: string, value: any) =>
            records.set(key, structuredClone(value)),
        ),
        deleteEmbeddedDocuments: vi.fn(async (_: string, ids: string[]) =>
            ids.forEach((id) => items.delete(id)),
        ),
        createEmbeddedDocuments: vi.fn(async (_: string, data: any[]) =>
            data.forEach((d) => items.set(d._id, destinationDocument(d))),
        ),
        updateEmbeddedDocuments: vi.fn(async (_: string, data: any[]) =>
            data.forEach((d) => (items.get(d._id).system.isCarried = d["system.isCarried"])),
        ),
    };
    // Foundry collections iterate documents rather than Map entries.
    (items as any)[Symbol.iterator] = function* () {
        yield* this.values();
    };
    const logic: any = {
        actor,
        speaker: {},
        dominantSide: "right",
        getItemLogic: () => ({ score: { effective: 12 } }),
        body: { structure: { parts, setPartFieldsUpdate: (changes: any[]) => changes } },
        data: {
            update: vi.fn(async (changes: any[]) =>
                changes.forEach((c) => Object.assign(parts[c.index]!, c.changes)),
            ),
        },
    };
    parts.forEach((p) => ((p as any).structure = logic.body.structure));
    actor.logic = logic;
    port.actors.set(actor.uuid, actor);
    return { actor, logic, records, items, parts };
}
let source: ReturnType<typeof participant>, target: ReturnType<typeof participant>;
const scope: any = { scope: { offerId: "trial", targetUuid: "Actor.target" } };
function offer(settled = false) {
    target.records.set("grabOffers.trial", {
        id: "trial",
        initiatorUuid: source.actor.uuid,
        initiatorUserId: "source-owner",
        targetUuid: target.actor.uuid,
        targetUserId: "target-owner",
        mode: {},
        targetPartCode: "left",
        availableTA: 0,
        status: settled ? "settled" : "offered",
        ...(settled ?
            {
                settled: {
                    targetPartCode: "left",
                    choice: { manoeuvre: "take" },
                    outcome: { initiatorWins: true },
                },
            }
        :   {}),
    });
}
function gear(id: string, containerId: string | null = null) {
    const data = { _id: id, name: id, type: "miscgear", system: { containerId, isCarried: true } };
    target.items.set(id, {
        id,
        name: id,
        system: data.system,
        toObject: () => structuredClone(data),
    });
}
beforeEach(() => {
    vi.clearAllMocks();
    port.actors.clear();
    port.seq = 0;
    port.user = "source-owner";
    source = participant("source");
    target = participant("target");
    port.dialog.mockResolvedValue({
        data: { manoeuvre: "take", firstHand: "right", targetPart: "left", impactTA: 0 },
    });
    port.die.mockReturnValue(4);
    port.mode = {
        isMelee: true,
        shortcode: "grab",
        traits: { strRoll: true },
        parent: { actor: source.actor, data: { impairedByRoles: ["hand"] } },
    };
});
describe("Grab offer struck-part resolution", () => {
    function exchange(aimBodyPartCode = "left", spread = 0) {
        return {
            attackerLandsBlow: true,
            attackResult: {
                token: { actor: source.actor },
                mode: port.mode,
                speaker: { userId: "source-owner" },
                aimBodyPartCode,
                spread,
            },
            defendResult: { token: { actor: target.actor } },
            tacticalAdvantages: { side: "attacker", count: 2 },
        } as any;
    }
    it("locks the actual scattered struck part before presenting choices", async () => {
        const aimZone = vi.fn(() => ({
            isMiss: false,
            location: { bodyPart: { shortcode: "right" } },
        }));
        target.logic.body.structure.aimZone = aimZone;
        target.logic.body.structure.maxZoneNumber = 10;
        (target.parts[0] as any).zone = { zoneNumbers: [3] };
        await offerGrabTrial(exchange("left", 4), {} as any);
        expect(aimZone).toHaveBeenCalledWith({ targetZoneNumber: 3, zoneDie: 4 });
        expect([...target.records.values()][0].targetPartCode).toBe("right");
        expect(source.actor.setFlag).not.toHaveBeenCalled();
    });
    it.each([
        ["left", 0, 3, 1],
        ["", 4, 1, 10],
    ])(
        "uses aimed or whole-body zone bounds (%s)",
        async (aim, spread, targetZoneNumber, zoneDie) => {
            target.logic.body.structure.aimZone = vi.fn(() => ({
                isMiss: false,
                location: { bodyPart: target.parts[0] },
            }));
            target.logic.body.structure.maxZoneNumber = 10;
            (target.parts[0] as any).zone = { zoneNumbers: [3] };
            await offerGrabTrial(exchange(aim as string, spread as number), {} as any);
            expect(target.logic.body.structure.aimZone).toHaveBeenCalledWith({
                targetZoneNumber,
                zoneDie,
            });
        },
    );
    it("a scatter miss creates no trial offer or card", async () => {
        target.logic.body.structure.aimZone = vi.fn(() => ({ isMiss: true }));
        (target.parts[0] as any).zone = { zoneNumbers: [3] };
        await offerGrabTrial(exchange(), {} as any);
        expect(target.actor.setFlag).not.toHaveBeenCalled();
        expect(port.card).not.toHaveBeenCalled();
    });
});
describe("participant-owned Grab trial documents", () => {
    it("an explicit Take weapon can commit the hand gripping its carrier without anatomical roles", async () => {
        offer();
        port.mode.shortcode = "disarm";
        port.mode.parent = {
            actor: source.actor,
            item: { id: "carrier" },
            data: { kind: "weapongear" },
        };
        port.mode.traits = { strRoll: true, take: true };
        source.parts[0]!.heldItemId = "other";
        source.parts[1]!.heldItemId = "carrier";
        const result = await beginGrabTrial(source.logic, scope);
        expect(result?.choice.partCodes).toEqual(["right"]);
        expect(result?.choice.manoeuvre).toBe("take");
        expect(source.actor.setFlag).toHaveBeenCalledTimes(1);
    });

    it("a mode with both Hold and Take commits Hold regardless of submitted choice", async () => {
        offer();
        port.mode.traits = { strRoll: true, take: true, hold: true };
        const result = await beginGrabTrial(source.logic, scope);
        expect(result?.choice.manoeuvre).toBe("hold");
    });

    it("reposts a committed winning effect card after chat failure without rerolling", async () => {
        offer();
        source.logic.getItemLogic = () => ({ score: { effective: 30 } });
        await beginGrabTrial(source.logic, scope);
        port.user = "target-owner";
        port.card.mockRejectedValueOnce(new Error("ChatMessage create failed"));
        await expect(respondGrabTrial(target.logic, scope)).rejects.toThrow(
            "ChatMessage create failed",
        );
        const committed = structuredClone(target.records.get("grabOffers.trial").settled);
        port.card.mockClear();
        port.dialog.mockClear();
        port.die.mockClear();
        const retried = await respondGrabTrial(target.logic, scope);
        expect(retried).toEqual(committed);
        expect(port.die).not.toHaveBeenCalled();
        expect(port.dialog).not.toHaveBeenCalled();
        expect(port.card).toHaveBeenCalledTimes(1);
        expect(port.card.mock.lastCall?.[1].buttons).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    action: "releaseGrabTake",
                    handlerUuid: target.actor.uuid,
                }),
            ]),
        );
    });
    it("rejects a changed canonical pending request after target confirmation", async () => {
        offer();
        await beginGrabTrial(source.logic, scope);
        port.user = "target-owner";
        port.die.mockClear();
        port.dialog.mockImplementationOnce(async () => {
            const pending = structuredClone(source.records.get("grabTrials.trial"));
            pending.choice.partCodes = ["different-hand"];
            source.records.set("grabTrials.trial", pending);
            return { data: {} };
        });
        await respondGrabTrial(target.logic, scope).catch(() => undefined);
        expect(port.die).not.toHaveBeenCalled();
        expect(target.actor.setFlag).not.toHaveBeenCalled();
        expect(target.records.get("grabOffers.trial").status).toBe("offered");
    });
    it("rejects an offer revoked while initiator chooses hands", async () => {
        offer();
        port.dialog.mockImplementationOnce(async () => {
            target.records.delete("grabOffers.trial");
            return {
                data: { manoeuvre: "take", firstHand: "right", targetPart: "left", impactTA: 0 },
            };
        });
        await beginGrabTrial(source.logic, scope).catch(() => undefined);
        expect(port.die).not.toHaveBeenCalled();
        expect(source.actor.setFlag).not.toHaveBeenCalled();
    });
    it.each([
        ["take", "hold"],
        ["hold", "take"],
    ])("a %s-only mode cannot initiate %s", async (allowed, forbidden) => {
        offer();
        port.mode.shortcode = allowed;
        port.mode.traits = { strRoll: true, [allowed]: true };
        port.dialog.mockResolvedValueOnce({
            data: { manoeuvre: forbidden, firstHand: "right", targetPart: "left", impactTA: 0 },
        });
        await beginGrabTrial(source.logic, scope).catch(() => undefined);
        expect(port.die).not.toHaveBeenCalled();
        expect(source.actor.setFlag).not.toHaveBeenCalled();
    });

    it.each([
        ["rarm", "", 0, [-2]],
        ["larm", "", 0, [-2, -3]],
        ["larm", "rarm", 2, [8]],
    ])(
        "commits selected-hand and explicitly spent TA math (%s/%s)",
        async (firstHand, secondHand, impactTA, values) => {
            offer();
            source.parts[0]!.shortcode = "larm";
            source.parts[1]!.shortcode = "rarm";
            target.records.get("grabOffers.trial").availableTA = 2;
            port.mode.traits.impTA = 4;
            port.dialog.mockResolvedValueOnce({
                data: { manoeuvre: "take", firstHand, secondHand, impactTA, targetPart: "left" },
            });
            const result = await beginGrabTrial(source.logic, scope);
            expect(result?.initiator.modifiers?.map((d) => d.value)).toEqual(values);
            expect(result?.choice.impactTacticalAdvantages).toBe(impactTA);
        },
    );

    it("initiator writes only its own committed roll and retries without rerolling", async () => {
        offer();
        await beginGrabTrial(source.logic, scope);
        await beginGrabTrial(source.logic, scope);
        expect(port.die).toHaveBeenCalledTimes(1);
        expect(source.actor.setFlag).toHaveBeenCalledTimes(1);
        expect(target.actor.setFlag).not.toHaveBeenCalled();
    });
    it.each(["unbound-owner", "target-owner"])(
        "rejects %s before any dialog, die or write",
        async (user) => {
            offer();
            port.user = user;
            await beginGrabTrial(source.logic, scope);
            expect(port.dialog).not.toHaveBeenCalled();
            expect(port.die).not.toHaveBeenCalled();
            expect(source.actor.setFlag).not.toHaveBeenCalled();
        },
    );
    it("rejects an unowned initiator and a wrong actor", async () => {
        offer();
        source.actor.isOwner = false;
        await beginGrabTrial(source.logic, scope);
        await beginGrabTrial(target.logic, scope);
        expect(port.dialog).not.toHaveBeenCalled();
    });
    it("rejects stale target identity and occupied selected hands", async () => {
        offer();
        await beginGrabTrial(source.logic, {
            scope: { offerId: "trial", targetUuid: "Actor.missing" },
        } as any);
        source.parts[1]!.heldItemId = "occupied";
        await expect(beginGrabTrial(source.logic, scope)).rejects.toThrow("usable free hands");
        expect(port.die).not.toHaveBeenCalled();
    });
    it("the addressed target settles a losing trial once and offers no effect", async () => {
        offer();
        await beginGrabTrial(source.logic, scope);
        port.user = "target-owner";
        target.logic.getItemLogic = () => ({ score: { effective: 99 } });
        const first = await respondGrabTrial(target.logic, scope);
        const second = await respondGrabTrial(target.logic, scope);
        expect(first?.outcome.initiatorWins).toBe(false);
        expect(second).toEqual(first);
        expect(port.die).toHaveBeenCalledTimes(2);
        expect(target.actor.setFlag).toHaveBeenCalledTimes(1);
        expect(source.actor.setFlag).toHaveBeenCalledTimes(1);
        expect(port.card.mock.lastCall?.[1].buttons).toBeUndefined();
    });
    it("rejects another controller answering even when both actors are owned", async () => {
        offer();
        await beginGrabTrial(source.logic, scope);
        port.dialog.mockClear();
        await respondGrabTrial(target.logic, scope);
        expect(port.dialog).not.toHaveBeenCalled();
        expect(target.actor.setFlag).not.toHaveBeenCalled();
    });
});
describe("Take escrow and inventory ownership", () => {
    it("refuses a fixed-ID collision before mutating inventory, body, or completion flags", async () => {
        offer(true);
        gear("sword");
        target.parts[0]!.heldItemId = "sword";
        port.user = "target-owner";
        await releaseGrabTake(target.logic, scope);
        const take = target.records.get("grabOffers.trial").take;
        source.items.set(take.rootId, {
            id: take.rootId,
            system: { isCarried: true },
            getFlag: () => ({ offerId: "another-transfer" }),
        });
        port.user = "source-owner";
        await expect(acceptGrabTake(source.logic, scope)).rejects.toThrow(
            "Take destination id belongs to another item",
        );
        expect(source.actor.createEmbeddedDocuments).not.toHaveBeenCalled();
        expect(source.actor.updateEmbeddedDocuments).not.toHaveBeenCalled();
        expect(source.logic.data.update).not.toHaveBeenCalled();
        expect(source.actor.setFlag).not.toHaveBeenCalled();
    });
    it.each([true, false])(
        "clears an immobilized retry grip and chooses available hand (%s)",
        async (hasFreeHand) => {
            offer(true);
            gear("sword");
            target.parts[0]!.heldItemId = "sword";
            port.user = "target-owner";
            await releaseGrabTake(target.logic, scope);
            const take = target.records.get("grabOffers.trial").take;
            source.items.set(take.rootId, destinationDocument(structuredClone(take.items[0])));
            source.items.get(take.rootId).system.isCarried = true;
            source.parts[0]!.heldItemId = take.rootId;
            source.parts[0]!.immobilized = true;
            if (!hasFreeHand) source.parts[1]!.heldItemId = "other";
            port.user = "source-owner";
            await acceptGrabTake(source.logic, scope);
            expect(source.parts[0]!.heldItemId).toBeNull();
            expect(source.parts[1]!.heldItemId).toBe(hasFreeHand ? take.rootId : "other");
            expect(source.items.get(take.rootId).system.isCarried).toBe(hasFreeHand);
            expect(source.actor.createEmbeddedDocuments).not.toHaveBeenCalled();
        },
    );

    it("moves a container subtree, releases both grips, and retries with fixed IDs", async () => {
        offer(true);
        gear("bag");
        gear("child", "bag");
        gear("grandchild", "child");
        target.parts.forEach((p) => (p.heldItemId = "bag"));
        port.user = "target-owner";
        await releaseGrabTake(target.logic, scope);
        await releaseGrabTake(target.logic, scope);
        expect(target.items.size).toBe(0);
        expect(target.parts.map((p) => p.heldItemId)).toEqual([null, null]);
        expect(source.actor.setFlag).not.toHaveBeenCalled();
        const escrow = target.records.get("grabOffers.trial").take;
        expect(escrow.items).toHaveLength(3);
        expect(escrow.items[1].system.containerId).toBe(escrow.rootId);
        port.user = "source-owner";
        await acceptGrabTake(source.logic, scope);
        await acceptGrabTake(source.logic, scope);
        expect(source.items.size).toBe(3);
        expect(source.actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        expect(source.actor.createEmbeddedDocuments.mock.calls[0]![2].keepId).toBe(true);
        expect(source.parts[0]!.heldItemId).toBe(escrow.rootId);
        expect(target.actor.setFlag).toHaveBeenCalledTimes(2);
    });
    it("empty struck hand cannot steal an item held elsewhere", async () => {
        offer(true);
        gear("sword");
        target.parts[1]!.heldItemId = "sword";
        port.user = "target-owner";
        await releaseGrabTake(target.logic, scope);
        expect(target.items.size).toBe(1);
        expect(port.dialog).not.toHaveBeenCalled();
    });
    it.each(["full", "immobilized"])(
        "a %s taker receives the item uncarried without an invalid grip",
        async (kind) => {
            offer(true);
            gear("sword");
            target.parts[0]!.heldItemId = "sword";
            port.user = "target-owner";
            await releaseGrabTake(target.logic, scope);
            source.parts.forEach((p) => {
                if (kind === "full") p.heldItemId = "occupied";
                else p.immobilized = true;
            });
            port.user = "source-owner";
            await acceptGrabTake(source.logic, scope);
            const done = source.records.get("grabTakeAccepted.trial");
            expect(done.held).toBe(false);
            expect(source.items.get(done.itemId).system.isCarried).toBe(false);
            expect(source.logic.data.update).not.toHaveBeenCalled();
        },
    );
    it("rejects release and acceptance by the other participant controller", async () => {
        offer(true);
        gear("sword");
        target.parts[0]!.heldItemId = "sword";
        await releaseGrabTake(target.logic, scope);
        expect(target.actor.deleteEmbeddedDocuments).not.toHaveBeenCalled();
        port.user = "target-owner";
        await releaseGrabTake(target.logic, scope);
        await acceptGrabTake(source.logic, scope);
        expect(source.actor.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it.each([false, true])(
        "checks all surviving originals before a partial-delete retry (replacement=%s)",
        async (replacement) => {
            offer(true);
            gear("bag");
            gear("child", "bag");
            target.parts[0]!.heldItemId = "bag";
            port.user = "target-owner";
            target.actor.deleteEmbeddedDocuments.mockImplementationOnce(async () => {
                target.items.delete("bag");
                throw new Error("interrupted delete");
            });
            await expect(releaseGrabTake(target.logic, scope)).rejects.toThrow(
                "interrupted delete",
            );
            expect(target.records.get("grabOffers.trial").take.status).toBe("prepared");
            target.logic.data.update.mockClear();
            target.actor.deleteEmbeddedDocuments.mockClear();
            if (replacement) {
                gear("bag");
                target.items.get("bag").system.containerId = "unrelated";
                target.parts[1]!.heldItemId = "bag";
                await expect(releaseGrabTake(target.logic, scope)).rejects.toThrow(
                    "changed or was replaced",
                );
                expect(target.logic.data.update).not.toHaveBeenCalled();
                expect(target.actor.deleteEmbeddedDocuments).not.toHaveBeenCalled();
                expect(target.parts[1]!.heldItemId).toBe("bag");
                expect(target.items.size).toBe(2);
            } else {
                await releaseGrabTake(target.logic, scope);
                expect(target.actor.deleteEmbeddedDocuments).toHaveBeenCalledWith("Item", [
                    "child",
                ]);
                expect(target.items.size).toBe(0);
                expect(target.records.get("grabOffers.trial").take.status).toBe("released");
            }
        },
    );
    it("resumes a partial destination create with the same IDs", async () => {
        offer(true);
        gear("bag");
        gear("child", "bag");
        target.parts[0]!.heldItemId = "bag";
        port.user = "target-owner";
        await releaseGrabTake(target.logic, scope);
        const take = target.records.get("grabOffers.trial").take;
        port.user = "source-owner";
        source.actor.createEmbeddedDocuments.mockImplementationOnce(
            async (_: string, data: any[]) => {
                source.items.set(data[0]._id, destinationDocument(data[0]));
                throw new Error("interrupted create");
            },
        );
        await expect(acceptGrabTake(source.logic, scope)).rejects.toThrow("interrupted create");
        await acceptGrabTake(source.logic, scope);
        expect(source.items.size).toBe(2);
        expect(
            source.actor.createEmbeddedDocuments.mock.calls[1]![1].map((d: any) => d._id),
        ).toEqual([take.items[1]._id]);
    });
    it("revalidates the target grip after the release confirmation", async () => {
        offer(true);
        gear("sword");
        target.parts[0]!.heldItemId = "sword";
        port.user = "target-owner";
        port.dialog.mockImplementationOnce(async () => {
            target.parts[0]!.heldItemId = null;
            return { data: {} };
        });
        await releaseGrabTake(target.logic, scope);
        expect(target.actor.deleteEmbeddedDocuments).not.toHaveBeenCalled();
        expect(target.actor.setFlag).not.toHaveBeenCalled();
    });
});
