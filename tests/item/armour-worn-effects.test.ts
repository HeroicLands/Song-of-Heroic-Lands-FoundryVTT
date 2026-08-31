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
    PERCEPTION_SHORTCODE,
    worstPerceptionPenalty,
    perceptionPenaltyApplies,
    armHarnessEncumbrance,
    ARM_HARNESS_THRESHOLD,
    ARM_HARNESS_ENCUMBRANCE,
} from "@src/document/item/logic/worn-armour-effects";

describe("worstPerceptionPenalty", () => {
    it("is zero when nothing worn penalizes perception", () => {
        expect(worstPerceptionPenalty([])).toBe(0);
        expect(worstPerceptionPenalty([0, 0])).toBe(0);
    });

    it("takes the single penalty when only one applies", () => {
        expect(worstPerceptionPenalty([0, -5, 0])).toBe(-5);
    });

    /**
     * A great helm subsumes what a cowl does to sight and hearing rather than
     * compounding it, so the worst applies — never the sum.
     */
    it("takes the worst, not the sum", () => {
        expect(worstPerceptionPenalty([-5, -10])).toBe(-10);
        expect(worstPerceptionPenalty([-5, -5, -5])).toBe(-5);
        expect(worstPerceptionPenalty([-10, -5, -10])).toBe(-10);
    });
});

describe("perceptionPenaltyApplies", () => {
    it("applies to a skill built on perception", () => {
        expect(perceptionPenaltyApplies(["dex", PERCEPTION_SHORTCODE])).toBe(true);
    });

    it("does not apply to a skill built on other attributes", () => {
        expect(perceptionPenaltyApplies(["dex", "agl"])).toBe(false);
        expect(perceptionPenaltyApplies([])).toBe(false);
    });
});

describe("armHarnessEncumbrance", () => {
    /**
     * The rule is a threshold on the set, not a cost per piece: fewer than
     * three arm articles cost nothing, and three or more cost 5 between them
     * however many are worn.
     */
    it("costs nothing below the threshold", () => {
        expect(armHarnessEncumbrance(0)).toBe(0);
        expect(armHarnessEncumbrance(1)).toBe(0);
        expect(armHarnessEncumbrance(2)).toBe(0);
    });

    it("costs a flat 5 at the threshold and above", () => {
        expect(armHarnessEncumbrance(ARM_HARNESS_THRESHOLD)).toBe(ARM_HARNESS_ENCUMBRANCE);
        expect(armHarnessEncumbrance(4)).toBe(ARM_HARNESS_ENCUMBRANCE);
        expect(armHarnessEncumbrance(9)).toBe(ARM_HARNESS_ENCUMBRANCE);
    });

    it("never scales with the count", () => {
        const counts = [3, 4, 5, 6, 7, 8];
        const results = new Set(counts.map(armHarnessEncumbrance));
        expect(results.size).toBe(1);
    });
});
