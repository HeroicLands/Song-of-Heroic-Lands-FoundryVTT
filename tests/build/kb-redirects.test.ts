/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import {
    applyRedirects,
    oldSectionOf,
    pageRedirects,
} from "../../utils/kb-redirects.mjs";

/** The legacy-URL map as committed: `type:shortcode` → its pre-shortcode slug. */
const LEGACY = { "being:nwght": "nightwight" };

/** A content note, in the shape the write phase hands to `pageRedirects`. */
const note = (fm: object, over: object = {}) => ({
    kind: "content" as const,
    fm,
    name: "Nightwights",
    slug: "nightwights",
    sec: "being",
    url: "/being/nightwights/",
    isReadme: false,
    ...over,
});

describe("pageRedirects — display names are never URLs (#1399)", () => {
    it("does not publish a note's Obsidian aliases as redirects", () => {
        const redirects = pageRedirects(
            note({
                type: "being",
                shortcode: "nwght",
                aliases: ["Nightwights", "Night Wight"],
            }),
            LEGACY,
        );
        // The generated redirect, and only it — no display name in sight.
        expect(redirects).toEqual(["/being/nightwight/"]);
    });

    it("publishes nothing for a note whose only aliases are display names", () => {
        const redirects = pageRedirects(
            note({
                type: "being",
                shortcode: "grsh",
                aliases: ["Black Death", "Chicken Pox"],
            }),
            LEGACY,
        );
        expect(redirects).toEqual([]);
    });

    it("still emits the legacy-slug redirect (#1280)", () => {
        const redirects = pageRedirects(
            note({ type: "being", shortcode: "nwght" }),
            LEGACY,
        );
        expect(redirects).toEqual(["/being/nightwight/"]);
    });

    it("still emits the /guide/ section-move redirect", () => {
        const redirects = pageRedirects(
            note(
                { type: "doc", shortcode: "res", aliases: ["Resolution"] },
                { sec: "rules", slug: "resolution", url: "/rules/resolution/" },
            ),
            {},
        );
        expect(redirects).toEqual(["/guide/resolution/"]);
    });

    it("redirects a moved page from its legacy slug in the old section too", () => {
        const redirects = pageRedirects(
            note(
                { type: "doc", shortcode: "res" },
                { sec: "rules", slug: "resolution", url: "/rules/resolution/" },
            ),
            { "doc:res": "combat-resolution" },
        );
        expect(redirects).toEqual([
            "/rules/combat-resolution/",
            "/guide/combat-resolution/",
        ]);
    });

    it("redirects the old section landing for a moved README", () => {
        const redirects = pageRedirects(
            note(
                { type: "doc", shortcode: "rules" },
                {
                    sec: "rules",
                    slug: "rules",
                    url: "/rules/",
                    isReadme: true,
                },
            ),
            {},
        );
        expect(redirects).toEqual(["/guide/rules/", "/guide/"]);
    });

    it("never redirects a page to itself", () => {
        const redirects = pageRedirects(
            note({ type: "being", shortcode: "nwght" }),
            { "being:nwght": "nightwights" }, // already the current slug
        );
        expect(redirects).toEqual([]);
    });

    it("tolerates a note with no legacy map at all", () => {
        expect(
            pageRedirects(note({ type: "being", shortcode: "nwght" })),
        ).toEqual([]);
    });
});

describe("pageRedirects — developer docs", () => {
    const dev = (over: object = {}) => ({
        kind: "dev" as const,
        fm: { type: "doc", aliases: ["Body Structure", "Anatomy"] },
        name: "Body Structure",
        slug: "body-structure",
        rel: "reference/body-structure.md",
        sec: "dev-docs",
        url: "/dev-docs/reference/body-structure/",
        isReadme: false,
        ...over,
    });

    it("redirects from the doc's old /dev/ path, not from its aliases", () => {
        expect(pageRedirects(dev(), LEGACY)).toEqual([
            "/dev/reference/body-structure/",
        ]);
    });

    it("redirects /dev/ for the root README", () => {
        expect(
            pageRedirects(
                dev({ rel: "README.md", url: "/dev-docs/", isReadme: true }),
            ),
        ).toEqual(["/dev/"]);
    });

    it("redirects the directory URL for a nested README", () => {
        expect(
            pageRedirects(
                dev({
                    rel: "concepts/README.md",
                    url: "/dev-docs/concepts/",
                    isReadme: true,
                }),
            ),
        ).toEqual(["/dev/concepts/"]);
    });

    // A page that moves between dev-doc sections changes its published URL,
    // and the section segment is not recoverable from anything the page still
    // carries — so the move is recorded (#1572). Both addresses it really
    // published at have to keep resolving; the address it never published at
    // (`/dev/<new path>/`) must not be claimed.
    it("redirects both addresses a page moved between sections published at", () => {
        expect(
            pageRedirects(
                dev({
                    rel: "content-creator/content-links.md",
                    slug: "content-links",
                    url: "/dev-docs/content-creator/content-links/",
                }),
            ),
        ).toEqual([
            "/dev/reference/content-links/",
            "/dev-docs/reference/content-links/",
        ]);
    });

    it("claims only the pre-split address for a page that has not moved", () => {
        expect(pageRedirects(dev(), LEGACY)).not.toContain(
            "/dev-docs/reference/body-structure/",
        );
    });

    it("never consults the legacy map for a developer doc", () => {
        // Dev docs have no shortcode; `undefined:undefined` must not key into it.
        expect(
            pageRedirects(dev({ fm: { type: "doc" } }), {
                "undefined:undefined": "boom",
            }),
        ).toEqual(["/dev/reference/body-structure/"]);
    });
});

describe("pageRedirects — the knowledgebase mount (#1470)", () => {
    // The knowledgebase publishes under /sohl/kb/, so a redirect is an address
    // inside that mount: an unprefixed one would resolve to a path the deploy
    // does not serve, which is exactly the silent 404 redirects exist to avoid.
    const KB = "/sohl/kb/";

    it("emits the legacy-slug redirect inside the mount", () => {
        expect(
            pageRedirects(
                note(
                    { type: "being", shortcode: "nwght" },
                    { url: "/sohl/kb/being/nightwights/" },
                ),
                LEGACY,
                KB,
            ),
        ).toEqual(["/sohl/kb/being/nightwight/"]);
    });

    it("emits the section-move redirect inside the mount", () => {
        expect(
            pageRedirects(
                note(
                    { type: "doc", shortcode: "res" },
                    {
                        sec: "rules",
                        slug: "resolution",
                        url: "/sohl/kb/rules/resolution/",
                    },
                ),
                {},
                KB,
            ),
        ).toEqual(["/sohl/kb/guide/resolution/"]);
    });

    it("emits a developer doc's old path inside the mount", () => {
        expect(
            pageRedirects(
                {
                    kind: "dev" as const,
                    fm: { type: "doc" },
                    slug: "body-structure",
                    rel: "reference/body-structure.md",
                    sec: "dev-docs",
                    url: "/sohl/kb/dev-docs/reference/body-structure/",
                    isReadme: false,
                },
                {},
                KB,
            ),
        ).toEqual(["/sohl/kb/dev/reference/body-structure/"]);
    });

    it("still never redirects a page to itself", () => {
        // The self-check compares against the page's own mounted URL, so it
        // only holds while both sides carry the same prefix. An alias equal to
        // the page's URL would have Hugo overwrite the page with its own
        // redirect stub.
        expect(
            pageRedirects(
                note(
                    { type: "being", shortcode: "nwght" },
                    { url: "/sohl/kb/being/nightwights/" },
                ),
                { "being:nwght": "nightwights" },
                KB,
            ),
        ).toEqual([]);
    });
});

describe("applyRedirects", () => {
    it("drops the authored aliases the frontmatter spread carried in", () => {
        const fm = {
            type: "being",
            shortcode: "nwght",
            aliases: ["Nightwights"],
        };
        // Exactly what the write phase builds: the note's own frontmatter,
        // spread, then the generated redirects applied over it.
        const data: Record<string, unknown> = { ...fm, slug: "nightwights" };
        applyRedirects(data, pageRedirects(note(fm), LEGACY));
        expect(data.aliases).toEqual(["/being/nightwight/"]);
    });

    it("emits no aliases key at all when there is nothing to redirect", () => {
        const fm = { type: "being", shortcode: "grsh", aliases: ["Ghost"] };
        const data: Record<string, unknown> = { ...fm };
        applyRedirects(data, pageRedirects(note(fm), LEGACY));
        expect("aliases" in data).toBe(false);
    });

    it("returns the same object it was given", () => {
        const data = {};
        expect(applyRedirects(data, ["/old/"])).toBe(data);
    });
});

describe("applyRedirects — a Hugo alias is publishDir-relative (#1470)", () => {
    // Hugo writes an alias at `publishDir + alias` and never subtracts the path
    // its baseURL carries, so an alias spelled as the full site URL publishes at
    // /sohl/sohl/kb/… — a redirect that exists and resolves to nothing. The site
    // root is therefore stripped on the way into the frontmatter, and only
    // there: everything upstream reasons in real, mounted URLs.
    it("strips the site root the baseURL already carries", () => {
        const data: Record<string, unknown> = {};
        applyRedirects(data, ["/sohl/kb/being/nightwight/"], "/sohl/");
        expect(data.aliases).toEqual(["/kb/being/nightwight/"]);
    });

    it("leaves a redirect untouched when the site is at a bare root", () => {
        const data: Record<string, unknown> = {};
        applyRedirects(data, ["/being/nightwight/"], "/");
        expect(data.aliases).toEqual(["/being/nightwight/"]);
    });

    it("refuses a redirect that does not sit under the site root", () => {
        // Silently passing it through would publish an alias at a path the
        // deploy does not serve — the failure this stripping exists to prevent.
        expect(() =>
            applyRedirects({}, ["/thalorna/being/x/"], "/sohl/"),
        ).toThrow(/site root/);
    });
});

describe("oldSectionOf", () => {
    it("maps a doc to /guide/, or /dev/ for a developer doc", () => {
        expect(oldSectionOf({ type: "doc" }, false)).toBe("guide");
        expect(oldSectionOf({ type: "doc" }, true)).toBe("dev");
    });

    it("leaves a typed content note in its own section", () => {
        expect(oldSectionOf({ type: "skill" }, false)).toBe("skill");
    });
});

/**
 * The `character` / `creature` merge (#1580). Both compiled to the same
 * `being`, so the two content types became one — and with them, two published
 * knowledgebase sections became one. The section a page used to sit in is the
 * one thing the retype erases from the note, and `sohl.kbcat` is what carries
 * it now.
 */
describe("oldSectionOf — the sections `being` absorbed", () => {
    it("sends a bestiary being back to /creature/", () => {
        expect(
            oldSectionOf({ type: "being", sohl: { kbcat: "animal" } }, false),
        ).toBe("creature");
    });

    it("sends a person back to /character/", () => {
        for (const kbcat of ["npc", "archetype"]) {
            expect(
                oldSectionOf({ type: "being", sohl: { kbcat } }, false),
            ).toBe("character");
        }
    });

    it("reports no move for a being added after the merge", () => {
        // Absence is the right answer, not a gap: a being with a kbcat this
        // map has never heard of is new content, and new content has no old
        // URL to preserve. Returning its own section is how the caller reads
        // "did not move" — anything else would publish a redirect from a URL
        // that never existed.
        expect(
            oldSectionOf(
                { type: "being", sohl: { kbcat: "dreadspawn" } },
                false,
            ),
        ).toBe("being");
        expect(oldSectionOf({ type: "being", sohl: {} }, false)).toBe("being");
        expect(oldSectionOf({ type: "being" }, false)).toBe("being");
    });
});

describe("pageRedirects — a merged section's pages keep their old URL", () => {
    const being = (kbcat: string, over: object = {}) => ({
        kind: "content" as const,
        fm: { type: "being", shortcode: "aurochs", sohl: { kbcat } },
        name: "Aurochs",
        slug: "aurochs",
        sec: "being",
        url: "/sohl/kb/being/aurochs/",
        isReadme: false,
        ...over,
    });

    it("redirects from the section the page actually published under", () => {
        expect(pageRedirects(being("animal"), {}, "/sohl/kb/")).toEqual([
            "/sohl/kb/creature/aurochs/",
        ]);
        expect(pageRedirects(being("npc"), {}, "/sohl/kb/")).toEqual([
            "/sohl/kb/character/aurochs/",
        ]);
    });

    it("combines the section move with a pre-shortcode slug", () => {
        // The address the page really had is the old section *and* the old
        // slug together, and that is the second entry. The first is the
        // module's long-standing behaviour of also claiming the legacy slug in
        // the page's current section: a spare address that resolves rather
        // than 404s, which costs nothing. Asserted so the interaction is a
        // decision on record and not a surprise — no note in this repository
        // currently carries both records at once.
        expect(
            pageRedirects(
                being("animal"),
                { "being:aurochs": "wild-ox" },
                "/sohl/kb/",
            ),
        ).toEqual(["/sohl/kb/being/wild-ox/", "/sohl/kb/creature/wild-ox/"]);
    });

    it("emits nothing for a being that never lived elsewhere", () => {
        expect(pageRedirects(being("dreadspawn"), {}, "/sohl/kb/")).toEqual([]);
    });
});
