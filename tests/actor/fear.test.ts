/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    FEAR_BRAVE_BONUS,
    FEAR_BRAVE_DURATION,
    FEAR_AFRAID_CLEAR,
    FEAR_TERRIFIED_CLEAR,
    fearStateFromTest,
    fearPsyGain,
    mostSevereFear,
    isFearfulState,
    fearDefenseRestricted,
    fearHelpless,
    fearMustFlee,
    fearClearDuration,
    fearLevelLabelKey,
} from "@src/document/actor/logic/fear";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    FEAR_LEVEL,
} from "@src/utils/constants";

describe("fear (#558)", () => {
    describe("fearStateFromTest", () => {
        it("maps a Critical Success to Brave", () => {
            expect(fearStateFromTest(CRITICAL_SUCCESS, 5)).toBe(
                FEAR_LEVEL.BRAVE,
            );
            expect(fearStateFromTest(CRITICAL_SUCCESS, 0)).toBe(
                FEAR_LEVEL.BRAVE,
            );
        });

        it("maps a Marginal Success to Steady", () => {
            expect(fearStateFromTest(MARGINAL_SUCCESS, 3)).toBe(
                FEAR_LEVEL.STEADY,
            );
        });

        it("maps a Marginal Failure to Afraid", () => {
            expect(fearStateFromTest(MARGINAL_FAILURE, 7)).toBe(
                FEAR_LEVEL.AFRAID,
            );
        });

        it("splits the critical failure by last digit — CF0 is Catatonic, CF5 Terrified", () => {
            expect(fearStateFromTest(CRITICAL_FAILURE, 0)).toBe(
                FEAR_LEVEL.CATATONIC,
            );
            expect(fearStateFromTest(CRITICAL_FAILURE, 5)).toBe(
                FEAR_LEVEL.TERRIFIED,
            );
        });
    });

    describe("fearPsyGain", () => {
        it("grants +2 PSY at Catatonic and +1 at Terrified, none otherwise", () => {
            expect(fearPsyGain(FEAR_LEVEL.CATATONIC)).toBe(2);
            expect(fearPsyGain(FEAR_LEVEL.TERRIFIED)).toBe(1);
            expect(fearPsyGain(FEAR_LEVEL.AFRAID)).toBe(0);
            expect(fearPsyGain(FEAR_LEVEL.STEADY)).toBe(0);
            expect(fearPsyGain(FEAR_LEVEL.BRAVE)).toBe(0);
        });
    });

    describe("mostSevereFear", () => {
        it("is NONE for no sources", () => {
            expect(mostSevereFear([])).toBe(FEAR_LEVEL.NONE);
        });

        it("returns the highest (most-failed) level across sources", () => {
            expect(
                mostSevereFear([
                    FEAR_LEVEL.AFRAID,
                    FEAR_LEVEL.CATATONIC,
                    FEAR_LEVEL.STEADY,
                ]),
            ).toBe(FEAR_LEVEL.CATATONIC);
        });
    });

    describe("state effect flags", () => {
        it("records Afraid and worse as fearful states", () => {
            expect(isFearfulState(FEAR_LEVEL.NONE)).toBe(false);
            expect(isFearfulState(FEAR_LEVEL.STEADY)).toBe(false);
            expect(isFearfulState(FEAR_LEVEL.AFRAID)).toBe(true);
            expect(isFearfulState(FEAR_LEVEL.TERRIFIED)).toBe(true);
            expect(isFearfulState(FEAR_LEVEL.CATATONIC)).toBe(true);
        });

        it("restricts defense to Block/Dodge only while Afraid or Terrified", () => {
            expect(fearDefenseRestricted(FEAR_LEVEL.AFRAID)).toBe(true);
            expect(fearDefenseRestricted(FEAR_LEVEL.TERRIFIED)).toBe(true);
            // Catatonic is Helpless, not merely defense-restricted.
            expect(fearDefenseRestricted(FEAR_LEVEL.CATATONIC)).toBe(false);
            expect(fearDefenseRestricted(FEAR_LEVEL.STEADY)).toBe(false);
        });

        it("marks only Catatonic as Helpless", () => {
            expect(fearHelpless(FEAR_LEVEL.CATATONIC)).toBe(true);
            expect(fearHelpless(FEAR_LEVEL.TERRIFIED)).toBe(false);
        });

        it("makes Afraid and Terrified victims flee", () => {
            expect(fearMustFlee(FEAR_LEVEL.AFRAID)).toBe(true);
            expect(fearMustFlee(FEAR_LEVEL.TERRIFIED)).toBe(true);
            expect(fearMustFlee(FEAR_LEVEL.CATATONIC)).toBe(false);
            expect(fearMustFlee(FEAR_LEVEL.STEADY)).toBe(false);
        });

        it("gives the clear-of-source duration per state", () => {
            expect(fearClearDuration(FEAR_LEVEL.TERRIFIED)).toBe(
                FEAR_TERRIFIED_CLEAR,
            );
            expect(fearClearDuration(FEAR_LEVEL.AFRAID)).toBe(
                FEAR_AFRAID_CLEAR,
            );
            expect(fearClearDuration(FEAR_LEVEL.CATATONIC)).toBeUndefined();
            expect(fearClearDuration(FEAR_LEVEL.STEADY)).toBeUndefined();
        });
    });

    describe("fearLevelLabelKey", () => {
        it("returns a localization key for each level and '' for unknown", () => {
            expect(fearLevelLabelKey(FEAR_LEVEL.CATATONIC)).toMatch(/^SOHL\./);
            expect(fearLevelLabelKey(FEAR_LEVEL.BRAVE)).toMatch(/^SOHL\./);
            expect(fearLevelLabelKey(999)).toBe("");
        });
    });

    describe("Brave bonus constants", () => {
        it("is +20 for five minutes", () => {
            expect(FEAR_BRAVE_BONUS).toBe(20);
            expect(FEAR_BRAVE_DURATION).toBe(300);
        });
    });
});
