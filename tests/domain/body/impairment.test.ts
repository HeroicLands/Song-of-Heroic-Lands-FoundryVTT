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
} from "@src/entity/body/impairment";

/** A part with two locations, `pate` and `face`. */
const HEAD = ["pate", "face"];

/** Shorthand injury builder. */
const inj = (locationShortcode: string, level: number, healingRate = 4) => ({
    locationShortcode,
    level,
    healingRate,
});

describe("bodyPartImpairment (#464)", () => {
    it("is none when the part has no injuries", () => {
        expect(bodyPartImpairment(HEAD, [])).toEqual({
            impairment: 0,
            unusable: false,
            status: BODY_PART_STATUS.NONE,
        });
    });

    it("ignores injuries on other parts' locations", () => {
        const r = bodyPartImpairment(HEAD, [inj("larm", 5)]);
        expect(r.status).toBe(BODY_PART_STATUS.NONE);
        expect(r.unusable).toBe(false);
    });

    it("a minor injury (M1) with HR ≤ 5 impairs by −5", () => {
        const r = bodyPartImpairment(HEAD, [inj("face", 1, 5)]);
        expect(r).toMatchObject({
            impairment: -5,
            unusable: false,
            status: BODY_PART_STATUS.MINOR,
        });
    });

    it("a minor injury that heals fast (HR > 5) does not impair", () => {
        const r = bodyPartImpairment(HEAD, [inj("face", 1, 6)]);
        expect(r.status).toBe(BODY_PART_STATUS.NONE);
        expect(r.impairment).toBe(0);
    });

    it("a serious injury (S2/S3) impairs by −10 (major)", () => {
        expect(bodyPartImpairment(HEAD, [inj("face", 2)]).status).toBe(
            BODY_PART_STATUS.MAJOR,
        );
        expect(bodyPartImpairment(HEAD, [inj("pate", 3)])).toMatchObject({
            impairment: -10,
            status: BODY_PART_STATUS.MAJOR,
        });
    });

    it("a grievous injury (G4/G5) makes the part unusable", () => {
        const r = bodyPartImpairment(HEAD, [inj("face", 4)]);
        expect(r.unusable).toBe(true);
        expect(r.status).toBe(BODY_PART_STATUS.UNUSABLE);
    });

    it("takes the most serious injury across the part's locations", () => {
        // A minor on one location and a grievous on another → unusable wins.
        const r = bodyPartImpairment(HEAD, [inj("face", 1, 5), inj("pate", 5)]);
        expect(r.status).toBe(BODY_PART_STATUS.UNUSABLE);
        // A minor and a serious → serious wins.
        const r2 = bodyPartImpairment(HEAD, [
            inj("face", 1, 5),
            inj("pate", 2),
        ]);
        expect(r2.status).toBe(BODY_PART_STATUS.MAJOR);
    });

    it("applies a permanent impairment as a floor (never milder)", () => {
        // Permanent −10 with only a minor injury → still −10 (major).
        const r = bodyPartImpairment(HEAD, [inj("face", 1, 5)], -10);
        expect(r).toMatchObject({
            impairment: -10,
            status: BODY_PART_STATUS.MAJOR,
        });
        // Permanent −10 with no injury → still −10.
        expect(bodyPartImpairment(HEAD, [], -10).status).toBe(
            BODY_PART_STATUS.MAJOR,
        );
        // A worse current injury dominates a milder permanent floor.
        expect(bodyPartImpairment(HEAD, [inj("face", 4)], -5).status).toBe(
            BODY_PART_STATUS.UNUSABLE,
        );
    });

    it("treats a positive/NA permanent impairment as no floor", () => {
        expect(bodyPartImpairment(HEAD, [], 5).status).toBe(
            BODY_PART_STATUS.NONE,
        );
    });
});
