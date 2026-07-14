/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { deriveHealth } from "@src/document/actor/logic/health";
import { STATUS_EFFECT } from "@src/utils/constants";

const NONE = new Set<string>();

/** Base input with the given overrides. */
const input = (over: Partial<Parameters<typeof deriveHealth>[0]> = {}) => ({
    enduranceScore: 13,
    injuryShocks: [],
    partImpairments: [],
    statuses: NONE,
    ...over,
});

describe("deriveHealth (#463)", () => {
    it("max = endurance × 3, full value when uninjured", () => {
        expect(deriveHealth(input({ enduranceScore: 13 }))).toEqual({
            max: 39,
            value: 39,
        });
    });

    it("defaults to 100/100 with no (or zero) endurance", () => {
        expect(deriveHealth(input({ enduranceScore: 0 }))).toEqual({
            max: 100,
            value: 100,
        });
    });

    it("subtracts shock × level for each injury", () => {
        // injuryShocks are already shock×level; 6 + 4 off a max of 39 → 29.
        expect(deriveHealth(input({ injuryShocks: [6, 4] })).value).toBe(29);
    });

    it("floors value at 0 when injuries exceed max", () => {
        expect(deriveHealth(input({ injuryShocks: [100] })).value).toBe(0);
    });

    it("caps at 75% of max for a part impaired ≤ −10", () => {
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100, // max 300
                    partImpairments: [{ impairment: -10, unusable: false }],
                }),
            ).value,
        ).toBe(225);
    });

    it("does not cap for a part impaired only −5", () => {
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    partImpairments: [{ impairment: -5, unusable: false }],
                }),
            ).value,
        ).toBe(300);
    });

    it("caps at 50% for an unusable part (worse than the −10 tier)", () => {
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    partImpairments: [
                        { impairment: -10, unusable: false },
                        { impairment: 0, unusable: true },
                    ],
                }),
            ).value,
        ).toBe(150);
    });

    it("caps at 25% when stunned, 10% when incapacitated or unconscious", () => {
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    statuses: new Set([STATUS_EFFECT.STUN]),
                }),
            ).value,
        ).toBe(75);
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    statuses: new Set([STATUS_EFFECT.INCAPACITATED]),
                }),
            ).value,
        ).toBe(30);
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    statuses: new Set([STATUS_EFFECT.UNCONSCIOUS]),
                }),
            ).value,
        ).toBe(30);
    });

    it("forces value to 0 when dead", () => {
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    statuses: new Set([STATUS_EFFECT.DEAD]),
                }),
            ).value,
        ).toBe(0);
    });

    it("applies the most restrictive ceiling", () => {
        // Unusable (50% → 150) and stunned (25% → 75) → 75 wins.
        expect(
            deriveHealth(
                input({
                    enduranceScore: 100,
                    partImpairments: [{ impairment: 0, unusable: true }],
                    statuses: new Set([STATUS_EFFECT.STUN]),
                }),
            ).value,
        ).toBe(75);
    });
});
