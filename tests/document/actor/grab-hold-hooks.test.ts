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

import { beforeEach, describe, it, expect, vi } from "vitest";
const m = vi.hoisted(() => ({
    user: "source-owner",
    actors: [] as any[],
    combat: undefined as any,
    release: vi.fn(),
    reconcile: vi.fn(),
    card: vi.fn(),
    handlers: new Map<string, Function>(),
    error: vi.fn(),
}));
vi.mock("@src/core/FoundryHelpers", () => ({
    fvttCurrentUser: () => ({ id: m.user }),
    fvttWorldActors: () => m.actors,
    getActiveCombat: () => m.combat,
    fvttHookOnError: m.error,
}));
vi.mock("@src/document/chat/action-card", () => ({ postActionCard: m.card }));
vi.mock("@src/document/actor/logic/grab-hold", () => ({
    releaseGrabHold: m.release,
    reconcileGrabHolds: m.reconcile,
    grabHoldTurnKey: (id: string) =>
        m.combat?.combatant?.actor?.uuid === id ?
            `${m.combat.uuid}:${m.combat.round}:${m.combat.turn}`
        :   undefined,
}));
import { beforeGrabHoldAction } from "@src/document/actor/logic/grab-hold-dispatch";
import {
    offerGrabHoldTurn,
    registerGrabHoldHooks,
    reconcileOwnedGrabHolds,
} from "@src/document/actor/foundry/grab-hold-hooks";
let source: any, target: any;
beforeEach(() => {
    vi.clearAllMocks();
    m.handlers.clear();
    m.user = "source-owner";
    source = {
        uuid: "Actor.source",
        documentName: "Actor",
        type: "being",
        isOwner: true,
        logic: { speaker: {} },
        getFlag: () => ({}),
    };
    target = {
        uuid: "Actor.target",
        documentName: "Actor",
        type: "being",
        isOwner: true,
        logic: { speaker: {} },
        getFlag: () => ({
            trial: {
                id: "trial",
                targetUuid: "Actor.target",
                initiatorUuid: "Actor.source",
                initiatorUserId: "source-owner",
                targetUserId: "target-owner",
                hold: { status: "active" },
            },
        }),
    };
    m.actors = [source, target];
    m.combat = {
        uuid: "Combat.one",
        round: 7,
        turn: Math.random(),
        combatant: { actor: source },
        combatants: [{ actor: source }, { actor: target }],
    };
    vi.stubGlobal("sohl", { i18n: { localize: (key: string) => key } });
    vi.stubGlobal("Hooks", {
        on: (event: string, callback: Function) => m.handlers.set(event, callback),
    });
});
describe("Hold lifecycle seams", () => {
    it("replays a source update arriving during target reconciliation", async () => {
        let release: (() => void) | undefined;
        m.reconcile.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    release = resolve;
                }),
        );
        const first = reconcileOwnedGrabHolds();
        await Promise.resolve();
        const second = reconcileOwnedGrabHolds();
        release!();
        await Promise.all([first, second]);
        expect(m.reconcile).toHaveBeenCalledTimes(4);
    });

    it("another action releases each source-owned Hold using canonical identities", async () => {
        await beforeGrabHoldAction(source, "attack");
        expect(m.release).toHaveBeenCalledTimes(1);
        expect(m.release.mock.calls[0][1].scope).toEqual({
            offerId: "trial",
            targetUuid: target.uuid,
        });
    });
    it("maintenance and target response never release the hold as another action", async () => {
        await beforeGrabHoldAction(source, "beginMaintainGrabHold");
        await beforeGrabHoldAction(source, "answerMaintainGrabHold");
        expect(m.release).not.toHaveBeenCalled();
    });
    it.each([
        "automatedBlockResume",
        "automatedCounterstrikeResume",
        "automatedDodgeResume",
        "automatedIgnoreResume",
        "blockTest",
        "counterstrikeTest",
        "dodgeTest",
        "answerGrabTrial",
    ])(
        "defence %s preserves an existing Hold while a subsequent attack releases it",
        async (action) => {
            await beforeGrabHoldAction(source, action);
            expect(m.release).not.toHaveBeenCalled();
            await beforeGrabHoldAction(source, "automatedAttack");
            expect(m.release).toHaveBeenCalledTimes(1);
        },
    );
    it("startup registration immediately reconciles and offers persisted Holds", async () => {
        registerGrabHoldHooks();
        await vi.waitFor(() => expect(m.card).toHaveBeenCalledTimes(1));
        expect(m.reconcile).toHaveBeenCalledTimes(2);
        expect(m.handlers.has("ready")).toBe(false);
    });
    it("a different owner controller cannot release a source hold", async () => {
        m.user = "target-owner";
        await beforeGrabHoldAction(source, "draw");
        expect(m.release).not.toHaveBeenCalled();
    });
    it("target-turn Pass reminder has no action buttons and spends no turn", async () => {
        m.user = "target-owner";
        m.combat.combatant.actor = target;
        await offerGrabHoldTurn();
        await offerGrabHoldTurn();
        expect(m.card).toHaveBeenCalledTimes(1);
        expect(m.card.mock.calls[0][1].buttons).toBeUndefined();
        expect(m.card.mock.calls[0][1].data.message).toBe("SOHL.Grab.holdPassReminder");
        expect(m.release).not.toHaveBeenCalled();
    });
    it("grabber-turn offer only invites maintenance or release without rolling", async () => {
        await offerGrabHoldTurn();
        expect(m.card.mock.calls[0][1].buttons.map((b: any) => b.action)).toEqual([
            "beginMaintainGrabHold",
            "releaseGrabHold",
        ]);
        expect(m.release).not.toHaveBeenCalled();
    });
    it("failed reminder post can be retried on the same turn", async () => {
        m.card.mockRejectedValueOnce(new Error("post failed"));
        await expect(offerGrabHoldTurn()).rejects.toThrow("post failed");
        await offerGrabHoldTurn();
        expect(m.card).toHaveBeenCalledTimes(2);
    });
    it("actual token displacement triggers release but appearance-only updates do not", async () => {
        registerGrabHoldHooks();
        m.handlers.get("updateToken")!({ actor: source }, { name: "new" });
        await Promise.resolve();
        expect(m.release).not.toHaveBeenCalled();
        m.handlers.get("updateToken")!({ actor: source }, { x: 80 });
        await vi.waitFor(() => expect(m.release).toHaveBeenCalledTimes(1));
    });
});
