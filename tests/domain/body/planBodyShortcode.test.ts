/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    planBodyShortcode,
    validateBodyShortcode,
} from "@src/entity/body/planBodyShortcode";

describe("validateBodyShortcode", () => {
    it("rejects a blank shortcode", () => {
        expect(validateBodyShortcode("  ", [], "body part", "this body")).toBe(
            "Shortcode cannot be blank.",
        );
    });

    it("rejects invalid characters", () => {
        expect(
            validateBodyShortcode("left arm", [], "body part", "this body"),
        ).toMatch(/invalid/);
    });

    it("rejects a collision, naming the noun and scope", () => {
        const err = validateBodyShortcode(
            "larm",
            ["larm", "rarm"],
            "body part",
            "this body",
        );
        expect(err).toBe(
            'A body part with shortcode "larm" already exists on this body.',
        );
    });

    it("accepts a unique slug", () => {
        expect(
            validateBodyShortcode("larm", ["rarm"], "body part", "this body"),
        ).toBeUndefined();
    });
});

describe("planBodyShortcode", () => {
    const NOUN = "body location";
    const SCOPE = "this part";

    it("keeps the current shortcode unchanged when the submission matches", () => {
        const plan = planBodyShortcode("skull", "skull", ["face"], NOUN, SCOPE);
        expect(plan).toEqual({ shortcode: "skull" });
    });

    it("accepts a valid rename", () => {
        const plan = planBodyShortcode(
            "skull",
            "cranium",
            ["face"],
            NOUN,
            SCOPE,
        );
        expect(plan).toEqual({ shortcode: "cranium" });
    });

    it("refuses a colliding rename, keeping the current shortcode and reporting why", () => {
        const plan = planBodyShortcode("skull", "face", ["face"], NOUN, SCOPE);
        expect(plan.shortcode).toBe("skull");
        expect(plan.error).toMatch(/already exists on this part/);
    });

    it("refuses a blank rename, keeping the current shortcode", () => {
        const plan = planBodyShortcode("skull", "", ["face"], NOUN, SCOPE);
        expect(plan.shortcode).toBe("skull");
        expect(plan.error).toBe("Shortcode cannot be blank.");
    });

    it("trims surrounding whitespace before deciding", () => {
        const unchanged = planBodyShortcode(
            "skull",
            "  skull  ",
            ["face"],
            NOUN,
            SCOPE,
        );
        expect(unchanged).toEqual({ shortcode: "skull" });
    });
});
