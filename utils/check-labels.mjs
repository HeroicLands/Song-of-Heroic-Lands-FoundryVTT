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
 * **The label registry and the issue-reporting guide agree.**
 *
 * `.github/labels.yml` is what a contributor's tooling sees; §3 of
 * `issue-reporting.md` is what a contributor reads. A label in one and not the
 * other means someone follows the guide and picks a label that does not exist,
 * or picks nothing because the guide never mentioned it.
 *
 * **Only this half is here.** Validating the registry itself — a name and a
 * colour on every entry, no duplicates, no description past GitHub's
 * 100-character limit — and syncing it to the repository are the same job in
 * every HeroicLands repository, and live in the `HeroicLands/.github` labels
 * action. What is left is the part no other repository can run, because no
 * other repository has an issue-reporting guide to disagree with.
 *
 * @module
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parse } from "yaml";
import { emitDiagnostic } from "@heroiclands/content-build/engine/diagnostics";

const REGISTRY = ".github/labels.yml";
const GUIDE = "kb/dev-docs/how-to/issue-reporting.md";

/** Every label name the registry declares. */
function registryNames() {
    return new Set(
        parse(readFileSync(resolve(REGISTRY), "utf8")).map((l) => l.name),
    );
}

/**
 * Every label name §3 of the guide documents.
 *
 * A registry row is a table row whose first cell is a backticked label name.
 *
 * @returns {Set<string>} The documented names.
 */
function guideNames() {
    const lines = readFileSync(resolve(GUIDE), "utf8").split("\n");
    const start = lines.findIndex((l) => /^##\s+3\./.test(l));
    if (start < 0) throw new Error(`Could not find §3 in ${GUIDE}`);
    const end = lines.findIndex((l, i) => i > start && /^##\s+\d/.test(l));
    const section = lines.slice(start, end < 0 ? lines.length : end);

    const names = new Set();
    for (const line of section) {
        const m = line.match(/^\|\s*`([a-z][a-z-]*)`\s*\|/);
        if (m) names.add(m[1]);
    }
    return names;
}

const registry = registryNames();
const guide = guideNames();
const only = (a, b) => [...a].filter((x) => !b.has(x));

const missingFromGuide = only(registry, guide);
const missingFromRegistry = only(guide, registry);

if (missingFromGuide.length || missingFromRegistry.length) {
    console.error(`check-labels: ${REGISTRY} and ${GUIDE} §3 disagree.`);
    // Each side is reported against the file that is *missing* the label, so
    // the finding names the file to edit rather than the disagreement.
    for (const name of missingFromGuide) {
        emitDiagnostic({
            file: GUIDE,
            severity: "error",
            message: `label "${name}" is in ${REGISTRY} but not in §3`,
        });
    }
    for (const name of missingFromRegistry) {
        emitDiagnostic({
            file: REGISTRY,
            severity: "error",
            message: `label "${name}" is in §3 but not in ${REGISTRY}`,
        });
    }
    console.error("Edit both when changing the registry.");
    process.exit(1);
}

console.log(`check-labels: registry and §3 agree (${registry.size} labels).`);
