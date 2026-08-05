/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import {
    BUILTIN_CALENDAR_PATHS,
    DEFAULT_CALENDAR_SHORTCODE,
    DEFAULT_CALENDAR_CONFIG,
    type BuiltinCalendarData,
} from "@src/core/foundry/builtin-calendars";

// The built-in calendars are true data files fetched at runtime, not bundled.
// There is no HTTP server in unit tests, so read each manifest path from disk
// (the same bytes `fvttFetchJson` would return) to assert their content.
const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../../..");

/** Read a shipped built-in calendar file (by its `systems/sohl/...` path). */
function readCalendar(path: string): BuiltinCalendarData {
    const rel = path.replace(/^systems\/sohl\//, "");
    return JSON.parse(readFileSync(resolve(REPO_ROOT, rel), "utf8"));
}

const CALENDARS: BuiltinCalendarData[] =
    BUILTIN_CALENDAR_PATHS.map(readCalendar);

/** Narrow a built-in calendar's config to the fields we assert on. */
function cfg(shortcode: string): any {
    return CALENDARS.find((c) => c.shortcode === shortcode)?.config;
}

describe("built-in calendars (runtime-loaded data files)", () => {
    it("manifests the Vylarian Reckoning (default, first) and the Turning Wheel", () => {
        const shortcodes = CALENDARS.map((c) => c.shortcode);
        expect(shortcodes).toContain("vylrec");
        expect(shortcodes).toContain("twheel");
        expect(shortcodes[0]).toBe("vylrec"); // default first
        expect(DEFAULT_CALENDAR_SHORTCODE).toBe("vylrec");
    });

    it("manifest paths point at the shipped calendar assets", () => {
        for (const p of BUILTIN_CALENDAR_PATHS) {
            expect(p).toMatch(/^systems\/sohl\/assets\/calendar\/.+\.json$/);
        }
    });

    it("the DEFAULT_CALENDAR_CONFIG is only a bootstrap placeholder (applied at init)", () => {
        // The real default config is fetched and applied at init; this constant
        // exists only to keep SOHLCONFIG.time well-formed before that runs.
        expect(DEFAULT_CALENDAR_CONFIG).toEqual({});
    });

    it("each built-in has a shortcode, a label, and a config", () => {
        for (const c of CALENDARS) {
            expect(c.shortcode, "shortcode")
                .to.be.a("string")
                .and.not.equal("");
            expect(c.label).toMatch(/^SOHL\./);
            expect(c.config).toBeTypeOf("object");
        }
    });

    it("both calendars are twelve 30-day months on a 360-day year", () => {
        for (const shortcode of ["vylrec", "twheel"]) {
            const c = cfg(shortcode);
            expect(c.months.values, shortcode).toHaveLength(12);
            expect(c.months.values.every((m: any) => m.days === 30)).toBe(true);
            expect(c.days.daysPerYear).toBe(360);
            expect(c.days.values).toHaveLength(10); // 10-day week
        }
    });

    it("the Vylarian Reckoning uses the VR era, year 720, no year zero", () => {
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

    it("the Turning Wheel keeps its own month/era keys (unchanged content)", () => {
        const c = cfg("twheel");
        expect(c.name).toBe("Turning Wheel");
        expect(c.era.name).toBe("SOHL.CALENDAR.DEFAULT.EraName");
        expect(c.months.values[0].name).toBe(
            "SOHL.Calendar.Default.Month.0.label",
        );
    });
});
