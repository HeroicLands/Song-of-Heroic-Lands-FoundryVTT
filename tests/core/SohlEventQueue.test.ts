/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SohlEventQueue } from "@src/core/SohlEventQueue";

function setUserFlags(opts: { isGM: boolean; isActiveGM: boolean }): void {
    (globalThis as any).game.user = {
        id: "testUser",
        isGM: opts.isGM,
        isActiveGM: opts.isActiveGM,
    };
}

describe("SohlEventQueue", () => {
    let queue: SohlEventQueue;

    beforeEach(() => {
        queue = new SohlEventQueue();
        setUserFlags({ isGM: true, isActiveGM: true });
    });

    afterEach(() => {
        setUserFlags({ isGM: true, isActiveGM: true });
    });

    describe("GM-gated registration", () => {
        it("registerEvent stores the event when the user is a GM", () => {
            setUserFlags({ isGM: true, isActiveGM: false });
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            expect(queue.size).toBe(1);
        });

        it("registerEvent is a no-op when the user is not a GM", () => {
            setUserFlags({ isGM: false, isActiveGM: false });
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            expect(queue.size).toBe(0);
        });

        it("unregisterEvent is a no-op when the user is not a GM", () => {
            setUserFlags({ isGM: true, isActiveGM: true });
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            expect(queue.size).toBe(1);

            setUserFlags({ isGM: false, isActiveGM: false });
            queue.unregisterEvent("Actor.a.Item.x", "healingTest");
            expect(queue.size).toBe(1);
        });

        it("any GM (not just primary) may register and unregister", () => {
            setUserFlags({ isGM: true, isActiveGM: false });
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            expect(queue.size).toBe(1);

            queue.unregisterEvent("Actor.a.Item.x", "healingTest");
            expect(queue.size).toBe(0);
        });
    });

    describe("registerEvent", () => {
        it("adds an event to the queue", () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000, {
                level: 3,
            });
            expect(queue.size).toBe(1);
            const [evt] = queue.debug();
            expect(evt).toMatchObject({
                uuid: "Actor.a.Item.x",
                kind: "healingTest",
                time: 1000,
                payload: { level: 3 },
            });
        });

        it("overwrites an existing event with the same uuid+kind", () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            queue.registerEvent("Actor.a.Item.x", "healingTest", 2000, {
                extra: "data",
            });
            expect(queue.size).toBe(1);
            const [evt] = queue.debug();
            expect(evt.time).toBe(2000);
            expect(evt.payload).toEqual({ extra: "data" });
        });

        it("keeps separate events for different kinds on the same uuid", () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            queue.registerEvent("Actor.a.Item.x", "bleedingCheck", 2000);
            expect(queue.size).toBe(2);
        });

        it("keeps separate events for different uuids with same kind", () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            queue.registerEvent("Actor.a.Item.y", "healingTest", 2000);
            expect(queue.size).toBe(2);
        });
    });

    describe("unregisterEvent", () => {
        it("removes an existing event", () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            queue.unregisterEvent("Actor.a.Item.x", "healingTest");
            expect(queue.size).toBe(0);
        });

        it("is safe to call for non-existent events", () => {
            expect(() =>
                queue.unregisterEvent("Actor.a.Item.x", "healingTest"),
            ).not.toThrow();
        });

        it("does not remove events with different kinds", () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            queue.registerEvent("Actor.a.Item.x", "bleedingCheck", 2000);
            queue.unregisterEvent("Actor.a.Item.x", "healingTest");
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].kind).toBe("bleedingCheck");
        });
    });

    describe("processDueEvents", () => {
        it("is a no-op on non-active-GM clients (even other GMs)", async () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            setUserFlags({ isGM: true, isActiveGM: false });
            await queue.processDueEvents(5000);
            expect(queue.size).toBe(1);
        });

        it("is a no-op on non-GM clients", async () => {
            queue.registerEvent("Actor.a.Item.x", "healingTest", 1000);
            setUserFlags({ isGM: false, isActiveGM: false });
            await queue.processDueEvents(5000);
            expect(queue.size).toBe(1);
        });

        it("dispatches events whose time <= worldTime on the primary GM", async () => {
            const seen: { kind: string; time: number }[] = [];
            (globalThis as any).fromUuid = async (uuid: string) => ({
                handleSohlEvent: async (
                    kind: string,
                    time: number,
                ): Promise<void> => {
                    seen.push({ kind, time });
                    return undefined;
                },
                uuid,
            });

            queue.registerEvent("Actor.a.Item.x", "first", 100);
            queue.registerEvent("Actor.a.Item.y", "second", 200);
            queue.registerEvent("Actor.a.Item.z", "later", 5000);

            await queue.processDueEvents(1000);

            expect(seen).toEqual([
                { kind: "first", time: 100 },
                { kind: "second", time: 200 },
            ]);
            expect(queue.size).toBe(1);
            expect(queue.debug()[0].kind).toBe("later");
        });

        it("processes events in chronological order regardless of insertion order", async () => {
            const seen: number[] = [];
            (globalThis as any).fromUuid = async () => ({
                handleSohlEvent: async (
                    _kind: string,
                    time: number,
                ): Promise<void> => {
                    seen.push(time);
                },
            });

            queue.registerEvent("Actor.a.Item.x", "c", 300);
            queue.registerEvent("Actor.a.Item.y", "a", 100);
            queue.registerEvent("Actor.a.Item.z", "b", 200);

            await queue.processDueEvents(1000);

            expect(seen).toEqual([100, 200, 300]);
        });

        it("skips silently when document UUID no longer resolves", async () => {
            (globalThis as any).fromUuid = async () => null;
            queue.registerEvent("Actor.gone", "healingTest", 100);
            await expect(queue.processDueEvents(1000)).resolves.not.toThrow();
            expect(queue.size).toBe(0);
        });

        it("warns when document does not implement handleSohlEvent", async () => {
            (globalThis as any).fromUuid = async () => ({ uuid: "Actor.foo" });
            queue.registerEvent("Actor.foo", "healingTest", 100);
            await queue.processDueEvents(1000);
            expect(queue.size).toBe(0);
        });

        it("removes events before dispatch so a throwing handler does not retry", async () => {
            let calls = 0;
            (globalThis as any).fromUuid = async () => ({
                handleSohlEvent: async (): Promise<void> => {
                    calls++;
                    throw new Error("handler exploded");
                },
            });

            queue.registerEvent("Actor.a.Item.x", "boom", 100);
            await queue.processDueEvents(1000);

            expect(calls).toBe(1);
            expect(queue.size).toBe(0);
        });

        it("handles cascading registration: a handler may schedule the next event", async () => {
            const seen: number[] = [];
            (globalThis as any).fromUuid = async () => ({
                handleSohlEvent: async (
                    _kind: string,
                    time: number,
                ): Promise<void> => {
                    seen.push(time);
                    if (seen.length < 3) {
                        queue.registerEvent(
                            "Actor.a.Item.x",
                            "tick",
                            time + 100,
                        );
                    }
                },
            });

            queue.registerEvent("Actor.a.Item.x", "tick", 100);
            await queue.processDueEvents(1000);

            expect(seen).toEqual([100, 200, 300]);
        });

        it("discards same-time re-registration during dispatch (loop protection)", async () => {
            let calls = 0;
            (globalThis as any).fromUuid = async () => ({
                handleSohlEvent: async (
                    _kind: string,
                    time: number,
                ): Promise<void> => {
                    calls++;
                    queue.registerEvent("Actor.a.Item.x", "loop", time);
                },
            });

            queue.registerEvent("Actor.a.Item.x", "loop", 100);
            await queue.processDueEvents(1000);

            expect(calls).toBe(1);
        });
    });

    describe("size", () => {
        it("returns 0 for an empty queue", () => {
            expect(queue.size).toBe(0);
        });

        it("returns the number of registered events", () => {
            queue.registerEvent("Actor.a.Item.x", "k1", 100);
            queue.registerEvent("Actor.a.Item.y", "k2", 200);
            expect(queue.size).toBe(2);
        });
    });

    describe("nextEventTime", () => {
        it("returns undefined for an empty queue", () => {
            expect(queue.nextEventTime).toBeUndefined();
        });

        it("returns the earliest scheduled time", () => {
            queue.registerEvent("Actor.a.Item.x", "later", 500);
            queue.registerEvent("Actor.a.Item.y", "earlier", 100);
            queue.registerEvent("Actor.a.Item.z", "middle", 300);
            expect(queue.nextEventTime).toBe(100);
        });
    });

    describe("clear", () => {
        it("removes all events from the queue", () => {
            queue.registerEvent("Actor.a.Item.x", "k1", 100);
            queue.registerEvent("Actor.a.Item.y", "k2", 200);
            queue.clear();
            expect(queue.size).toBe(0);
        });
    });

    describe("debug", () => {
        it("returns an empty array for an empty queue", () => {
            expect(queue.debug()).toEqual([]);
        });

        it("returns events sorted by ascending time", () => {
            queue.registerEvent("Actor.a.Item.x", "c", 300);
            queue.registerEvent("Actor.a.Item.y", "a", 100);
            queue.registerEvent("Actor.a.Item.z", "b", 200);
            const sorted = queue.debug();
            expect(sorted.map((e) => e.time)).toEqual([100, 200, 300]);
        });

        it("includes uuid, kind, time, and payload in each event", () => {
            queue.registerEvent("Actor.a.Item.x", "k", 100, { x: 1 });
            const [evt] = queue.debug();
            expect(evt).toEqual({
                uuid: "Actor.a.Item.x",
                kind: "k",
                time: 100,
                payload: { x: 1 },
            });
        });
    });
});
