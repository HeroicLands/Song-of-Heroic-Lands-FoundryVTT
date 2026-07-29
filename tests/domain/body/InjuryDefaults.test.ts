/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { amputationOutcome } from "@src/entity/body/injury-defaults";
import {
    BLEEDING_SUSCEPTIBILITY,
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

describe("amputationOutcome", () => {
    it("critical failure severs and always bleeds; a vital limb kills", () => {
        const out = amputationOutcome(CRITICAL_FAILURE, {
            isVital: true,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.NONE,
        });
        expect(out).toEqual({
            severed: true,
            dies: true,
            bleeder: true,
            shockPenalty: 0,
        });
    });

    it("critical failure on a non-vital limb severs and bleeds but does not kill", () => {
        const out = amputationOutcome(CRITICAL_FAILURE, {
            isVital: false,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.NONE,
        });
        expect(out).toMatchObject({
            severed: true,
            dies: false,
            bleeder: true,
        });
    });

    it("marginal failure severs; bleeds only when the location can bleed", () => {
        const bleeds = amputationOutcome(MARGINAL_FAILURE, {
            isVital: false,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.HIGH,
        });
        expect(bleeds).toMatchObject({ severed: true, bleeder: true });

        const dry = amputationOutcome(MARGINAL_FAILURE, {
            isVital: false,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.NONE,
        });
        expect(dry).toMatchObject({ severed: true, bleeder: false });
    });

    it("marginal failure on a vital limb kills", () => {
        const out = amputationOutcome(MARGINAL_FAILURE, {
            isVital: true,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.LOW,
        });
        expect(out).toMatchObject({ severed: true, dies: true, bleeder: true });
    });

    it("marginal success does not sever but penalizes the shock roll by 20", () => {
        const out = amputationOutcome(MARGINAL_SUCCESS, {
            isVital: true,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.HIGH,
        });
        expect(out).toEqual({
            severed: false,
            dies: false,
            bleeder: false,
            shockPenalty: -20,
        });
    });

    it("critical success does not sever and carries no shock penalty", () => {
        const out = amputationOutcome(CRITICAL_SUCCESS, {
            isVital: true,
            bleedRisk: BLEEDING_SUSCEPTIBILITY.HIGH,
        });
        expect(out).toEqual({
            severed: false,
            dies: false,
            bleeder: false,
            shockPenalty: 0,
        });
    });
});
