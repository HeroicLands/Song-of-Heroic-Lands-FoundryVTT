/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { offerSchedule, describeInterval } from "@src/document/item/logic/offer-schedule";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { globSync } from "glob";

describe("offerSchedule — the consent step for scheduling timed effects (#579)", () => {
    afterEach(() => vi.restoreAllMocks());

    const DOC = { uuid: "Item.effect0000" } as any;

    function spies() {
        return {
            schedule: vi.spyOn((globalThis as any).sohl, "schedule"),
            unschedule: vi.spyOn((globalThis as any).sohl, "unschedule"),
        };
    }

    it("scope.schedule === true schedules the occurrence (no dialog)", async () => {
        const { schedule, unschedule } = spies();
        const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
        await offerSchedule(
            { skipDialog: true, scope: { schedule: true } },
            DOC,
            "healingCheck",
            500,
        );
        expect(schedule).toHaveBeenCalledWith(DOC, "healingCheck", 500);
        expect(unschedule).not.toHaveBeenCalled();
        expect(dlg).not.toHaveBeenCalled();
    });

    it("scope.schedule === false clears any schedule (no dialog)", async () => {
        const { schedule, unschedule } = spies();
        await offerSchedule(
            { skipDialog: true, scope: { schedule: false } },
            DOC,
            "healingCheck",
            500,
        );
        expect(unschedule).toHaveBeenCalledWith(DOC, "healingCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    it("skipDialog with no scope answer takes no action beyond a safe clear", async () => {
        const { schedule, unschedule } = spies();
        await offerSchedule({ skipDialog: true, scope: {} }, DOC, "courseCheck", 42);
        expect(unschedule).toHaveBeenCalledWith(DOC, "courseCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    it("interactive: the dialog defaults to Schedule; a Yes schedules with the rolled cadence", async () => {
        const { schedule, unschedule } = spies();
        // Assert the affirmative button is the default (prefer-dialog + one-click OK).
        const dlg = vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        await offerSchedule({ skipDialog: false, scope: {} }, DOC, "healingCheck", 5 * 86400);
        expect(schedule).toHaveBeenCalledWith(DOC, "healingCheck", 5 * 86400);
        expect(unschedule).not.toHaveBeenCalled();
        const spec = (dlg.mock.calls[0] as any)[0];
        const yes = spec.buttons.find((b: any) => b.action === "yes");
        expect(yes.default, "Schedule is the default button").toBe(true);
    });

    it("describeInterval renders the cadence as a human phrase", () => {
        expect(describeInterval(5 * 86400)).toBe("5 days");
        expect(describeInterval(86400)).toBe("1 day");
        expect(describeInterval(4 * 3600)).toBe("4 hours");
        expect(describeInterval(90)).toBe("2 minutes"); // rounds
        expect(describeInterval(0)).toBe("0 seconds");
    });

    it("interactive: a declined / dismissed dialog clears any schedule", async () => {
        const { schedule, unschedule } = spies();
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
        await offerSchedule({ skipDialog: false, scope: {} }, DOC, "healingCheck", 500);
        expect(unschedule).toHaveBeenCalledWith(DOC, "healingCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    // ---- event-driven schedules (issue #622) ----

    it("event-driven: an accepted offer schedules bound to the lifecycle trigger", async () => {
        const { schedule, unschedule } = spies();
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        await offerSchedule({ skipDialog: false, scope: {} }, DOC, "shockReTest", 0, "turnEnd");
        expect(schedule).toHaveBeenCalledWith(
            DOC,
            "shockReTest",
            0,
            undefined,
            undefined,
            "turnEnd",
            undefined,
        );
        expect(unschedule).not.toHaveBeenCalled();
    });

    it("event-driven: a predicate source is threaded through to sohl.schedule (#569)", async () => {
        const { schedule } = spies();
        await offerSchedule(
            { skipDialog: true, scope: { schedule: true } },
            DOC,
            "shockReTest",
            0,
            "turnEnd",
            "combatant.actor.uuid === subscriberUuid",
        );
        expect(schedule).toHaveBeenCalledWith(
            DOC,
            "shockReTest",
            0,
            undefined,
            undefined,
            "turnEnd",
            "combatant.actor.uuid === subscriberUuid",
        );
    });

    it("event-driven: scope.schedule pre-answers without a dialog and carries the trigger", async () => {
        const { schedule } = spies();
        const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
        await offerSchedule(
            { skipDialog: true, scope: { schedule: true } },
            DOC,
            "shockReTest",
            0,
            "turnEnd",
        );
        expect(schedule).toHaveBeenCalledWith(
            DOC,
            "shockReTest",
            0,
            undefined,
            undefined,
            "turnEnd",
            undefined,
        );
        expect(dlg).not.toHaveBeenCalled();
    });

    it("event-driven: the offer uses the lifecycle prompt + cadence, not the timed one", async () => {
        vi.spyOn((globalThis as any).sohl, "schedule");
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        const fmt = vi.spyOn((globalThis as any).sohl.i18n, "format");
        await offerSchedule({ skipDialog: false, scope: {} }, DOC, "shockReTest", 0, "turnEnd");
        // The event-driven prompt key is used (no dangling "in {when}"), and the
        // cadence phrase comes from the trigger, not from describeInterval.
        const promptCall = fmt.mock.calls.find((c: any) => c[0] === "SOHL.Schedule.promptEvent");
        expect(promptCall, "uses the event prompt key").toBeTruthy();
        // Under the key-returning test i18n, the trigger phrase falls back to
        // the trigger name — the point is it is the cadence, not an interval.
        expect((promptCall as any)[1].when).toBe("turnEnd");
        expect(
            fmt.mock.calls.some((c: any) => c[0] === "SOHL.Schedule.prompt"),
            "must not use the timed prompt key",
        ).toBe(false);
    });
});

describe("offerSchedule anchoring (#1181)", () => {
    const DOC = { uuid: "Item.effect0000" } as any;

    function spies() {
        return {
            schedule: vi.spyOn((globalThis as any).sohl, "schedule"),
            unschedule: vi.spyOn((globalThis as any).sohl, "unschedule"),
        };
    }

    afterEach(() => vi.restoreAllMocks());

    it("a time-based offer without an anchor keeps the plain 3-argument shape", async () => {
        const { schedule } = spies();
        await offerSchedule(
            { skipDialog: true, scope: { schedule: true } },
            DOC,
            "healingCheck",
            500,
        );
        expect(schedule).toHaveBeenCalledWith(DOC, "healingCheck", 500);
    });

    it("threads an explicit anchor through to sohl.schedule", async () => {
        const { schedule } = spies();
        // The test performed at day 22 was DUE at day 10, so it re-anchors there
        // and the next occurrence lands on day 15 — not day 27.
        await offerSchedule(
            { skipDialog: true, scope: { schedule: true } },
            DOC,
            "healingCheck",
            5,
            undefined,
            undefined,
            10,
        );
        expect(schedule).toHaveBeenCalledWith(
            DOC,
            "healingCheck",
            5,
            undefined,
            undefined,
            undefined,
            undefined,
            10,
        );
    });

    it("a declined offer unschedules regardless of the anchor", async () => {
        const { schedule, unschedule } = spies();
        await offerSchedule(
            { skipDialog: true, scope: { schedule: false } },
            DOC,
            "healingCheck",
            5,
            undefined,
            undefined,
            10,
        );
        expect(schedule).not.toHaveBeenCalled();
        expect(unschedule).toHaveBeenCalledWith(DOC, "healingCheck");
    });
});

/**
 * #1086 — the offer dialog names the effect from
 * `SOHL.Reminder.effect.<actionName>`, a key built at runtime from the action
 * name. `npm run lint:lang-coverage` reads only concrete key literals, so three
 * Trauma recovery checks shipped with no key and the dialog showed the raw key
 * ("Set a SOHL.Reminder.effect.psycheRecovery Reminder?").
 *
 * The guard scans every `offerSchedule` call site for its action-name literal
 * and requires the matching label to exist, so a newly offered action cannot
 * reach a player as a raw key.
 */
describe("reminder labels for every offered action (#1086)", () => {
    const REPO_ROOT = resolve(__dirname, "../..");

    const LANG: Record<string, string> = JSON.parse(
        readFileSync(resolve(REPO_ROOT, "lang/en.json"), "utf8"),
    );

    /** Action names passed as `offerSchedule`'s third argument across `src/`. */
    function offeredActionNames(): string[] {
        const names = new Set<string>();
        // `offerSchedule(context, doc, "actionName", …)` — the two leading
        // arguments are simple references, so a comma-free match reaches the
        // literal without needing a parser.
        const call = /offerSchedule\(\s*[^,()]+,\s*[^,()]+,\s*"([^"]+)"/g;
        for (const file of globSync("src/**/*.ts", { cwd: REPO_ROOT })) {
            const source = readFileSync(resolve(REPO_ROOT, file), "utf8");
            for (const match of source.matchAll(call)) names.add(match[1]);
        }
        return [...names].sort();
    }

    it("finds the offer call sites it is meant to guard", () => {
        // A refactor that changes the call shape must not silently empty the
        // scan and turn this suite into a no-op.
        expect(offeredActionNames()).toContain("healingCheck");
    });

    it.each(offeredActionNames())("%s has a SOHL.Reminder.effect label", (actionName) => {
        expect(LANG[`SOHL.Reminder.effect.${actionName}`]).toBeTruthy();
    });
});
