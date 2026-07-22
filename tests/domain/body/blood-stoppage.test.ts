/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    BLOOD_STOPPAGE_NEXT_BONUS,
    bloodStoppageOutcome,
} from "@src/entity/body/blood-stoppage";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

describe("blood stoppage (#547)", () => {
    it("CS stops the bleeding immediately", () => {
        expect(bloodStoppageOutcome(CRITICAL_SUCCESS)).toEqual({
            kind: "stopImmediately",
            nextBonus: 0,
        });
    });

    it("MS stops the bleeding after the next advance", () => {
        expect(bloodStoppageOutcome(MARGINAL_SUCCESS)).toEqual({
            kind: "stopAfterNext",
            nextBonus: 0,
        });
    });

    it("MF continues but grants +10 to the next test", () => {
        expect(bloodStoppageOutcome(MARGINAL_FAILURE)).toEqual({
            kind: "continuePlusNext",
            nextBonus: BLOOD_STOPPAGE_NEXT_BONUS,
        });
        expect(BLOOD_STOPPAGE_NEXT_BONUS).toBe(10);
    });

    it("CF continues with no bonus", () => {
        expect(bloodStoppageOutcome(CRITICAL_FAILURE)).toEqual({
            kind: "continue",
            nextBonus: 0,
        });
    });
});
