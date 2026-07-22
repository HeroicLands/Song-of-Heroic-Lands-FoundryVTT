/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { offerReschedule } from "@src/document/item/logic/reschedule";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

describe("offerReschedule — the consent step for recurring timed effects (#579)", () => {
    afterEach(() => vi.restoreAllMocks());

    const DOC = { uuid: "Item.effect0000" } as any;

    function spies() {
        return {
            schedule: vi.spyOn((globalThis as any).sohl, "schedule"),
            unschedule: vi.spyOn((globalThis as any).sohl, "unschedule"),
        };
    }

    it("scope.reschedule === true schedules the next occurrence (no dialog)", async () => {
        const { schedule, unschedule } = spies();
        const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
        await offerReschedule(
            { skipDialog: true, scope: { reschedule: true } } as any,
            DOC,
            "healingCheck",
            500,
        );
        expect(schedule).toHaveBeenCalledWith(DOC, "healingCheck", 500);
        expect(unschedule).not.toHaveBeenCalled();
        expect(dlg).not.toHaveBeenCalled();
    });

    it("scope.reschedule === false clears the schedule (no dialog)", async () => {
        const { schedule, unschedule } = spies();
        await offerReschedule(
            { skipDialog: true, scope: { reschedule: false } } as any,
            DOC,
            "healingCheck",
            500,
        );
        expect(unschedule).toHaveBeenCalledWith(DOC, "healingCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    it("skipDialog with no scope answer defaults to No (unschedule)", async () => {
        const { schedule, unschedule } = spies();
        await offerReschedule(
            { skipDialog: true, scope: {} } as any,
            DOC,
            "courseCheck",
            42,
        );
        expect(unschedule).toHaveBeenCalledWith(DOC, "courseCheck");
        expect(schedule).not.toHaveBeenCalled();
    });

    it("interactive: a Yes on the offer dialog schedules the next occurrence", async () => {
        const { schedule, unschedule } = spies();
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        await offerReschedule(
            { skipDialog: false, scope: {} } as any,
            DOC,
            "healingCheck",
            500,
        );
        expect(schedule).toHaveBeenCalledWith(DOC, "healingCheck", 500);
        expect(unschedule).not.toHaveBeenCalled();
    });

    it("interactive: a No / dismissed dialog (default) clears the schedule", async () => {
        const { schedule, unschedule } = spies();
        // The dialog callback returns `action === "yes"`; a dismissal resolves
        // null. Either non-true result declines.
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
        await offerReschedule(
            { skipDialog: false, scope: {} } as any,
            DOC,
            "healingCheck",
            500,
        );
        expect(unschedule).toHaveBeenCalledWith(DOC, "healingCheck");
        expect(schedule).not.toHaveBeenCalled();
    });
});
