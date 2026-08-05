/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    BUILTIN_CALENDARS,
    DEFAULT_CALENDAR_SHORTCODE,
    DEFAULT_CALENDAR_CONFIG,
} from "@src/core/foundry/builtin-calendars";

/** Narrow a built-in calendar's config to the fields we assert on. */
function cfg(shortcode: string): any {
    return BUILTIN_CALENDARS.find((c) => c.shortcode === shortcode)?.config;
}

describe("built-in calendars (hardcoded)", () => {
    it("ships only the Vylarian Reckoning, as the default", () => {
        const shortcodes = BUILTIN_CALENDARS.map((c) => c.shortcode);
        expect(shortcodes).toEqual(["vylrec"]);
        expect(DEFAULT_CALENDAR_SHORTCODE).toBe("vylrec");
    });

    it("the default calendar config is the Vylarian Reckoning", () => {
        expect((DEFAULT_CALENDAR_CONFIG as any).name).toBe(
            "Vylarian Reckoning",
        );
        expect(cfg("vylrec")).toBe(DEFAULT_CALENDAR_CONFIG);
    });

    it("each built-in has a shortcode, a label, and a config", () => {
        for (const c of BUILTIN_CALENDARS) {
            expect(c.shortcode, "shortcode")
                .to.be.a("string")
                .and.not.equal("");
            expect(c.label).toMatch(/^SOHL\./);
            expect(c.config).toBeTypeOf("object");
        }
    });

    it("is twelve 30-day months on a 360-day, 10-day-week year", () => {
        const c = cfg("vylrec");
        expect(c.months.values).toHaveLength(12);
        expect(c.months.values.every((m: any) => m.days === 30)).toBe(true);
        expect(c.days.daysPerYear).toBe(360);
        expect(c.days.values).toHaveLength(10); // 10-day week
    });

    it("uses the VR era, year 720, no year zero, with Vylarian month keys", () => {
        const c = cfg("vylrec");
        expect(c.years.yearZero).toBe(720);
        expect(c.era.hasYearZero).toBe(false);
        expect(c.era.abbrev).toBe("SOHL.CALENDAR.VYLARIAN.EraAbbr");
        expect(c.era.name).toBe("SOHL.CALENDAR.VYLARIAN.EraName");
        // Month names are the Vylarian localization keys (Floralis … Janar).
        expect(c.months.values[0].name).toBe(
            "SOHL.Calendar.Vylarian.Month.0.label",
        );
        expect(c.months.values[11].name).toBe(
            "SOHL.Calendar.Vylarian.Month.11.label",
        );
    });
});
