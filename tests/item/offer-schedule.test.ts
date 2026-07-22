/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
    offerSchedule,
    describeInterval,
} from "@src/document/item/logic/offer-schedule";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

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
        await offerSchedule(
            { skipDialog: true, scope: {} },
            DOC,
            "courseCheck",
            42,
        );
        expect(unschedule).toHaveBeenCalledWith(DOC, "courseCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    it("interactive: the dialog defaults to Schedule; a Yes schedules with the rolled cadence", async () => {
        const { schedule, unschedule } = spies();
        // Assert the affirmative button is the default (prefer-dialog + one-click OK).
        const dlg = vi
            .spyOn(FoundryHelpersMock, "dialog")
            .mockResolvedValue(true);
        await offerSchedule(
            { skipDialog: false, scope: {} },
            DOC,
            "healingCheck",
            5 * 86400,
        );
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
        await offerSchedule(
            { skipDialog: false, scope: {} },
            DOC,
            "healingCheck",
            500,
        );
        expect(unschedule).toHaveBeenCalledWith(DOC, "healingCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    // ---- event-driven schedules (issue #622) ----

    it("event-driven: an accepted offer schedules bound to the lifecycle trigger", async () => {
        const { schedule, unschedule } = spies();
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        await offerSchedule(
            { skipDialog: false, scope: {} },
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
        );
        expect(unschedule).not.toHaveBeenCalled();
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
        );
        expect(dlg).not.toHaveBeenCalled();
    });

    it("event-driven: the offer uses the lifecycle prompt + cadence, not the timed one", async () => {
        vi.spyOn((globalThis as any).sohl, "schedule");
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        const fmt = vi.spyOn((globalThis as any).sohl.i18n, "format");
        await offerSchedule(
            { skipDialog: false, scope: {} },
            DOC,
            "shockReTest",
            0,
            "turnEnd",
        );
        // The event-driven prompt key is used (no dangling "in {when}"), and the
        // cadence phrase comes from the trigger, not from describeInterval.
        const promptCall = fmt.mock.calls.find(
            (c: any) => c[0] === "SOHL.Schedule.promptEvent",
        );
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
