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
 * API documentation coverage gate.
 *
 * Runs TypeDoc's `notDocumented` validation and fails if any symbol outside the
 * intentionally-deferred files is missing documentation. `src/utils/constants.ts`
 * is excluded: it is a large catalog of enum/lookup tables (e.g. `TRAIT_CODE`,
 * `SKILL_CODE`) whose individual members are self-describing and are documented
 * in CLAUDE.md / the player rules site rather than per-member TSDoc. Its
 * top-level tables/helpers (notably `defineType`) are still documented; only the
 * member-level `notDocumented` noise is ignored here.
 *
 * Reads nothing; shells out to `npx typedoc --options typedoc-html.json
 * --validation.notDocumented` and parses its output. Exits non-zero (failing
 * CI) if any in-scope symbol is undocumented.
 *
 * Usage:
 *   npm run docs:coverage:check  // node utils/docs-coverage.mjs
 *   node utils/docs-coverage.mjs // direct invocation (no args)
 */
import { spawnSync } from "node:child_process";

/** Files whose `notDocumented` warnings are intentionally ignored. */
const IGNORED_FILES = ["/constants.ts"];

const NEEDLE = "does not have any documentation";

const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["typedoc", "--options", "typedoc-html.json", "--validation.notDocumented"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);

const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

const undocumented = output
    .split(/\r?\n/)
    .filter((line) => line.includes(NEEDLE));

const offending = undocumented.filter(
    (line) => !IGNORED_FILES.some((f) => line.includes(f)),
);
const ignoredCount = undocumented.length - offending.length;

console.log(
    `API doc coverage: ${offending.length} undocumented (in scope), ` +
        `${ignoredCount} ignored in ${IGNORED_FILES.join(", ")}.`,
);

if (offending.length > 0) {
    console.error(
        "\nUndocumented symbols that must be documented:\n" +
            offending.map((l) => l.replace(/^.*?\bwarning\b/i, "")).join("\n"),
    );
    process.exit(1);
}

console.log("All in-scope API symbols are documented. ✓");
