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
import { offerGrabTrial, activateGrabTrial } from "@src/document/actor/logic/grab-actions";

function participant(id: string, owner: boolean) {
    const records = new Map<string, any>();
    const actor: any = {
        uuid: `Actor.${id}`,
        documentName: "Actor",
        type: "being",
        name: id,
        isOwner: owner,
        getFlag: (_scope: string, key: string) => records.get(key),
        setFlag: vi.fn(async (_scope: string, key: string, value: any) =>
            records.set(key, structuredClone(value)),
        ),
    };
    const part = { shortcode: "arm", zone: { zoneNumbers: [1] } };
    actor.logic = {
        actor,
        speaker: {},
        body: {
            structure: {
                parts: [part],
                maxZoneNumber: 10,
                aimZone: vi.fn(() => ({ isMiss: false, location: { bodyPart: part } })),
                getLocationByCode: vi.fn(() => ({ bodyPart: part })),
            },
        },
    };
    port.actors.set(actor.uuid, actor);
    return { actor, records, part };
}

beforeEach(() => {
    port.actors.clear();
    port.seq = 0;
    port.user = "source-owner";
    port.card.mockReset();
    port.mode = undefined;
});

describe("Grab offer exchange routing", () => {
    it("uses the already resolved blocking limb without drawing another location", async () => {
        const source = participant("source", false),
            target = participant("target", true);
        const mode: any = {
            isMelee: true,
            shortcode: "grab",
            traits: { strRoll: true },
            pointerData: {},
        };
        await offerGrabTrial(
            {
                attackerLandsBlow: true,
                limbBlockStrikesLimb: true,
                blockingLimbLocationCode: "blockingarm",
                attackResult: {
                    token: { actor: source.actor },
                    mode,
                    aimBodyPartCode: "obsolete",
                    speaker: { userId: "source-owner" },
                    spread: 4,
                },
                defendResult: { token: { actor: target.actor } },
                tacticalAdvantages: { side: "attacker", count: 0 },
            } as any,
            {} as any,
        );
        expect(target.actor.logic.body.structure.getLocationByCode).toHaveBeenCalledWith(
            "blockingarm",
        );
        expect(target.actor.logic.body.structure.aimZone).not.toHaveBeenCalled();
        expect([...target.records.values()][0].targetPartCode).toBe("arm");
    });
    it("defers a winning counterstrike to the affected owner without writing their actor", async () => {
        const source = participant("source", true),
            target = participant("target", true);
        const mode: any = {
            isMelee: true,
            shortcode: "grab",
            traits: { strRoll: true },
            pointerData: {},
            parent: { actor: source.actor },
        };
        port.mode = mode;
        await offerGrabTrial(
            {
                attackerLandsBlow: false,
                targetWins: true,
                defenderLandsBlow: true,
                attackResult: {
                    token: { actor: target.actor },
                    speaker: { userId: "target-owner" },
                },
                defendResult: {
                    token: { actor: source.actor },
                    mode,
                    aimBodyPartCode: "",
                    speaker: { userId: "source-owner" },
                    spread: 4,
                },
                tacticalAdvantages: { side: "defender", count: 2 },
            } as any,
            {} as any,
        );
        expect(target.actor.setFlag).not.toHaveBeenCalled();
        const activation = [...source.records.values()][0];
        expect(activation.availableTA).toBe(2);
        expect(activation.initiatorUuid).toBe(source.actor.uuid);
        const button = port.card.mock.calls[0][1].buttons[0];
        expect(button.action).toBe("activateGrabTrial");
        expect(button.handlerUuid).toBe(target.actor.uuid);
        await activateGrabTrial(target.actor.logic, { scope: button.scope } as any);
        expect(target.actor.setFlag).not.toHaveBeenCalled();
        target.actor.isOwner = true;
        // Elevated ownership does not grant the initiating controller consent.
        await activateGrabTrial(target.actor.logic, { scope: button.scope } as any);
        expect(target.actor.setFlag).not.toHaveBeenCalled();
        port.user = "target-owner";
        await activateGrabTrial(target.actor.logic, { scope: button.scope } as any);
        const offer = [...target.records.values()][0];
        expect(offer.targetUserId).toBe("target-owner");
        expect(offer.initiatorUserId).toBe("source-owner");
        expect(offer.targetPartCode).toBe("arm");
        await activateGrabTrial(target.actor.logic, { scope: button.scope } as any);
        expect(target.actor.setFlag).toHaveBeenCalledTimes(1);
        expect(port.card.mock.calls.at(-1)![1].buttons[0].handlerUuid).toBe(source.actor.uuid);
    });
});
