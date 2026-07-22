/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    phaseFields,
    durationFields,
} from "@src/document/item/foundry/temporal-fields";

describe("temporal-fields schema helpers (#481)", () => {
    it("phaseFields stamps a one-shot {Formula, Base, Date} triplet", () => {
        const f = phaseFields("onset");
        expect(Object.keys(f).sort()).toEqual(
            ["onsetDate", "onsetDurationBase", "onsetDurationFormula"].sort(),
        );
    });

    it("durationFields stamps only the {Formula, Base} interval pair (the recurrence anchor lives in the generic store, #588)", () => {
        const f = durationFields("healingCheck");
        expect(Object.keys(f).sort()).toEqual(
            ["healingCheckDurationFormula", "healingCheckDurationBase"].sort(),
        );
    });

    it("durationFields carries no bespoke last*Date anchor", () => {
        const f = durationFields("bloodLossAdvance");
        expect(Object.keys(f)).not.toContain("lastBloodLossAdvanceDate");
        expect(Object.keys(f)).toContain("bloodLossAdvanceDurationBase");
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
