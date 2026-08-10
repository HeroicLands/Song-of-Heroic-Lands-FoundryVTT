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
 * `TLD/shortcode`); `tldAlias` holds aliases scoped to a content directory.
 */
function makeCtx(overrides: Record<string, unknown> = {}) {
    const shock = { url: "/rules/sohl-shock/", name: "Shock" };
    const climb = { url: "/skill/climbing/", name: "Climbing" };
    return {
        index: new Map<string, object>([
            ["rules/sohl-shock", shock],
            ["rules/shock", shock], // TLD/shortcode
            ["skill/climbing", climb],
            ["skills/climb", climb], // TLD/shortcode
        ]),
        tldAlias: new Map<string, object>([
            ["rules|shock", shock],
            ["rules|shock state", shock],
        ]),
        collide: new Set<string>(["gear"]),
        tldCollide: new Set<string>(["rules|coma"]),
        sections: new Set<string>(["rules", "skill"]),
        contentTlds: new Set<string>(["rules", "skills", "creatures"]),
        tld: "Rules",
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
    it("resolves TLD/shortcode to the target's KB url", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("see [[Rules/shock|the rules]]", ctx)).toBe(
            "see [the rules](/rules/sohl-shock/)",
        );
        expect(ctx.errors).toEqual([]);
    });

    it("resolves a bare alias scoped to the source's own content directory", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("worsens the [[Shock State]]", ctx)).toBe(
            "worsens the [Shock State](/rules/sohl-shock/)",
        );
    });

    it("appends a section anchor for a cross-page section link", () => {
        const ctx = makeCtx();
        expect(
            resolveKbWikilinks(
                "the [[Rules/shock#shock-state-index|Index]]",
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
        expect(
            resolveKbWikilinks("a [[Skills/climb|Climbing]] test", ctx),
        ).toBe("a [Climbing](/skill/climbing/) test");
    });

    it("accepts a table-escaped pipe", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("| [[Rules/shock\\|Shock]] |", ctx)).toBe(
            "| [Shock](/rules/sohl-shock/) |",
        );
    });

    it("falls back to the target's own name when unlabelled", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[Rules/shock]]", ctx)).toBe(
            "[Shock](/rules/sohl-shock/)",
        );
    });

    it("reports a qualified target whose key does not exist", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("[[Rules/nosuch|X]]", ctx)).toBe("X");
        expect(ctx.errors).toHaveLength(1);
        expect(ctx.errors[0]).toMatchObject({ reason: "broken section/slug" });
    });

    it("reports an alias that is ambiguous within the source's directory", () => {
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
