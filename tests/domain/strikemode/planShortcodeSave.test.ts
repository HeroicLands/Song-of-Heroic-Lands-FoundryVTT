/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    planShortcodeSave,
    uniqueShortcode,
} from "@src/entity/strikemode/planShortcodeSave";

describe("planShortcodeSave", () => {
    // Siblings = the weapon's OTHER strike modes (the edited one excluded).
    const siblings = ["thrust", "pommel"];

    it("accepts an unchanged shortcode", () => {
        const plan = planShortcodeSave("cut", "cut", siblings);
        expect(plan).toEqual({ shortcode: "cut" });
    });

    it("trims whitespace before comparing to the current shortcode", () => {
        const plan = planShortcodeSave("cut", "  cut  ", siblings);
        expect(plan.shortcode).toBe("cut");
        expect(plan.error).toBeUndefined();
    });

    it("accepts a new, unique shortcode", () => {
        const plan = planShortcodeSave("cut", "slash", siblings);
        expect(plan).toEqual({ shortcode: "slash" });
    });

    it("trims a new shortcode before adopting it", () => {
        const plan = planShortcodeSave("cut", "  slash ", siblings);
        expect(plan.shortcode).toBe("slash");
        expect(plan.error).toBeUndefined();
    });

    it("rejects a blank shortcode and keeps the current one", () => {
        const plan = planShortcodeSave("cut", "   ", siblings);
        expect(plan.shortcode).toBe("cut");
        expect(plan.error).toMatch(/blank/i);
    });

    it("rejects a shortcode that collides with a sibling", () => {
        const plan = planShortcodeSave("cut", "thrust", siblings);
        expect(plan.shortcode).toBe("cut");
        expect(plan.error).toMatch(/already exists/i);
    });

    it("rejects shortcodes containing dot-path magic characters", () => {
        const plan = planShortcodeSave("cut", "a.b", siblings);
        expect(plan.shortcode).toBe("cut");
        expect(plan.error).toMatch(/invalid/i);
    });

    it("accepts letters, numbers, underscores, and dashes", () => {
        for (const sc of ["Slash_2", "back-hand", "AB12"]) {
            const plan = planShortcodeSave("cut", sc, siblings);
            expect(plan.shortcode).toBe(sc);
            expect(plan.error).toBeUndefined();
        }
    });
});

describe("uniqueShortcode", () => {
    it("slugs the base and returns it when free", () => {
        expect(uniqueShortcode("Broadsword", [])).toBe("broadsword");
    });

    it("strips characters outside [\\w-]", () => {
        expect(uniqueShortcode("Ball & Chain", [])).toBe("ballchain");
    });

    it("falls back to 'mode' when nothing survives slugging", () => {
        expect(uniqueShortcode("!!!", [])).toBe("mode");
    });

    it("appends an incrementing suffix to avoid collisions", () => {
        expect(uniqueShortcode("sword", ["sword"])).toBe("sword2");
        expect(uniqueShortcode("sword", ["sword", "sword2"])).toBe("sword3");
    });
});
