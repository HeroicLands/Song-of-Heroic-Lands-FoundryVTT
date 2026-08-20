/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import {
    resolveCharges,
    // eslint-disable-next-line
} from "../engine/helpers.mjs";

describe("resolveCharges (pack builder — a blank maximum means 'does not use charges', #1129)", () => {
    it("yields a null max when the frontmatter declares no charges block", () => {
        expect(resolveCharges({ sohl: {} })).toEqual({
            value: null,
            max: null,
        });
    });

    it("yields a null max when the maximum is explicitly null", () => {
        expect(
            resolveCharges({ sohl: { charges: { value: null, max: null } } }),
        ).toEqual({ value: null, max: null });
    });

    it("keeps a declared finite maximum and current value", () => {
        expect(
            resolveCharges({ sohl: { charges: { value: 3, max: 5 } } }),
        ).toEqual({ value: 3, max: 5 });
    });

    it("keeps a zero maximum, which means 'counted but uncapped'", () => {
        expect(
            resolveCharges({ sohl: { charges: { value: 2, max: 0 } } }),
        ).toEqual({ value: 2, max: 0 });
    });

    it("keeps a null value (infinite remaining) alongside a real maximum", () => {
        expect(
            resolveCharges({ sohl: { charges: { value: null, max: 4 } } }),
        ).toEqual({ value: null, max: 4 });
    });

    it("forces the value to null when the item does not use charges", () => {
        // A stray current-charge count cannot outlive a blank maximum: the
        // logic layer disables both modifiers when max is null.
        expect(
            resolveCharges({ sohl: { charges: { value: 7, max: null } } }),
        ).toEqual({ value: null, max: null });
    });

    it("ignores a legacy usesCharges flag entirely", () => {
        // The flag was inert and has been dropped from the schema (#1129);
        // authored content that still carries it must not resurrect it.
        const charges = resolveCharges({
            sohl: { charges: { usesCharges: true, value: 1, max: 2 } },
        });
        expect(charges).toEqual({ value: 1, max: 2 });
        expect(charges).not.toHaveProperty("usesCharges");
    });
});
