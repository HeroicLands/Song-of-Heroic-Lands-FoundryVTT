/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const port = vi.hoisted(() => ({ dialog: vi.fn(), now: 177, picker: vi.fn() }));
vi.mock("@src/core/FoundryHelpers", () => ({ dialog: port.dialog, fvttWorldTime: () => port.now }));
import { openDatePickerDialog } from "@src/apps/foundry/date-picker-dialog";
const calendar = new (foundry as any).data.CalendarData({
    name: "Picker test",
    years: { yearZero: 1000, firstWeekday: 0 },
    months: {
        values: [
            { name: "One", abbreviation: "O", ordinal: 1, days: 31 },
            { name: "Two", abbreviation: "T", ordinal: 2, days: 28 },
        ],
    },
    days: {
        values: [],
        daysPerYear: 59,
        hoursPerDay: 24,
        minutesPerHour: 60,
        secondsPerMinute: 60,
    },
    seasons: { values: [] },
});
const originalCalendar = (globalThis as any).sohl.calendar;
afterEach(() => {
    (globalThis as any).sohl.calendar = originalCalendar;
    vi.unstubAllGlobals();
});
beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("game", { modules: new Map([["calendaria", { active: true }]]) });
    vi.stubGlobal("CALENDARIA", { api: { showDatePicker: port.picker } });
    (globalThis as any).sohl.calendar = calendar;
    port.dialog.mockResolvedValue({ action: "pick" });
});
describe("optional date picker boundary", () => {
    it("offers the native editor while Calendaria is active", async () => {
        port.dialog
            .mockResolvedValueOnce({ action: "basic" })
            .mockResolvedValueOnce({ action: "set", worldTime: 12345 });
        expect(await openDatePickerDialog(29)).toBe(12345);
        expect(port.picker).not.toHaveBeenCalled();
        expect(port.dialog.mock.calls[0]![0].buttons.map((b: any) => b.action)).toEqual([
            "pick",
            "basic",
            "now",
            "clear",
            "cancel",
        ]);
        expect(port.dialog.mock.calls[1]![0].buttons.map((b: any) => b.action)).toEqual([
            "set",
            "now",
            "clear",
            "cancel",
        ]);
    });

    it("an unavailable picker falls back to the native editor", async () => {
        port.picker.mockRejectedValue(new Error("API unavailable"));
        port.dialog
            .mockResolvedValueOnce({ action: "pick" })
            .mockResolvedValueOnce({ action: "clear", worldTime: null });
        const warning = vi.spyOn(sohl.log, "warn").mockImplementation(() => undefined);
        try {
            expect(await openDatePickerDialog(29)).toBeNull();
            expect(port.dialog).toHaveBeenCalledTimes(2);
            expect(warning).toHaveBeenCalledTimes(1);
        } finally {
            warning.mockRestore();
        }
    });

    it("calls the public picker, preserving seconds and display-year conversion", async () => {
        port.picker.mockResolvedValue({ year: 1000, month: 2, day: 4, hour: 6, minute: 7 });
        expect(await openDatePickerDialog(29)).toBe((31 + 3) * 86400 + 6 * 3600 + 7 * 60 + 29);
        expect(port.picker).toHaveBeenCalledWith(
            expect.objectContaining({
                date: { year: 1000, month: 1, day: 1, hour: 0, minute: 0 },
                showTime: true,
            }),
        );
    });
    it.each(["now", "clear", "cancel"])(
        "retains the %s action without invoking the module",
        async (action) => {
            port.dialog.mockResolvedValue({ action });
            expect(await openDatePickerDialog(29)).toBe(
                action === "now" ? 177
                : action === "clear" ? null
                : undefined,
            );
            expect(port.picker).not.toHaveBeenCalled();
        },
    );
    it("maps external cancellation to no update rather than clear", async () => {
        port.picker.mockResolvedValue(null);
        expect(await openDatePickerDialog(29)).toBeUndefined();
    });
    it.each(["inactive", "missing-api"])(
        "uses native picker when integration is %s",
        async (state) => {
            if (state === "inactive")
                vi.stubGlobal("game", { modules: new Map([["calendaria", { active: false }]]) });
            else vi.stubGlobal("CALENDARIA", {});
            port.dialog.mockResolvedValue({ action: "clear", worldTime: null });
            expect(await openDatePickerDialog(29)).toBeNull();
            expect(port.picker).not.toHaveBeenCalled();
            expect(port.dialog.mock.lastCall?.[0].buttons.map((b: any) => b.action)).toEqual([
                "set",
                "now",
                "clear",
                "cancel",
            ]);
        },
    );
    it("an invalid external selection opens the native editor without writing a bad date", async () => {
        port.picker.mockResolvedValue({ year: 1000, month: 2, day: 31 });
        port.dialog
            .mockResolvedValueOnce({ action: "pick" })
            .mockResolvedValueOnce({ action: "cancel", worldTime: undefined });
        expect(await openDatePickerDialog(29)).toBeUndefined();
        expect(port.dialog).toHaveBeenCalledTimes(2);
    });
});
