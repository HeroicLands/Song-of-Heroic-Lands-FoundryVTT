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
const LEGACY = { "creature:nwght": "nightwight" };

/** A content note, in the shape the write phase hands to `pageRedirects`. */
const note = (fm: object, over: object = {}) => ({
    kind: "content" as const,
    fm,
    name: "Nightwights",
    slug: "nightwights",
    sec: "creature",
    url: "/creature/nightwights/",
    isReadme: false,
    ...over,
});

describe("pageRedirects — display names are never URLs (#1399)", () => {
    it("does not publish a note's Obsidian aliases as redirects", () => {
        const redirects = pageRedirects(
            note({
                type: "creature",
                shortcode: "nwght",
                aliases: ["Nightwights", "Night Wight"],
            }),
            LEGACY,
        );
        // The generated redirect, and only it — no display name in sight.
        expect(redirects).toEqual(["/creature/nightwight/"]);
    });

    it("publishes nothing for a note whose only aliases are display names", () => {
        const redirects = pageRedirects(
            note({
                type: "creature",
                shortcode: "grsh",
                aliases: ["Black Death", "Chicken Pox"],
            }),
            LEGACY,
        );
        expect(redirects).toEqual([]);
    });

    it("still emits the legacy-slug redirect (#1280)", () => {
        const redirects = pageRedirects(
            note({ type: "creature", shortcode: "nwght" }),
            LEGACY,
        );
        expect(redirects).toEqual(["/creature/nightwight/"]);
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
            note({ type: "creature", shortcode: "nwght" }),
            { "creature:nwght": "nightwights" }, // already the current slug
        );
        expect(redirects).toEqual([]);
    });

    it("tolerates a note with no legacy map at all", () => {
        expect(
            pageRedirects(note({ type: "creature", shortcode: "nwght" })),
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

    it("never consults the legacy map for a developer doc", () => {
        // Dev docs have no shortcode; `undefined:undefined` must not key into it.
        expect(
            pageRedirects(dev({ fm: { type: "doc" } }), {
                "undefined:undefined": "boom",
            }),
        ).toEqual(["/dev/reference/body-structure/"]);
    });
});

describe("applyRedirects", () => {
    it("drops the authored aliases the frontmatter spread carried in", () => {
        const fm = {
            type: "creature",
            shortcode: "nwght",
            aliases: ["Nightwights"],
        };
        // Exactly what the write phase builds: the note's own frontmatter,
        // spread, then the generated redirects applied over it.
        const data: Record<string, unknown> = { ...fm, slug: "nightwights" };
        applyRedirects(data, pageRedirects(note(fm), LEGACY));
        expect(data.aliases).toEqual(["/creature/nightwight/"]);
    });

    it("emits no aliases key at all when there is nothing to redirect", () => {
        const fm = { type: "creature", shortcode: "grsh", aliases: ["Ghost"] };
        const data: Record<string, unknown> = { ...fm };
        applyRedirects(data, pageRedirects(note(fm), LEGACY));
        expect("aliases" in data).toBe(false);
    });

    it("returns the same object it was given", () => {
        const data = {};
        expect(applyRedirects(data, ["/old/"])).toBe(data);
    });
});

describe("oldSectionOf", () => {
    it("maps a doc to /guide/, or /dev/ for a developer doc", () => {
        expect(oldSectionOf({ type: "doc" }, false)).toBe("guide");
        expect(oldSectionOf({ type: "doc" }, true)).toBe("dev");
    });

    it("leaves a typed content note in its own section", () => {
        expect(oldSectionOf({ type: "creature" }, false)).toBe("creature");
    });
});
