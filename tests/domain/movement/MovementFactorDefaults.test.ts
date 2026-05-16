/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    HYDROLOGY,
    MOVEMENT_FACTOR_MODE,
    MOVEMENT_FACTOR_SCOPE,
    SURFACE_COVER,
    TOPOGRAPHY,
} from "@src/utils/constants";
import {
    applyMovementFactors,
    type TravelContext,
} from "@src/domain/movement/MovementFactorDefaults";

/**
 * The base human walking speed under ideal conditions: 5 leagues per
 * 4-hour watch on a flat paved road. This is the rulebook's
 * "Topography: Flat / Terrain: Paved Road / Foot" cell.
 */
const HUMAN_BASE = 5;

/**
 * Rulebook trek-movement table, foot column only. Each row is
 * (topography, surfaceCover, expectedLeaguesPerWatch). These are the
 * values from the rulebook — our default factor table must reproduce
 * them when applied to HUMAN_BASE.
 */
const RULEBOOK_FOOT: Array<[string, string, number]> = [
    // Flat (rulebook's "Flat" topography → TOPOGRAPHY.FLAT)
    [TOPOGRAPHY.FLAT, SURFACE_COVER.PAVED_ROAD, 5],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.UNPAVED_ROAD, 5],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.RURAL_TRACK, 5],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.WILDERNESS_TRAIL, 5],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.GRASSLAND, 4],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.WOODLAND, 4],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.HEATH, 4],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.NEEDLELEAF_FOREST, 4],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.MIXED_FOREST, 3],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.DUNES, 3],
    [TOPOGRAPHY.FLAT, SURFACE_COVER.WETLANDS, 1],

    // Rough/Hilly (rulebook → TOPOGRAPHY.MODERATE)
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.PAVED_ROAD, 4],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.UNPAVED_ROAD, 4],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.RURAL_TRACK, 4],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.WILDERNESS_TRAIL, 4],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.GRASSLAND, 3],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.WOODLAND, 3],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.HEATH, 3],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.NEEDLELEAF_FOREST, 3],
    [TOPOGRAPHY.MODERATE, SURFACE_COVER.MIXED_FOREST, 2],

    // Mountainous (rulebook → TOPOGRAPHY.STEEP)
    [TOPOGRAPHY.STEEP, SURFACE_COVER.PAVED_ROAD, 3],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.UNPAVED_ROAD, 3],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.RURAL_TRACK, 3],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.WILDERNESS_TRAIL, 3],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.COLD_WOODLAND, 2],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.ALPINE, 2],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.NEEDLELEAF_FOREST, 2],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.BARREN, 1],
    [TOPOGRAPHY.STEEP, SURFACE_COVER.MIXED_FOREST, 1],
];

describe("MovementFactorDefaults — rulebook anchor", () => {
    describe("foot column matches rulebook trek table for HUMAN_BASE=5", () => {
        for (const [topography, surfaceCover, expected] of RULEBOOK_FOOT) {
            it(`${topography} + ${surfaceCover} → ${expected} LPW`, () => {
                const ctx: TravelContext = {
                    topography,
                    surfaceCover,
                    hydrology: HYDROLOGY.DRY,
                };
                const result = applyMovementFactors(HUMAN_BASE, [], ctx);
                expect(result).toBe(expected);
            });
        }
    });

    describe("hydrology defaults", () => {
        it("DRY adds no penalty", () => {
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.PAVED_ROAD,
                hydrology: HYDROLOGY.DRY,
            };
            expect(applyMovementFactors(5, [], ctx)).toBe(5);
        });

        it("SHALLOW adds -1 penalty", () => {
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.PAVED_ROAD,
                hydrology: HYDROLOGY.SHALLOW,
            };
            expect(applyMovementFactors(5, [], ctx)).toBe(4);
        });

        it("DEEP overrides to 0 (terrestrial cannot walk through deep water)", () => {
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.PAVED_ROAD,
                hydrology: HYDROLOGY.DEEP,
            };
            expect(applyMovementFactors(5, [], ctx)).toBe(0);
        });
    });

    describe("vehicle drag", () => {
        it("multiplicative drag factor reduces speed", () => {
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.PAVED_ROAD,
                hydrology: HYDROLOGY.DRY,
                vehicleDrag: 0.6,
            };
            expect(applyMovementFactors(5, [], ctx)).toBe(3);
        });

        it("drag stacks with terrain penalties", () => {
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.MODERATE, // -1
                surfaceCover: SURFACE_COVER.GRASSLAND, // -1
                hydrology: HYDROLOGY.DRY,
                vehicleDrag: 0.5, // half drag
            };
            // 5 - 1 - 1 = 3, then × 0.5 = 1.5
            expect(applyMovementFactors(5, [], ctx)).toBe(1.5);
        });
    });

    describe("lineage factor overrides", () => {
        it("lineage override replaces default for matching scope/key", () => {
            // A camel takes no penalty in dunes (override default of -2 with 0)
            const lineageFactors = [
                {
                    scope: MOVEMENT_FACTOR_SCOPE.SURFACE_COVER,
                    key: SURFACE_COVER.DUNES,
                    mode: MOVEMENT_FACTOR_MODE.ADD,
                    textValue: "0",
                },
            ];
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.DUNES,
                hydrology: HYDROLOGY.DRY,
            };
            // Default would give 5 - 2 = 3 (camel's 8 LPW base would be 6).
            // Camel overrides DUNES penalty to 0, so 5 - 0 = 5.
            expect(applyMovementFactors(5, lineageFactors, ctx)).toBe(5);
        });

        it("lineage factors don't affect unrelated terrain", () => {
            const lineageFactors = [
                {
                    scope: MOVEMENT_FACTOR_SCOPE.SURFACE_COVER,
                    key: SURFACE_COVER.DUNES,
                    mode: MOVEMENT_FACTOR_MODE.ADD,
                    textValue: "0",
                },
            ];
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.MIXED_FOREST,
                hydrology: HYDROLOGY.DRY,
            };
            // Mixed forest still uses default (-2): 5 - 2 = 3.
            expect(applyMovementFactors(5, lineageFactors, ctx)).toBe(3);
        });
    });

    describe("clamping", () => {
        it("never returns a negative speed", () => {
            const lineageFactors = [
                {
                    scope: MOVEMENT_FACTOR_SCOPE.SURFACE_COVER,
                    key: SURFACE_COVER.WETLANDS,
                    mode: MOVEMENT_FACTOR_MODE.ADD,
                    textValue: "-100",
                },
            ];
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.FLAT,
                surfaceCover: SURFACE_COVER.WETLANDS,
                hydrology: HYDROLOGY.DRY,
            };
            expect(applyMovementFactors(5, lineageFactors, ctx)).toBe(0);
        });

        it("VERTICAL topography overrides to 0", () => {
            const ctx: TravelContext = {
                topography: TOPOGRAPHY.VERTICAL,
                surfaceCover: SURFACE_COVER.PAVED_ROAD,
                hydrology: HYDROLOGY.DRY,
            };
            expect(applyMovementFactors(5, [], ctx)).toBe(0);
        });
    });
});
