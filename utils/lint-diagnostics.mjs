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
 * How every `utils/check-*.mjs` linter reports a finding (#1668).
 *
 * A linter's output is a **work list**, and a finding is only actionable if it
 * says where it is. Before this module each script invented its own report:
 * some named a file and no line, some carried a line in an indented, ad-hoc
 * layout, and no two agreed — so acting on a failure meant re-finding what the
 * linter already knew.
 *
 * Findings are now emitted in the form every C-family compiler, `tsc` and
 * ESLint already use, so nothing has to be taught to read it:
 *
 * ```text
 * assets/content/Regions/Capital_Nome.md:43:635: error: dead wikilink [[Kenbet_Pat]]
 * ```
 *
 * `file:line:column: severity: message`. Two rules keep it parseable:
 *
 * - _The path starts the line._ A finding is never indented and never prefixed.
 *   Leading whitespace alone puts it outside what a standard error matcher
 *   reads, which is exactly what the old `  <file>:<line>: …` form did.
 * - _A field is dropped, never guessed._ A position that cannot be established
 *   honestly is omitted (`file: error: …`) rather than defaulted to `1:1`,
 *   which would send a reader to the top of the file every time.
 *
 * Summary counts and the explanatory paragraphs each linter prints are **not**
 * findings and keep their prose form — nothing needs to parse them.
 *
 * This is the same contract `@heroiclands/content-build` adopted for its own
 * note diagnostics (content-build#17). It is stated here rather than imported
 * because these linters check *this* repository's source, docs, lang files and
 * e2e specs — subjects the content package knows nothing about — and because
 * the lint chain must not wait on a content-build release to run. If the two
 * ever need to be one module, this file is the seam to collapse.
 */

import path from "node:path";

/**
 * The `file:line:column` locator, with whatever is known.
 *
 * The path is relativized against the working directory — the repository root
 * for every lint script — so it is both shorter to read and what an editor
 * resolves a relative diagnostic against. A path outside the tree stays
 * absolute, since a `../../..` locator helps nobody.
 *
 * @param {object} at
 * @param {string} [at.file] - Absolute or repository-relative path.
 * @param {number} [at.line] - 1-based line.
 * @param {number} [at.column] - 1-based column. Ignored without a line.
 * @returns {string} The locator, or `""` when not even a file is known.
 */
export function formatLocator({ file, line, column } = {}) {
    if (!file) return "";
    let shown = file;
    if (path.isAbsolute(file)) {
        const rel = path.relative(process.cwd(), file);
        // `..` means the file sits outside the working directory; an absolute
        // path is the more useful of the two there.
        if (rel && !rel.startsWith("..")) shown = rel;
    }
    if (!Number.isFinite(line)) return shown;
    if (!Number.isFinite(column)) return `${shown}:${line}`;
    return `${shown}:${line}:${column}`;
}

/**
 * One finding, as a parseable line.
 *
 * @param {object} d
 * @param {string} [d.file] - The file the finding is about.
 * @param {number} [d.line] - 1-based line.
 * @param {number} [d.column] - 1-based column.
 * @param {"error"|"warning"} d.severity - Which of the two levels this is.
 * @param {string} d.message - What is wrong, in one sentence.
 * @returns {string} `file:line:column: severity: message`, with any unknown
 *   leading field omitted.
 */
export function formatDiagnostic({ file, line, column, severity, message }) {
    const locator = formatLocator({ file, line, column });
    return `${locator ? `${locator}: ` : ""}${severity}: ${message}`;
}

/**
 * Prints one finding on stderr.
 *
 * Findings go to stderr whatever their severity: they are the output a caller
 * pipes or matches, kept clear of the summary prose on stdout.
 *
 * @param {object} d - As {@link formatDiagnostic}.
 * @returns {void}
 */
export function reportDiagnostic(d) {
    console.error(formatDiagnostic(d));
}

/**
 * Where a literal sits in a text, so a linter can report the position it
 * already had implicitly.
 *
 * Most findings are *about* a string the linter matched — a wikilink, a
 * hardcoded caption, a marker. Its position is then a string search away, which
 * is worth doing: it costs nothing and it is the difference between a finding
 * that can be opened and one that has to be hunted for.
 *
 * @param {string} text - The file's contents.
 * @param {string} needle - The literal to locate.
 * @param {number} [occurrence=1] - Which occurrence, 1-based. Repeats of the
 *   same literal are otherwise indistinguishable — the symptom that motivated
 *   this whole change.
 * @returns {{line: number, column: number}|undefined} 1-based position, or
 *   `undefined` when the literal is not there. A caller that gets `undefined`
 *   reports the file alone rather than a position that is not the problem.
 */
export function locateInText(text, needle, occurrence = 1) {
    if (typeof text !== "string" || !needle) return undefined;
    let at = -1;
    for (let n = 0; n < occurrence; n++) {
        at = text.indexOf(needle, at + 1);
        if (at === -1) return undefined;
    }
    const before = text.slice(0, at);
    return {
        line: before.split("\n").length,
        column: at - before.lastIndexOf("\n"),
    };
}

/**
 * Where a literal sits, as the fields {@link formatDiagnostic} takes.
 *
 * Saves every caller the same three-line spread, and keeps the
 * drop-rather-than-guess rule in one place: an unfound literal contributes no
 * position at all instead of `undefined` fields that read as a bug.
 *
 * @param {string} text - The file's contents.
 * @param {string} needle - The literal to locate.
 * @param {number} [occurrence=1] - Which occurrence, 1-based.
 * @returns {{line?: number, column?: number}} Spreadable position fields.
 */
export function positionOf(text, needle, occurrence = 1) {
    return locateInText(text, needle, occurrence) ?? {};
}
