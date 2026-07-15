/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    phaseFields,
    recurringPhaseFields,
} from "@src/document/item/foundry/temporal-fields";

describe("temporal-fields schema helpers (#481)", () => {
    it("phaseFields stamps a one-shot {Formula, Base, Date} triplet", () => {
        const f = phaseFields("onset");
        expect(Object.keys(f).sort()).toEqual(
            ["onsetDate", "onsetDurationBase", "onsetDurationFormula"].sort(),
        );
    });

    it("recurringPhaseFields uses a last{Name}Date anchor instead of {name}Date", () => {
        const f = recurringPhaseFields("healingCheck");
        expect(Object.keys(f).sort()).toEqual(
            [
                "healingCheckDurationFormula",
                "healingCheckDurationBase",
                "lastHealingCheckDate",
            ].sort(),
        );
    });

    it("capitalizes multi-word names correctly for the anchor key", () => {
        const f = recurringPhaseFields("bloodLossAdvance");
        expect(Object.keys(f)).toContain("lastBloodLossAdvanceDate");
    });

    it("returns constructed DataField instances", () => {
        const f = phaseFields("resolution");
        // setup.ts stubs foundry.data.fields.* as classes; every value is an
        // instance (truthy object), one per schema key.
        for (const field of Object.values(f)) {
            expect(field).toBeTypeOf("object");
            expect(field).not.toBeNull();
        }
    });
});
