/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time content helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import {
    contentSlug,
    findSlugCollisions,
} from "../../../utils/content-slug.mjs";

describe("contentSlug", () => {
    it("is the note's name, lowercased and hyphenated", () => {
        expect(contentSlug("Mail Byrnie")).toBe("mail-byrnie");
        expect(contentSlug("Russet Robe")).toBe("russet-robe");
    });

    it("drops apostrophes rather than turning them into separators", () => {
        // `armorers-kit`, never `armorer-s-kit` — this is the published URL.
        expect(contentSlug("Armorer's Kit")).toBe("armorers-kit");
        expect(contentSlug("Dye, Dragon’s Blood")).toBe("dye-dragons-blood");
    });

    it("transliterates accented characters instead of dropping them", () => {
        // The old slugifier reduced these to `n-sv-rroth` / `lverrik-t-rvallor`,
        // which is why they needed a hand-written slug.
        expect(contentSlug("Nüsvōrroth")).toBe("nusvorroth");
        expect(contentSlug("Ālverrik Tārvallor")).toBe("alverrik-tarvallor");
        expect(contentSlug("Tānvüran Elephant")).toBe("tanvuran-elephant");
    });

    it("spells out ligatures the way a reader would", () => {
        expect(contentSlug("Þorn Þegn")).toBe("thorn-thegn");
        expect(contentSlug("Ærik Ælfwine")).toBe("aerik-aelfwine");
        expect(contentSlug("Œuvre")).toBe("oeuvre");
        expect(contentSlug("Straße")).toBe("strasse");
        expect(contentSlug("ĲsseImeer")).toBe("ijsseimeer");
        expect(contentSlug("Ŋara")).toBe("ngara");
        // Eth follows the Icelandic convention of a bare `d`.
        expect(contentSlug("Óðinn")).toBe("odinn");
        // Slashed and ringed vowels reduce to their base letter.
        expect(contentSlug("Ølrún Åsa")).toBe("olrun-asa");
    });

    it("keeps a fraction's digits together", () => {
        // `¾` transliterates to `3/4`; the solidus must not split it into `3-4`.
        expect(contentSlug("Kûrbúl ¾-Helm")).toBe("kurbul-34-helm");
        expect(contentSlug("Plate ½-Helm")).toBe("plate-12-helm");
        // A slash that is not between digits is still a separator.
        expect(contentSlug("Armor/Clothing")).toBe("armor-clothing");
    });

    it("collapses punctuation and trims stray separators", () => {
        expect(contentSlug("Flask, glass (1 pint)")).toBe("flask-glass-1-pint");
        expect(contentSlug("  Spaced  Out  ")).toBe("spaced-out");
        expect(contentSlug("-Trim-")).toBe("trim");
    });

    it("throws when there is no name to derive from", () => {
        expect(() => contentSlug("")).toThrow(/no name/);
        expect(() => contentSlug("   ")).toThrow(/no name/);
        expect(() => contentSlug(undefined)).toThrow(/no name/);
    });

    it("throws when a name reduces to nothing URL-safe", () => {
        expect(() => contentSlug("!!!")).toThrow(/no URL-safe characters/);
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
                page("armorgear", "russet-robe", "Armor/Russet_Robe.md"),
                page("armorgear", "mail-byrnie", "Armor/Mail_Byrnie.md"),
                // The same name in another section is a different page.
                page("rules", "gear", "Rules/Gear.md"),
                page("user-guide", "gear", "User_Guide/Gear.md"),
            ]),
        ).toEqual([]);
    });

    it("reports two notes that derive the same URL in one section", () => {
        const collisions = findSlugCollisions([
            page("armorgear", "russet-robe", "Armor/Russet_Robe.md"),
            page("armorgear", "russet-robe", "Armor/Russet_Robe_Alt.md"),
        ]);
        expect(collisions).toHaveLength(1);
        expect(collisions[0].url).toBe("/armorgear/russet-robe/");
        expect(collisions[0].sources).toEqual([
            "Armor/Russet_Robe.md",
            "Armor/Russet_Robe_Alt.md",
        ]);
    });

    it("lists every claimant when more than two collide", () => {
        const collisions = findSlugCollisions([
            page("trauma", "casting", "Trauma/A.md"),
            page("trauma", "casting", "Trauma/B.md"),
            page("trauma", "casting", "Trauma/C.md"),
        ]);
        expect(collisions[0].sources).toHaveLength(3);
    });
});
