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
 * CI guard: no `TODO`/`FIXME` comments in `src/`. Deferred work is tracked in
 * GitHub issues, not flagged in the code — a code marker duplicates the issue
 * and drifts out of sync, and markers inside published JSDoc leak into the API
 * site as documentation prose. When you would write a `TODO`, file (or find) an
 * issue instead; record any code-site context in that issue.
 *
 * Only `TODO`/`FIXME` are checked (not `HACK`/`XXX`), and only inside comments —
 * string-literal contents are ignored so values like `"XXX"` or a quoted
 * `"TODO"` never trip the check.
 *
 * Recursively scans every `.ts` file under `src/`; writes nothing. Prints
 * offending `file:line` locations and exits non-zero (failing CI) on any marker.
 *
 * Usage:
 *   npm run lint:todos         // node utils/check-todos.mjs
 *   node utils/check-todos.mjs // direct invocation (no args)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const FORBIDDEN = /\b(?:TODO|FIXME)\b/;

/** @returns {Generator<string>} every `.ts` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (p.endsWith(".ts")) yield p;
    }
}

const violations = [];
for (const file of walk(ROOT)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
        // Blank out string/template-literal contents so markers inside strings
        // are not flagged.
        const code = line.replace(
            /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g,
            '""',
        );
        // Restrict the check to the comment portion of the line.
        const comment = code.match(/\/\/.*|\/\*.*|^\s*\*.*/)?.[0];
        if (!comment) return;
        if (FORBIDDEN.test(comment)) {
            violations.push(`${file}:${i + 1}: ${line.trim()}`);
        }
    });
}

if (violations.length) {
    console.error(
        `\ncheck-todos: ${violations.length} TODO/FIXME marker(s) in committed code:\n`,
    );
    for (const v of violations) console.error(`  ${v}`);
    console.error(
        "\nDeferred work is tracked in GitHub issues, not flagged in code. " +
            "File or find an issue,\nrecord any code-site context there, and remove the marker.\n",
    );
    process.exit(1);
}
console.log("check-todos: no TODO/FIXME markers in committed code.");
