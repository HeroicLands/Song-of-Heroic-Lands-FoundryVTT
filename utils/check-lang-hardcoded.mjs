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
 * CI guard (issue #1354): the **reverse** of `check-lang-coverage.mjs`.
 *
 * That guard walks *key → `en.json`* and so cannot see a template that never
 * mentions a key at all. Before #1350 there were 516 hardcoded English literals
 * across 61 templates, and translating every key in `en.json` would still have
 * left those surfaces in English.
 *
 * This walks *UI text → key*: every user-visible literal in `templates/**` must
 * be a `{{localize}}` call, not English in the markup. It reads text nodes and
 * the user-visible attributes once Handlebars expressions are stripped.
 *
 * It also **compiles** every template, because the usual way to break one while
 * localizing it is to nest `{{localize …}}` inside another mustache — legal in
 * an HTML attribute, a parse error inside a helper's hash (a `(localize …)`
 * subexpression is required there).
 *
 * Usage:
 *   npm run lint:lang-hardcoded
 *   node utils/check-lang-hardcoded.mjs
 */
import { readFileSync } from "node:fs";
import { reportDiagnostic, positionOf } from "./lint-diagnostics.mjs";
import { globSync } from "glob";
import Handlebars from "handlebars";

/** Attributes whose value the user reads. */
const VISIBLE_ATTRS = [
    "title",
    "placeholder",
    "aria-label",
    "alt",
    "data-tooltip",
    "data-title",
];

/**
 * Literals that are deliberately **not** localization keys, each with the reason
 * it cannot be one. Keep this short and justified — it is the escape hatch, not
 * the rule. Anything that is ordinary UI prose belongs in `lang/en.json`.
 *
 * Format: `[literal, reason]`.
 */
const ALLOWED = [
    [
        "item.system.code === 'pyrn'",
        "A SafeExpression example shown as a placeholder — code, not prose.",
    ],
];
const allowed = new Set(ALLOWED.map(([literal]) => literal));

/**
 * User-visible English left in a template once Handlebars is stripped.
 *
 * @param {string} src - The template source.
 * @returns {string[]} The offending literals, attribute-qualified where relevant.
 */
function hardcodedLiterals(src) {
    const stripped = src
        .replace(/\{\{![\s\S]*?\}\}/g, " ")
        .replace(/\{\{[^}]*\}\}/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<script[\s\S]*?<\/script>/g, " ");
    const found = [];
    // An HTML entity (`&infin;`, `&middot;`) is a symbol, not prose — its
    // letters are markup, so drop entities before looking for words.
    const isProse = (t) =>
        /[A-Za-z]{2}/.test(t.replace(/&[a-zA-Z]+;|&#\d+;/g, " ")) &&
        !allowed.has(t);

    for (const m of stripped.matchAll(/>([^<>]+)</g)) {
        const text = m[1].replace(/\s+/g, " ").trim();
        // `needle` is the text *unnormalized*, which is what locates it in the
        // source: `stripped` has had substitutions of a different length, so
        // the match index cannot be carried across (#1668).
        if (isProse(text)) found.push({ text, needle: m[1] });
    }
    for (const attr of VISIBLE_ATTRS) {
        const re = new RegExp(`\\b${attr}="([^"]*)"`, "g");
        for (const m of stripped.matchAll(re)) {
            const text = m[1].replace(/\s+/g, " ").trim();
            if (isProse(text)) {
                found.push({ text: `${attr}="${text}"`, needle: m[0] });
            }
        }
    }
    return found;
}

const templates = globSync("templates/**/*.hbs").sort();
if (templates.length < 50) {
    console.error(
        `check-lang-hardcoded: only ${templates.length} template(s) found — ` +
            "run from the repository root.",
    );
    process.exit(1);
}

let offenders = 0;
let broken = 0;
for (const file of templates) {
    const src = readFileSync(file, "utf8");
    for (const { text, needle } of hardcodedLiterals(src)) {
        offenders++;
        reportDiagnostic({
            file,
            ...positionOf(src, needle),
            severity: "error",
            message: `hardcoded user-visible string: ${text}`,
        });
    }
    try {
        Handlebars.precompile(src);
    } catch (err) {
        broken++;
        reportDiagnostic({
            file,
            // Handlebars reports a line/column of its own for a parse error.
            line: err?.hash?.loc?.first_line ?? err?.lineNumber,
            column:
                err?.hash?.loc?.first_column ?
                    err.hash.loc.first_column + 1
                :   undefined,
            severity: "error",
            message: `template does not compile: ${String(err).split("\n")[0]}`,
        });
    }
}

if (offenders || broken) {
    if (offenders)
        console.error(
            `\ncheck-lang-hardcoded: ${offenders} user-visible literal(s) are not ` +
                'localized.\nReplace each with {{localize "SOHL.…"}} and add the key ' +
                "(see\nkb/dev-docs/reference/localization-keys.md), or add it to " +
                "ALLOWED with a reason.\n",
        );
    if (broken)
        console.error(
            `\ncheck-lang-hardcoded: ${broken} template(s) failed to compile. ` +
                "A {{localize …}}\nnested inside another mustache is legal in an HTML " +
                "attribute but a parse error\ninside a helper's hash — use a " +
                "(localize …) subexpression there.\n",
        );
    process.exit(1);
}
console.log(
    `check-lang-hardcoded: ${templates.length} template(s) fully localized and compiling.`,
);
