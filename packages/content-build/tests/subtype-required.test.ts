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
    requireSubType,
    // eslint-disable-next-line
} from "../engine/helpers.mjs";

describe("requireSubType (pack builder — subType is mandatory, never defaulted)", () => {
    it("returns the declared subType from the sohl block", () => {
        expect(requireSubType({ sohl: { subType: "arrow" } })).toBe("arrow");
    });

    it("returns the declared subType from top-level frontmatter", () => {
        expect(requireSubType({ subType: "injury" })).toBe("injury");
    });

    it("throws when subType is absent (no fallback is substituted)", () => {
        expect(() => requireSubType({ sohl: {} }, "widget")).toThrow(
            /subType/i,
        );
        expect(() => requireSubType({}, "widget")).toThrow(/subType/i);
    });

    it("throws when subType is blank", () => {
        expect(() =>
            requireSubType({ sohl: { subType: "" } }, "widget"),
        ).toThrow(/subType/i);
    });

    it("labels the error with the given context, else the item title/name", () => {
        expect(() => requireSubType({}, "MyItem")).toThrow(/MyItem/);
        expect(() => requireSubType({ name: "Dagger" })).toThrow(/Dagger/);
        expect(() => requireSubType({ title: "Broadsword" })).toThrow(
            /Broadsword/,
        );
    });
});
