/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SohlEventQueue } from "@src/entity/event/SohlEventQueue";
import { wireSohlHookBridge } from "@src/core/logic/SohlHookBridge";
// Mock-swapped shim (vitest alias); spy on it instead of touching raw Foundry globals.
import * as FoundryHelpers from "@src/core/FoundryHelpers";

type HookFn = (...args: any[]) => any;

function setUserFlags(opts: { isGM: boolean; isActiveGM: boolean }): void {
    vi.spyOn(FoundryHelpers, "fvttIsCurrentUserGM").mockReturnValue(opts.isGM);
    vi.spyOn(FoundryHelpers, "fvttIsActiveGM").mockReturnValue(opts.isActiveGM);
}

function captureHooks(): {
    hooks: Map<string, HookFn[]>;
    restore: () => void;
} {
    const hooks = new Map<string, HookFn[]>();
    const original = (globalThis as any).Hooks;
    (globalThis as any).Hooks = {
        on(name: string, fn: HookFn) {
            const list = hooks.get(name) ?? [];
            list.push(fn);
            hooks.set(name, list);
        },
        callAll() {},
        call() {
            return true;
        },
        once() {},
        onError() {},
    };
    return {
        hooks,
        restore() {
            (globalThis as any).Hooks = original;
        },
    };
}

describe("SohlHookBridge", () => {
    let queue: SohlEventQueue;
    let captured: ReturnType<typeof captureHooks>;
    let fireSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        setUserFlags({ isGM: true, isActiveGM: true });
        queue = new SohlEventQueue();
        fireSpy = vi.fn(async () => {});
        (queue as any).fire = fireSpy;
        captured = captureHooks();
        wireSohlHookBridge(queue);
    });

    afterEach(() => {
        captured.restore();
        vi.restoreAllMocks();
    });

    it("registers all expected Foundry hooks", () => {
        expect(captured.hooks.has("updateWorldTime")).toBe(true);
        expect(captured.hooks.has("combatStart")).toBe(true);
        expect(captured.hooks.has("deleteCombat")).toBe(true);
        expect(captured.hooks.has("combatRound")).toBe(true);
        expect(captured.hooks.has("combatTurn")).toBe(true);
    });

    describe("updateWorldTime", () => {
        it("translates the hook to an updateWorldTime trigger context", async () => {
            const fn = captured.hooks.get("updateWorldTime")![0];
            await fn(1234, 60, { foo: "bar" }, "userA");
            expect(fireSpy).toHaveBeenCalledWith({
                name: "updateWorldTime",
                worldTime: 1234,
                dt: 60,
                options: { foo: "bar" },
                userId: "userA",
            });
        });

        it("short-circuits on non-active-GM", async () => {
            setUserFlags({ isGM: true, isActiveGM: false });
            const fn = captured.hooks.get("updateWorldTime")![0];
            await fn(1234, 60, {}, "userA");
            expect(fireSpy).not.toHaveBeenCalled();
        });
    });

    describe("combatStart", () => {
        it("fires combatStart", async () => {
            const combat = { id: "c1", combatant: null };
            const fn = captured.hooks.get("combatStart")![0];
            await fn(combat);
            expect(fireSpy).toHaveBeenCalledWith({
                name: "combatStart",
                combat,
            });
        });
    });

    describe("deleteCombat", () => {
        it("fires combatEnd (mapped from deleteCombat)", async () => {
            const combat = { id: "c1" };
            const fn = captured.hooks.get("deleteCombat")![0];
            await fn(combat);
            expect(fireSpy).toHaveBeenCalledWith({
                name: "combatEnd",
                combat,
            });
        });
    });

    describe("combatTurn / combatRound", () => {
        function makeCombatant(id: string): any {
            return { id, name: `Combatant ${id}` };
        }

        function makeCombat(
            initial: { round: number; turn: number; combatantId: string },
            combatantIds: string[],
        ): any {
            const combatants = new Map(
                combatantIds.map((id) => [id, makeCombatant(id)]),
            );
            return {
                id: "combat-1",
                round: initial.round,
                turn: initial.turn,
                combatant: combatants.get(initial.combatantId) ?? null,
                combatants: {
                    get: (id: string) => combatants.get(id),
                },
            };
        }

        it("on combatStart, fires combatStart and initializes the per-combat prior tracker", async () => {
            const combat = makeCombat({ round: 1, turn: 0, combatantId: "A" }, [
                "A",
                "B",
            ]);
            await captured.hooks.get("combatStart")![0](combat);
            fireSpy.mockClear();

            // Next combatTurn: prior should be {round:1, turn:0, combatantId: "A"}.
            combat.round = 1;
            combat.turn = 1;
            combat.combatant = combat.combatants.get("B");
            await captured.hooks.get("combatTurn")![0](
                combat,
                { round: 1, turn: 1 },
                {},
            );

            const calls = fireSpy.mock.calls.map((c: any[]) => c[0]);
            // turnEnd for prior combatant A, then turnStart for new B.
            expect(calls).toEqual([
                {
                    name: "turnEnd",
                    combat,
                    combatant: combat.combatants.get("A"),
                    turn: 0,
                    round: 1,
                    skipped: false,
                },
                {
                    name: "turnStart",
                    combat,
                    combatant: combat.combatants.get("B"),
                    turn: 1,
                    round: 1,
                    skipped: false,
                },
            ]);
        });

        it("on combatRound, fires roundEnd then roundStart", async () => {
            const combat = makeCombat({ round: 1, turn: 0, combatantId: "A" }, [
                "A",
            ]);
            await captured.hooks.get("combatStart")![0](combat);
            fireSpy.mockClear();

            combat.round = 2;
            combat.turn = 0;
            await captured.hooks.get("combatRound")![0](
                combat,
                { round: 2, turn: 0 },
                {},
            );

            const calls = fireSpy.mock.calls.map((c: any[]) => c[0]);
            expect(calls[0]).toEqual({
                name: "roundEnd",
                combat,
                round: 1,
                skipped: false,
            });
            expect(calls[1]).toEqual({
                name: "roundStart",
                combat,
                round: 2,
                skipped: false,
            });
        });

        it("short-circuits combatTurn / combatRound on non-active-GM", async () => {
            const combat = makeCombat({ round: 1, turn: 0, combatantId: "A" }, [
                "A",
            ]);
            await captured.hooks.get("combatStart")![0](combat);
            fireSpy.mockClear();
            setUserFlags({ isGM: true, isActiveGM: false });

            await captured.hooks.get("combatTurn")![0](
                combat,
                { round: 1, turn: 1 },
                {},
            );
            await captured.hooks.get("combatRound")![0](
                combat,
                { round: 2, turn: 0 },
                {},
            );
            expect(fireSpy).not.toHaveBeenCalled();
        });
    });
});
