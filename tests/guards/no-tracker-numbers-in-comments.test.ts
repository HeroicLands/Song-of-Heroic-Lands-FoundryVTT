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
 * Attribution guard: no comment under `templates/` or `scss/` cites a tracker
 * number. A number dates the instant the tracker entry closes; a reader has
 * `CHANGELOG.md`, the commit log, and the pull requests for history, and the
 * comment it displaces states the rule or the behaviour instead.
 *
 * `src/`, `tests/`, and `utils/` carry none, so this guard is scoped to the
 * trees that still could regress.
 *
 * `cypress/` is deliberately excluded: an `it.skip`/`describe.skip` title
 * there carries its blocking issue as `(#NN)` by convention, cross-checked
 * against `utils/check-e2e-red.mjs`'s `FENCED_RED_ALLOWLIST` — stripping the
 * number there breaks that guard rather than fixing anything. That citation is
 * a live cross-reference a tool reads, not a comment dating itself.
 *
 * The pattern is deliberately narrow: a `(` directly followed by `#` and 2-4
 * digits, optionally repeated as a `,`/`/`-joined list, with anything up to
 * the closing `)`. A hex colour or an id selector never takes that shape in
 * this tree — a colour is a bare `#rrggbb` with no wrapping parens, and the
 * digit run is bounded on the right (`(?!\d)`) so a 6- or 8-digit colour like
 * `light-dark(#805500, #f2b950)` is never mistaken for two short tracker
 * numbers. The file list is derived from the tree at run time, so a new file
 * is covered the moment it lands.
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";
import { describe, expect, it } from "vitest";

const TRACKER_CITATION = /\(#[0-9]{2,4}(?!\d)(?:\s*[,/]\s*#[0-9]{2,4}(?!\d))*[^)]*\)/g;

/** Every file under the trees this guard covers, as a repo-relative path. */
const FILES = globSync(["templates/**/*.hbs", "scss/**/*.scss"], { posix: true }).sort();

/** Every tracker-number citation in one file's source, as `file:line: match`. */
function findings(file: string, source: string): string[] {
    const out: string[] = [];
    source.split("\n").forEach((line, index) => {
        for (const match of line.matchAll(TRACKER_CITATION)) {
            out.push(`${file}:${index + 1}: ${match[0]}`);
        }
    });
    return out;
}

describe("templates/scss carry no tracker-number citations", () => {
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
        // An id selector or an anchor link never opens with a digit, so it never
        // takes the `(#NNN)` shape to begin with.
        expect(findings("x.hbs", "{{!-- see [[doc-foo#bar-baz|Foo]] --}}\n")).toEqual([]);
    });
});
