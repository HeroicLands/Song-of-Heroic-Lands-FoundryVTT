/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import {
    scheduledFireAt,
    upsertScheduledAction,
    removeScheduledAction,
    armScheduledActions,
    scheduleAction,
    unscheduleAction,
    type ScheduledAction,
} from "@src/entity/event/scheduled-actions";

const entry = (
    actionName: string,
    anchor = 0,
    interval = 100,
    payload?: Record<string, unknown>,
    sceneUuid?: string,
    triggerName?: string,
    predicate?: string,
): ScheduledAction => ({
    actionName,
    anchor,
    interval,
    sceneUuid,
    payload,
    triggerName,
    predicate,
});

/** A stub queue recording scheduleAt / subscribe / unsubscribe. */
function mockQueue() {
    return {
        scheduleAt: vi.fn(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
    } as any;
}

/** A stub schedulable document with a recording `update` and an owning logic. */
function mockDoc(scheduledActions: ScheduledAction[] = []) {
    return {
        uuid: "Actor.a.Item.w",
        system: { scheduledActions },
        update: vi.fn().mockResolvedValue(undefined),
        logic: PARENT,
    };
}

/**
 * Stand-in owning logic — the parent an event-driven predicate compiles under.
 * Truthy is all the SohlEntity invariant needs; a pure context predicate never
 * dereferences it.
 */
const PARENT = {} as any;

describe("scheduled-actions — pure helpers", () => {
    it("scheduledFireAt = anchor + interval", () => {
        expect(scheduledFireAt(entry("k", 1000, 250))).toBe(1250);
    });

    it("upsert adds a new entry", () => {
        const list = upsertScheduledAction([], entry("a"));
        expect(list.map((e) => e.actionName)).toEqual(["a"]);
    });

    it("upsert replaces the entry with the same actionName (no dupes)", () => {
        const list = upsertScheduledAction(
            [entry("a", 0, 100), entry("b", 0, 100)],
            entry("a", 500, 200),
        );
        expect(list.filter((e) => e.actionName === "a")).toHaveLength(1);
        expect(list.find((e) => e.actionName === "a")).toMatchObject({
            anchor: 500,
            interval: 200,
        });
        expect(list.map((e) => e.actionName).sort()).toEqual(["a", "b"]);
    });

    it("upsert is pure (returns a new array)", () => {
        const orig = [entry("a")];
        const next = upsertScheduledAction(orig, entry("b"));
        expect(next).not.toBe(orig);
        expect(orig).toHaveLength(1);
    });

    it("remove drops the entry with actionName", () => {
        const list = removeScheduledAction([entry("a"), entry("b")], "a");
        expect(list.map((e) => e.actionName)).toEqual(["b"]);
    });

    it("remove tolerates undefined / absent", () => {
        expect(removeScheduledAction(undefined, "x")).toEqual([]);
        expect(removeScheduledAction([entry("a")], "x")).toHaveLength(1);
    });
});

describe("armScheduledActions (load-side re-arm)", () => {
    it("arms each entry into the queue at anchor + interval, with its payload", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.a",
            [entry("heal", 1000, 100, { hr: 4 }), entry("bleed", 500, 300)],
            queue,
            PARENT,
        );
        expect(queue.scheduleAt).toHaveBeenCalledTimes(2);
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.a",
            "heal",
            1100,
            { hr: 4 },
            undefined,
        );
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.a",
            "bleed",
            800,
            undefined,
            undefined,
        );
    });

    it("is a no-op for an empty / undefined schedule", () => {
        const queue = mockQueue();
        armScheduledActions("Actor.a", undefined, queue, PARENT);
        expect(queue.scheduleAt).not.toHaveBeenCalled();
    });

    it("re-arms a scene-bound entry with its sceneUuid (issue #590)", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.world",
            [entry("checkForBandits", 500, 240, undefined, "Scene.hideout")],
            queue,
            PARENT,
        );
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.world",
            "checkForBandits",
            740,
            undefined,
            "Scene.hideout",
        );
    });

    it("treats a blank sceneUuid as world-wide (undefined at the queue)", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.world",
            [entry("plague", 0, 100, undefined, "")],
            queue,
            PARENT,
        );
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.world",
            "plague",
            100,
            undefined,
            undefined,
        );
    });

    // ---- event-driven triggers (issue #622) ----

    it("arms an event-driven entry via subscribe (not scheduleAt)", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.b",
            [entry("shockReTest", 500, 0, { s: 1 }, undefined, "turnEnd")],
            queue,
            PARENT,
        );
        expect(queue.scheduleAt).not.toHaveBeenCalled();
        expect(queue.subscribe).toHaveBeenCalledTimes(1);
        expect(queue.subscribe).toHaveBeenCalledWith({
            uuid: "Actor.b",
            actionName: "shockReTest",
            triggerName: "turnEnd",
            payload: { s: 1 },
            sceneUuid: undefined,
        });
    });

    it("an explicit updateWorldTime triggerName is still time-based (scheduleAt)", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.b",
            [entry("heal", 100, 50, undefined, undefined, "updateWorldTime")],
            queue,
            PARENT,
        );
        expect(queue.subscribe).not.toHaveBeenCalled();
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.b",
            "heal",
            150,
            undefined,
            undefined,
        );
    });

    it("carries a scene binding onto an event-driven subscription", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.b",
            [entry("regionTick", 0, 0, undefined, "Scene.crypt", "turnEnd")],
            queue,
            PARENT,
        );
        expect(queue.subscribe).toHaveBeenCalledWith({
            uuid: "Actor.b",
            actionName: "regionTick",
            triggerName: "turnEnd",
            payload: undefined,
            sceneUuid: "Scene.crypt",
        });
    });

    it("arms an event entry's predicate as a compiled SafeExpression (#569)", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.b",
            [
                entry(
                    "shockReTest",
                    0,
                    0,
                    undefined,
                    undefined,
                    "turnEnd",
                    "combatant.actor.uuid === subscriberUuid",
                ),
            ],
            queue,
            PARENT,
        );
        const arg = queue.subscribe.mock.calls[0][0];
        expect(arg.predicate).toBeTruthy();
        expect(arg.predicate.source).toBe(
            "combatant.actor.uuid === subscriberUuid",
        );
        expect(typeof arg.predicate.evaluate).toBe("function");
    });

    it("arms an event entry with no predicate as unconditional (undefined)", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.b",
            [entry("shockReTest", 0, 0, undefined, undefined, "turnEnd")],
            queue,
            PARENT,
        );
        expect(queue.subscribe.mock.calls[0][0].predicate).toBeUndefined();
    });

    it("arms a mixed list — time via scheduleAt, event via subscribe", () => {
        const queue = mockQueue();
        armScheduledActions(
            "Actor.b",
            [
                entry("heal", 1000, 100),
                entry("shockReTest", 500, 0, undefined, undefined, "turnEnd"),
            ],
            queue,
            PARENT,
        );
        expect(queue.scheduleAt).toHaveBeenCalledTimes(1);
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.b",
            "heal",
            1100,
            undefined,
            undefined,
        );
        expect(queue.subscribe).toHaveBeenCalledTimes(1);
        expect(queue.subscribe).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: "shockReTest",
                triggerName: "turnEnd",
            }),
        );
    });
});

describe("scheduleAction (persist + arm)", () => {
    it("writes the whole scheduledActions array AND arms the queue", async () => {
        const queue = mockQueue();
        const doc = mockDoc([entry("existing", 0, 100)]);
        await scheduleAction(doc as any, queue, "heal", 250, { hr: 4 }, 1000);

        // Persist: whole array written, upserted, anchored at now=1000.
        const written = doc.update.mock.calls[0][0]["system.scheduledActions"];
        expect(
            written.map((e: ScheduledAction) => e.actionName).sort(),
        ).toEqual(["existing", "heal"]);
        expect(
            written.find((e: ScheduledAction) => e.actionName === "heal"),
        ).toMatchObject({ anchor: 1000, interval: 250, payload: { hr: 4 } });
        // Arm: queued at now + interval (world-wide → no scene arg).
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            doc.uuid,
            "heal",
            1250,
            { hr: 4 },
            undefined,
        );
    });

    it("re-scheduling the same action replaces (not duplicates) its entry", async () => {
        const queue = mockQueue();
        const doc = mockDoc([entry("heal", 0, 100)]);
        await scheduleAction(doc as any, queue, "heal", 500, undefined, 2000);
        const written = doc.update.mock.calls[0][0]["system.scheduledActions"];
        expect(
            written.filter((e: ScheduledAction) => e.actionName === "heal"),
        ).toHaveLength(1);
        expect(written[0]).toMatchObject({ anchor: 2000, interval: 500 });
    });

    it("persists and arms a scene-bound schedule (issue #590)", async () => {
        const queue = mockQueue();
        const doc = mockDoc();
        await scheduleAction(
            doc as any,
            queue,
            "checkForBandits",
            240,
            undefined,
            500,
            "Scene.hideout",
        );
        // Persist: the entry carries the scene binding.
        const written = doc.update.mock.calls[0][0]["system.scheduledActions"];
        expect(written[0]).toMatchObject({
            actionName: "checkForBandits",
            anchor: 500,
            interval: 240,
            sceneUuid: "Scene.hideout",
        });
        // Arm: the queue is told the scene it is bound to.
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            doc.uuid,
            "checkForBandits",
            740,
            undefined,
            "Scene.hideout",
        );
    });

    it("persists a triggerName and arms an event-driven schedule via subscribe (issue #622)", async () => {
        const queue = mockQueue();
        const doc = mockDoc();
        await scheduleAction(
            doc as any,
            queue,
            "shockReTest",
            0,
            { state: 2 },
            1000,
            undefined,
            "turnEnd",
        );
        // Persist: the entry records its trigger.
        const written = doc.update.mock.calls[0][0]["system.scheduledActions"];
        expect(written[0]).toMatchObject({
            actionName: "shockReTest",
            anchor: 1000,
            triggerName: "turnEnd",
            payload: { state: 2 },
        });
        // Arm: a live subscription, not a timed one-shot.
        expect(queue.scheduleAt).not.toHaveBeenCalled();
        expect(queue.subscribe).toHaveBeenCalledWith({
            uuid: doc.uuid,
            actionName: "shockReTest",
            triggerName: "turnEnd",
            payload: { state: 2 },
            sceneUuid: undefined,
            predicate: undefined,
        });
    });

    it("persists and arms an event-driven predicate (#569)", async () => {
        const queue = mockQueue();
        const doc = mockDoc();
        await scheduleAction(
            doc as any,
            queue,
            "shockReTest",
            0,
            undefined,
            1000,
            undefined,
            "turnEnd",
            "combatant.actor.uuid === subscriberUuid",
        );
        // Persist: the predicate source is stored on the entry.
        const written = doc.update.mock.calls[0][0]["system.scheduledActions"];
        expect(written[0].predicate).toBe(
            "combatant.actor.uuid === subscriberUuid",
        );
        // Arm: subscribe gets a compiled SafeExpression of that source.
        const arg = queue.subscribe.mock.calls[0][0];
        expect(arg.predicate.source).toBe(
            "combatant.actor.uuid === subscriberUuid",
        );
    });
});

describe("unscheduleAction (clear + unsubscribe)", () => {
    it("removes the persisted entry and unsubscribes from the queue", async () => {
        const queue = mockQueue();
        const doc = mockDoc([entry("heal"), entry("bleed")]);
        await unscheduleAction(doc as any, queue, "heal");

        const written = doc.update.mock.calls[0][0]["system.scheduledActions"];
        expect(written.map((e: ScheduledAction) => e.actionName)).toEqual([
            "bleed",
        ]);
        expect(queue.unsubscribe).toHaveBeenCalledWith(doc.uuid, "heal");
    });
});
