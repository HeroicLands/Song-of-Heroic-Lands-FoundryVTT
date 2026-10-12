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

import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
    user: "target-owner",
    actors: new Map<string, any>(),
    dialog: vi.fn(),
    card: vi.fn(),
    die: vi.fn(),
    combat: undefined as any,
    seq: 0,
}));
vi.mock("@src/core/FoundryHelpers", () => ({
    dialog: mock.dialog,
    fvttCurrentUser: () => ({ id: mock.user }),
    fvttResolveUuid: (id: string) => mock.actors.get(id),
    fvttRandomId: () => `trauma${++mock.seq}`,
    getActiveCombat: () => mock.combat,
}));
vi.mock("@src/document/chat/action-card", () => ({ postActionCard: mock.card }));
vi.mock("@src/entity/roll/SimpleRoll", () => ({
    SimpleRoll: class {
        roll() {
            return mock.die();
        }
    },
}));
vi.mock("@src/entity/strikemode/StrikeModeBase", () => ({
    StrikeModeBase: {
        fromPointerData: () => ({
            shortcode: "grab",
            parent: { actor: mock.actors.get("Actor.source"), data: {} },
        }),
    },
}));
import {
    applyGrabHold,
    beginMaintainGrabHold,
    answerMaintainGrabHold,
    releaseGrabHold,
    reconcileGrabHolds,
} from "@src/document/actor/logic/grab-hold";
function participant(id: string) {
    const records = new Map<string, any>(),
        items = new Map<string, any>();
    const parts = [
        {
            shortcode: "arm",
            canHoldItem: true,
            heldItemId: null as string | null,
            immobilized: false,
            locations: [{ shortcode: "hand" }],
        },
    ];
    const actor: any = {
        uuid: `Actor.${id}`,
        type: "being",
        documentName: "Actor",
        name: id,
        isOwner: true,
        items,
        getFlag: (_: string, key: string) =>
            key === "grabOffers" ?
                Object.fromEntries(
                    [...records]
                        .filter(([key]) => key.startsWith("grabOffers."))
                        .map(([key, value]) => [key.slice(11), value]),
                )
            :   records.get(key),
        setFlag: vi.fn(async (_: string, key: string, value: any) =>
            records.set(key, structuredClone(value)),
        ),
        createEmbeddedDocuments: vi.fn(async (_: string, data: any[]) =>
            data.forEach((d) =>
                items.set(d._id, {
                    ...d,
                    getFlag: (scope: string, key: string) => d.flags?.[scope]?.[key],
                }),
            ),
        ),
        deleteEmbeddedDocuments: vi.fn(async (_: string, ids: string[]) =>
            ids.forEach((id) => items.delete(id)),
        ),
    };
    const logic: any = {
        actor,
        speaker: {},
        body: { structure: { parts } },
        getItemLogic: () => ({ score: { effective: 12 } }),
    };
    actor.logic = logic;
    mock.actors.set(actor.uuid, actor);
    return { actor, logic, parts, records, items };
}
let source: ReturnType<typeof participant>, target: ReturnType<typeof participant>;
const context: any = { scope: { offerId: "trial", targetUuid: "Actor.target" } };
const offer = () => target.records.get("grabOffers.trial");
beforeEach(() => {
    vi.clearAllMocks();
    mock.actors.clear();
    mock.user = "target-owner";
    mock.seq = 0;
    source = participant("source");
    target = participant("target");
    target.parts[0]!.heldItemId = "sword";
    target.items.set("sword", { system: { isCarried: true } });
    target.records.set("grabOffers.trial", {
        id: "trial",
        initiatorUuid: source.actor.uuid,
        initiatorUserId: "source-owner",
        targetUuid: target.actor.uuid,
        targetUserId: "target-owner",
        status: "settled",
        settled: {
            choice: { manoeuvre: "hold", partCodes: ["arm"] },
            targetPartCode: "arm",
            initiator: { modifiers: [] },
            outcome: { initiatorWins: true },
        },
    });
    mock.dialog.mockResolvedValue({ data: {} });
    mock.die.mockReturnValue(4);
    mock.combat = {
        uuid: "Combat.one",
        round: 2,
        turn: 1,
        combatant: { actor: source.actor },
        turns: [{ actor: target.actor }, { actor: source.actor }],
    };
});
async function activeHold() {
    await applyGrabHold(target.logic, context);
}
async function maintenance() {
    await activeHold();
    mock.user = "source-owner";
    await beginMaintainGrabHold(source.logic, context);
    mock.user = "target-owner";
}
describe("owner-controlled Hold documents", () => {
    it("creates one marked condition and preserves grip and carried gear on retries", async () => {
        await activeHold();
        await activeHold();
        expect(target.actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        const trauma = target.items.get(offer().hold.traumaId);
        expect(trauma.system).toMatchObject({
            subType: "physcond",
            shortcode: "immob",
            bodyLocationCode: "hand",
        });
        expect(trauma.getFlag("sohl", "grabHold")).toBe("trial");
        expect(target.parts[0]!.heldItemId).toBe("sword");
        expect(target.items.get("sword").system.isCarried).toBe(true);
        expect(source.actor.setFlag).not.toHaveBeenCalled();
    });
    it("resumes interrupted creation with its persisted ID", async () => {
        target.actor.createEmbeddedDocuments.mockImplementationOnce(
            async (_: string, data: any[]) => {
                const d = data[0];
                target.items.set(d._id, { ...d, getFlag: () => "trial" });
                throw new Error("interrupted");
            },
        );
        await expect(activeHold()).rejects.toThrow("interrupted");
        const id = offer().hold.traumaId;
        await activeHold();
        expect(offer().hold.traumaId).toBe(id);
        expect(offer().hold.status).toBe("active");
        expect(target.actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    });
    it("rejects a different controller even when Foundry grants ownership", async () => {
        mock.user = "source-owner";
        await activeHold();
        expect(mock.dialog).not.toHaveBeenCalled();
        expect(target.actor.setFlag).not.toHaveBeenCalled();
    });
    it("revalidates controller and grabbing limbs after confirmation", async () => {
        mock.dialog.mockImplementationOnce(async () => {
            source.parts[0]!.heldItemId = "axe";
            return {};
        });
        await activeHold();
        expect(target.actor.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it("commits only source die and retries a failed maintenance card without reroll", async () => {
        await activeHold();
        mock.user = "source-owner";
        mock.card.mockRejectedValueOnce(new Error("post failed"));
        await expect(beginMaintainGrabHold(source.logic, context)).rejects.toThrow("post failed");
        await beginMaintainGrabHold(source.logic, context);
        expect(mock.die).toHaveBeenCalledTimes(1);
        expect(source.actor.setFlag).toHaveBeenCalledTimes(1);
    });
    it("maintenance win renews the same condition; repeated answer cannot reroll", async () => {
        await maintenance();
        target.logic.getItemLogic = () => ({ score: { effective: 1 } });
        await answerMaintainGrabHold(target.logic, context);
        await answerMaintainGrabHold(target.logic, context);
        expect(offer().hold.status).toBe("active");
        expect(offer().hold.revision).toBe(1);
        expect(mock.die).toHaveBeenCalledTimes(2);
        expect(target.actor.deleteEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it("maintenance tie/loss removes only its marked trauma, preserving gear", async () => {
        await maintenance();
        await answerMaintainGrabHold(target.logic, context);
        expect(offer().hold.status).toBe("ended");
        expect(target.items.size).toBe(1);
        expect(target.items.has("sword")).toBe(true);
    });
    it("loss cleanup interruption is retryable without another target die", async () => {
        await maintenance();
        target.actor.deleteEmbeddedDocuments.mockRejectedValueOnce(new Error("delete failed"));
        await expect(answerMaintainGrabHold(target.logic, context)).rejects.toThrow(
            "delete failed",
        );
        expect(offer().hold.status).toBe("ending");
        await reconcileGrabHolds(target.logic);
        expect(offer().hold.status).toBe("ended");
        expect(mock.die).toHaveBeenCalledTimes(2);
    });
    it("cannot maintain on target turn or answer a request from an earlier turn", async () => {
        await maintenance();
        mock.combat.combatant.actor = target.actor;
        await answerMaintainGrabHold(target.logic, context);
        mock.user = "source-owner";
        await beginMaintainGrabHold(source.logic, context);
        expect(mock.die).toHaveBeenCalledTimes(1);
        expect(offer().hold.revision).toBe(0);
    });
    it("source release writes only source flag; target owner reconciles its condition", async () => {
        await activeHold();
        const traumaId = offer().hold.traumaId;
        mock.user = "source-owner";
        await releaseGrabHold(source.logic, context);
        expect(target.items.has(traumaId)).toBe(true);
        await reconcileGrabHolds(target.logic);
        expect(target.items.has(traumaId)).toBe(true);
        mock.user = "target-owner";
        await reconcileGrabHolds(target.logic);
        expect(target.items.has(traumaId)).toBe(false);
        expect(offer().hold.status).toBe("ended");
    });
    it("expires after the next grabber turn passes without maintenance", async () => {
        await activeHold();
        mock.combat.round = 3;
        mock.combat.turn = 2;
        await reconcileGrabHolds(target.logic);
        expect(offer().hold.status).toBe("ended");
        expect(mock.die).not.toHaveBeenCalled();
    });
    it("keeps the condition while its next grabber turn is still awaiting an answer", async () => {
        await activeHold();
        mock.combat.round = 3;
        mock.combat.turn = 1;
        await reconcileGrabHolds(target.logic);
        expect(offer().hold.status).toBe("active");
    });
    it("combat deletion ends a combat-bound Hold", async () => {
        await activeHold();
        mock.combat = undefined;
        await reconcileGrabHolds(target.logic);
        expect(offer().hold.status).toBe("ended");
    });
    it("cleanup never removes an unrelated condition with a mismatched marker", async () => {
        await activeHold();
        const id = offer().hold.traumaId;
        target.items.get(id).getFlag = () => "another-hold";
        mock.user = "source-owner";
        await releaseGrabHold(source.logic, context);
        mock.user = "target-owner";
        await reconcileGrabHolds(target.logic);
        expect(target.items.has(id)).toBe(true);
        expect(target.actor.deleteEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it("coalesces simultaneous owner cleanup requests into one deletion", async () => {
        await activeHold();
        source.records.set("grabHoldReleased.trial", true);
        const deleted = target.actor.deleteEmbeddedDocuments;
        let finish!: () => void;
        const gate = new Promise<void>((resolve) => {
            finish = resolve;
        });
        deleted.mockImplementation(async (_kind: string, ids: string[]) => {
            await gate;
            ids.forEach((id) => target.items.delete(id));
        });
        const pending = Promise.all([
            reconcileGrabHolds(target.logic),
            reconcileGrabHolds(target.logic),
        ]);
        await new Promise((resolve) => setTimeout(resolve, 0));
        const requests = deleted.mock.calls.length;
        finish();
        await pending;
        expect(requests).toBe(1);
        expect(offer().hold.status).toBe("ended");
    });
});
