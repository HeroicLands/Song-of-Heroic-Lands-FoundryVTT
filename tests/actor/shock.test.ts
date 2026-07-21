/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    SHOCK_STATE,
    SHOCK_STATUS_IDS,
    SHOCK_RETEST_MODIFIER,
    shockStateFromStatuses,
    shockStatusForLevel,
    clampShockState,
    shockStateFromIndex,
    shockIndexAdjustment,
    shockReTestOutcome,
    shockCourseHrDelta,
    comaHealingRate,
} from "@src/document/actor/logic/shock";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    STATUS_EFFECT,
} from "@src/utils/constants";

describe("shock (#550)", () => {
    describe("shockStateFromStatuses", () => {
        it("is NONE when no shock status is active", () => {
            expect(shockStateFromStatuses(new Set())).toBe(SHOCK_STATE.NONE);
            expect(shockStateFromStatuses(new Set(["prone", "bleeding"]))).toBe(
                SHOCK_STATE.NONE,
            );
        });

        it("maps each shock status to its level", () => {
            expect(shockStateFromStatuses(new Set([STATUS_EFFECT.STUN]))).toBe(
                SHOCK_STATE.STUNNED,
            );
            expect(
                shockStateFromStatuses(new Set([STATUS_EFFECT.INCAPACITATED])),
            ).toBe(SHOCK_STATE.INCAPACITATED);
            expect(
                shockStateFromStatuses(new Set([STATUS_EFFECT.UNCONSCIOUS])),
            ).toBe(SHOCK_STATE.UNCONSCIOUS);
            expect(shockStateFromStatuses(new Set([STATUS_EFFECT.DEAD]))).toBe(
                SHOCK_STATE.DEAD,
            );
        });

        it("reports the most severe when several are active", () => {
            expect(
                shockStateFromStatuses(
                    new Set([STATUS_EFFECT.STUN, STATUS_EFFECT.UNCONSCIOUS]),
                ),
            ).toBe(SHOCK_STATE.UNCONSCIOUS);
            expect(
                shockStateFromStatuses(
                    new Set([
                        STATUS_EFFECT.STUN,
                        STATUS_EFFECT.DEAD,
                        STATUS_EFFECT.INCAPACITATED,
                    ]),
                ),
            ).toBe(SHOCK_STATE.DEAD);
        });
    });

    describe("shockStatusForLevel", () => {
        it("returns null for NONE and out-of-range levels", () => {
            expect(shockStatusForLevel(SHOCK_STATE.NONE)).toBeNull();
            expect(shockStatusForLevel(99)).toBeNull();
            expect(shockStatusForLevel(-1)).toBeNull();
        });

        it("returns the status id for each shock level", () => {
            expect(shockStatusForLevel(SHOCK_STATE.STUNNED)).toBe(
                STATUS_EFFECT.STUN,
            );
            expect(shockStatusForLevel(SHOCK_STATE.DEAD)).toBe(
                STATUS_EFFECT.DEAD,
            );
        });
    });

    describe("clampShockState", () => {
        it("clamps and rounds into [NONE, DEAD]", () => {
            expect(clampShockState(-3)).toBe(SHOCK_STATE.NONE);
            expect(clampShockState(2.4)).toBe(SHOCK_STATE.INCAPACITATED);
            expect(clampShockState(9)).toBe(SHOCK_STATE.DEAD);
        });
    });

    describe("shockStateFromIndex (#555)", () => {
        it("maps the Shock State Index to a shock state", () => {
            // SSI table: <=6 None, 7 Stunned, 8 Incap, 9 Unconscious, >=10 Dead.
            expect(shockStateFromIndex(0)).toBe(SHOCK_STATE.NONE);
            expect(shockStateFromIndex(6)).toBe(SHOCK_STATE.NONE);
            expect(shockStateFromIndex(7)).toBe(SHOCK_STATE.STUNNED);
            expect(shockStateFromIndex(8)).toBe(SHOCK_STATE.INCAPACITATED);
            expect(shockStateFromIndex(9)).toBe(SHOCK_STATE.UNCONSCIOUS);
            expect(shockStateFromIndex(10)).toBe(SHOCK_STATE.DEAD);
            expect(shockStateFromIndex(15)).toBe(SHOCK_STATE.DEAD);
        });
    });

    describe("shockIndexAdjustment (#555)", () => {
        it("adjusts the SSI by the Shock test result", () => {
            // CF +2, MF +1, MS 0, CS -1.
            expect(shockIndexAdjustment(CRITICAL_FAILURE)).toBe(2);
            expect(shockIndexAdjustment(MARGINAL_FAILURE)).toBe(1);
            expect(shockIndexAdjustment(MARGINAL_SUCCESS)).toBe(0);
            expect(shockIndexAdjustment(CRITICAL_SUCCESS)).toBe(-1);
        });
    });

    describe("shockReTestOutcome (#556)", () => {
        it("critical success recovers from all shock", () => {
            expect(
                shockReTestOutcome(SHOCK_STATE.INCAPACITATED, CRITICAL_SUCCESS),
            ).toEqual({ kind: "recover" });
            expect(
                shockReTestOutcome(SHOCK_STATE.UNCONSCIOUS, CRITICAL_SUCCESS),
            ).toEqual({ kind: "recover" });
        });

        it("marginal success improves to Stunned", () => {
            expect(
                shockReTestOutcome(SHOCK_STATE.UNCONSCIOUS, MARGINAL_SUCCESS),
            ).toEqual({ kind: "improve", state: SHOCK_STATE.STUNNED });
        });

        it("marginal failure drops into Extended Shock at HR 5", () => {
            expect(
                shockReTestOutcome(SHOCK_STATE.INCAPACITATED, MARGINAL_FAILURE),
            ).toEqual({ kind: "extendedShock", hr: 5 });
            expect(
                shockReTestOutcome(SHOCK_STATE.UNCONSCIOUS, MARGINAL_FAILURE),
            ).toEqual({ kind: "extendedShock", hr: 5 });
        });

        it("critical failure: Incapacitated → Extended Shock HR 4, Unconscious → Coma", () => {
            expect(
                shockReTestOutcome(SHOCK_STATE.INCAPACITATED, CRITICAL_FAILURE),
            ).toEqual({ kind: "extendedShock", hr: 4 });
            expect(
                shockReTestOutcome(SHOCK_STATE.UNCONSCIOUS, CRITICAL_FAILURE),
            ).toEqual({ kind: "coma" });
        });
    });

    describe("shockCourseHrDelta (#556)", () => {
        it("adjusts the Healing Rate by the course-test result", () => {
            expect(shockCourseHrDelta(CRITICAL_FAILURE)).toBe(-2);
            expect(shockCourseHrDelta(MARGINAL_FAILURE)).toBe(-1);
            expect(shockCourseHrDelta(MARGINAL_SUCCESS)).toBe(1);
            expect(shockCourseHrDelta(CRITICAL_SUCCESS)).toBe(2);
        });
    });

    describe("comaHealingRate (#556)", () => {
        it("is 12 − location Shock Value − Injury Level", () => {
            expect(comaHealingRate(4, 5)).toBe(3);
            expect(comaHealingRate(0, 0)).toBe(12);
            expect(comaHealingRate(3, 3)).toBe(6);
        });
    });

    it("SHOCK_RETEST_MODIFIER is −20", () => {
        expect(SHOCK_RETEST_MODIFIER).toBe(-20);
    });

    it("SHOCK_STATUS_IDS lists exactly the four shock statuses", () => {
        expect([...SHOCK_STATUS_IDS]).toEqual([
            STATUS_EFFECT.STUN,
            STATUS_EFFECT.INCAPACITATED,
            STATUS_EFFECT.UNCONSCIOUS,
            STATUS_EFFECT.DEAD,
        ]);
    });
});
