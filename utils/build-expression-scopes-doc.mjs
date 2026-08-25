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
 * Generate the "Bound variables" section of
 * `kb/dev-docs/concepts/expressions.md` from the expression-scope catalog
 * (`src/entity/expr/expression-scopes.mjs`).
 *
 * The catalog is the same module the runtime validates against and the editor
 * autocompletes from, so a generated table cannot drift from the code the way
 * the hand-maintained one did (issue #1142: it documented 8 of 12 call sites and
 * nothing failed).
 *
 * Run via `npm run docs:expr-scopes`; `npm run lint` runs this with `--check`
 * and fails when the committed section is stale.
 *
 * Only the region between the BEGIN/END markers is rewritten — the surrounding
 * prose stays hand-written.
 *
 * The result is then run through Prettier, so the page satisfies the generator
 * and `prettier --check` at once. Without that the two disagree permanently:
 * Prettier realigns the generated table's columns, this generator writes them
 * back, and whichever ran last leaves the other failing. Formatting here is what
 * lets the page stay under Prettier rather than being excluded from it — it is a
 * hand-written concept doc that happens to carry one generated table, so
 * excluding it would leave all of its prose unformatted.
 */

import fs from "fs";
import { emitDiagnostic } from "@heroiclands/package-build/engine/diagnostics";
import path from "path";
import { formatGenerated } from "./format-generated.mjs";
import { EXPRESSION_SCOPES } from "../src/entity/expr/expression-scopes.mjs";

const DOC = path.resolve("kb/dev-docs/concepts/expressions.md");
const BEGIN = "<!-- BEGIN GENERATED: expression-scopes -->";
const END = "<!-- END GENERATED: expression-scopes -->";

/**
 * Escape the cell separator so a description containing a pipe cannot break the
 * table it is rendered into.
 * @param {string} text - Raw cell text.
 * @returns {string} Table-safe cell text.
 */
function cell(text) {
    return String(text).replace(/\|/g, "\\|");
}

/**
 * Render the generated section: a call-site summary table, then a per-scope
 * definition list of every binding and its meaning.
 * @returns {string} The markdown between the BEGIN/END markers (no markers).
 */
export function buildExpressionScopesSection() {
    const entries = Object.entries(EXPRESSION_SCOPES);

    const rows = entries.map(([id, scope]) => {
        const bindings = Object.keys(scope.bindings);
        const list =
            bindings.length ?
                bindings.map((b) => `\`${b}\``).join(", ")
            :   "_none_";
        const open = scope.open ? " _(open)_" : "";
        return `| ${cell(scope.label)} | ${cell(scope.site)} | ${cell(scope.field)} | ${list}${open} | ${cell(scope.result)} |`;
    });

    const lines = [
        "| Call site | Where | Field(s) | Bindings | Result |",
        "| --------- | ----- | -------- | -------- | ------ |",
        ...rows,
        "",
        "Scopes marked _(open)_ carry a context that varies at runtime, so an",
        "identifier beyond those listed is permitted there; everywhere else, an",
        "identifier the scope does not declare is rejected when the expression is",
        "compiled.",
        "",
        "#### What each binding means",
        "",
    ];

    for (const [id, scope] of entries) {
        lines.push(`**\`${id}\`** — ${scope.summary}`);
        lines.push("");
        if (Object.keys(scope.bindings).length === 0) {
            lines.push(
                "- _No bindings._ Only literals and helper calls may appear.",
            );
        } else {
            for (const [name, description] of Object.entries(scope.bindings)) {
                lines.push(`- \`${name}\` — ${description}`);
            }
        }
        lines.push("");
    }

    return lines.join("\n").trimEnd();
}

/**
 * Splice the generated section into the documentation file's marker region.
 * @param {string} current - The current file contents.
 * @returns {string} The file contents with the region regenerated.
 * @throws {Error} If either marker is missing.
 */
export function renderDoc(current) {
    const start = current.indexOf(BEGIN);
    const end = current.indexOf(END);
    if (start === -1 || end === -1 || end < start) {
        throw new Error(
            `Missing ${BEGIN} / ${END} markers in ${path.relative(process.cwd(), DOC)}`,
        );
    }
    const head = current.slice(0, start + BEGIN.length);
    const tail = current.slice(end);
    return `${head}\n\n${buildExpressionScopesSection()}\n\n${tail}`;
}

const isCheck = process.argv.includes("--check");
const rel = path.relative(process.cwd(), DOC);
const current = fs.readFileSync(DOC, "utf8");
const next = await formatGenerated(renderDoc(current), DOC);

if (isCheck) {
    if (current !== next) {
        emitDiagnostic({
            file: rel,
            severity: "error",
            message:
                "the generated expression-scope section is out of date — run " +
                "`npm run docs:expr-scopes` and commit the result",
        });
        process.exit(1);
    }
    console.log(`✓ ${rel} expression-scope section is up to date.`);
} else if (current === next) {
    console.log(`✓ ${rel} expression-scope section already up to date.`);
} else {
    fs.writeFileSync(DOC, next);
    console.log(`✓ ${rel} expression-scope section regenerated.`);
}
