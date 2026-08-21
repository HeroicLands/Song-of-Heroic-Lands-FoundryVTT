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
 * **The contract itself lives in `@heroiclands/content-build`**
 * (`engine/diagnostics`, content-build#17), and this module re-exports it
 * rather than restating it. It was briefly stated here because the package had
 * not published it yet; once 0.7.0 did, keeping a second copy would have been
 * the same one-rule-two-implementations drift that #1664 was — a format both
 * sides must agree on, with nothing making them.
 *
 * Locating a literal in an arbitrary file is the other half, and content-build
 * has no equivalent: its `positionInBody` maps an *offset* within a parsed note
 * body back to its file, which is a different job — these linters read source,
 * docs, lang files and e2e specs, none of which are notes. That half now lives
 * in `@heroiclands/package-build`, whose whole subject is the non-content parts
 * of a Foundry package, and this module re-exports it for the same reason it
 * re-exports the format: a rule both sides must agree on, with nothing making
 * them, is the drift #1664 was.
 *
 * So nothing is defined here any more. The module survives as the name
 * twenty-odd linters already import, which is churn worth not spending.
 */

import {
    formatLocator,
    formatDiagnostic,
    emitDiagnostic,
} from "@heroiclands/content-build/engine/diagnostics";
import { locateInText, positionOf } from "@heroiclands/package-build/text";

export { formatLocator, formatDiagnostic, locateInText, positionOf };

/**
 * Prints one finding on stderr.
 *
 * A thin alias for the package's {@link emitDiagnostic}, kept because nineteen
 * linters already call it by this name and the rename would be churn. Both
 * severities reach stderr either way — `console.warn` is a stderr stream in
 * Node — so findings stay clear of the summary prose on stdout, which is the
 * property the linters depend on.
 *
 * @param {object} d - As {@link formatDiagnostic}.
 * @returns {void}
 */
export const reportDiagnostic = emitDiagnostic;
