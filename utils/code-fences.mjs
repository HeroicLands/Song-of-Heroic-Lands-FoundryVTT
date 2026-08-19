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
 * Where **code** lives in a markdown body, so a rewriter can leave it alone.
 *
 * A code block is verbatim: its contents are shown to the reader exactly as
 * written. Every build-time rewriter that pattern-matches a body therefore has
 * to know where code is — otherwise a source listing that happens to contain
 * the rewriter's syntax is silently corrupted. Wikilink conversion met this as
 * `[[0]]` inside a fence being turned into a link (#1505), and it depended on
 * the surrounding literal's shape (`[[1,2],[3,4]]` survived), so the corruption
 * looked arbitrary.
 *
 * Three forms are recognised, which is every form the content tree uses:
 *
 * - **Fenced blocks** — three or more backticks or tildes, closed by the same
 *   character at least as long, or by the end of the document. A longer fence
 *   contains a shorter one, so a markdown sample can quote a code sample. The
 *   opening line, info string and all, is part of the block.
 * - **Indented blocks** — four columns past the enclosing context, following a
 *   blank line (an indent cannot interrupt a paragraph).
 * - **Inline spans** — a run of backticks closed by a run of equal length,
 *   within one paragraph.
 *
 * The fence syntax is the one `expandContentTables` already reads, and
 * this module owns it now so the two can never disagree.
 *
 * **Known limits.** This is a scanner, not a markdown parser, and it errs
 * towards treating something as code — a false positive leaves an author's text
 * as written, a false negative rewrites it. List nesting is tracked only to the
 * innermost open marker, so an indented block inside a deeply nested list may be
 * read as list prose; a backslash-escaped backtick still counts as a span
 * delimiter; and HTML blocks are not code (they are not verbatim in markdown
 * either). None of these can turn code into a link — the failure this exists to
 * prevent.
 */

/** A fence line, capturing its indent, its marker, and its info string. */
export const FENCE_LINE = /^([ \t]*)(`{3,}|~{3,})[ \t]*([^\r\n]*)$/;

/** A list item's opening line, capturing the indent and the marker itself. */
const LIST_MARKER = /^([ \t]*)(?:[-*+]|\d{1,9}[.)])(?:[ \t]+|$)/;

/** A line's leading whitespace. */
const LEADING = /^[ \t]*/;

/**
 * The column a run of leading whitespace reaches, tabs expanded to four.
 *
 * @param {string} space - Leading whitespace only.
 * @returns {number} The column the first non-space character sits at.
 */
function column(space) {
    let col = 0;
    for (const ch of space) col = ch === "\t" ? col + 4 - (col % 4) : col + 1;
    return col;
}

/**
 * Every code region in a markdown body, as character offsets into it.
 *
 * @param {string | null | undefined} markdown - The body (frontmatter already
 *   stripped). An absent body has no code in it.
 * @param {object} [options]
 * @param {boolean} [options.spans=true] - Include inline code spans. Set false
 *   to consider only block-level code.
 * @returns {Array<{start: number, end: number}>} Non-overlapping regions, in
 *   source order. `end` is exclusive.
 */
export function codeRegions(markdown, { spans = true } = {}) {
    const src = String(markdown ?? "");
    if (!src) return [];
    const lines = src.split("\n");

    // Where each line begins, so a region can be reported in the caller's own
    // coordinates rather than in lines.
    const at = [];
    let offset = 0;
    for (const line of lines) {
        at.push(offset);
        offset += line.length + 1;
    }
    const through = (first, last) => ({
        start: at[first],
        end: at[last] + lines[last].length,
    });

    const regions = [];
    // The content column of the innermost open list item: an indented block
    // has to clear *that*, not column zero, or every list continuation would
    // read as code.
    let listColumn = null;
    // The start of the document counts as a blank line, so a body that opens
    // with an indented sample is still code.
    let afterBlank = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const fence = FENCE_LINE.exec(line);
        if (fence) {
            const marker = fence[2];
            const closer = new RegExp(
                `^[ \\t]*${marker[0]}{${marker.length},}[ \\t]*$`,
            );
            let close = i + 1;
            while (close < lines.length && !closer.test(lines[close])) close++;
            // An unclosed fence runs to the end of the document.
            regions.push(through(i, Math.min(close, lines.length - 1)));
            i = close;
            afterBlank = false;
            continue;
        }

        if (line.trim() === "") {
            afterBlank = true;
            continue;
        }

        const indent = column(LEADING.exec(line)[0]);
        const codeColumn = (listColumn ?? 0) + 4;
        if (afterBlank && indent >= codeColumn) {
            // The block runs to the last line still indented that far; blank
            // lines inside it belong to it, trailing ones do not.
            let last = i;
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim() === "") continue;
                if (column(LEADING.exec(lines[j])[0]) < codeColumn) break;
                last = j;
            }
            regions.push(through(i, last));
            i = last;
            afterBlank = false;
            continue;
        }

        const marker = LIST_MARKER.exec(line);
        if (marker) {
            listColumn = column(marker[0]);
        } else if (listColumn !== null && indent < listColumn) {
            // Prose back at the outer margin closes the list.
            listColumn = null;
        }
        afterBlank = false;
    }

    if (spans) regions.push(...codeSpans(src, regions));
    regions.sort((a, b) => a.start - b.start);
    return regions;
}

/**
 * The inline code spans outside the block-level regions already found.
 *
 * A run of _n_ backticks opens a span that the next run of exactly _n_ closes.
 * A run with no partner is a literal backtick, and a span cannot cross a blank
 * line — both are CommonMark's rules, and both are what an author expects when
 * a stray backtick appears in prose.
 *
 * @param {string} src - The body.
 * @param {Array<{start: number, end: number}>} blocks - Block-level regions.
 * @returns {Array<{start: number, end: number}>} The spans, in source order.
 */
function codeSpans(src, blocks) {
    const runs = [];
    const backticks = /`+/g;
    let run;
    while ((run = backticks.exec(src)) !== null) {
        if (!inside(blocks, run.index)) {
            runs.push({ start: run.index, length: run[0].length });
        }
    }

    const spans = [];
    for (let i = 0; i < runs.length; i++) {
        const open = runs[i];
        let close = i + 1;
        while (close < runs.length && runs[close].length !== open.length) {
            close++;
        }
        if (close >= runs.length) continue; // no partner: a literal backtick
        const end = runs[close].start + runs[close].length;
        if (/\n[ \t]*\n/.test(src.slice(open.start, end))) continue;
        spans.push({ start: open.start, end });
        i = close;
    }
    return spans;
}

/**
 * Is this offset inside one of the regions?
 *
 * @param {Array<{start: number, end: number}>} regions - Sorted regions.
 * @param {number} offset - A character offset.
 * @returns {boolean}
 */
function inside(regions, offset) {
    for (const region of regions) {
        if (offset < region.start) return false;
        if (offset < region.end) return true;
    }
    return false;
}

/**
 * The offset argument of a `String.prototype.replace` callback.
 *
 * The callback is handed `(match, ...groups, offset, source)`, plus a groups
 * object when the pattern has named groups — so the offset is found from the
 * end, not by counting captures the caller might change.
 *
 * @param {Array<unknown>} args - The callback's own arguments.
 * @returns {number} The match's offset into the source.
 */
function offsetOf(args) {
    const last = args[args.length - 1];
    return typeof last === "string" ?
            args[args.length - 2]
        :   args[args.length - 3];
}

/**
 * `String.prototype.replace`, skipping anything inside code.
 *
 * A match inside a code region is returned as it was written, so the block
 * stays verbatim; the replacer is not called for it at all, which matters when
 * it records a side effect (an unresolved link, say).
 *
 * @param {string} markdown - The body.
 * @param {RegExp} pattern - A **global** pattern to rewrite.
 * @param {(...args: Array<any>) => string} replacer - As `replace` takes.
 * @param {object} [options] - Passed to {@link codeRegions}.
 * @returns {string} The rewritten body.
 */
export function replaceOutsideCode(markdown, pattern, replacer, options) {
    const src = String(markdown ?? "");
    const regions = codeRegions(src, options);
    if (regions.length === 0) return src.replace(pattern, replacer);
    return src.replace(pattern, (...args) =>
        inside(regions, offsetOf(args)) ? args[0] : replacer(...args),
    );
}

/**
 * `String.prototype.matchAll`, skipping anything inside code.
 *
 * @param {string} markdown - The body.
 * @param {RegExp} pattern - A **global** pattern to search for.
 * @param {object} [options] - Passed to {@link codeRegions}.
 * @returns {Array<RegExpMatchArray>} The matches outside code, in source order.
 */
export function matchAllOutsideCode(markdown, pattern, options) {
    const src = String(markdown ?? "");
    const regions = codeRegions(src, options);
    return [...src.matchAll(pattern)].filter(
        (match) => !inside(regions, match.index),
    );
}
