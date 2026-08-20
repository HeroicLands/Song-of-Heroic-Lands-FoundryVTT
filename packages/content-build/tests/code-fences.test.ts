/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Fenced-code detection is engine machinery: every content package's wikilink
// and table passes skip code regions through it (#1512).
import {
    codeRegions,
    matchAllOutsideCode,
    replaceOutsideCode,
} from "../engine/code-fences.mjs";

/** Stand-in for a rewriter: every `[[…]]` outside code becomes `X`. */
const LINK = /\[\[([^\]\n]+)\]\]/g;
const rewrite = (src: string) => replaceOutsideCode(src, LINK, () => "X");

describe("replaceOutsideCode — fenced blocks are verbatim (#1505)", () => {
    it("rewrites a link in prose", () => {
        expect(rewrite("see [[doc-shock]] here")).toBe("see X here");
    });

    it("leaves a backtick fence alone, including a nested array literal", () => {
        const src = [
            "before [[doc-shock]]",
            "```js",
            "const first = grid[[0]];",
            "```",
            "after [[doc-shock]]",
        ].join("\n");
        expect(rewrite(src)).toBe(
            [
                "before X",
                "```js",
                "const first = grid[[0]];",
                "```",
                "after X",
            ].join("\n"),
        );
    });

    it("leaves a tilde fence alone", () => {
        const src = ["~~~", "grid[[0]]", "~~~", "[[doc-shock]]"].join("\n");
        expect(rewrite(src)).toBe(["~~~", "grid[[0]]", "~~~", "X"].join("\n"));
    });

    it("honours a longer fence that contains a shorter one", () => {
        const src = [
            "````md",
            "```js",
            "grid[[0]]",
            "```",
            "````",
            "[[doc-shock]]",
        ].join("\n");
        expect(rewrite(src)).toBe(
            ["````md", "```js", "grid[[0]]", "```", "````", "X"].join("\n"),
        );
    });

    it("runs an unclosed fence to the end of the document", () => {
        const src = ["```js", "grid[[0]]", "still [[doc-shock]] code"].join(
            "\n",
        );
        expect(rewrite(src)).toBe(src);
    });

    it("does not treat an info string as content to rewrite", () => {
        // A fence's own opening line is part of the block.
        expect(rewrite("```[[doc-shock]]\nx\n```")).toBe(
            "```[[doc-shock]]\nx\n```",
        );
    });

    it("resumes rewriting after the closing fence, for several blocks", () => {
        const src = [
            "```",
            "[[a-b]]",
            "```",
            "[[doc-shock]]",
            "```",
            "[[c-d]]",
            "```",
            "[[doc-shock]]",
        ].join("\n");
        expect(rewrite(src)).toBe(
            ["```", "[[a-b]]", "```", "X", "```", "[[c-d]]", "```", "X"].join(
                "\n",
            ),
        );
    });
});

describe("replaceOutsideCode — indented code blocks (#1505)", () => {
    it("leaves a four-space indented block alone", () => {
        const src = [
            "Example:",
            "",
            "    const first = grid[[0]];",
            "",
            "[[doc-shock]]",
        ].join("\n");
        expect(rewrite(src)).toBe(
            ["Example:", "", "    const first = grid[[0]];", "", "X"].join(
                "\n",
            ),
        );
    });

    it("keeps a blank line inside one indented block", () => {
        const src = [
            "",
            "    grid[[0]]",
            "",
            "    grid[[1]]",
            "",
            "[[doc-shock]]",
        ].join("\n");
        expect(rewrite(src)).toBe(
            ["", "    grid[[0]]", "", "    grid[[1]]", "", "X"].join("\n"),
        );
    });

    it("treats a tab-indented block as code", () => {
        expect(rewrite("Example:\n\n\tgrid[[0]]\n")).toBe(
            "Example:\n\n\tgrid[[0]]\n",
        );
    });

    it("does not treat a list item's own continuation as code", () => {
        // Four spaces under a `- ` marker is list prose, where a wikilink is a
        // link like any other.
        const src = ["- item", "", "    see [[doc-shock]]"].join("\n");
        expect(rewrite(src)).toBe(["- item", "", "    see X"].join("\n"));
    });

    it("still finds code indented past a list item's content column", () => {
        const src = ["- item", "", "        grid[[0]]"].join("\n");
        expect(rewrite(src)).toBe(src);
    });

    it("does not let an indented line interrupt a paragraph", () => {
        // With no blank line before it, the indent is a lazy continuation.
        const src = ["a paragraph", "    see [[doc-shock]]"].join("\n");
        expect(rewrite(src)).toBe(["a paragraph", "    see X"].join("\n"));
    });
});

describe("replaceOutsideCode — inline code spans (#1505)", () => {
    it("leaves a span alone", () => {
        expect(rewrite("write `grid[[0]]` in code")).toBe(
            "write `grid[[0]]` in code",
        );
    });

    it("pairs runs of equal length, so a doubled span survives", () => {
        expect(rewrite("``a `[[x-y]]` b`` and [[doc-shock]]")).toBe(
            "``a `[[x-y]]` b`` and X",
        );
    });

    it("does not open a span on an unmatched backtick", () => {
        expect(rewrite("a ` stray backtick and [[doc-shock]]")).toBe(
            "a ` stray backtick and X",
        );
    });

    it("does not carry a span across a blank line", () => {
        expect(rewrite("a `open\n\nand [[doc-shock]]")).toBe(
            "a `open\n\nand X",
        );
    });
});

describe("codeRegions", () => {
    it("returns the regions in source order", () => {
        const src = "`a`\n\n```\nb\n```\n";
        const regions = codeRegions(src);
        expect(regions.map((r) => src.slice(r.start, r.end))).toEqual([
            "`a`",
            "```\nb\n```",
        ]);
    });

    it("reports nothing for a body with no code", () => {
        expect(codeRegions("plain [[doc-shock]] prose")).toEqual([]);
    });

    it("tolerates an empty or absent body", () => {
        expect(codeRegions("")).toEqual([]);
        expect(codeRegions(undefined)).toEqual([]);
    });
});

describe("matchAllOutsideCode", () => {
    it("yields only the matches outside code, with their captures", () => {
        const src = "[[a-b]]\n```\n[[c-d]]\n```\n`[[e-f]]` [[g-h]]";
        const hits = [...matchAllOutsideCode(src, /\[\[([^\]\n]+)\]\]/g)].map(
            (m) => m[1],
        );
        expect(hits).toEqual(["a-b", "g-h"]);
    });
});
