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
import { offerEnveloped, applyEnveloped } from "@src/document/actor/logic/envelop-actions";
function participant(id: string, owner = true) {
    const records = new Map<string, any>(),
        items: any = new Map();
    items.find = (predicate: any) => [...items.values()].find(predicate);
    const actor: any = {
        uuid: `Actor.${id}`,
        documentName: "Actor",
        type: "being",
        name: id,
        isOwner: owner,
        items,
        getFlag: (_scope: string, key: string) => records.get(key),
        setFlag: vi.fn(async (_scope: string, key: string, value: any) =>
            records.set(key, structuredClone(value)),
        ),
        createEmbeddedDocuments: vi.fn(async (_kind: string, data: any[]) => {
            for (const d of data)
                items.set(d._id, {
                    id: d._id,
                    type: d.type,
                    system: d.system,
                    getFlag: (_s: string, k: string) => d.flags?.sohl?.[k],
                });
        }),
    };
    actor.logic = { actor, speaker: {} };
    port.actors.set(actor.uuid, actor);
    return { actor, records, items };
}
beforeEach(() => {
    port.actors.clear();
    port.seq = 0;
    port.card.mockReset();
    port.dialog.mockReset();
    port.user = "target-owner";
});
describe("owner-controlled Enveloped condition", () => {
    it("offers no automatic penalty/trauma, then applies once after target confirmation", async () => {
        const source = participant("source", false),
            target = participant("target");
        await offerEnveloped(
            {
                attackerLandsBlow: true,
                attackResult: {
                    token: { actor: source.actor },
                    mode: { traits: { envelop: true } },
                    speaker: { userId: "source-owner" },
                },
                defendResult: {
                    token: { actor: target.actor },
                    speaker: { userId: "target-owner" },
                },
            } as any,
            {} as any,
        );
        expect(target.actor.createEmbeddedDocuments).not.toHaveBeenCalled();
        expect(source.actor.setFlag).not.toHaveBeenCalled();
        const scope = port.card.mock.calls[0][1].buttons[0].scope;
        port.dialog.mockResolvedValueOnce(null);
        await applyEnveloped(target.actor.logic, { scope } as any);
        expect(target.actor.createEmbeddedDocuments).not.toHaveBeenCalled();
        port.dialog.mockResolvedValueOnce({ data: {} });
        await applyEnveloped(target.actor.logic, { scope } as any);
        expect(target.actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        const trauma = [...target.items.values()][0] as any;
        expect(trauma.system).toEqual({ shortcode: "enveloped", subType: "physcond" });
        expect(trauma.system).not.toHaveProperty("scheduledActions");
        await applyEnveloped(target.actor.logic, { scope } as any);
        expect(target.actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    });
    it("keeps GM ownership separate from the counterstruck player's controller", async () => {
        const source = participant("source"),
            target = participant("target");
        port.user = "GM";
        await offerEnveloped(
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
                    mode: { traits: { envelop: true } },
                    speaker: { userId: "GM" },
                },
            } as any,
            {} as any,
        );
        expect(target.actor.setFlag).not.toHaveBeenCalled();
        const scope = port.card.mock.calls[0][1].buttons[0].scope;
        port.dialog.mockResolvedValue({ data: {} });
        await applyEnveloped(target.actor.logic, { scope } as any);
        expect(port.dialog).not.toHaveBeenCalled();
        port.user = "target-owner";
        await applyEnveloped(target.actor.logic, { scope } as any);
        expect(target.actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    });
    it("does not offer Enveloped for an unsuccessful attack", async () => {
        await offerEnveloped(
            {
                attackerLandsBlow: false,
                attackResult: { mode: { traits: { envelop: true } } },
            } as any,
            {} as any,
        );
        expect(port.card).not.toHaveBeenCalled();
    });
    it("also offers the condition for a landed counterstrike that loses the comparison", async () => {
        const source = participant("source"),
            target = participant("target");
        port.user = "source-owner";
        await offerEnveloped(
            {
                attackerLandsBlow: true,
                targetWins: false,
                defenderLandsBlow: true,
                attackResult: {
                    token: { actor: target.actor },
                    mode: { traits: {} },
                    speaker: { userId: "target-owner" },
                },
                defendResult: {
                    token: { actor: source.actor },
                    mode: { traits: { envelop: true } },
                    speaker: { userId: "source-owner" },
                },
            } as any,
            {} as any,
        );
        expect(port.card).toHaveBeenCalledTimes(1);
        expect(port.card.mock.calls[0][1].buttons[0].handlerUuid).toBe(target.actor.uuid);
        expect(target.actor.setFlag).not.toHaveBeenCalled();
    });
});
