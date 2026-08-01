/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { defaultImg } from "../../../utils/packs/items.mjs";

describe("items defaultImg (fail-fast on unknown type, #890)", () => {
    it("returns the per-type default for a known item type", () => {
        expect(defaultImg("weapongear")).toBe(
            "systems/sohl/assets/icons/other/sword.svg",
        );
        expect(defaultImg("miscgear")).toBe(
            "systems/sohl/assets/icons/other/question-mark.svg",
        );
    });

    it("throws (aborting the build) for a type the builder doesn't know", () => {
        expect(() => defaultImg("somegear")).toThrow(/DEFAULT_IMG/);
        expect(() => defaultImg("being")).toThrow(/DEFAULT_IMG/);
        expect(() => defaultImg("")).toThrow(/DEFAULT_IMG/);
    });
});
