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
    moraleLevelLabelKey,
} from "@src/document/actor/logic/morale";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    MORALE_LEVEL,
} from "@src/utils/constants";

describe("morale (#559)", () => {
    describe("moraleStateFromTest", () => {
        it("maps CS/MS/MF and splits the critical failure by last digit", () => {
            expect(moraleStateFromTest(CRITICAL_SUCCESS, 0)).toBe(
                MORALE_LEVEL.BRAVE,
            );
            expect(moraleStateFromTest(MARGINAL_SUCCESS, 3)).toBe(
                MORALE_LEVEL.STEADY,
            );
            expect(moraleStateFromTest(MARGINAL_FAILURE, 7)).toBe(
                MORALE_LEVEL.WITHDRAWING,
            );
            expect(moraleStateFromTest(CRITICAL_FAILURE, 0)).toBe(
                MORALE_LEVEL.CATATONIC,
            );
            expect(moraleStateFromTest(CRITICAL_FAILURE, 5)).toBe(
                MORALE_LEVEL.ROUTED,
            );
        });
    });

    describe("moralePsyGain", () => {
        it("grants +2 at Catatonic and +1 at Routed, none otherwise", () => {
            expect(moralePsyGain(MORALE_LEVEL.CATATONIC)).toBe(2);
            expect(moralePsyGain(MORALE_LEVEL.ROUTED)).toBe(1);
            expect(moralePsyGain(MORALE_LEVEL.WITHDRAWING)).toBe(0);
            expect(moralePsyGain(MORALE_LEVEL.STEADY)).toBe(0);
        });
    });

    describe("mostSevereMorale", () => {
        it("returns the highest level across sources, NONE for empty", () => {
            expect(mostSevereMorale([])).toBe(MORALE_LEVEL.NONE);
            expect(
                mostSevereMorale([
                    MORALE_LEVEL.WITHDRAWING,
                    MORALE_LEVEL.ROUTED,
                ]),
            ).toBe(MORALE_LEVEL.ROUTED);
        });
    });

    describe("state effect flags", () => {
        it("records Withdrawing and worse as shaken states", () => {
            expect(isShakenMorale(MORALE_LEVEL.STEADY)).toBe(false);
            expect(isShakenMorale(MORALE_LEVEL.WITHDRAWING)).toBe(true);
            expect(isShakenMorale(MORALE_LEVEL.ROUTED)).toBe(true);
            expect(isShakenMorale(MORALE_LEVEL.CATATONIC)).toBe(true);
        });

        it("classifies helpless / routs / withdraws per state", () => {
            expect(moraleHelpless(MORALE_LEVEL.CATATONIC)).toBe(true);
            expect(moraleHelpless(MORALE_LEVEL.ROUTED)).toBe(false);
            expect(moraleRouts(MORALE_LEVEL.ROUTED)).toBe(true);
            expect(moraleRouts(MORALE_LEVEL.CATATONIC)).toBe(false);
            expect(moraleWithdraws(MORALE_LEVEL.WITHDRAWING)).toBe(true);
            expect(moraleWithdraws(MORALE_LEVEL.ROUTED)).toBe(false);
        });
    });

    describe("reactionOutcome", () => {
        it("improves Catatonic to Routed and any other shaken to Steady on success", () => {
            expect(reactionOutcome(MORALE_LEVEL.CATATONIC, true)).toBe(
                MORALE_LEVEL.ROUTED,
            );
            expect(reactionOutcome(MORALE_LEVEL.ROUTED, true)).toBe(
                MORALE_LEVEL.STEADY,
            );
            expect(reactionOutcome(MORALE_LEVEL.WITHDRAWING, true)).toBe(
                MORALE_LEVEL.STEADY,
            );
        });

        it("leaves the state unchanged on failure", () => {
            expect(reactionOutcome(MORALE_LEVEL.ROUTED, false)).toBe(
                MORALE_LEVEL.ROUTED,
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

    describe("moraleLevelLabelKey", () => {
        it("returns a localization key per level and '' for unknown", () => {
            expect(moraleLevelLabelKey(MORALE_LEVEL.ROUTED)).toMatch(/^SOHL\./);
            expect(moraleLevelLabelKey(999)).toBe("");
        });
    });

    describe("Brave bonus constants", () => {
        it("is +20 for five minutes", () => {
            expect(MORALE_BRAVE_BONUS).toBe(20);
            expect(MORALE_BRAVE_DURATION).toBe(300);
        });
    });
});
