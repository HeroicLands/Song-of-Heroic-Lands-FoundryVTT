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
    DEFAULT_CALENDAR_SHORTCODE,
    resolveCalendarConfig,
} from "../../utils/packs/calendars.mjs";

// The build-time calendar loader reads the shipped `assets/calendar/`
// JSON files (the same data the runtime registers) so the content build can map
// a character's birth calendar without loading Foundry (#1039).
describe("build calendar loader", () => {
    it("defaults to the Vylarian Reckoning shortcode", () => {
        expect(DEFAULT_CALENDAR_SHORTCODE).toBe("vylrec");
    });

    it("resolves a shipped calendar's config by shortcode", () => {
        const config = resolveCalendarConfig(DEFAULT_CALENDAR_SHORTCODE) as any;
        expect(config.days.daysPerYear).toBe(360);
        expect(config.months.values).toHaveLength(12);
    });

    it("resolves the Turning Wheel calendar", () => {
        expect(resolveCalendarConfig("twheel")).toBeTruthy();
    });

    it("throws (fails the build) on an unknown shortcode", () => {
        expect(() => resolveCalendarConfig("nope")).toThrow(/Unknown calendar/);
    });
});
