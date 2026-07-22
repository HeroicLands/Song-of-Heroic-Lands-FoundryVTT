/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    PALL_DEPTH_PER_PAL,
    PALL_LIGHT_REDUCTION,
    PALL_STATE,
    pallDepthPenalty,
    pallStrengthAt,
    pallResistState,
    pallStressGain,
    isPallFailure,
    pallCloudPenalties,
    pallRecoveryOutcome,
} from "@src/document/actor/logic/pall";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

describe("the Pall (#561)", () => {
    describe("pallDepthPenalty", () => {
        it("is 5 x total PAL and never negative", () => {
            expect(PALL_DEPTH_PER_PAL).toBe(5);
            expect(pallDepthPenalty(4)).toBe(20);
            expect(pallDepthPenalty(0)).toBe(0);
            expect(pallDepthPenalty(-3)).toBe(0);
        });
    });

    describe("pallStrengthAt", () => {
        it("reduces by 1 per 5 feet (rounding up) and by the light reduction", () => {
            expect(pallStrengthAt(10, 0)).toBe(10);
            expect(pallStrengthAt(10, 5)).toBe(9);
            expect(pallStrengthAt(10, 6)).toBe(8); // ceil(6/5) = 2
            expect(pallStrengthAt(10, 10, PALL_LIGHT_REDUCTION.DAYLIGHT)).toBe(
                6,
            );
            expect(pallStrengthAt(3, 100)).toBe(0); // clamped
        });
    });

    describe("pallResistState", () => {
        it("maps CS/MS/MF and splits the critical failure by last digit", () => {
            expect(pallResistState(CRITICAL_SUCCESS, 0)).toBe(
                PALL_STATE.IMMUNE,
            );
            expect(pallResistState(MARGINAL_SUCCESS, 3)).toBe(
                PALL_STATE.RESIST,
            );
            expect(pallResistState(MARGINAL_FAILURE, 7)).toBe(
                PALL_STATE.DISTURBED,
            );
            expect(pallResistState(CRITICAL_FAILURE, 0)).toBe(
                PALL_STATE.CATATONIC,
            );
            expect(pallResistState(CRITICAL_FAILURE, 5)).toBe(
                PALL_STATE.TERRIFIED,
            );
        });
    });

    describe("pallStressGain / isPallFailure", () => {
        it("gains +3/+2/+1 PSL at Catatonic/Terrified/Disturbed, none on success", () => {
            expect(pallStressGain(PALL_STATE.CATATONIC)).toBe(3);
            expect(pallStressGain(PALL_STATE.TERRIFIED)).toBe(2);
            expect(pallStressGain(PALL_STATE.DISTURBED)).toBe(1);
            expect(pallStressGain(PALL_STATE.RESIST)).toBe(0);
            expect(pallStressGain(PALL_STATE.IMMUNE)).toBe(0);
        });

        it("treats Disturbed and worse as failures", () => {
            expect(isPallFailure(PALL_STATE.RESIST)).toBe(false);
            expect(isPallFailure(PALL_STATE.DISTURBED)).toBe(true);
            expect(isPallFailure(PALL_STATE.CATATONIC)).toBe(true);
        });
    });

    describe("pallCloudPenalties", () => {
        it("is PSLx5 to perception/agility and PSLx10 to dodge/move/stealth", () => {
            expect(pallCloudPenalties(2)).toEqual({
                perception: 10,
                agility: 10,
                dodge: 20,
                move: 20,
                stealth: 20,
            });
            expect(pallCloudPenalties(0).move).toBe(0);
        });
    });

    describe("pallRecoveryOutcome", () => {
        it("recovers on success, falls unconscious on MF, and faces the Pall on CF", () => {
            expect(pallRecoveryOutcome(CRITICAL_SUCCESS)).toEqual({
                kind: "recover",
                pslDelta: -2,
                criticalSuccess: true,
            });
            expect(pallRecoveryOutcome(MARGINAL_SUCCESS)).toEqual({
                kind: "recover",
                pslDelta: -1,
                criticalSuccess: false,
            });
            expect(pallRecoveryOutcome(MARGINAL_FAILURE)).toEqual({
                kind: "unconscious",
                pslDelta: 0,
                criticalSuccess: false,
            });
            expect(pallRecoveryOutcome(CRITICAL_FAILURE)).toEqual({
                kind: "face",
                pslDelta: 0,
                criticalSuccess: false,
            });
        });
    });
});
