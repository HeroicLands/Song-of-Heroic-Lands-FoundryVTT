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
): ScheduledAction => ({ actionName, anchor, interval, payload });

/** A stub queue recording scheduleAt / unsubscribe. */
function mockQueue() {
    return { scheduleAt: vi.fn(), unsubscribe: vi.fn() } as any;
}

/** A stub schedulable document with a recording `update`. */
function mockDoc(scheduledActions: ScheduledAction[] = []) {
    return {
        uuid: "Actor.a.Item.w",
        system: { scheduledActions },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

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
        );
        expect(queue.scheduleAt).toHaveBeenCalledTimes(2);
        expect(queue.scheduleAt).toHaveBeenCalledWith("Actor.a", "heal", 1100, {
            hr: 4,
        });
        expect(queue.scheduleAt).toHaveBeenCalledWith(
            "Actor.a",
            "bleed",
            800,
            undefined,
        );
    });

    it("is a no-op for an empty / undefined schedule", () => {
        const queue = mockQueue();
        armScheduledActions("Actor.a", undefined, queue);
        expect(queue.scheduleAt).not.toHaveBeenCalled();
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
        // Arm: queued at now + interval.
        expect(queue.scheduleAt).toHaveBeenCalledWith(doc.uuid, "heal", 1250, {
            hr: 4,
        });
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
