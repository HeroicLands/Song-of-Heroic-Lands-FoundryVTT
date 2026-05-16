/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    HYDROLOGY,
    MOVEMENT_FACTOR_MODE,
    MOVEMENT_FACTOR_SCOPE,
    SURFACE_COVER,
    TOPOGRAPHY,
} from "@src/utils/constants";
import type { MovementProfile } from "./MovementProfile";

/**
 * Default movement-factor table.
 *
 * Lineages override individual factors when biology demands — a camel
 * can override the DUNES surface-cover penalty up; a snake can override
 * the WETLANDS penalty up; a fish swimming uses the AQUATIC medium and
 * never references this table. The table is the *baseline*, not the
 * truth of every creature's movement.
 *
 * For non-foot modes (mounted, flying, swimming): each medium has its
 * own profile with its own factor table. The defaults here apply to
 * terrestrial-foot only.
 */

/** A factor entry: the data shape of MovementProfile.Factor without scope/key
 * (those are the dictionary keys here). */
interface DefaultFactor {
    mode: string;
    value: number;
}

/**
 * Penalty in leagues-per-watch deducted for each topography category.
 */
export const TOPOGRAPHY_DEFAULTS: Record<string, DefaultFactor> = {
    [TOPOGRAPHY.FLAT]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [TOPOGRAPHY.GENTLE]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [TOPOGRAPHY.MODERATE]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -1 },
    [TOPOGRAPHY.STEEP]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -2 },
    [TOPOGRAPHY.EXTREME]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -3 },
    [TOPOGRAPHY.VERTICAL]: { mode: MOVEMENT_FACTOR_MODE.OVERRIDE, value: 0 },
};

/**
 * Penalty in leagues-per-watch deducted for each surface cover.
 *
 * Note: roads/tracks/trails impose no penalty — they're the baseline for
 * the "5 LPW" reference. Wilderness penalties grow with vegetation density
 * and ground hostility.
 */
export const SURFACE_COVER_DEFAULTS: Record<string, DefaultFactor> = {
    [SURFACE_COVER.PAVED_ROAD]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [SURFACE_COVER.UNPAVED_ROAD]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [SURFACE_COVER.RURAL_TRACK]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [SURFACE_COVER.WILDERNESS_TRAIL]: {
        mode: MOVEMENT_FACTOR_MODE.ADD,
        value: 0,
    },
    [SURFACE_COVER.CITY_STREET]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [SURFACE_COVER.SALT_FLAT]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    // Rulebook -1 from baseline.
    [SURFACE_COVER.GRASSLAND]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -1 },
    [SURFACE_COVER.WOODLAND]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -1 },
    [SURFACE_COVER.HEATH]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -1 },
    [SURFACE_COVER.NEEDLELEAF_FOREST]: {
        mode: MOVEMENT_FACTOR_MODE.ADD,
        value: -1,
    },
    [SURFACE_COVER.COLD_WOODLAND]: {
        mode: MOVEMENT_FACTOR_MODE.ADD,
        value: -1,
    },
    [SURFACE_COVER.ALPINE]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -1 },
    // Rulebook -2 from baseline.
    [SURFACE_COVER.MIXED_FOREST]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -2 },
    [SURFACE_COVER.DUNES]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -2 },
    [SURFACE_COVER.BARREN]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -2 },
    [SURFACE_COVER.RUINS]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -2 },
    // Rulebook -4 from baseline (essentially impassable on foot).
    [SURFACE_COVER.WETLANDS]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -4 },
};

/**
 * Hydrology factors apply on top of the ground surface — wet ground or
 * wading slows travel further. Deep water requires swimming; on a
 * terrestrial profile this overrides speed to zero.
 */
export const HYDROLOGY_DEFAULTS: Record<string, DefaultFactor> = {
    [HYDROLOGY.DRY]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [HYDROLOGY.DAMP]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: 0 },
    [HYDROLOGY.SHALLOW]: { mode: MOVEMENT_FACTOR_MODE.ADD, value: -1 },
    // On a terrestrial profile, deep water means you cannot walk through it.
    [HYDROLOGY.DEEP]: { mode: MOVEMENT_FACTOR_MODE.OVERRIDE, value: 0 },
};

/**
 * Lookup function: given a (scope, key) pair, return the default factor,
 * or undefined if no default exists. Lineage-defined factors override
 * defaults for the same (scope, key); see applyMovementFactors.
 */
export function getDefaultFactor(
    scope: string,
    key: string,
): DefaultFactor | undefined {
    switch (scope) {
        case MOVEMENT_FACTOR_SCOPE.TOPOGRAPHY:
            return TOPOGRAPHY_DEFAULTS[key];
        case MOVEMENT_FACTOR_SCOPE.SURFACE_COVER:
            return SURFACE_COVER_DEFAULTS[key];
        case MOVEMENT_FACTOR_SCOPE.HYDROLOGY:
            return HYDROLOGY_DEFAULTS[key];
        default:
            return undefined;
    }
}

/**
 * The travel context: the (scope, key) pairs describing the current
 * scene/region the moving party is traversing. Built by the runtime
 * from scene defaults + region overrides, and passed into
 * `applyMovementFactors`.
 */
export interface TravelContext {
    topography?: string;
    surfaceCover?: string;
    hydrology?: string;
    /** Vehicle drag factor, contributed by a wagon/cart if any. */
    vehicleDrag?: number;
    /** Per-creature ad-hoc factors layered on top — e.g., temporary weather. */
    extraFactors?: MovementProfile.Factor[];
}

/**
 * Apply the resolved factor stack to a base speed.
 *
 * Order of operations:
 *   1. Start with `base`.
 *   2. Sum all ADD-mode factors (including negatives — penalties).
 *   3. Multiply by the product of all MULTIPLY-mode factors.
 *   4. Apply OVERRIDE (last write wins, replaces value).
 *   5. Apply FLOOR / CEILING clamps.
 *   6. Floor at 0 (no negative speeds).
 *
 * Lineage-provided factors take precedence over the default table for the
 * same (scope, key) pair. Otherwise, defaults are applied automatically
 * when the travel context names that scope/key.
 */
export function applyMovementFactors(
    base: number,
    lineageFactors: MovementProfile.Factor[],
    context: TravelContext,
): number {
    // Index lineage factors by (scope, key) for override detection.
    const lineageMap = new Map<string, MovementProfile.Factor>();
    for (const f of lineageFactors) {
        lineageMap.set(`${f.scope}:${f.key}`, f);
    }

    // Collect the active factors by walking the context.
    const active: { mode: string; value: number }[] = [];
    const consider = (scope: string, key: string | undefined) => {
        if (!key) return;
        const lineage = lineageMap.get(`${scope}:${key}`);
        if (lineage) {
            active.push({
                mode: lineage.mode,
                value: parseFloat(lineage.textValue),
            });
            return;
        }
        const def = getDefaultFactor(scope, key);
        if (def) active.push(def);
    };
    consider(MOVEMENT_FACTOR_SCOPE.TOPOGRAPHY, context.topography);
    consider(MOVEMENT_FACTOR_SCOPE.SURFACE_COVER, context.surfaceCover);
    consider(MOVEMENT_FACTOR_SCOPE.HYDROLOGY, context.hydrology);

    // Vehicle drag is a multiplicative factor, applied after the rest.
    if (context.vehicleDrag !== undefined) {
        active.push({
            mode: MOVEMENT_FACTOR_MODE.MULTIPLY,
            value: context.vehicleDrag,
        });
    }

    // Extra ad-hoc factors (weather, encumbrance, etc.) merge in here.
    if (context.extraFactors) {
        for (const f of context.extraFactors) {
            active.push({ mode: f.mode, value: parseFloat(f.textValue) });
        }
    }

    // 1. Start with base.
    let v = base;

    // 2. Sum ADD factors.
    for (const f of active) {
        if (f.mode === MOVEMENT_FACTOR_MODE.ADD) v += f.value;
    }

    // 3. Multiply.
    for (const f of active) {
        if (f.mode === MOVEMENT_FACTOR_MODE.MULTIPLY) v *= f.value;
    }

    // 4. Override (last one wins).
    for (const f of active) {
        if (f.mode === MOVEMENT_FACTOR_MODE.OVERRIDE) v = f.value;
    }

    // 5. Floor / ceiling clamps.
    for (const f of active) {
        if (f.mode === MOVEMENT_FACTOR_MODE.FLOOR && v < f.value) v = f.value;
        if (f.mode === MOVEMENT_FACTOR_MODE.CEILING && v > f.value) v = f.value;
    }

    // 6. Never negative.
    return Math.max(0, v);
}
