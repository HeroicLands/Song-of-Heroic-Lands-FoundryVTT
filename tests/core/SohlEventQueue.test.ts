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
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
// Mock-swapped shim (vitest alias); spy on it instead of touching raw Foundry globals.
import * as FoundryHelpers from "@src/core/FoundryHelpers";

function setUserFlags(opts: { isGM: boolean; isActiveGM: boolean }): void {
    vi.spyOn(FoundryHelpers, "fvttIsCurrentUserGM").mockReturnValue(opts.isGM);
    vi.spyOn(FoundryHelpers, "fvttIsActiveGM").mockReturnValue(opts.isActiveGM);
}

function worldTimeCtx(worldTime: number): SohlTriggerContext {
    return { name: "updateWorldTime", worldTime, dt: 0 };
}

/** A SafeExpression predicate from a source string. */
const PRED_PARENT = { id: "pred", name: "pred" } as any;
function pred(source: string): SafeExpression {
    return new SafeExpression({ source }, { parent: PRED_PARENT });
}

/**
 * A resolved document whose logic records `executeAction(kind, context)` calls.
 * `onAction` receives `(kind, ctx, payload)` — the trigger context is the action
 * context's `scope`, and its `payload` is `scope.payload`.
 */
function actionDoc(
    onAction: (
        kind: string,
        ctx: SohlTriggerContext,
        payload: Record<string, unknown> | undefined,
    ) => void | Promise<void>,
): any {
    return {
        logic: {
            speaker: new SohlSpeaker({}),
            executeAction: async (
                kind: string,
                context: any,
            ): Promise<void> => {
                await onAction(kind, context.scope, context.scope?.payload);
            },
        },
    };
}

/** Install a global `fromUuid` returning an actionDoc for every uuid. */
function installActionDoc(
    onAction: Parameters<typeof actionDoc>[0] = () => {},
): void {
    (globalThis as any).fromUuid = async (_uuid: string) => actionDoc(onAction);
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
                kind: "healingCheck",
                triggerName: "updateWorldTime",
                fireAt: 1000,
            });
            expect(queue.size).toBe(1);
        });

        it("subscribe runs on non-GM clients too (populate everywhere)", () => {
            setUserFlags({ isGM: false, isActiveGM: false });
            queue.subscribe({
                uuid: "Actor.a.Item.x",
                kind: "healingCheck",
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

        it("keeps separate entries for different kinds / uuids", () => {
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
            queue.subscribe({
                uuid: "u2",
                kind: "a",
                triggerName: "combatStart",
            });
            expect(queue.size).toBe(3);
        });
    });

    describe("fire dispatches by executing the action named by kind", () => {
        it("executes `kind` as the action, passing ctx (with payload) as scope", async () => {
            const calls: any[] = [];
            installActionDoc((kind, ctx, payload) => {
                calls.push({ kind, name: ctx.name, payload });
            });
            queue.subscribe({
                uuid: "u1",
                kind: "berserkerCheck",
                triggerName: "combatStart",
                payload: { threshold: 12 },
            });
            queue.subscribe({
                uuid: "u2",
                kind: "onEnd",
                triggerName: "combatEnd",
            });

            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(calls).toEqual([
                {
                    kind: "berserkerCheck",
                    name: "combatStart",
                    payload: { threshold: 12 },
                },
            ]);
        });

        it("evaluates a SafeExpression predicate and skips falsy ones", async () => {
            const calls: string[] = [];
            installActionDoc((kind) => {
                calls.push(kind);
            });
            queue.subscribe({
                uuid: "u1",
                kind: "yes",
                triggerName: "combatStart",
                predicate: pred("true"),
            });
            queue.subscribe({
                uuid: "u2",
                kind: "no",
                triggerName: "combatStart",
                predicate: pred("false"),
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(calls).toEqual(["yes"]);
        });

        it("can predicate on the trigger context (e.g. its name)", async () => {
            const calls: string[] = [];
            installActionDoc((kind) => {
                calls.push(kind);
            });
            queue.subscribe({
                uuid: "u1",
                kind: "match",
                triggerName: "combatStart",
                predicate: pred('name === "combatStart"'),
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(calls).toEqual(["match"]);
        });

        it("catches and logs predicate exceptions, keeps the subscription", async () => {
            installActionDoc();
            queue.subscribe({
                uuid: "u1",
                kind: "broken",
                triggerName: "combatStart",
                predicate: pred("unknownIdentifier"), // throws on evaluate
            });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(queue.size).toBe(1);
            expect(errorSpy).toHaveBeenCalled();
        });

        it("is a no-op on non-active-GM", async () => {
            const seen: string[] = [];
            installActionDoc((kind) => {
                seen.push(kind);
            });
            queue.subscribe({
                uuid: "u1",
                kind: "k",
                triggerName: "combatStart",
            });
            setUserFlags({ isGM: true, isActiveGM: false });
            await queue.fire({ name: "combatStart", combat: {} as any });
            expect(seen).toEqual([]);
        });

        it("catches action errors and continues dispatching the rest", async () => {
            const seen: string[] = [];
            installActionDoc((kind) => {
                if (kind === "boom") throw new Error("nope");
                seen.push(kind);
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

        it("warns when the resolved document logic cannot execute actions", async () => {
            (globalThis as any).fromUuid = async () => ({ logic: {} });
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
        beforeEach(() => installActionDoc());

        it("does not fire before worldTime reaches fireAt", async () => {
            const seen: string[] = [];
            installActionDoc((kind) => {
                seen.push(kind);
            });
            queue.scheduleAt("u", "k", 1000);
            await queue.fire(worldTimeCtx(500));
            expect(seen).toEqual([]);
            expect(queue.size).toBe(1);
        });

        it("fires once and removes itself when worldTime >= fireAt (one-shot)", async () => {
            const seen: string[] = [];
            installActionDoc((kind) => {
                seen.push(kind);
            });
            queue.scheduleAt("u", "k", 1000);
            await queue.fire(worldTimeCtx(1500));
            expect(seen).toEqual(["k"]);
            expect(queue.size).toBe(0);
        });

        it("dispatches multiple due subscriptions in fireAt order regardless of insertion order", async () => {
            const seen: number[] = [];
            installActionDoc((_kind, _ctx, payload) => {
                seen.push((payload as any).fireAt);
            });
            queue.scheduleAt("u3", "c", 700, { fireAt: 700 });
            queue.scheduleAt("u1", "a", 300, { fireAt: 300 });
            queue.scheduleAt("u2", "b", 500, { fireAt: 500 });
            await queue.fire(worldTimeCtx(1000));
            expect(seen).toEqual([300, 500, 700]);
        });

        it("does not re-fire a handler-scheduled successor within the same pass", async () => {
            const seen: number[] = [];
            installActionDoc((_kind, _ctx, payload) => {
                const fireAt = (payload as any).fireAt;
                seen.push(fireAt);
                queue.scheduleAt("u", "tick", fireAt + 100, {
                    fireAt: fireAt + 100,
                });
            });
            queue.scheduleAt("u", "tick", 100, { fireAt: 100 });
            await queue.fire(worldTimeCtx(1000));
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
            installActionDoc((_kind, _ctx, payload) => {
                const fireAt = (payload as any).fireAt;
                seen.push(fireAt);
                queue.scheduleAt("injury", "healingCheck", fireAt + FIVE_DAYS, {
                    fireAt: fireAt + FIVE_DAYS,
                });
            });
            queue.scheduleAt("injury", "healingCheck", FIVE_DAYS, {
                fireAt: FIVE_DAYS,
            });
            await queue.fire(worldTimeCtx(SIXTY_DAYS));
            expect(seen).toEqual([FIVE_DAYS]);
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].fireAt).toBe(2 * FIVE_DAYS);
        });

        it("respects predicates during a pass (skipped subs do not block the loop)", async () => {
            const seen: string[] = [];
            installActionDoc((kind) => {
                seen.push(kind);
            });
            queue.subscribe({
                uuid: "u1",
                kind: "skipped",
                triggerName: "updateWorldTime",
                fireAt: 100,
                predicate: pred("false"),
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
    });

    describe("loop protection", () => {
        it("a handler re-arming during dispatch does not re-fire in the same pass", async () => {
            let calls = 0;
            installActionDoc((_kind, ctx) => {
                calls++;
                if (ctx.name === "updateWorldTime")
                    queue.scheduleAt("u", "k", 100);
            });
            queue.scheduleAt("u", "k", 100);
            await queue.fire(worldTimeCtx(1000));
            expect(calls).toBe(1);
            expect(queue.size).toBe(1);
        });

        it("aborts re-entrant fire on the same trigger with depth > 16", async () => {
            (globalThis as any).fromUuid = async () =>
                actionDoc(async () => {
                    queue.subscribe({
                        uuid: "u",
                        kind: "deep",
                        triggerName: "combatStart",
                    });
                    await queue.fire({
                        name: "combatStart",
                        combat: {} as any,
                    });
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
            queue.scheduleAt("Actor.a.Item.x", "healingCheck", 9000);
            expect(queue.nextFireTime("Actor.a.Item.x", "healingCheck")).toBe(
                9000,
            );
        });
    });

    describe("debug", () => {
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
            expect(queue.debug().map((s) => s.kind)).toEqual(["a", "m", "z"]);
        });
    });
});
