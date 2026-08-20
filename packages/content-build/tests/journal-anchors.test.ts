/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { splitPages, assertUniqueAnchors } from "../engine/journals.mjs";

describe("splitPages (a page per H1, and per anchored heading)", () => {
    it("splits on an H1 and keeps its heading depth", () => {
        const pages = splitPages(
            "intro text\n\n# First\n\nbody\n\n# Second\n\nmore",
        );
        expect(pages.map((p) => p.name)).toEqual([
            "Introduction",
            "First",
            "Second",
        ]);
        expect(pages.map((p) => p.level)).toEqual([1, 1, 1]);
    });

    it("splits on a deeper heading when it carries an anchor, recording the slug", () => {
        const pages = splitPages(
            "# Top\n\na\n\n## Marked {#marked}\n\nb\n\n## Plain\n\nc",
        );
        expect(pages.map((p) => p.name)).toEqual(["Top", "Marked"]);
        expect(pages[1].level).toBe(2);
        expect(pages[1].anchorSlug).toBe("marked");
        // The unanchored H2 stays inside the page it follows.
        expect(pages[1].markdown).toContain("## Plain");
    });

    it("strips the anchor from the page name", () => {
        const [page] = splitPages(
            "# Shock State Index {#shock-state-index}\n\nbody",
        );
        expect(page.name).toBe("Shock State Index");
        expect(page.anchorSlug).toBe("shock-state-index");
    });

    it("ignores a heading inside a fenced code block", () => {
        const pages = splitPages(
            "# Real\n\n```\n# Not a heading {#nope}\n```\n",
        );
        expect(pages).toHaveLength(1);
        expect(pages[0].name).toBe("Real");
    });
});

describe("assertUniqueAnchors", () => {
    it("accepts distinct anchors", () => {
        expect(() =>
            assertUniqueAnchors(
                [
                    { anchorSlug: "a" },
                    { anchorSlug: "b" },
                    { anchorSlug: null },
                ],
                "Note",
            ),
        ).not.toThrow();
    });

    it("accepts several pages with no anchor at all", () => {
        expect(() =>
            assertUniqueAnchors(
                [{ anchorSlug: null }, { anchorSlug: null }],
                "Note",
            ),
        ).not.toThrow();
    });

    it("rejects a repeated anchor, naming the note and the slug", () => {
        // Two headings sharing an anchor derive the same page id, which the
        // LevelDB packer would only report as an opaque key collision.
        expect(() =>
            assertUniqueAnchors(
                [
                    { anchorSlug: "before-you-start" },
                    { anchorSlug: "before-you-start" },
                ],
                "Mystical Ability",
            ),
        ).toThrow(/Mystical Ability.*before-you-start/);
    });
});
