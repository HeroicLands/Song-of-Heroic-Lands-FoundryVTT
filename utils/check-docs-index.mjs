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
 * CI guard: keep the hand-maintained developer-doc index in sync with the files
 * on disk, so a new `kb/dev-docs/<section>/<page>.md` can never be silently
 * orphaned from the navigation.
 *
 * Every content page under any `kb/dev-docs/<section>/` directory must be linked
 * from `kb/dev-docs/README.md` — the doc-tree landing (rendered as the
 * `/dev-docs/` landing on the knowledgebase, and the GitHub-facing index).
 * Exits non-zero on any omission.
 *
 * **The sections are read off disk, not listed here.** They used to be a literal
 * array, which meant a *new* section was invisible to this guard rather than
 * covered by it — every page in it could be orphaned silently, which is the one
 * failure this script exists to prevent (#1571). Discovering them makes adding a
 * section safe by default: the guard picks it up the moment the directory exists.
 *
 * (The API site no longer carries the guide tree — `projectDocuments` was removed
 * in #430 — so there is no per-section `children:` stub to cross-check anymore;
 * the README is the single index.)
 *
 * Usage:
 *   npm run lint:docs-index
 *   node utils/check-docs-index.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { reportDiagnostic } from "./lint-diagnostics.mjs";
import { join } from "node:path";

const DOCS = "kb/dev-docs";
const README = join(DOCS, "README.md");

/** Every section directory that exists, in stable order. */
const SECTIONS = readdirSync(DOCS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const readme = readFileSync(README, "utf8");
const violations = [];

for (const section of SECTIONS) {
    const dir = join(DOCS, section);

    for (const name of readdirSync(dir)) {
        if (!name.endsWith(".md")) continue;

        const rel = `${section}/${name}`;
        // README links pages as `<section>/<name>.md`.
        if (!readme.includes(rel)) {
            violations.push({
                file: rel,
                message: `not linked from ${README}`,
            });
        }
    }
}

if (violations.length) {
    console.error(
        `\ncheck-docs-index: ${violations.length} documentation page(s) missing from the index:\n`,
    );
    for (const v of violations) {
        reportDiagnostic({
            file: v.file,
            severity: "error",
            message: v.message,
        });
    }
    console.error(
        `\nEvery ${DOCS}/<section>/<page>.md must be linked from ${README}.\n` +
            "Add the missing link(s), or move the page out of the section directory.\n",
    );
    process.exit(1);
}
console.log("check-docs-index: every documentation page is indexed.");
