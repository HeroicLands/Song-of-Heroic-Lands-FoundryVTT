/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time content helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import { contentSlug, findSlugCollisions } from "../../utils/content-slug.mjs";

describe("contentSlug", () => {
    it("is the note's shortcode, lowercased", () => {
        expect(contentSlug({ shortcode: "RRobe" })).toBe("rrobe");
        expect(contentSlug({ shortcode: "MByrn" })).toBe("mbyrn");
        expect(contentSlug({ shortcode: "nsvrroth" })).toBe("nsvrroth");
    });

    it("reduces anything that is not URL-safe to single hyphens", () => {
        expect(contentSlug({ shortcode: "flask glass 1pt" })).toBe(
            "flask-glass-1pt",
        );
        expect(contentSlug({ shortcode: "b_flk__punch" })).toBe("b-flk-punch");
        expect(contentSlug({ shortcode: "-trim-" })).toBe("trim");
    });

    it("transliterates a non-ASCII shortcode rather than dropping characters", () => {
        // The naive slugifier turned `Ālverrik` into `lverrik`; a shortcode must
        // never lose characters, or two notes can collapse onto one URL.
        expect(contentSlug({ shortcode: "Tānvür" })).toBe("tanvur");
    });

    it("throws when the note has no shortcode", () => {
        expect(() => contentSlug({ type: "creature" })).toThrow(/shortcode/);
        expect(() => contentSlug({ shortcode: "   " })).toThrow(/shortcode/);
    });

    it("throws when a shortcode reduces to nothing", () => {
        expect(() => contentSlug({ shortcode: "!!!" })).toThrow(
            /no URL-safe characters/,
        );
    });
});

describe("findSlugCollisions", () => {
    const page = (sec: string, slug: string, src: string) => ({
        sec,
        slug,
        src,
    });

    it("reports nothing when every section/slug pair is unique", () => {
        expect(
            findSlugCollisions([
                page("armorgear", "rrobe", "Armor/Russet_Robe.md"),
                page("armorgear", "mbyrn", "Armor/Mail_Byrnie.md"),
                page("creature", "rrobe", "Creatures/Rock_Robin.md"),
            ]),
        ).toEqual([]);
    });

    it("reports two notes that derive the same URL in one section", () => {
        const collisions = findSlugCollisions([
            page("armorgear", "rrobe", "Armor/Russet_Robe.md"),
            page("armorgear", "rrobe", "Armor/Ragged_Robe.md"),
        ]);
        expect(collisions).toHaveLength(1);
        expect(collisions[0].url).toBe("/armorgear/rrobe/");
        expect(collisions[0].sources).toEqual([
            "Armor/Russet_Robe.md",
            "Armor/Ragged_Robe.md",
        ]);
    });

    it("lists every claimant when more than two collide", () => {
        const collisions = findSlugCollisions([
            page("trauma", "cast", "Trauma/A.md"),
            page("trauma", "cast", "Trauma/B.md"),
            page("trauma", "cast", "Trauma/C.md"),
        ]);
        expect(collisions[0].sources).toHaveLength(3);
    });
});
