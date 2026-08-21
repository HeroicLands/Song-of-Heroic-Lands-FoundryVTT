/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time KB helper (plain ESM, no Foundry). Imported by relative path
// because the KB build scripts live outside the `@src` alias tree.
import {
    slugify,
    resolveKbWikilinks,
    frontmatterWikilinks,
} from "../../utils/kb-wikilinks.mjs";

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

/**
 * Cross-package resolution through the link manifest (#1446).
 *
 * `creature-grkrahk` is the real case: a Bestiary page addresses a note that
 * lives in the `thalorna` package. Before the manifest nothing in the syntax
 * separated that from a typo, so the address had to be tolerated and lost its
 * href; both halves of that trade are exercised here.
 */
describe("cross-package addresses (link manifest)", () => {
    const foreign = new Map<string, object>([
        [
            "creature/grkrahk",
            {
                url: "/thalorna/creature/grukar-ahk/",
                name: "Grukar-ahk",
                package: "thalorna",
            },
        ],
        // The same address a local entry also claims, to prove precedence.
        ["skill/climb", { url: "/thalorna/skill/stale/", name: "Stale" }],
    ]);

    it("renders a foreign address as a real link", () => {
        const ctx = makeCtx({ foreign, manifestsComplete: true });
        expect(
            resolveKbWikilinks(
                "the [[creature-grkrahk|Grukar-ahk]] spawn",
                ctx,
            ),
        ).toBe("the [Grukar-ahk](/thalorna/creature/grukar-ahk/) spawn");
        expect(ctx.errors).toHaveLength(0);
    });

    it("uses the foreign document's name when the link carries no label", () => {
        const ctx = makeCtx({ foreign, manifestsComplete: true });
        expect(resolveKbWikilinks("[[creature-grkrahk]]", ctx)).toBe(
            "[Grukar-ahk](/thalorna/creature/grukar-ahk/)",
        );
    });

    it("prefers the local index — a live build outranks a vendored manifest", () => {
        const ctx = makeCtx({ foreign, manifestsComplete: true, type: null });
        expect(resolveKbWikilinks("[[skill-climb]]", ctx)).toBe(
            "[Climbing](/skill/climbing/)",
        );
    });

    it("fails an address that resolves nowhere, once manifests are complete", () => {
        const ctx = makeCtx({ foreign, manifestsComplete: true });
        expect(resolveKbWikilinks("[[creature-notreal|Nope]]", ctx)).toBe(
            "Nope",
        );
        expect(ctx.errors).toEqual([
            {
                file: "rules/Bleeding.md",
                target: "creature-notreal",
                reason: "broken type/shortcode",
            },
        ]);
    });

    it("tolerates the same address while a package is still missing", () => {
        // The pre-#1446 behaviour, and why the guard is gated: with `thalorna`
        // invisible, a correct cross-package link is indistinguishable from
        // this and failing here would break the build on good content.
        const ctx = makeCtx({ manifestsComplete: false });
        expect(resolveKbWikilinks("[[creature-notreal|Nope]]", ctx)).toBe(
            "Nope",
        );
        expect(ctx.errors).toHaveLength(0);
    });

    it("renders an address with no page as its name, not a dead href", () => {
        // A pack-only package publishes Foundry addresses and no web pages
        // (#1516), so its entries carry no `path`. The address is real — this
        // is not a typo — but there is nothing to link to, so the reader gets
        // the document's name as prose and the build does not fail.
        const packOnly = new Map<string, object>([
            [
                "creature/wolf",
                {
                    name: "Dire Wolf",
                    uuid: "Compendium.sohl-adventure.items.Item.abc",
                    package: "adventure",
                },
            ],
        ]);
        const ctx = makeCtx({ foreign: packOnly, manifestsComplete: true });
        expect(resolveKbWikilinks("a [[creature-wolf]] howls", ctx)).toBe(
            "a Dire Wolf howls",
        );
        expect(ctx.errors).toHaveLength(0);
    });

    it("keeps the author's label for an address with no page", () => {
        const packOnly = new Map<string, object>([
            ["creature/wolf", { name: "Dire Wolf", package: "adventure" }],
        ]);
        const ctx = makeCtx({ foreign: packOnly, manifestsComplete: true });
        expect(resolveKbWikilinks("a [[creature-wolf|grey wolf]]", ctx)).toBe(
            "a grey wolf",
        );
        expect(ctx.errors).toHaveLength(0);
    });

    it("leaves a bare prose link alone even when manifests are complete", () => {
        // `[[Grukar-ahk]]` is prose, not an address; only a qualified target is
        // checked, so a worldbuilding placeholder is still not an error.
        const ctx = makeCtx({ foreign, manifestsComplete: true });
        expect(resolveKbWikilinks("[[Some Unwritten Place]]", ctx)).toBe(
            "Some Unwritten Place",
        );
        expect(ctx.errors).toHaveLength(0);
    });
});

describe("a code fence is verbatim (#1505)", () => {
    it("leaves a nested array literal in a fence alone", () => {
        const ctx = makeCtx();
        const src = [
            "See [[doc/shock|the rules]].",
            "",
            "```js",
            "const first = grid[[0]];",
            "```",
        ].join("\n");
        const out = resolveKbWikilinks(src, ctx);
        expect(out).toContain("const first = grid[[0]];");
        expect(out).toContain("[the rules](/rules/sohl-shock/)");
        expect(ctx.errors).toEqual([]);
    });

    it("leaves an inline code span alone", () => {
        const ctx = makeCtx();
        expect(resolveKbWikilinks("write `grid[[0]]` here", ctx)).toBe(
            "write `grid[[0]]` here",
        );
    });
});

describe("frontmatterWikilinks (#1428)", () => {
    it("finds a wikilink authored in a nested frontmatter value", () => {
        expect(
            frontmatterWikilinks({
                type: "polity",
                government: {
                    summary:
                        "A warlord protecting the spawn-chamber of a fertile " +
                        "[[creature-grkrahk|Grukar-ahk]]; nominally sovereign.",
                },
            }),
        ).toEqual([
            {
                path: "government.summary",
                link: "[[creature-grkrahk|Grukar-ahk]]",
            },
        ]);
    });

    it("reports a link in a top-level string, a list, and a list of maps", () => {
        expect(
            frontmatterWikilinks({
                description: "See [[doc-shock]].",
                aliases: ["plain", "[[doc-shock|Shock]]"],
                rows: [{ note: "and [[skill-climb]]" }],
            }),
        ).toEqual([
            { path: "description", link: "[[doc-shock]]" },
            { path: "aliases.1", link: "[[doc-shock|Shock]]" },
            { path: "rows.0.note", link: "[[skill-climb]]" },
        ]);
    });

    it("reports every link in one value, in reading order", () => {
        expect(
            frontmatterWikilinks({ summary: "[[a-one]] then [[b-two|Two]]" }),
        ).toEqual([
            { path: "summary", link: "[[a-one]]" },
            { path: "summary", link: "[[b-two|Two]]" },
        ]);
    });

    it("passes clean frontmatter, and non-string values, without complaint", () => {
        expect(
            frontmatterWikilinks({
                type: "polity",
                weight: 12,
                published: true,
                when: new Date("2026-08-20T00:00:00Z"),
                name: { full: "Kingdom of Grukarholm" },
                tags: ["ankaris", "grukarholm"],
                empty: null,
            }),
        ).toEqual([]);
    });

    it("is not fooled by a lone bracket pair or an unclosed link", () => {
        expect(
            frontmatterWikilinks({
                a: "an array literal grid[0] and a [single] bracket",
                b: "an unclosed [[doc-shock",
            }),
        ).toEqual([]);
    });

    it("answers for absent or non-object frontmatter", () => {
        expect(frontmatterWikilinks(undefined)).toEqual([]);
        expect(frontmatterWikilinks(null)).toEqual([]);
        expect(frontmatterWikilinks("not frontmatter")).toEqual([]);
    });
});
