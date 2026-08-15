/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time KB helper (plain ESM, no Foundry). Imported by relative path
// because the KB build scripts live outside the `@src` alias tree.
import { slugify, resolveKbWikilinks } from "../../utils/kb-wikilinks.mjs";

/**
 * A stand-in KB index. `index` holds the unambiguous keys (`section/slug` and
 * `type/shortcode`); `typeAlias` holds aliases scoped to a content type.
 */
function makeCtx(overrides: Record<string, unknown> = {}) {
    const shock = { url: "/rules/sohl-shock/", name: "Shock" };
    const climb = { url: "/skill/climbing/", name: "Climbing" };
    return {
        index: new Map<string, object>([
            ["rules/sohl-shock", shock],
            ["doc/shock", shock], // type/shortcode
            ["skill/climbing", climb],
            ["skill/climb", climb], // type/shortcode
            // In Foundry the item and its documentation are two documents; on
            // the KB the item note *is* its documentation, so the build indexes
            // `doc<type>` as an alias of the same page (#1362).
            ["docskill/climb", climb],
        ]),
        typeAlias: new Map<string, object>([
            ["doc|shock", shock],
            ["doc|shock state", shock],
            // The vault exporter writes the canonical `type-shortcode` address
            // as an alias of the note, which is how the hyphen form resolves
            // here (#1398).
            ["doc|doc-shock", shock],
        ]),
        collide: new Set<string>(["gear"]),
        typeCollide: new Set<string>(["doc|coma"]),
        sections: new Set<string>(["rules", "skill"]),
        contentTypes: new Set<string>(["doc", "skill", "creature"]),
        type: "doc",
        errors: [] as object[],
        src: "rules/Bleeding.md",
        ...overrides,
    };
}

describe("slugify (KB heading/anchor slug)", () => {
    it("lowercases and hyphenates, trimming stray separators", () => {
        expect(slugify("Shock State Index")).toBe("shock-state-index");
        expect(slugify("Affliction vs. Trauma")).toBe("affliction-vs-trauma");
    });

    it("leaves an already-slugged anchor unchanged", () => {
        expect(slugify("blood-loss-advance-test")).toBe(
            "blood-loss-advance-test",
        );
    });
});

describe("resolveKbWikilinks", () => {
    it("resolves type/shortcode to the target's KB url", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("see [[doc/shock|the rules]]", ctx)).toBe(
            "see [the rules](/rules/sohl-shock/)",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("treats `doc<type>` as an alias of the item's own page (#1362)", () => {
        const ctx = makeCtx();
        // The item and its documentation are one page here, so both qualifiers
        // land on the same URL — the same authored link that addresses two
        // separate documents in Foundry.
        expect(resolveKbWikilinks("[[docskill/climb|Climbing]]", ctx)).toBe(
            "[Climbing](/skill/climbing/)",
        );
        expect(resolveKbWikilinks("[[skill/climb|Climbing]]", ctx)).toBe(
            "[Climbing](/skill/climbing/)",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("keeps an anchor on `doc<type>` an ordinary in-page anchor", () => {
        const ctx = makeCtx();
        expect(
            resolveKbWikilinks(
                "[[docskill/climb#crafting|how it is made]]",
                ctx,
            ),
        ).toBe("[how it is made](/skill/climbing/#crafting)");
        expect(ctx.errors).toEqual([]);
    });

    it("resolves a bare alias scoped to the source's own type", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("worsens the [[Shock State]]", ctx)).toBe(
            "worsens the [Shock State](/rules/sohl-shock/)",
        );
    });

    it("appends a section anchor for a cross-page section link", () => {
        const ctx = makeCtx();
        expect(
            resolveKbWikilinks(
                "the [[doc/shock#shock-state-index|Index]]",
                ctx,
            ),
        ).toBe("the [Index](/rules/sohl-shock/#shock-state-index)");
    });

    it("renders a same-page section link as a bare anchor href", () => {
        const ctx = makeCtx();
        expect(
            resolveKbWikilinks("see [[#course-test|the Course Test]]", ctx),
        ).toBe("see [the Course Test](#course-test)");
        expect(ctx.errors).toEqual([]);
    });

    it("crosses content directories to another KB section", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("a [[skill/climb|Climbing]] test", ctx)).toBe(
            "a [Climbing](/skill/climbing/) test",
        );
    });

    it("accepts a table-escaped pipe", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("| [[doc/shock\\|Shock]] |", ctx)).toBe(
            "| [Shock](/rules/sohl-shock/) |",
        );
    });

    it("falls back to the target's own name when unlabelled", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[doc/shock]]", ctx)).toBe(
            "[Shock](/rules/sohl-shock/)",
        );
    });

    it("falls back to the name for the hyphen form too (#1409)", () => {
        // `type-shortcode` is the canonical address (#1398), so it is no more
        // display text than `type/shortcode` is.
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[doc-shock]]", ctx)).toBe(
            "[Shock](/rules/sohl-shock/)",
        );
    });

    it("keeps a hyphenated bare alias as the prose the author wrote (#1409)", () => {
        // `Grukar-ahk` is a note *name*, not `type-shortcode`: nothing before
        // the hyphen is a content type, so the author's words stand.
        const grukar = { url: "/creatures/grukar-ahk/", name: "Grukar-ahk" };
        const ctx = makeCtx({
            typeAlias: new Map<string, object>([["doc|grukar-ahk", grukar]]),
        });
        expect(resolveKbWikilinks("the [[Grukar-ahk]] raid", ctx)).toBe(
            "the [Grukar-ahk](/creatures/grukar-ahk/) raid",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("reports a qualified target whose key does not exist", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[doc/nosuch|X]]", ctx)).toBe("X");
        expect(ctx.errors).toHaveLength(1);
        expect(ctx.errors[0]).toMatchObject({
            reason: "broken type/shortcode",
        });
    });

    it("reports an alias that is ambiguous within the source's type", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("a [[Coma]] state", ctx)).toBe(
            "a Coma state",
        );
        expect(ctx.errors[0]).toMatchObject({ reason: "ambiguous" });
    });

    it("treats an unknown bare target as an external reference, not an error", () => {
        // Worldbuilding notes kept outside this repo must not fail the build.
        const ctx = makeCtx();
        expect(
            resolveKbWikilinks("the [[Empire of Tanvur|Tanvurans]] rode", ctx),
        ).toBe("the Tanvurans rode");
        expect(ctx.errors).toEqual([]);
    });

    it("treats an unknown prefix as external too", () => {
        const ctx = makeCtx();
        expect(
            resolveKbWikilinks("[[Setting/Creatures/Folk/Grukar]]", ctx),
        ).toBe("Setting/Creatures/Folk/Grukar");
        expect(ctx.errors).toEqual([]);
    });
});
