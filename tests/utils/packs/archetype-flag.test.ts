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
    resolveArchetype,
    withArchetypeFlag,
    // eslint-disable-next-line
} from "../../../utils/packs/helpers.mjs";

describe("resolveArchetype (build:compiledb archetype contract, #640)", () => {
    it("returns the number when sohl.archetype is a number", () => {
        expect(resolveArchetype({ sohl: { archetype: 0 } }, "x")).toBe(0);
        expect(resolveArchetype({ sohl: { archetype: 3 } }, "x")).toBe(3);
    });

    it("returns undefined when sohl.archetype is null (not an archetype)", () => {
        expect(resolveArchetype({ sohl: { archetype: null } }, "x")).toBe(
            undefined,
        );
    });

    it("throws when sohl.archetype is absent", () => {
        expect(() => resolveArchetype({ sohl: {} }, "widget")).toThrow(
            /archetype/i,
        );
        expect(() => resolveArchetype({}, "widget")).toThrow(/archetype/i);
    });

    it("throws when sohl.archetype is a non-number, non-null value", () => {
        expect(() =>
            resolveArchetype({ sohl: { archetype: "0" } }, "widget"),
        ).toThrow(/archetype/i);
        expect(() =>
            resolveArchetype({ sohl: { archetype: true } }, "widget"),
        ).toThrow(/archetype/i);
    });

    it("accepts a top-level archetype key (sohlField fallback parity)", () => {
        expect(resolveArchetype({ archetype: 2 }, "x")).toBe(2);
        expect(resolveArchetype({ archetype: null }, "x")).toBe(undefined);
    });
});

describe("withArchetypeFlag (build:compiledb archetype contract, #640)", () => {
    it("sets flags.sohl.docArchetype to the number", () => {
        const flags = withArchetypeFlag({ sohl: { archetype: 0 } }, {}, "x");
        expect(flags).toEqual({ sohl: { docArchetype: 0 } });
    });

    it("omits the flag entirely when archetype is null", () => {
        const flags = withArchetypeFlag(
            { sohl: { archetype: null } },
            {},
            "x",
        );
        expect(flags).toEqual({});
        expect("sohl" in flags).toBe(false);
    });

    it("preserves existing unrelated flags", () => {
        const flags = withArchetypeFlag(
            { sohl: { archetype: 1 } },
            { core: { keep: true }, sohl: { other: "y" } },
            "x",
        );
        expect(flags).toEqual({
            core: { keep: true },
            sohl: { other: "y", docArchetype: 1 },
        });
    });

    it("strips a stale docArchetype when archetype is null but keeps sibling sohl flags", () => {
        const flags = withArchetypeFlag(
            { sohl: { archetype: null } },
            { sohl: { docArchetype: 5, other: "y" } },
            "x",
        );
        expect(flags).toEqual({ sohl: { other: "y" } });
    });

    it("does not mutate the passed-in flags object", () => {
        const input = { sohl: { other: "y" } };
        withArchetypeFlag({ sohl: { archetype: 2 } }, input, "x");
        expect(input).toEqual({ sohl: { other: "y" } });
    });

    it("throws when archetype is absent", () => {
        expect(() => withArchetypeFlag({ sohl: {} }, {}, "widget")).toThrow(
            /archetype/i,
        );
    });
});
