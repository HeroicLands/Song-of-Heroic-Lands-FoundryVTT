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
 * Deferral guard: no markdown note under `assets/content/` carries a `TODO` or
 * `FIXME` marker. Deferred work is a GitHub issue carrying the note and the
 * section it promises, not a comment in the tree — a marker in a published note
 * is invisible to the reader while the page still promises something it does
 * not say.
 *
 * The org-wide `todos` action enforces the same rule over comments under
 * `src/`, and reads content markdown as prose rather than as code, so the
 * content tree needs its own assertion.
 *
 * The file list is derived from the tree at run time, so a new note is covered
 * the moment it lands.
 *
 * Code is exempt, the way the `todos` action exempts a string literal: a fenced
 * block and an inline code span are both masked before matching, which is what
 * lets the developer documentation state the rule by quoting `TODO`. The word
 * has to stand on its own to be a finding, so prose about "TODOs" reads as
 * prose.
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";
import { describe, expect, it } from "vitest";

const MARKER = /\b(?:TODO|FIXME)\b/g;

/** Every markdown note in the content tree, as a path relative to the root. */
const NOTES = globSync("assets/content/**/*.md", { posix: true }).sort();

/** Replace every character but a newline with a space, so positions survive. */
const blank = (text: string): string => text.replace(/[^\n]/g, " ");

/** One line with each of its inline code spans blanked. */
function maskSpans(line: string): string {
    let out = "";
    let at = 0;
    while (at < line.length) {
        if (line[at] !== "`") {
            out += line[at];
            at += 1;
            continue;
        }
        let run = 0;
        while (line[at + run] === "`") run += 1;
        const close = line.indexOf("`".repeat(run), at + run);
        if (close === -1) {
            // An unmatched run opens no span, so it masks nothing.
            out += line.slice(at, at + run);
            at += run;
            continue;
        }
        const end = close + run;
        out += blank(line.slice(at, end));
        at = end;
    }
    return out;
}

/** Every marker in one note's source, as `file:line:column: TODO`. */
function findings(file: string, source: string): string[] {
    const out: string[] = [];
    let fence: string | undefined;
    source.split("\n").forEach((line, index) => {
        const delimiter = /^[ \t]*(`{3,}|~{3,})/.exec(line)?.[1];
        if (fence !== undefined) {
            // A fence closes on a run of its own character, at least as long.
            if (delimiter?.startsWith(fence[0]!) && delimiter.length >= fence.length) {
                fence = undefined;
            }
            return;
        }
        if (delimiter !== undefined) {
            fence = delimiter;
            return;
        }
        for (const match of maskSpans(line).matchAll(MARKER)) {
            out.push(`${file}:${index + 1}:${match.index + 1}: ${match[0]}`);
        }
    });
    return out;
}

describe("assets/content carries no deferral markers", () => {
    it("finds markdown to check", () => {
        // A glob that matches nothing would pass every assertion below.
        expect(NOTES.length).toBeGreaterThan(0);
    });

    it("has no TODO or FIXME marker in any note", () => {
        const offenders = NOTES.flatMap((file) => findings(file, readFileSync(file, "utf8")));
        expect(offenders).toEqual([]);
    });

    it("masks code but not an HTML comment", () => {
        // The exemption has to be narrow enough that the markers this guard
        // exists for are still findings.
        expect(findings("x.md", "a `TODO` marker\n")).toEqual([]);
        expect(findings("x.md", "```text\nTODO\n```\n")).toEqual([]);
        expect(findings("x.md", "### No TODOs in code\n")).toEqual([]);
        expect(findings("x.md", "<!-- TODO: write this -->\n")).toEqual(["x.md:1:6: TODO"]);
        expect(findings("x.md", "a\nFIXME later\n")).toEqual(["x.md:2:1: FIXME"]);
    });
});
