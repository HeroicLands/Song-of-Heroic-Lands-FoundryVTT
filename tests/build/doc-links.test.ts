/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time CI guard (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import { slugify, anchorsIn, linksIn } from "../../utils/check-doc-links.mjs";

/**
 * These helpers decide whether a link is reported as broken, so getting them
 * subtly wrong is worse than not checking at all: it fails the build on links
 * that work. Both mistakes below were made before they were caught here.
 */
describe("slugify (GitHub heading anchors)", () => {
    it("lowercases and hyphenates", () => {
        expect(slugify("Adding a shim function")).toBe(
            "adding-a-shim-function",
        );
    });

    it("does NOT collapse the gap left by dropped punctuation", () => {
        // `&` is removed but the spaces around it are not, so the real anchor
        // carries two hyphens. Collapsing produced a false "dead anchor".
        expect(slugify("Player & GM rules (external)")).toBe(
            "player--gm-rules-external",
        );
        expect(slugify("Why not a sandbox / denylist?")).toBe(
            "why-not-a-sandbox--denylist",
        );
    });

    it("drops punctuation inside words rather than splitting them", () => {
        expect(slugify("10) Create-dialog archetypes")).toBe(
            "10-create-dialog-archetypes",
        );
        expect(slugify("flags.sohl.docArchetype")).toBe(
            "flagssohldocarchetype",
        );
    });
});

describe("anchorsIn", () => {
    it("keeps a code span in a heading — it is part of the anchor text", () => {
        // Masking code spans before reading headings computed an anchor no
        // renderer generates, rejecting a link that works.
        const anchors = anchorsIn("## The `toChat` card-data contract\n");
        expect(anchors).toContain("the-tochat-card-data-contract");
    });

    it("prefers an explicit {#slug} over the derived one", () => {
        const anchors = anchorsIn("# Crafting {#crafting}\n");
        expect(anchors).toContain("crafting");
        expect(anchors).not.toContain("crafting-crafting");
    });

    it("ignores headings inside a fenced block", () => {
        const anchors = anchorsIn("```\n# Not A Heading\n```\n# Real\n");
        expect(anchors).toContain("real");
        expect(anchors).not.toContain("not-a-heading");
    });

    it("collects an explicit HTML anchor", () => {
        expect(anchorsIn('<a id="manual-anchor"></a>\n')).toContain(
            "manual-anchor",
        );
    });

    it("uses a link's text, not its target, when a heading is a link", () => {
        expect(anchorsIn("## [Testing](./testing.md)\n")).toContain("testing");
    });
});

describe("linksIn", () => {
    it("finds a relative link and its anchor, with a line number", () => {
        const [link] = linksIn("intro\n\nsee [x](../how-to/testing.md#tdd).\n");
        expect(link).toMatchObject({
            rel: "../how-to/testing.md",
            anchor: "tdd",
            line: 3,
        });
    });

    it("skips external links", () => {
        expect(linksIn("[a](https://example.com) [b](mailto:x@y.z)")).toEqual(
            [],
        );
    });

    it("skips a link shown as an example inside code", () => {
        // The reference pages document link syntax; those must not be followed.
        expect(linksIn("`[x](./nope.md)`")).toEqual([]);
        expect(linksIn("```\n[x](./nope.md)\n```")).toEqual([]);
    });

    it("reports a same-page anchor with an empty target", () => {
        expect(linksIn("see [that](#a-section)")[0]).toMatchObject({
            rel: "",
            anchor: "a-section",
        });
    });

    it("ignores a link title after the target", () => {
        expect(linksIn('[x](./testing.md "The title")')[0].rel).toBe(
            "./testing.md",
        );
    });
});
