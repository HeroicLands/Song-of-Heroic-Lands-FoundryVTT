/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    bodyPartImpairment,
    BODY_PART_STATUS,
    BODY_PART_TIER,
} from "@src/entity/body/impairment";

/** A part with two locations, `pate` and `face`. */
const HEAD = ["pate", "face"];

/** Shorthand injury builder. */
const inj = (locationShortcode: string, level: number, healingRate = 4) => ({
    locationShortcode,
    level,
    healingRate,
});

describe("bodyPartImpairment (#464/#470)", () => {
    it("is none/usable when the part has no injuries", () => {
        expect(bodyPartImpairment(HEAD, [])).toEqual({
            impairment: 0,
            usable: true,
            tier: BODY_PART_TIER.NONE,
            status: BODY_PART_STATUS.NONE,
        });
    });

    it("ignores injuries on other parts' locations", () => {
        const r = bodyPartImpairment(HEAD, [inj("larm", 5)]);
        expect(r.tier).toBe(BODY_PART_TIER.NONE);
        expect(r.usable).toBe(true);
    });

    it("a minor injury (M1) with HR ≤ 5 → MINOR tier (−5)", () => {
        expect(bodyPartImpairment(HEAD, [inj("face", 1, 5)])).toMatchObject({
            impairment: -5,
            usable: true,
            tier: BODY_PART_TIER.MINOR,
            status: BODY_PART_STATUS.MINOR,
        });
    });

    it("a minor injury that heals fast (HR > 5) does not impair", () => {
        const r = bodyPartImpairment(HEAD, [inj("face", 1, 6)]);
        expect(r.tier).toBe(BODY_PART_TIER.NONE);
        expect(r.impairment).toBe(0);
    });

    it("a serious injury (S2/S3) → SERIOUS tier (−10, grid 'major')", () => {
        expect(bodyPartImpairment(HEAD, [inj("pate", 3)])).toMatchObject({
            impairment: -10,
            usable: true,
            tier: BODY_PART_TIER.SERIOUS,
            status: BODY_PART_STATUS.MAJOR,
        });
    });

    it("a grievous injury (G4/G5) makes the part UNUSABLE (no numeric impairment)", () => {
        const r = bodyPartImpairment(HEAD, [inj("face", 4)]);
        expect(r.usable).toBe(false);
        expect(r.impairment).toBe(0);
        expect(r.tier).toBe(BODY_PART_TIER.NONE);
        expect(r.status).toBe(BODY_PART_STATUS.UNUSABLE);
    });

    it("takes the worst of the part's injuries (does not sum)", () => {
        // A minor and a grievous → unusable wins.
        expect(
            bodyPartImpairment(HEAD, [inj("face", 1, 5), inj("pate", 5)])
                .usable,
        ).toBe(false);
        // A minor and a serious → serious (−10), not −15.
        expect(
            bodyPartImpairment(HEAD, [inj("face", 1, 5), inj("pate", 2)])
                .impairment,
        ).toBe(-10);
    });

    it("permanent impairment tiers the part but never unuses it", () => {
        // Permanent −20 with no injury → GRIEVOUS tier, still usable.
        expect(bodyPartImpairment(HEAD, [], -20)).toMatchObject({
            impairment: -20,
            usable: true,
            tier: BODY_PART_TIER.GRIEVOUS,
        });
        // Worst-of: permanent −10 dominates a milder minor injury.
        expect(bodyPartImpairment(HEAD, [inj("face", 1, 5)], -10).tier).toBe(
            BODY_PART_TIER.SERIOUS,
        );
        // A positive/NA permanent value is no impairment.
        expect(bodyPartImpairment(HEAD, [], 5).tier).toBe(BODY_PART_TIER.NONE);
    });

    it("permanentlyUnusable makes the part unusable regardless of impairment", () => {
        const r = bodyPartImpairment(HEAD, [], 0, true);
        expect(r.usable).toBe(false);
        expect(r.status).toBe(BODY_PART_STATUS.UNUSABLE);
    });
});
