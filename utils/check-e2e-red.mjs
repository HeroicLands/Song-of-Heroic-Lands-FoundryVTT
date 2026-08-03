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
 * CI guard: the frozen-subset Cypress e2e suite must stay green with no
 * **in-scope** spec left RED-skipped. This enforces Blocker III of the
 * Being-centric beta freeze (issue #958).
 *
 * The whole `cypress/e2e` suite is **in scope** by default: every spec is
 * expected to pass on the frozen path. The only `it.skip` / `describe.skip`
 * cases permitted are the **fenced-RED allowlist** below — RED specs blocked by
 * a fenced (out-of-scope-for-beta) feature or explicitly post-freeze behavior,
 * each keyed to the GitHub issue that will un-skip it. A skip that cites an
 * issue *not* in the allowlist is an in-scope spec gone RED: either make it
 * green, or (if the maintainer has decided to fence its feature) add the issue
 * to the allowlist with a justification.
 *
 * **The convention this enforces:** every RED skip must cite its blocking
 * issue(s) as `(#NN)` in the test title (or, for a whole-suite fence via
 * `itemSheetSuite`, in the `red` / `persistRed` option value). That is what
 * makes the skip auditable and lets this static check map it to the allowlist
 * without running Foundry.
 *
 * Scans every `*.cy.js` under `cypress/e2e/`; writes nothing. Prints offending
 * `file:line` locations and exits non-zero (failing CI) on any violation.
 *
 * Usage:
 *   npm run lint:e2e-red          // node utils/check-e2e-red.mjs
 *   node utils/check-e2e-red.mjs  // direct invocation (no args)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "cypress/e2e";

/**
 * The fenced-RED allowlist: GitHub issue number → why its RED spec is permitted
 * to stay skipped for the Being-centric beta freeze. Every entry is a fenced
 * feature (out of the frozen subset) or explicitly post-freeze behavior — the
 * frozen schema stands, only the deferred *behavior* is RED. When a fenced
 * feature lands, un-skip its spec(s) and delete its entry here.
 *
 * See the beta-scope plan (Blocker III / issue #958) for the in/out-of-scope
 * boundary these numbers draw.
 *
 * @type {Record<number, string>}
 */
const FENCED_RED_ALLOWLIST = {
    // --- Automated Combat (fenced: attack/counterstrike resolution) ---
    177: "Automated attack/counterstrike start — getUsableStrikeModes() unwired",
    186: "Automated Combat: attacker landing-blow injury button",
    64: "Automated Combat: Dodge should not be skill-gated",
    185: "Per-turn/round rules (didAction / move-budget reset & enforcement)",
    620: "Automated Combat tour drive primitives (import-adventure / start-combat / set-target)",

    // --- Non-being actors (fenced: cohort / structure / vehicle) ---
    184: "Derived behavior for the non-being actor Logic classes",
    76: "Cohort shared-gear tab",

    // --- Post-freeze behavior (schema frozen; action layer deferred) ---
    71: "Fate availability and consumption",
    72: "Use Mystery action",
    67: "Affliction condition predicates (canTransmit / canContract)",
    68: "Affliction lifecycle test suite (contract / transmit / course / treat)",
};

/** @returns {Generator<string>} every `*.cy.js` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (p.endsWith(".cy.js")) yield p;
    }
}

/** Extract every distinct `#NN` issue number from a string. */
function issueRefs(text) {
    const nums = new Set();
    for (const m of text.matchAll(/#(\d+)/g)) nums.add(Number(m[1]));
    return [...nums];
}

const violations = [];
const usedIssues = new Set();

for (const file of walk(ROOT)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
        const loc = `${file}:${i + 1}`;

        // (a) A literal `it.skip("title …")` / `describe.skip("title …")`.
        //     The blocking issue must be cited in the title.
        const skipTitle = line.match(
            /\b(?:it|describe)\.skip\(\s*(["'`])((?:\\.|(?!\1).)*)\1/,
        );
        if (skipTitle) {
            checkRed(loc, skipTitle[2], "RED skip", line);
            return;
        }

        // (b) An `itemSheetSuite` whole-suite / persist fence via option value:
        //     `red: "#NN …"` or `persistRed: "#NN …"`.
        const redOpt = line.match(
            /\b(?:red|persistRed):\s*(["'`])((?:\\.|(?!\1).)*)\1/,
        );
        if (redOpt) {
            checkRed(loc, redOpt[2], "fenced item-sheet suite", line);
        }
    });
}

/**
 * Validate one RED marker's cited issues against the allowlist.
 * @param {string} loc   `file:line`
 * @param {string} text  the title / option value carrying the `#NN` refs
 * @param {string} kind  human label for the marker
 * @param {string} line  the raw source line (for the error message)
 */
function checkRed(loc, text, kind, line) {
    const refs = issueRefs(text);
    if (refs.length === 0) {
        violations.push(
            `${loc}: ${kind} cites no issue — add the blocking issue as (#NN):\n      ${line.trim()}`,
        );
        return;
    }
    const fenced = refs.filter((n) => n in FENCED_RED_ALLOWLIST);
    if (fenced.length === 0) {
        violations.push(
            `${loc}: in-scope spec is RED (issues ${refs
                .map((n) => `#${n}`)
                .join(
                    ", ",
                )} not in the fenced allowlist) — make it green, or fence the feature by adding it to FENCED_RED_ALLOWLIST:\n      ${line.trim()}`,
        );
        return;
    }
    for (const n of fenced) usedIssues.add(n);
}

// Stale allowlist entries (fenced feature landed or spec removed but the entry
// lingers) are a warning, not a failure — they keep the allowlist honest
// without blocking a merge that legitimately removed a RED spec.
const stale = Object.keys(FENCED_RED_ALLOWLIST)
    .map(Number)
    .filter((n) => !usedIssues.has(n));

if (violations.length) {
    console.error(
        `\ncheck-e2e-red: ${violations.length} frozen-subset e2e violation(s):\n`,
    );
    for (const v of violations) console.error(`  ${v}`);
    console.error(
        "\nThe frozen-path e2e suite must be green. A RED (it.skip/describe.skip) spec is\n" +
            "permitted only for a fenced feature or post-freeze behavior listed in\n" +
            "utils/check-e2e-red.mjs → FENCED_RED_ALLOWLIST, keyed by its blocking issue.\n",
    );
    process.exit(1);
}

if (stale.length) {
    console.warn(
        `check-e2e-red: warning — ${stale.length} unused fenced-allowlist ` +
            `entr${stale.length === 1 ? "y" : "ies"} ` +
            `(${stale.map((n) => `#${n}`).join(", ")}); ` +
            "if the feature landed, un-skip its spec and remove the entry.",
    );
}

console.log(
    `check-e2e-red: frozen-subset e2e suite is green (${usedIssues.size} fenced-RED ` +
        `issue${usedIssues.size === 1 ? "" : "s"} allowlisted).`,
);
