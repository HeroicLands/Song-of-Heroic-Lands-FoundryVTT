/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    deriveHealth,
    healingBaseFor,
    physicalHealthCeiling,
    healthBand,
    HEALTH_BAND,
    type PartHealthInput,
} from "@src/document/actor/logic/health";
import { BODY_PART_TIER } from "@src/entity/body/impairment";

/** A part-health input with the given tier and options. */
const part = (
    tier: PartHealthInput["tier"],
    opts: { usable?: boolean; critical?: boolean } = {},
): PartHealthInput => ({
    tier,
    usable: opts.usable ?? true,
    critical: opts.critical ?? false,
});

const { NONE, MINOR, SERIOUS, GRIEVOUS } = BODY_PART_TIER;

describe("physicalHealthCeiling (#470)", () => {
    it("is 100 when nothing is impaired", () => {
        expect(physicalHealthCeiling([])).toBe(100);
        expect(physicalHealthCeiling([part(NONE), part(NONE)])).toBe(100);
    });

    it("reads the non-critical table by tier and count", () => {
        expect(physicalHealthCeiling([part(MINOR)])).toBe(80);
        expect(physicalHealthCeiling([part(SERIOUS), part(SERIOUS)])).toBe(20);
        expect(physicalHealthCeiling([part(GRIEVOUS)])).toBe(30); // usable, permanent
    });

    it("treats an unusable part as the UNUSABLE row regardless of tier", () => {
        // Grievous injury → tier none but usable false → unusable bucket.
        expect(physicalHealthCeiling([part(NONE, { usable: false })])).toBe(20);
    });

    it("is harsher for critical parts, and a critical unusable part is 0 (dead)", () => {
        expect(physicalHealthCeiling([part(SERIOUS, { critical: true })])).toBe(
            20,
        );
        expect(
            physicalHealthCeiling([
                part(SERIOUS, { critical: true }),
                part(SERIOUS, { critical: true }),
            ]),
        ).toBe(10);
        expect(
            physicalHealthCeiling([
                part(NONE, { usable: false, critical: true }),
            ]),
        ).toBe(0);
    });

    it("takes the minimum across all buckets", () => {
        // 2 non-critical MINOR (50%) + 1 critical SERIOUS (20%) → 20%.
        expect(
            physicalHealthCeiling([
                part(MINOR),
                part(MINOR),
                part(SERIOUS, { critical: true }),
            ]),
        ).toBe(20);
    });
});

describe("healthBand (#470)", () => {
    it.each([
        [100, HEALTH_BAND.EXCELLENT],
        [96, HEALTH_BAND.EXCELLENT],
        [95, HEALTH_BAND.GOOD],
        [80, HEALTH_BAND.GOOD],
        [79, HEALTH_BAND.FAIR],
        [60, HEALTH_BAND.FAIR],
        [59, HEALTH_BAND.POOR],
        [30, HEALTH_BAND.POOR],
        [29, HEALTH_BAND.MORBID],
        [1, HEALTH_BAND.MORBID],
        [0, HEALTH_BAND.DEAD],
    ])("value %i → %s", (value, band) => {
        expect(healthBand(value)).toBe(band);
    });
});

describe("healingBaseFor (#549)", () => {
    it("is the plain average when END equals WIL", () => {
        expect(healingBaseFor(12, 12)).toBe(12);
        expect(healingBaseFor(16, 16)).toBe(16);
    });

    it("is the plain average when it is a whole number (no rounding needed)", () => {
        expect(healingBaseFor(14, 10)).toBe(12); // avg 12, END > WIL
        expect(healingBaseFor(10, 14)).toBe(12); // avg 12, END < WIL
    });

    it("rounds a fractional average UP when END > WIL", () => {
        expect(healingBaseFor(13, 12)).toBe(13); // 12.5 → 13
        expect(healingBaseFor(15, 10)).toBe(13); // 12.5 → 13
        expect(healingBaseFor(16, 15)).toBe(16); // 15.5 → 16
    });

    it("rounds a fractional average DOWN when END < WIL", () => {
        expect(healingBaseFor(12, 13)).toBe(12); // 12.5 → 12
        expect(healingBaseFor(10, 15)).toBe(12); // 12.5 → 12
        expect(healingBaseFor(15, 16)).toBe(15); // 15.5 → 15
    });
});

describe("deriveHealth (#470)", () => {
    it("is 100/Excellent for an uninjured being (max always 100)", () => {
        expect(deriveHealth({ parts: [], dead: false })).toEqual({
            max: 100,
            value: 100,
            band: HEALTH_BAND.EXCELLENT,
        });
    });

    it("value is the physical ceiling, banded", () => {
        const h = deriveHealth({
            parts: [part(SERIOUS), part(SERIOUS)],
            dead: false,
        });
        expect(h).toEqual({ max: 100, value: 20, band: HEALTH_BAND.MORBID });
    });

    it("floors a living being at 1 even when the ceiling is 0", () => {
        // A critical unusable part → ceiling 0, but the being isn't `dead`.
        const h = deriveHealth({
            parts: [part(NONE, { usable: false, critical: true })],
            dead: false,
        });
        expect(h.value).toBe(1);
        expect(h.band).toBe(HEALTH_BAND.MORBID);
    });

    it("is 0/Dead when the being is dead", () => {
        expect(deriveHealth({ parts: [part(MINOR)], dead: true })).toEqual({
            max: 100,
            value: 0,
            band: HEALTH_BAND.DEAD,
        });
    });
});
