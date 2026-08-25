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
 * CI guard: the rules corpus never describes the VTT that implements it.
 *
 * The rules exist above the game — they are the specification the Foundry
 * system implements, and must read as though no VTT exists. A rule that says
 * "click **Accept** on the card in the chat log" describes an interface, not a
 * game; when the interface changes, the rule silently becomes wrong.
 *
 * Automation behaviour — the consent/offer flow, what is prompted and when —
 * is genuinely useful, but its home is the **User Guide**
 * (`assets/content/User_Guide/`), which this guard deliberately does not scan.
 * Move such prose there rather than deleting it.
 *
 * Scans every `.md` file under `assets/content/Rules/`, skipping YAML
 * frontmatter and fenced `dataview` blocks (both are structural, not prose).
 * Prints offending `file:line` locations and exits non-zero on any match.
 *
 * Usage:
 *   npm run lint:rules-vtt         // node utils/check-rules-vtt.mjs
 *   node utils/check-rules-vtt.mjs // direct invocation (no args)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { emitDiagnostic } from "@heroiclands/package-build/engine/diagnostics";
import { join } from "node:path";

const ROOT = join("assets", "content", "Rules");

/** Interface vocabulary that has no place in a rules document. */
const FORBIDDEN = [
    [/\bclick/i, "clicking is an interface act, not a game act"],
    [/\bbuttons?\b/i, "buttons belong to the User Guide"],
    [/\bdialogs?\b/i, "dialogs belong to the User Guide"],
    [/\bchat log\b/i, "the chat log belongs to the User Guide"],
    [
        /\bthe system\b/i,
        'say what happens at the table, not what "the system" does',
    ],
];

/** @returns {Generator<string>} every `.md` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir).sort()) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (p.endsWith(".md")) yield p;
    }
}

if (!existsSync(ROOT)) {
    // Say which tree is missing and how to get it, rather than letting the walk
    // throw a bare ENOENT that reads like a corrupt checkout.
    console.error(
        `check-rules-vtt: no rules tree at ${ROOT}. assets/content/ is ` +
            `this repository's own source — check out the tree.`,
    );
    process.exit(1);
}

const violations = [];
for (const file of walk(ROOT)) {
    const lines = readFileSync(file, "utf8").split("\n");
    let inFrontmatter = lines[0]?.trim() === "---";
    /** The fence marker of the `dataview` block currently open, if any. */
    let inQuery = null;
    lines.forEach((line, i) => {
        if (inFrontmatter) {
            if (i > 0 && line.trim() === "---") inFrontmatter = false;
            return;
        }
        // A fenced `dataview` block is generated-table configuration, not prose.
        if (inQuery) {
            if (new RegExp(`^[ \\t]*${inQuery}[ \\t]*$`).test(line)) {
                inQuery = null;
            }
            return;
        }
        const fence = /^[ \t]*(`{3,}|~{3,})[ \t]*dataview\b/i.exec(line);
        if (fence) {
            inQuery = `${fence[1][0]}{${fence[1].length},}`;
            return;
        }
        for (const [pattern, why] of FORBIDDEN) {
            if (pattern.test(line)) {
                // The column is where the offending phrase starts, so an
                // editor lands on it rather than on the line (#1668).
                const at = line.search(pattern);
                violations.push({
                    file,
                    line: i + 1,
                    column: at === -1 ? undefined : at + 1,
                    why,
                    text: line.trim(),
                });
                return;
            }
        }
    });
}

if (violations.length) {
    console.error(
        `\ncheck-rules-vtt: ${violations.length} VTT reference(s) in the rules:\n`,
    );
    for (const v of violations) {
        emitDiagnostic({
            file: v.file,
            line: v.line,
            column: v.column,
            severity: "error",
            message: `${v.why}: ${v.text}`,
        });
    }
    console.error(
        "\nThe rules are the specification the VTT implements and must read as though no\n" +
            "VTT exists. Restate the mechanic as what happens at the table; move automation\n" +
            "behaviour worth keeping to assets/content/User_Guide/ rather than deleting it.\n",
    );
    process.exit(1);
}
console.log("check-rules-vtt: the rules describe the game, not the VTT.");
