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
 * CI guard: the label registry has two faces that MUST agree —
 * `.github/labels.yml` (the machine source synced to GitHub) and the §3 table in
 * `docs/how-to/issue-reporting.md` (the human reference). This asserts the set of
 * label names is identical in both, so neither can drift or "invent" a label the
 * other doesn't have.
 *
 * Usage: node utils/check-labels.mjs   (run as part of `npm run lint`)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

/** Label names declared in the machine registry. */
function registryNames() {
    const list = parse(readFileSync(resolve(".github/labels.yml"), "utf8"));
    return new Set(list.map((l) => l.name));
}

/** Label names listed in the §3 table of the issue-reporting doc. */
function docNames() {
    const md = readFileSync(
        resolve("docs/how-to/issue-reporting.md"),
        "utf8",
    ).split("\n");
    const start = md.findIndex((l) => /^##\s+3\./.test(l));
    if (start < 0) throw new Error("Could not find §3 in issue-reporting.md");
    const end = md.findIndex((l, i) => i > start && /^##\s+\d/.test(l));
    const section = md.slice(start, end < 0 ? md.length : end);
    const names = new Set();
    for (const line of section) {
        // A registry row is a table row whose first cell is `` `label-name` ``.
        const m = line.match(/^\|\s*`([a-z][a-z-]*)`\s*\|/);
        if (m) names.add(m[1]);
    }
    return names;
}

function diff(a, b) {
    return [...a].filter((x) => !b.has(x));
}

const registry = registryNames();
const doc = docNames();

const missingFromDoc = diff(registry, doc);
const missingFromRegistry = diff(doc, registry);

if (missingFromDoc.length || missingFromRegistry.length) {
    console.error(
        "check-labels: .github/labels.yml and issue-reporting.md §3 disagree.",
    );
    if (missingFromDoc.length)
        console.error(
            `  in labels.yml but not §3: ${missingFromDoc.join(", ")}`,
        );
    if (missingFromRegistry.length)
        console.error(
            `  in §3 but not labels.yml: ${missingFromRegistry.join(", ")}`,
        );
    console.error(
        "Edit both when changing the registry (see issue-reporting.md §3).",
    );
    process.exit(1);
}

console.log(`check-labels: registry and §3 agree (${registry.size} labels).`);
