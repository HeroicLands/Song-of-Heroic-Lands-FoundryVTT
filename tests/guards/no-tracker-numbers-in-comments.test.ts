/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Attribution guard: no comment in the source trees cites a tracker number. A
 * number dates the instant the tracker entry closes; a reader has
 * `CHANGELOG.md`, the commit log, and the pull requests for history, and the
 * comment it displaces states the rule or the behaviour instead.
 *
 * Only comment text is examined: `//` and `/* *\/` in scripts and styles,
 * `{{!-- --}}` and `<!-- -->` in templates. Code, string literals and colour
 * values are never read, so `&#8212;` or a quoted `"#783"` cannot match.
 *
 * Cited forms: `(#NN)`, `issue N`, `epic #NN`, `Feature N`, `repo#NN`,
 * `owner/repo#NN` and a bare `#NN`. A bare number that is three repeated
 * digits (`#000`) or sits in a comment using colour vocabulary (`color`,
 * `fill`, `border`, ...) is a colour and passes; a 6- or 8-digit run never
 * matches because the digit run is bounded.
 *
 * `cypress/` is checked for comments but an `it.skip`/`describe.skip` title is
 * a string literal carrying its blocking issue as `(#NN)` by convention,
 * cross-checked against `utils/check-e2e-red.mjs`; it is not a comment and is
 * not read. The file list is derived from the tree at run time.
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";
import { describe, expect, it } from "vitest";

const TRACKER_CITATION = new RegExp(
    [
        String.raw`\(#[0-9]{2,4}(?!\d)(?:\s*[,/]\s*#[0-9]{2,4}(?!\d))*[^)]*\)`,
        String.raw`\b(?:issue|epic|Feature)s?\s+#?[0-9]{1,4}(?!\d)`,
        String.raw`[A-Za-z][\w.-]*(?:/[A-Za-z][\w.-]*)?#[0-9]{1,4}(?!\d)`,
        String.raw`(?<![\w&#/&-])#[0-9]{2,4}(?![\w-])`,
    ].join("|"),
    "gi",
);

const COLOUR_CONTEXT = /color|fill|hex|rgb|border|solid|outline|background|shadow/i;

/** Every file under the trees this guard covers, as a repo-relative path. */
const FILES = globSync(
    [
        "templates/**/*.hbs",
        "scss/**/*.scss",
        "src/**/*.{ts,mjs,js}",
        "cypress/**/*.{js,ts}",
        "utils/**/*.mjs",
        "tests/**/*.{ts,js}",
        "*.{js,mjs,ts}",
    ],
    { posix: true, nodir: true, ignore: ["tests/guards/no-tracker-numbers-in-comments.test.ts"] },
).sort();

/** Comment text of one source file, as `[lineIndex, text]` pairs. */
function comments(file: string, source: string): Array<[number, string]> {
    const out: Array<[number, string]> = [];
    const lines = source.split("\n");
    const template = file.endsWith(".hbs");
    let block: string | undefined;
    lines.forEach((line, index) => {
        if (block !== undefined) {
            const end = line.indexOf(block);
            if (end === -1) {
                out.push([index, line]);
                return;
            }
            out.push([index, line.slice(0, end)]);
            line = line.slice(end + block.length);
            block = undefined;
        }
        let rest = line;
        for (;;) {
            const openers: Array<[number, string, string]> = [];
            const add = (open: string, close: string) => {
                const at = rest.indexOf(open);
                if (at !== -1) openers.push([at, open, close]);
            };
            if (template) {
                add("{{!--", "--}}");
                add("<!--", "-->");
            } else {
                add("/*", "*/");
                const slash = rest.search(/(?<![:"'\w])\/\/(?!\/?$)/);
                if (slash !== -1) openers.push([slash, "//", ""]);
            }
            if (openers.length === 0) return;
            openers.sort((x, y) => x[0] - y[0]);
            const [at, open, close] = openers[0]!;
            const after = rest.slice(at + open.length);
            if (close === "") {
                out.push([index, after]);
                return;
            }
            const end = after.indexOf(close);
            if (end === -1) {
                out.push([index, after]);
                block = close;
                return;
            }
            out.push([index, after.slice(0, end)]);
            rest = after.slice(end + close.length);
        }
    });
    return out;
}

/** A bare `#NNN` that reads as a colour: repeated digits, or colour vocabulary nearby. */
function isColour(token: string, text: string): boolean {
    return /^#(\d)\1\1$/.test(token) || COLOUR_CONTEXT.test(text);
}

/** Every tracker-number citation in one file's comments, as `file:line: match`. */
function findings(file: string, source: string): string[] {
    const out: string[] = [];
    for (const [index, text] of comments(file, source)) {
        for (const match of text.matchAll(TRACKER_CITATION)) {
            if (match[0].startsWith("#") && isColour(match[0], text)) continue;
            out.push(`${file}:${index + 1}: ${match[0]}`);
        }
    }
    return out;
}

describe("source comments carry no tracker-number citations", () => {
    it("finds files to check", () => {
        // A glob that matches nothing would pass every assertion below.
        expect(FILES.length).toBeGreaterThan(0);
    });

    it("has no tracker-number citation in any file", () => {
        const offenders = FILES.flatMap((file) => findings(file, readFileSync(file, "utf8")));
        expect(offenders).toEqual([]);
    });

    it("matches a bare citation and a joined list, not a colour or a selector", () => {
        expect(findings("x.scss", "// re-themed for the light band (#810).\n")).toEqual([
            "x.scss:1: (#810)",
        ]);
        expect(findings("x.hbs", "{{!-- sub-type edits its fields (#926). --}}\n")).toEqual([
            "x.hbs:1: (#926)",
        ]);
        expect(findings("x.hbs", "{{!-- only its columns (#927, #939). --}}\n")).toEqual([
            "x.hbs:1: (#927, #939)",
        ]);
        // Trailing prose before the close paren is still one citation.
        expect(findings("x.scss", "// re-themed for the light band (#810, follow-up).\n")).toEqual([
            "x.scss:1: (#810, follow-up)",
        ]);
        // A 6-digit hex colour pair in a function call is not two short tracker
        // numbers.
        expect(findings("x.scss", "outline: 2px solid light-dark(#805500, #f2b950);\n")).toEqual(
            [],
        );
        // A bare colour carries no wrapping parens at all.
        expect(findings("x.scss", "color: #000;\n")).toEqual([]);
        expect(findings("x.scss", "// the same #87 element reason\n")).toEqual(["x.scss:1: #87"]);
        expect(findings("x.scss", "// (epic #783, Feature 0)\n")).toEqual([
            "x.scss:1: epic #783",
            "x.scss:1: Feature 0",
        ]);
        expect(findings("x.scss", "// see package-build#183 for it\n")).toEqual([
            "x.scss:1: package-build#183",
        ]);
        expect(findings("x.hbs", "<!-- see issue #915 -->\n")).toEqual(["x.hbs:1: issue #915"]);
        expect(findings("x.js", "/*\n * #917 - icons\n */\n")).toEqual(["x.js:2: #917"]);
        // Code, entities and colours outside comments are never read.
        expect(findings("x.hbs", "<span>&#8212;</span> color: #123;\n")).toEqual([]);
        expect(findings("x.js", 'const c = "#783"; const u = "http://a/#12";\n')).toEqual([]);
        // An id selector or an anchor link never opens with a digit, so it never
        // takes the `(#NNN)` shape to begin with.
        expect(findings("x.hbs", "{{!-- see [[doc-foo#bar-baz|Foo]] --}}\n")).toEqual([]);
    });
});
