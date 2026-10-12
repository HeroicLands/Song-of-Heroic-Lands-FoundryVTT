/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { planGrabTake, type TakePart } from "@src/entity/body/grabTake";
const hand = (
    shortcode: string,
    heldItemId: string | null = null,
    immobilized = false,
): TakePart => ({ shortcode, heldItemId, canHoldItem: true, immobilized });
describe("Take targets the struck part", () => {
    it("takes the held item and puts it in a usable empty hand", () => {
        expect(planGrabTake("left", [hand("left", "sword")], [hand("right")])).toEqual({
            itemId: "sword",
            releasePartCodes: ["left"],
            receivePartCode: "right",
        });
    });
    it("an empty struck part has no effect, even if another part holds an item", () => {
        expect(
            planGrabTake("left", [hand("left"), hand("right", "sword")], [hand("right")]),
        ).toBeUndefined();
    });
    it("releases both grips of one two-handed weapon", () => {
        expect(
            planGrabTake("left", [hand("left", "staff"), hand("right", "staff")], [hand("right")])
                ?.releasePartCodes,
        ).toEqual(["left", "right"]);
    });
    it("a full-handed taker still disarms, leaving the item on the ground", () => {
        expect(
            planGrabTake(
                "left",
                [hand("left", "sword")],
                [hand("left", "shield"), hand("right", "axe")],
            )?.receivePartCode,
        ).toBeNull();
    });
    it("an empty immobilized or unusable hand cannot receive the item", () => {
        expect(
            planGrabTake(
                "left",
                [hand("left", "sword")],
                [hand("left", null, true), { ...hand("right"), canHoldItem: false }],
            )?.receivePartCode,
        ).toBeNull();
    });
});
