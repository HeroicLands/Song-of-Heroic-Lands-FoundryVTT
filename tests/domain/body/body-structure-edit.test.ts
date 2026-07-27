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
    moveArrayElement,
    moveLocation,
    partHasLocations,
} from "@src/entity/body/body-structure-edit";

describe("moveArrayElement", () => {
    it("moves an element forward, preserving the others' order", () => {
        expect(moveArrayElement(["a", "b", "c", "d"], 0, 2)).toEqual([
            "b",
            "c",
            "a",
            "d",
        ]);
    });

    it("moves an element backward", () => {
        expect(moveArrayElement(["a", "b", "c", "d"], 3, 1)).toEqual([
            "a",
            "d",
            "b",
            "c",
        ]);
    });

    it("is a no-op copy when from === to", () => {
        const src = ["a", "b", "c"];
        const out = moveArrayElement(src, 1, 1);
        expect(out).toEqual(src);
        expect(out).not.toBe(src);
    });

    it("returns an unchanged copy when an index is out of range", () => {
        const src = ["a", "b", "c"];
        expect(moveArrayElement(src, -1, 1)).toEqual(src);
        expect(moveArrayElement(src, 0, 9)).toEqual(src);
        expect(moveArrayElement(src, 5, 0)).toEqual(src);
    });

    it("does not mutate the input array", () => {
        const src = ["a", "b", "c"];
        moveArrayElement(src, 0, 2);
        expect(src).toEqual(["a", "b", "c"]);
    });
});

describe("moveLocation", () => {
    const makeParts = () => [
        {
            shortcode: "head",
            locations: [{ shortcode: "skull" }, { shortcode: "face" }],
        },
        { shortcode: "arm", locations: [{ shortcode: "hand" }] },
    ];

    it("reorders a location within the same part", () => {
        const out = moveLocation(makeParts(), 0, 0, 0, 1);
        expect(out[0].locations.map((l) => l.shortcode)).toEqual([
            "face",
            "skull",
        ]);
        expect(out[1].locations.map((l) => l.shortcode)).toEqual(["hand"]);
    });

    it("moves a location from one part to another at the given index", () => {
        const out = moveLocation(makeParts(), 0, 0, 1, 0);
        expect(out[0].locations.map((l) => l.shortcode)).toEqual(["face"]);
        expect(out[1].locations.map((l) => l.shortcode)).toEqual([
            "skull",
            "hand",
        ]);
    });

    it("appends to the destination part when the target index is past the end", () => {
        const out = moveLocation(makeParts(), 0, 1, 1, 99);
        expect(out[1].locations.map((l) => l.shortcode)).toEqual([
            "hand",
            "face",
        ]);
    });

    it("does not mutate the input parts or their location arrays", () => {
        const src = makeParts();
        moveLocation(src, 0, 0, 1, 0);
        expect(src[0].locations.map((l) => l.shortcode)).toEqual([
            "skull",
            "face",
        ]);
        expect(src[1].locations.map((l) => l.shortcode)).toEqual(["hand"]);
    });

    it("returns an unchanged copy on an out-of-range source", () => {
        const out = moveLocation(makeParts(), 9, 0, 0, 0);
        expect(out.map((p) => p.locations.map((l) => l.shortcode))).toEqual([
            ["skull", "face"],
            ["hand"],
        ]);
    });
});

describe("partHasLocations", () => {
    const parts = [{ locations: [{ shortcode: "x" }] }, { locations: [] }];
    it("is true for a part with locations", () => {
        expect(partHasLocations(parts, 0)).toBe(true);
    });
    it("is false for an empty locations array", () => {
        expect(partHasLocations(parts, 1)).toBe(false);
    });
    it("is false for an out-of-range index", () => {
        expect(partHasLocations(parts, 9)).toBe(false);
    });
});
