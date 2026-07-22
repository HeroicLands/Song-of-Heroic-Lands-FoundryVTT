/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    WEAKNESS_FATIGUE_PER_LEVEL,
    PSYCHE_PRESENTATION,
    PSYCHE_PERMANENCE,
    weaknessFatigueForLevel,
    psychePresentation,
    psycheRecoveryOutcome,
    auralShockRecoveryOutcome,
} from "@src/document/item/logic/psyche";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

describe("psyche (#560)", () => {
    describe("weaknessFatigueForLevel", () => {
        it("is 5 Fatigue Levels per PSY/AS level (0 for non-positive)", () => {
            expect(WEAKNESS_FATIGUE_PER_LEVEL).toBe(5);
            expect(weaknessFatigueForLevel(3)).toBe(15);
            expect(weaknessFatigueForLevel(0)).toBe(0);
            expect(weaknessFatigueForLevel(-2)).toBe(0);
        });
    });

    describe("psychePresentation", () => {
        it("maps PSY to Quirk / Impulse / Disorder", () => {
            expect(psychePresentation(0)).toBe(PSYCHE_PRESENTATION.NONE);
            expect(psychePresentation(1)).toBe(PSYCHE_PRESENTATION.QUIRK);
            expect(psychePresentation(2)).toBe(PSYCHE_PRESENTATION.IMPULSE);
            expect(psychePresentation(3)).toBe(PSYCHE_PRESENTATION.DISORDER);
            expect(psychePresentation(6)).toBe(PSYCHE_PRESENTATION.DISORDER);
        });
    });

    describe("psycheRecoveryOutcome", () => {
        it("recovers on success and marks a Grievous critical failure", () => {
            expect(psycheRecoveryOutcome(CRITICAL_SUCCESS)).toEqual({
                psyDelta: -2,
                grievous: false,
            });
            expect(psycheRecoveryOutcome(MARGINAL_SUCCESS)).toEqual({
                psyDelta: -1,
                grievous: false,
            });
            expect(psycheRecoveryOutcome(MARGINAL_FAILURE)).toEqual({
                psyDelta: 0,
                grievous: false,
            });
            expect(psycheRecoveryOutcome(CRITICAL_FAILURE)).toEqual({
                psyDelta: 0,
                grievous: true,
            });
        });
    });

    describe("auralShockRecoveryOutcome", () => {
        it("recovers AS on success and grants +1 PSY on a critical failure", () => {
            expect(auralShockRecoveryOutcome(CRITICAL_SUCCESS)).toEqual({
                asDelta: -2,
                psyGain: 0,
            });
            expect(auralShockRecoveryOutcome(MARGINAL_SUCCESS)).toEqual({
                asDelta: -1,
                psyGain: 0,
            });
            expect(auralShockRecoveryOutcome(MARGINAL_FAILURE)).toEqual({
                asDelta: 0,
                psyGain: 0,
            });
            expect(auralShockRecoveryOutcome(CRITICAL_FAILURE)).toEqual({
                asDelta: 0,
                psyGain: 1,
            });
        });
    });

    describe("PSYCHE_PERMANENCE", () => {
        it("distinguishes indefinite from permanent", () => {
            expect(PSYCHE_PERMANENCE.INDEFINITE).toBe("indefinite");
            expect(PSYCHE_PERMANENCE.PERMANENT).toBe("permanent");
        });
    });
});
