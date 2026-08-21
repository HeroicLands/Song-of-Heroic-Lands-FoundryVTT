/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { locateInText, positionOf } from "../text.mjs";

describe("locateInText", () => {
    it("locates a literal on the first line", () => {
        expect(locateInText("hello world", "world")).toEqual({
            line: 1,
            column: 7,
        });
    });

    it("counts lines from one and columns from one", () => {
        expect(locateInText("a\nb\ntarget", "target")).toEqual({
            line: 3,
            column: 1,
        });
    });

    // Repeats of one literal are otherwise indistinguishable, which is the
    // symptom the positioned-diagnostic format exists to remove.
    it("selects the requested occurrence", () => {
        const text = "x\nx\nx";
        expect(locateInText(text, "x", 1)?.line).toBe(1);
        expect(locateInText(text, "x", 2)?.line).toBe(2);
        expect(locateInText(text, "x", 3)?.line).toBe(3);
    });

    it("returns undefined when the literal is absent", () => {
        expect(locateInText("hello", "nope")).toBeUndefined();
    });

    it("returns undefined when the occurrence runs out", () => {
        expect(locateInText("x\nx", "x", 3)).toBeUndefined();
    });

    it("returns undefined for a missing needle or non-text", () => {
        expect(locateInText("hello", "")).toBeUndefined();
        expect(locateInText(undefined as never, "x")).toBeUndefined();
    });
});

describe("positionOf", () => {
    it("spreads into diagnostic fields when found", () => {
        expect({ file: "f", ...positionOf("a\nb", "b") }).toEqual({
            file: "f",
            line: 2,
            column: 1,
        });
    });

    // Dropped rather than guessed: a `1:1` default would send the reader to the
    // top of the file every time.
    it("contributes no fields at all when not found", () => {
        expect({ file: "f", ...positionOf("a", "z") }).toEqual({ file: "f" });
    });
});
