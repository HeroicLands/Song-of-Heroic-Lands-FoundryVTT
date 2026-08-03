/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    MORALE_BRAVE_BONUS,
    MORALE_BRAVE_DURATION,
    RALLY_LOCKOUT_LONG,
    RALLY_LOCKOUT_SHORT,
    moraleStateFromTest,
    moralePsyGain,
    mostSevereMorale,
    isShakenMorale,
    moraleHelpless,
    moraleRouts,
    moraleWithdraws,
    reactionOutcome,
    rallyOutcome,
    moraleCategoryLabelKey,
} from "@src/document/actor/logic/morale";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    MORALE_CATEGORY,
    type MoraleCategory,
} from "@src/utils/constants";

describe("morale (#559)", () => {
    describe("moraleStateFromTest", () => {
        it("maps CS/MS/MF and splits the critical failure by last digit", () => {
            expect(moraleStateFromTest(CRITICAL_SUCCESS, 0)).toBe(
                MORALE_CATEGORY.BRAVE,
            );
            expect(moraleStateFromTest(MARGINAL_SUCCESS, 3)).toBe(
                MORALE_CATEGORY.STEADY,
            );
            expect(moraleStateFromTest(MARGINAL_FAILURE, 7)).toBe(
                MORALE_CATEGORY.WITHDRAWING,
            );
            expect(moraleStateFromTest(CRITICAL_FAILURE, 0)).toBe(
                MORALE_CATEGORY.CATATONIC,
            );
            expect(moraleStateFromTest(CRITICAL_FAILURE, 5)).toBe(
                MORALE_CATEGORY.ROUTED,
            );
        });
    });

    describe("moralePsyGain", () => {
        it("grants +2 at Catatonic and +1 at Routed, none otherwise", () => {
            expect(moralePsyGain(MORALE_CATEGORY.CATATONIC)).toBe(2);
            expect(moralePsyGain(MORALE_CATEGORY.ROUTED)).toBe(1);
            expect(moralePsyGain(MORALE_CATEGORY.WITHDRAWING)).toBe(0);
            expect(moralePsyGain(MORALE_CATEGORY.STEADY)).toBe(0);
        });
    });

    describe("mostSevereMorale", () => {
        it("returns the highest level across sources, NONE for empty", () => {
            expect(mostSevereMorale([])).toBe(MORALE_CATEGORY.NONE);
            expect(
                mostSevereMorale([
                    MORALE_CATEGORY.WITHDRAWING,
                    MORALE_CATEGORY.ROUTED,
                ]),
            ).toBe(MORALE_CATEGORY.ROUTED);
        });
    });

    describe("state effect flags", () => {
        it("records Withdrawing and worse as shaken states", () => {
            expect(isShakenMorale(MORALE_CATEGORY.STEADY)).toBe(false);
            expect(isShakenMorale(MORALE_CATEGORY.WITHDRAWING)).toBe(true);
            expect(isShakenMorale(MORALE_CATEGORY.ROUTED)).toBe(true);
            expect(isShakenMorale(MORALE_CATEGORY.CATATONIC)).toBe(true);
        });

        it("classifies helpless / routs / withdraws per state", () => {
            expect(moraleHelpless(MORALE_CATEGORY.CATATONIC)).toBe(true);
            expect(moraleHelpless(MORALE_CATEGORY.ROUTED)).toBe(false);
            expect(moraleRouts(MORALE_CATEGORY.ROUTED)).toBe(true);
            expect(moraleRouts(MORALE_CATEGORY.CATATONIC)).toBe(false);
            expect(moraleWithdraws(MORALE_CATEGORY.WITHDRAWING)).toBe(true);
            expect(moraleWithdraws(MORALE_CATEGORY.ROUTED)).toBe(false);
        });
    });

    describe("reactionOutcome", () => {
        it("improves Catatonic to Routed and any other shaken to Steady on success", () => {
            expect(reactionOutcome(MORALE_CATEGORY.CATATONIC, true)).toBe(
                MORALE_CATEGORY.ROUTED,
            );
            expect(reactionOutcome(MORALE_CATEGORY.ROUTED, true)).toBe(
                MORALE_CATEGORY.STEADY,
            );
            expect(reactionOutcome(MORALE_CATEGORY.WITHDRAWING, true)).toBe(
                MORALE_CATEGORY.STEADY,
            );
        });

        it("leaves the state unchanged on failure", () => {
            expect(reactionOutcome(MORALE_CATEGORY.ROUTED, false)).toBe(
                MORALE_CATEGORY.ROUTED,
            );
        });
    });

    describe("rallyOutcome", () => {
        it("maps CS→steady, MS→reaction, and failures→unresponsive with a lockout", () => {
            expect(rallyOutcome(CRITICAL_SUCCESS)).toEqual({ kind: "steady" });
            expect(rallyOutcome(MARGINAL_SUCCESS)).toEqual({
                kind: "reaction",
            });
            expect(rallyOutcome(MARGINAL_FAILURE)).toEqual({
                kind: "unresponsive",
                lockout: RALLY_LOCKOUT_SHORT,
            });
            expect(rallyOutcome(CRITICAL_FAILURE)).toEqual({
                kind: "unresponsive",
                lockout: RALLY_LOCKOUT_LONG,
            });
        });
    });

    describe("moraleCategoryLabelKey", () => {
        it("returns a localization key per category and '' for unknown", () => {
            expect(moraleCategoryLabelKey(MORALE_CATEGORY.ROUTED)).toMatch(
                /^SOHL\./,
            );
            expect(moraleCategoryLabelKey("bogus" as MoraleCategory)).toBe("");
        });
    });

    describe("Brave bonus constants", () => {
        it("is +20 for five minutes", () => {
            expect(MORALE_BRAVE_BONUS).toBe(20);
            expect(MORALE_BRAVE_DURATION).toBe(300);
        });
    });
});
