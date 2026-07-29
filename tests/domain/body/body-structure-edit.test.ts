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
    countGroupMembers,
    moveArrayElement,
    moveGroupedElement,
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

describe("moveGroupedElement", () => {
    /** A flat locations array across two parts: head[skull, face], arm[hand]. */
    const makeLocs = () => [
        { shortcode: "skull", bodyPartCode: "head" },
        { shortcode: "face", bodyPartCode: "head" },
        { shortcode: "hand", bodyPartCode: "arm" },
    ];
    const move = (
        items: { shortcode: string; bodyPartCode: string }[],
        from: number,
        group: string,
        pos: number,
    ) =>
        moveGroupedElement(
            items,
            from,
            group,
            pos,
            (l) => l.bodyPartCode,
            (l, bodyPartCode) => ({ ...l, bodyPartCode }),
        );

    it("reorders an element within its own group", () => {
        expect(move(makeLocs(), 0, "head", 1).map((l) => l.shortcode)).toEqual([
            "face",
            "skull",
            "hand",
        ]);
    });

    it("re-parents an element to another group at the given position", () => {
        const out = move(makeLocs(), 0, "arm", 0);
        expect(out.map((l) => l.shortcode)).toEqual(["face", "skull", "hand"]);
        expect(out.find((l) => l.shortcode === "skull")!.bodyPartCode).toBe(
            "arm",
        );
    });

    it("inserts after the group's last member when the position is past the end", () => {
        const out = move(makeLocs(), 1, "arm", 99);
        expect(out.map((l) => l.shortcode)).toEqual(["skull", "hand", "face"]);
        expect(out[2].bodyPartCode).toBe("arm");
    });

    it("appends to the end of the array when the destination group is empty", () => {
        const out = move(makeLocs(), 2, "tail", 0);
        expect(out.map((l) => l.shortcode)).toEqual(["skull", "face", "hand"]);
        expect(out[2].bodyPartCode).toBe("tail");
    });

    it("clamps a negative position to the group's first slot", () => {
        expect(move(makeLocs(), 2, "head", -5).map((l) => l.shortcode)).toEqual(
            ["hand", "skull", "face"],
        );
    });

    it("leaves the parent code untouched on a same-group move", () => {
        const out = move(makeLocs(), 0, "head", 1);
        expect(
            out.every(
                (l) =>
                    l.bodyPartCode ===
                    makeLocs().find((s) => s.shortcode === l.shortcode)!
                        .bodyPartCode,
            ),
        ).toBe(true);
    });

    it("returns an unchanged copy on an out-of-range source", () => {
        const src = makeLocs();
        expect(move(src, 9, "head", 0)).toEqual(src);
        expect(move(src, -1, "head", 0)).toEqual(src);
    });

    it("does not mutate the input array or its elements", () => {
        const src = makeLocs();
        move(src, 0, "arm", 0);
        expect(src.map((l) => l.shortcode)).toEqual(["skull", "face", "hand"]);
        expect(src[0].bodyPartCode).toBe("head");
    });
});

describe("countGroupMembers", () => {
    const locs = [
        { bodyPartCode: "head" },
        { bodyPartCode: "head" },
        { bodyPartCode: "arm" },
    ];
    const by = (l: { bodyPartCode: string }) => l.bodyPartCode;

    it("counts the children of a parent", () => {
        expect(countGroupMembers(locs, "head", by)).toBe(2);
        expect(countGroupMembers(locs, "arm", by)).toBe(1);
    });

    it("is 0 for a parent with no children", () => {
        expect(countGroupMembers(locs, "tail", by)).toBe(0);
    });
});
