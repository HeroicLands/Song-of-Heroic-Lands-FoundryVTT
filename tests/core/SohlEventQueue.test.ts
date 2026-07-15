/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type MockInstance,
} from "vitest";
import { SohlEventQueue } from "@src/entity/event/SohlEventQueue";
import type { SohlTriggerContext } from "@src/entity/event/event-trigger";
// Mock-swapped shim (vitest alias); spy on it instead of touching raw Foundry globals.
import * as FoundryHelpers from "@src/core/FoundryHelpers";

function setUserFlags(opts: { isGM: boolean; isActiveGM: boolean }): void {
    vi.spyOn(FoundryHelpers, "fvttIsCurrentUserGM").mockReturnValue(opts.isGM);
    vi.spyOn(FoundryHelpers, "fvttIsActiveGM").mockReturnValue(opts.isActiveGM);
}

function worldTimeCtx(worldTime: number): SohlTriggerContext {
    return { name: "updateWorldTime", worldTime, dt: 0 };
}

describe("SohlEventQueue", () => {
    let queue: SohlEventQueue;
    let warnSpy: MockInstance;
    let errorSpy: MockInstance;

    beforeEach(() => {
        queue = new SohlEventQueue();
        setUserFlags({ isGM: true, isActiveGM: true });
        warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("subscribe / unsubscribe (all clients)", () => {
        it("subscribe stores when any GM (even inactive)", () => {
            setUserFlags({ isGM: true, isActiveGM: false });
            queue.subscribe({
                uuid: "Actor.a.Item.x",
                kind: "healingTest",
                triggerName: "updateWorldTime",
                fireAt: 1000,
            });
            expect(queue.size).toBe(1);
        });

        it("subscribe runs on non-GM clients too (populate everywhere)", () => {
            setUserFlags({ isGM: false, isActiveGM: false });
            queue.subscribe({
                uuid: "Actor.a.Item.x",
                kind: "healingTest",
                triggerName: "updateWorldTime",
                fireAt: 1000,
            });
            expect(queue.size).toBe(1);
        });

        it("unsubscribe runs on all clients (including non-GM)", () => {
            queue.subscribe({
                uuid: "Actor.a.Item.x",
                kind: "k",
                triggerName: "combatStart",
            });
            expect(queue.size).toBe(1);

            setUserFlags({ isGM: false, isActiveGM: false });
            queue.unsubscribe("Actor.a.Item.x", "k");
            expect(queue.size).toBe(0);
        });

        it("unsubscribe is safe when the subscription is absent", () => {
            expect(() => queue.unsubscribe("nope", "nada")).not.toThrow();
        });

        it("clear empties the queue", () => {
            queue.subscribe({
                uuid: "u1",
                kind: "k1",
                triggerName: "combatStart",
            });
            queue.subscribe({
                uuid: "u2",
                kind: "k2",
                triggerName: "combatEnd",
            });
            queue.clear();
            expect(queue.size).toBe(0);
        });
    });

    describe("subscribe (overwrite semantics)", () => {
        it("overwrites on the same (uuid, kind)", () => {
            queue.subscribe({
                uuid: "u",
                kind: "k",
                triggerName: "updateWorldTime",
                fireAt: 100,
            });
            queue.subscribe({
                uuid: "u",
                kind: "k",
                triggerName: "combatStart",
                payload: { v: 1 },
            });
            expect(queue.size).toBe(1);
            const [s] = queue.debug();
            expect(s.triggerName).toBe("combatStart");
            expect(s.payload).toEqual({ v: 1 });
            expect(s.fireAt).toBeUndefined();
        });

        it("keeps separate entries for different kinds on the same uuid", () => {
            queue.subscribe({
                uuid: "u",
                kind: "a",
                triggerName: "combatStart",
            });
            queue.subscribe({
                uuid: "u",
                kind: "b",
                triggerName: "combatStart",
            });
            expect(queue.size).toBe(2);
        });

        it("keeps separate entries for different uuids with the same kind", () => {
            queue.subscribe({
                uuid: "u1",
                kind: "k",
                triggerName: "combatStart",
            });
            queue.subscribe({
                uuid: "u2",
                kind: "k",
                triggerName: "combatStart",
            });
            expect(queue.size).toBe(2);
        });
    });

    describe("fire (non-time triggers)", () => {
        it("dispatches to subscriptions whose triggerName matches the context", async () => {
            const seen: any[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    kind: string,
                    ctx: SohlTriggerContext,
                    payload?: Record<string, unknown>,
                ): Promise<void> => {
                    seen.push({ kind, name: ctx.name, payload });
                },
            });

            queue.subscribe({
                uuid: "u1",
                kind: "onStart",
                triggerName: "combatStart",
                payload: { x: 1 },
            });
            queue.subscribe({
                uuid: "u2",
                kind: "onEnd",
                triggerName: "combatEnd",
            });

            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(seen).toEqual([
                { kind: "onStart", name: "combatStart", payload: { x: 1 } },
            ]);
        });

        it("evaluates predicates and skips subscriptions returning false", async () => {
            const calls: string[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (kind: string): Promise<void> => {
                    calls.push(kind);
                },
            });
            queue.subscribe({
                uuid: "u1",
                kind: "yes",
                triggerName: "combatStart",
                predicate: () => true,
            });
            queue.subscribe({
                uuid: "u2",
                kind: "no",
                triggerName: "combatStart",
                predicate: () => false,
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(calls).toEqual(["yes"]);
        });

        it("catches and logs predicate exceptions, keeps the subscription", async () => {
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (): Promise<void> => {},
            });
            queue.subscribe({
                uuid: "u1",
                kind: "broken",
                triggerName: "combatStart",
                predicate: () => {
                    throw new Error("oops");
                },
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(queue.size).toBe(1);
            expect(errorSpy).toHaveBeenCalled();
        });

        it("is a no-op on non-active-GM", async () => {
            const handler = vi.fn();
            (globalThis as any).fromUuid = async () => ({
                handleSohlEvent: handler,
            });
            queue.subscribe({
                uuid: "u1",
                kind: "k",
                triggerName: "combatStart",
            });

            setUserFlags({ isGM: true, isActiveGM: false });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(handler).not.toHaveBeenCalled();
        });

        it("catches handler errors and continues dispatching the rest", async () => {
            const seen: string[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (kind: string): Promise<void> => {
                    if (kind === "boom") throw new Error("nope");
                    seen.push(kind);
                },
            });
            queue.subscribe({
                uuid: "u1",
                kind: "boom",
                triggerName: "combatStart",
            });
            queue.subscribe({
                uuid: "u2",
                kind: "ok",
                triggerName: "combatStart",
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(seen).toEqual(["ok"]);
            expect(errorSpy).toHaveBeenCalled();
        });

        it("silently skips subscriptions whose UUID no longer resolves", async () => {
            (globalThis as any).fromUuid = async () => null;
            queue.subscribe({
                uuid: "missing",
                kind: "k",
                triggerName: "combatStart",
            });
            await expect(
                queue.fire({ name: "combatStart", combat: {} as any }),
            ).resolves.not.toThrow();
        });

        it("warns when the resolved document lacks handleSohlEvent", async () => {
            (globalThis as any).fromUuid = async () => ({ uuid: "foo" });
            queue.subscribe({
                uuid: "foo",
                kind: "k",
                triggerName: "combatStart",
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(warnSpy).toHaveBeenCalled();
        });
    });

    describe("scheduleAt + updateWorldTime", () => {
        beforeEach(() => {
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (): Promise<void> => {},
            });
        });

        it("does not fire before worldTime reaches fireAt", async () => {
            const handler = vi.fn();
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: handler,
            });
            queue.scheduleAt("u", "k", 1000);
            await queue.fire(worldTimeCtx(500));
            expect(handler).not.toHaveBeenCalled();
            expect(queue.size).toBe(1);
        });

        it("fires once and removes itself when worldTime >= fireAt (one-shot)", async () => {
            const handler = vi.fn();
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: handler,
            });
            queue.scheduleAt("u", "k", 1000);
            await queue.fire(worldTimeCtx(1500));
            expect(handler).toHaveBeenCalledTimes(1);
            expect(queue.size).toBe(0);
        });

        it("dispatches multiple due scheduleAt subscriptions in fireAt order regardless of insertion order", async () => {
            const seen: number[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    _kind: string,
                    _ctx: SohlTriggerContext,
                    payload?: Record<string, unknown>,
                ): Promise<void> => {
                    seen.push((payload as any).fireAt);
                },
            });

            queue.scheduleAt("u3", "c", 700, { fireAt: 700 });
            queue.scheduleAt("u1", "a", 300, { fireAt: 300 });
            queue.scheduleAt("u2", "b", 500, { fireAt: 500 });

            await queue.fire(worldTimeCtx(1000));
            expect(seen).toEqual([300, 500, 700]);
        });

        it("does not re-fire a handler-scheduled successor within the same pass", async () => {
            const seen: number[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    _kind: string,
                    _ctx: SohlTriggerContext,
                    payload?: Record<string, unknown>,
                ): Promise<void> => {
                    const fireAt = (payload as any).fireAt;
                    seen.push(fireAt);
                    queue.scheduleAt("u", "tick", fireAt + 100, {
                        fireAt: fireAt + 100,
                    });
                },
            });

            queue.scheduleAt("u", "tick", 100, { fireAt: 100 });
            await queue.fire(worldTimeCtx(1000));
            // Single pass: only the initially-due 100 fires; the 200 successor
            // the handler armed waits for the next fire().
            expect(seen).toEqual([100]);
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].fireAt).toBe(200);
        });
    });

    describe("single-pass dispatch (no cascade)", () => {
        it("does NOT catch up recurring events over a time jump — that is the consumer's job", async () => {
            const seen: number[] = [];
            const FIVE_DAYS = 5 * 86400;
            const SIXTY_DAYS = 60 * 86400;

            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    _kind: string,
                    _ctx: SohlTriggerContext,
                    payload?: Record<string, unknown>,
                ): Promise<void> => {
                    const fireAt = (payload as any).fireAt;
                    seen.push(fireAt);
                    queue.scheduleAt(
                        "injury",
                        "healingTest",
                        fireAt + FIVE_DAYS,
                        {
                            fireAt: fireAt + FIVE_DAYS,
                        },
                    );
                },
            });

            queue.scheduleAt("injury", "healingTest", FIVE_DAYS, {
                fireAt: FIVE_DAYS,
            });
            await queue.fire(worldTimeCtx(SIXTY_DAYS));

            // Only the initially-due occurrence fires; the handler's re-arm (10d)
            // waits for the next fire(). Recurrence catch-up is the document's
            // responsibility (elapsed-interval loop in its handler), not the queue's.
            expect(seen).toEqual([FIVE_DAYS]);
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].fireAt).toBe(2 * FIVE_DAYS);
        });

        it("respects predicates during cascade (skipped subscriptions do not block the loop)", async () => {
            const seen: string[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (kind: string): Promise<void> => {
                    seen.push(kind);
                },
            });

            queue.subscribe({
                uuid: "u1",
                kind: "skipped",
                triggerName: "updateWorldTime",
                fireAt: 100,
                predicate: () => false,
            });
            queue.subscribe({
                uuid: "u2",
                kind: "fires",
                triggerName: "updateWorldTime",
                fireAt: 200,
            });

            await queue.fire(worldTimeCtx(500));
            expect(seen).toEqual(["fires"]);
        });

        it("does not dispatch newly-scheduled subscriptions whose fireAt is after worldTime", async () => {
            const seen: number[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    _kind: string,
                    _ctx: SohlTriggerContext,
                    payload?: Record<string, unknown>,
                ): Promise<void> => {
                    seen.push((payload as any).fireAt);
                },
            });

            queue.scheduleAt("u", "k", 100, { fireAt: 100 });
            // Handler runs at 100, schedules at 5000 (beyond worldTime).
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    _kind: string,
                    _ctx: SohlTriggerContext,
                    payload?: Record<string, unknown>,
                ): Promise<void> => {
                    const f = (payload as any).fireAt;
                    seen.push(f);
                    if (f === 100) {
                        queue.scheduleAt("u", "k", 5000, { fireAt: 5000 });
                    }
                },
            });

            await queue.fire(worldTimeCtx(1000));
            expect(seen).toEqual([100]);
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].fireAt).toBe(5000);
        });

        it("subscribing to a non-updateWorldTime trigger mid-cascade does not affect the cascade", async () => {
            const seen: string[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (kind: string): Promise<void> => {
                    seen.push(kind);
                    if (kind === "first") {
                        queue.subscribe({
                            uuid: "u",
                            kind: "onCombat",
                            triggerName: "combatStart",
                        });
                    }
                },
            });
            queue.scheduleAt("u1", "first", 100);
            queue.scheduleAt("u2", "second", 200);

            await queue.fire(worldTimeCtx(1000));
            expect(seen).toEqual(["first", "second"]);
            // The combatStart subscription survives — separate trigger.
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].triggerName).toBe("combatStart");
        });
    });

    describe("loop protection", () => {
        it("a handler re-arming during dispatch does not re-fire in the same pass", async () => {
            let calls = 0;
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (
                    _kind: string,
                    ctx: SohlTriggerContext,
                ): Promise<void> => {
                    calls++;
                    // Re-arm (same fireAt) — no cascade, so it waits for the next
                    // fire() rather than looping here. No same-tick guard needed.
                    if (ctx.name === "updateWorldTime") {
                        queue.scheduleAt("u", "k", 100);
                    }
                },
            });

            queue.scheduleAt("u", "k", 100);
            await queue.fire(worldTimeCtx(1000));
            expect(calls).toBe(1);
            expect(queue.size).toBe(1);
        });

        it("aborts re-entrant fire on the same trigger with depth > 16", async () => {
            (globalThis as any).fromUuid = async (uuid: string) => ({
                uuid,
                handleSohlEvent: async (): Promise<void> => {
                    // Re-entrantly dispatch the same trigger from inside the handler.
                    queue.subscribe({
                        uuid: "u",
                        kind: "deep",
                        triggerName: "combatStart",
                    });
                    await queue.fire({
                        name: "combatStart",
                        combat: {} as any,
                    });
                },
            });
            queue.subscribe({
                uuid: "u",
                kind: "deep",
                triggerName: "combatStart",
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(errorSpy).toHaveBeenCalled();
        });
    });

    describe("query API (all clients)", () => {
        it("nextFireTime returns the fireAt, or undefined when absent", () => {
            queue.scheduleAt("u", "k", 4242);
            expect(queue.nextFireTime("u", "k")).toBe(4242);
            expect(queue.nextFireTime("u", "missing")).toBeUndefined();
        });

        it("timeUntil returns signed seconds from now (undefined when absent)", () => {
            vi.spyOn(FoundryHelpers, "fvttWorldTime").mockReturnValue(1000);
            queue.scheduleAt("u", "future", 1500);
            queue.scheduleAt("u", "past", 400);
            expect(queue.timeUntil("u", "future")).toBe(500);
            expect(queue.timeUntil("u", "past")).toBe(-600);
            expect(queue.timeUntil("u", "missing")).toBeUndefined();
        });

        it("isScheduled reflects presence", () => {
            queue.scheduleAt("u", "k", 100);
            expect(queue.isScheduled("u", "k")).toBe(true);
            expect(queue.isScheduled("u", "nope")).toBe(false);
        });

        it("populates on non-GM clients so players can query dates locally", () => {
            setUserFlags({ isGM: false, isActiveGM: false });
            queue.scheduleAt("Actor.a.Item.x", "healingTest", 9000);
            expect(queue.nextFireTime("Actor.a.Item.x", "healingTest")).toBe(
                9000,
            );
        });
    });

    describe("debug", () => {
        it("returns empty array for empty queue", () => {
            expect(queue.debug()).toEqual([]);
        });

        it("returns subscriptions sorted by (triggerName, fireAt, kind)", () => {
            queue.subscribe({
                uuid: "u",
                kind: "z",
                triggerName: "updateWorldTime",
                fireAt: 100,
            });
            queue.subscribe({
                uuid: "u",
                kind: "a",
                triggerName: "combatStart",
            });
            queue.subscribe({
                uuid: "u",
                kind: "m",
                triggerName: "updateWorldTime",
                fireAt: 50,
            });
            const sorted = queue.debug();
            expect(sorted.map((s) => s.kind)).toEqual(["a", "m", "z"]);
        });
    });
});
