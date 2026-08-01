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

import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

/**
 * Foundry-free helpers backing the **Fate** mechanic (issue #854).
 *
 * A player may spend a Fate Point *after* a test is rolled to raise that test's
 * success level — the die is never re-rolled. These pure functions encode the
 * two decisions that drive the flow:
 *
 * 1. **Which Fate Points may be spent** on a given skill's test
 *    ({@link eligibleFateSources}, {@link fatePointsAvailable},
 *    {@link preferredFateSource}); and
 * 2. **What a rolled Fate test does** to the original test — how many success
 *    levels it adds and whether it consumes a point ({@link resolveFateOutcome}).
 *
 * Both are data-driven and side-effect-free so they unit-test without Foundry
 * and never re-implement the "is it a success?" heuristic the bug in #854 came
 * from — consumption and the level bump are keyed on the **matched rung**, not
 * `isSuccess`.
 */

/**
 * The resolved path of a Fate test, one per rung of the fate description table
 * plus the two branches of the critical-success player choice. Used to select
 * the resolved-path text shown on the fate result card.
 */
export type FatePath =
    | "loseFateNoEffect"
    | "noLossNoEffect"
    | "success"
    | "critSpend"
    | "critKeep";

/** The player's choice on a critical-success Fate test (see {@link resolveFateOutcome}). */
export type FateCritChoice = "spend" | "keep";

/** The consequence of a resolved Fate test. */
export interface FateOutcome {
    /** The resolved rung/branch (drives the fate card's path text). */
    path: FatePath;
    /** Whether a Fate Point is consumed by this outcome. */
    consumesPoint: boolean;
    /** Success levels added to the original test (0, 1, or 2). */
    levelDelta: number;
    /**
     * Whether this rung is the critical success that requires a player choice —
     * `true` only for `critSpend`/`critKeep`. When a Fate test evaluates to a
     * critical success, the caller must prompt the choice and pass it in; the
     * default (no choice) resolves to the point-spending `critSpend` branch.
     */
    requiresChoice: boolean;
}

/**
 * Resolve what a rolled Fate test does, keyed on the **matched rung** (the Fate
 * test's own success level), never on a pass/fail flag. This fixes the #854
 * "hiccup": a critical failure consumes a point (no effect), and the
 * critical-success "keep" branch does not.
 *
 * | Fate test result | consumesPoint | levelDelta |
 * | ---------------- | ------------- | ---------- |
 * | Critical Failure | yes           | +0         |
 * | Marginal Failure | no            | +0         |
 * | Marginal Success | yes           | +1         |
 * | Critical Success — spend | yes   | +2         |
 * | Critical Success — keep  | no    | +1         |
 *
 * @param fateSuccessLevel - The Fate test's evaluated success level
 *   (`CRITICAL_FAILURE` … `CRITICAL_SUCCESS`).
 * @param critChoice - On a critical success, the player's choice; defaults to
 *   `"spend"` (the +2 branch). Ignored on every other rung.
 * @returns The resolved {@link FateOutcome}.
 */
export function resolveFateOutcome(
    fateSuccessLevel: number,
    critChoice?: FateCritChoice,
): FateOutcome {
    if (fateSuccessLevel >= CRITICAL_SUCCESS) {
        return critChoice === "keep" ?
                {
                    path: "critKeep",
                    consumesPoint: false,
                    levelDelta: 1,
                    requiresChoice: true,
                }
            :   {
                    path: "critSpend",
                    consumesPoint: true,
                    levelDelta: 2,
                    requiresChoice: true,
                };
    }
    if (fateSuccessLevel >= MARGINAL_SUCCESS) {
        return {
            path: "success",
            consumesPoint: true,
            levelDelta: 1,
            requiresChoice: false,
        };
    }
    if (fateSuccessLevel <= CRITICAL_FAILURE) {
        return {
            path: "loseFateNoEffect",
            consumesPoint: true,
            levelDelta: 0,
            requiresChoice: false,
        };
    }
    return {
        path: "noLossNoEffect",
        consumesPoint: false,
        levelDelta: 0,
        requiresChoice: false,
    };
}

/**
 * A normalized projection of a Fate Mystery item, decoupling the eligibility
 * math from the live {@link sohl.document.item.logic.MysteryLogic} so it stays
 * pure and testable. The owning logic/item is carried opaquely in {@link ref}.
 *
 * @typeParam T - The opaque reference type (a Mystery logic in production).
 */
export interface FateMysteryProjection<T = unknown> {
    /** The underlying Fate Mystery (opaque here; the logic in production). */
    ref: T;
    /** The mystery's subtype (matched against the Fate subtype). */
    subType: string;
    /**
     * The associated skill's shortcode, or `null` for a **general** Fate Point
     * usable on any skill's test. A set code is **skill-specific** — usable only
     * on that skill.
     */
    assocSkillCode: string | null;
    /** Whether charges are infinite (`charges.value === null`); never decremented. */
    infinite: boolean;
    /** Finite charges remaining (ignored when {@link infinite}). */
    remaining: number;
}

/**
 * Select the Fate Mystery projections that may be spent on a test against the
 * given skill: those whose subtype is the Fate subtype, whose scope matches
 * (general `null`, or this skill's shortcode), and that still have a charge
 * available (infinite, or `remaining > 0`).
 *
 * @param projections - All Fate Mystery projections on the actor.
 * @param fateSubType - The Fate mystery subtype value (`MYSTERY_SUBTYPE.FATE`).
 * @param skillShortcode - The tested skill's shortcode.
 * @returns The eligible-and-available projections (order preserved).
 */
export function eligibleFateSources<T>(
    projections: FateMysteryProjection<T>[],
    fateSubType: string,
    skillShortcode: string,
): FateMysteryProjection<T>[] {
    return projections.filter(
        (p) =>
            p.subType === fateSubType &&
            (p.assocSkillCode == null || p.assocSkillCode === skillShortcode) &&
            (p.infinite || p.remaining > 0),
    );
}

/**
 * The total Fate Points available across a set of eligible projections —
 * `Infinity` when any source has infinite charges, else the sum of finite
 * remaining charges. Drives the "≥1 point available" gate and the count shown to
 * the player.
 *
 * @param eligible - The eligible projections (typically from
 *   {@link eligibleFateSources}).
 * @returns The available point count, or `Infinity`.
 */
export function fatePointsAvailable<T>(
    eligible: FateMysteryProjection<T>[],
): number {
    if (eligible.some((p) => p.infinite)) return Infinity;
    return eligible.reduce((sum, p) => sum + Math.max(p.remaining, 0), 0);
}

/**
 * The Fate Point to pre-select when consuming one (assist-within-consent): spend
 * the **most-restricted** eligible point first — a skill-specific point before a
 * general one, and a finite source before an infinite one — so the player's more
 * flexible points are preserved. The player may still override the pick in the
 * source dialog.
 *
 * @param eligible - The eligible projections.
 * @returns The preferred projection, or `undefined` when none are eligible.
 */
export function preferredFateSource<T>(
    eligible: FateMysteryProjection<T>[],
): FateMysteryProjection<T> | undefined {
    if (!eligible.length) return undefined;
    return [...eligible].sort((a, b) => {
        // Skill-specific (assocSkillCode set) before general (null).
        const aGeneral = a.assocSkillCode == null ? 1 : 0;
        const bGeneral = b.assocSkillCode == null ? 1 : 0;
        if (aGeneral !== bGeneral) return aGeneral - bGeneral;
        // Finite before infinite, to preserve the flexible infinite source.
        const aInfinite = a.infinite ? 1 : 0;
        const bInfinite = b.infinite ? 1 : 0;
        return aInfinite - bInfinite;
    })[0];
}
