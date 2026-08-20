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
    resolveRelation,
    // eslint-disable-next-line
} from "../engine/helpers.mjs";

describe("resolveRelation (pack builder — affiliation standing map, #1404)", () => {
    it("returns an empty map when the affiliation authors no relations", () => {
        expect(resolveRelation({})).toEqual({});
        expect(resolveRelation({ sohl: {} })).toEqual({});
    });

    it("passes an authored map through, from the sohl block or the top level", () => {
        expect(
            resolveRelation({ sohl: { relation: { peoni: "nemesis" } } }),
        ).toEqual({ peoni: "nemesis" });
        expect(resolveRelation({ relation: { larani: "aligned" } })).toEqual({
            larani: "aligned",
        });
    });

    it("accepts every declared standing", () => {
        expect(
            resolveRelation({
                relation: {
                    a: "aligned",
                    u: "unaligned",
                    r: "rival",
                    n: "nemesis",
                },
            }),
        ).toEqual({ a: "aligned", u: "unaligned", r: "rival", n: "nemesis" });
    });

    it("throws on an unknown standing rather than shipping it", () => {
        // Foundry would drop the invalid choice at load, quietly turning an
        // authored hostility into neutrality.
        expect(() =>
            resolveRelation({ relation: { peoni: "hostile" } }, "Agrik"),
        ).toThrow(/Agrik: relation\["peoni"\]/);
    });

    it("throws when the map is not a map", () => {
        expect(() => resolveRelation({ relation: ["peoni"] }, "Agrik")).toThrow(
            /map of shortcode/,
        );
        expect(() => resolveRelation({ relation: "peoni" }, "Agrik")).toThrow(
            /map of shortcode/,
        );
    });
});
