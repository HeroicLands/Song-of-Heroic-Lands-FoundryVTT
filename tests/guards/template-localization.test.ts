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
 * Reverse localization guard (issue #1350). `lint:lang-coverage` only checks
 * **key → `en.json`**; nothing checked **UI text → key**, so 516 English strings
 * across 61 templates were never keys at all and no amount of translating
 * `en.json` would have reached them.
 *
 * This walks the other way: every user-visible literal in `templates/**` must be
 * a `{{localize}}` call, not English in the markup. It reads text nodes and the
 * user-visible attributes (`title`, `placeholder`, `aria-label`, `alt`,
 * `data-tooltip`, `data-title`) once Handlebars expressions are stripped.
 *
 * It also compiles every template, because the usual way to break one while
 * localizing it is to nest `{{localize …}}` inside another mustache — legal in an
 * HTML attribute, a parse error inside a helper's hash (use a `(localize …)`
 * subexpression there).
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";
import Handlebars from "handlebars";
import { describe, expect, it } from "vitest";

/** Attributes whose value the user reads. */
const VISIBLE_ATTRS = [
    "title",
    "placeholder",
    "aria-label",
    "alt",
    "data-tooltip",
    "data-title",
] as const;

/**
 * Literals that are deliberately not localized, each with the reason it cannot
 * be. Keep this list short and justified — it is the escape hatch, not the rule.
 */
const ALLOWED = new Map<string, string>([
    [
        "item.system.code === 'pyrn'",
        "A SafeExpression example shown as a placeholder — code, not prose.",
    ],
]);

/** User-visible English left in a template after Handlebars is stripped. */
function hardcodedLiterals(src: string): string[] {
    const stripped = src
        .replace(/\{\{![\s\S]*?\}\}/g, " ")
        .replace(/\{\{[^}]*\}\}/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<script[\s\S]*?<\/script>/g, " ");
    const found: string[] = [];
    // An HTML entity (`&infin;`, `&middot;`) is a symbol, not prose — its
    // letters are markup, so drop entities before looking for words.
    const isProse = (t: string) =>
        /[A-Za-z]{2}/.test(t.replace(/&[a-zA-Z]+;|&#\d+;/g, " ")) &&
        !ALLOWED.has(t);

    for (const m of stripped.matchAll(/>([^<>]+)</g)) {
        const text = m[1]!.replace(/\s+/g, " ").trim();
        if (isProse(text)) found.push(text);
    }
    for (const attr of VISIBLE_ATTRS) {
        const re = new RegExp(`\\b${attr}="([^"]*)"`, "g");
        for (const m of stripped.matchAll(re)) {
            const text = m[1]!.replace(/\s+/g, " ").trim();
            if (isProse(text)) found.push(`${attr}="${text}"`);
        }
    }
    return found;
}

const TEMPLATES = globSync("templates/**/*.hbs").sort();

describe("templates are fully localized (#1350)", () => {
    it("finds the template tree", () => {
        expect(TEMPLATES.length).toBeGreaterThan(50);
    });

    it("leaves no user-visible English in the markup", () => {
        const offenders: string[] = [];
        for (const file of TEMPLATES) {
            for (const literal of hardcodedLiterals(
                readFileSync(file, "utf8"),
            )) {
                offenders.push(`${file}: ${literal}`);
            }
        }
        expect(offenders).toEqual([]);
    });

    it("compiles every template", () => {
        const broken: string[] = [];
        for (const file of TEMPLATES) {
            try {
                Handlebars.precompile(readFileSync(file, "utf8"));
            } catch (e) {
                broken.push(`${file}: ${String(e).split("\n")[0]}`);
            }
        }
        expect(broken).toEqual([]);
    });
});
