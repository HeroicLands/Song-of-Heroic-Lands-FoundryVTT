/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * CI guard: every `TODO`/`FIXME` comment in `src/` must reference a tracking
 * issue, written as `TODO(#123)` / `FIXME(#123)`. Deferred work belongs in
 * issues, not in floating code comments that drift out of sync.
 *
 * Only `TODO`/`FIXME` are enforced (not `HACK`/`XXX`), and only inside
 * comments — string-literal contents are ignored so values like `"XXX"` or a
 * quoted `"TODO"` never trip the check. Exits non-zero on any violation.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const ENFORCED = /\b(?:TODO|FIXME)\b/;
const LINKED = /\b(?:TODO|FIXME)\(#\d+\)/;

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
        if (ENFORCED.test(comment) && !LINKED.test(comment)) {
            violations.push(`${file}:${i + 1}: ${line.trim()}`);
        }
    });
}

if (violations.length) {
    console.error(
        `\ncheck-todos: ${violations.length} TODO/FIXME without an issue reference:\n`,
    );
    for (const v of violations) console.error(`  ${v}`);
    console.error(
        "\nEvery TODO/FIXME in committed code must reference a tracking issue, " +
            "e.g. TODO(#123).\nFile or find an issue and link it, or remove the comment.\n",
    );
    process.exit(1);
}
console.log("check-todos: all TODO/FIXME markers reference a tracking issue.");
