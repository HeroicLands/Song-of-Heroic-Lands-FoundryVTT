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
        ]),
        collide: new Set<string>(["gear"]),
        typeCollide: new Set<string>(["doc|coma"]),
        sections: new Set<string>(["rules", "skill"]),
        // The build seeds this with the real types *and* the virtual
        // `doc<type>` qualifier of every item type (see build-kb-content.mjs).
        contentTypes: new Set<string>(["doc", "skill", "creature", "docskill"]),
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

    it("reports a qualified target whose key does not exist", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[doc/nosuch|X]]", ctx)).toBe("X");
        expect(ctx.errors).toHaveLength(1);
        expect(ctx.errors[0]).toMatchObject({
            reason: "broken type/shortcode",
        });
    });

    it("tolerates an unresolved hyphen-qualified target (#1398)", () => {
        // The hyphen form is what the *vault* writes, and the vault holds
        // packages this build does not publish — `[[creature-grkrahk]]` is a
        // real setting note carrying exactly that alias. Nothing in the syntax
        // separates it from a typo, so an unresolved one is left as prose
        // rather than failing the build on correct content. The slash form,
        // written only by this repository's own older links, still errors.
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[creature-grkrahk|the Ahk]]", ctx)).toBe(
            "the Ahk",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("does not read a hyphenated *name* as a qualified target", () => {
        // `Grukar-ahk` is a note name, not an address: a hyphen qualifies only
        // when what precedes it is a known type. Reporting these would fail the
        // build on every worldbuilding reference kept outside this repository.
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[Grukar-ahk|the Grukar]]", ctx)).toBe(
            "the Grukar",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("resolves the hyphen form across types, as the packs do", () => {
        // The source note is a `doc`; the target is a `skill`, so the
        // type-scoped alias index cannot reach it. Only reading the qualifier
        // does — and until it did, every cross-type link written in the
        // canonical separator rendered as plain text on the knowledgebase.
        const ctx = makeCtx();
        expect(resolveKbWikilinks("a [[skill-climb|Climbing]] test", ctx)).toBe(
            "a [Climbing](/skill/climbing/) test",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("resolves the hyphen form of `doc<type>` to the item's own page", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[docskill-climb|Climbing]]", ctx)).toBe(
            "[Climbing](/skill/climbing/)",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("carries an anchor through a hyphen-qualified target", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[skill-climb#crafting|how]]", ctx)).toBe(
            "[how](/skill/climbing/#crafting)",
        );
        expect(ctx.errors).toEqual([]);
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
