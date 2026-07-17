/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    buildCalendarViewModel,
    type CalendarRegEntry,
} from "@src/apps/logic/calendar-settings-view";

const upper = (key: string) => key.toUpperCase();

const registry: [string, CalendarRegEntry][] = [
    ["greg", { label: "greg", builtin: true }],
    ["harn", { label: "harn", builtin: true }],
    ["custom", { label: "custom", builtin: false }],
];

describe("calendar-settings-view", () => {
    describe("buildCalendarViewModel", () => {
        it("builds a dropdown row per calendar, localizing labels", () => {
            const { calendars } = buildCalendarViewModel(
                registry,
                "harn",
                upper,
            );
            expect(calendars).toEqual([
                { id: "greg", label: "GREG", active: false },
                { id: "harn", label: "HARN", active: true },
                { id: "custom", label: "CUSTOM", active: false },
            ]);
        });

        it("lists only non-builtin calendars as imported", () => {
            const { imported } = buildCalendarViewModel(
                registry,
                "greg",
                upper,
            );
            expect(imported).toEqual([{ id: "custom", label: "CUSTOM" }]);
        });

        it("marks no row active when the active id is unknown", () => {
            const { calendars } = buildCalendarViewModel(
                registry,
                "none",
                upper,
            );
            expect(calendars.some((c) => c.active)).toBe(false);
        });

        it("returns empty lists for an empty registry", () => {
            const vm = buildCalendarViewModel([], "x", upper);
            expect(vm).toEqual({ calendars: [], imported: [] });
        });
    });
});
