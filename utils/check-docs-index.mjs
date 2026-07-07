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
 * CI guard: keep the two hand-maintained documentation indexes in sync with the
 * files on disk, so a new `docs/<section>/<page>.md` can never be silently
 * orphaned from the navigation.
 *
 * Every content page under `docs/{concepts,how-to,reference,contributing}/`
 * (excluding the per-section index stub itself) must be linked from BOTH:
 *
 *   1. its section stub's `children:` front-matter
 *      (`docs/<section>/<section>.md`) — this drives the published TypeDoc site
 *      navigation; and
 *   2. `docs/README.md` — the GitHub-facing index.
 *
 * TypeDoc already fails the build on a `children:` entry that points at a
 * missing file, so this guard covers the opposite direction (a file that no
 * index references). Exits non-zero on any omission.
 *
 * Usage:
 *   npm run lint:docs-index
 *   node utils/check-docs-index.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SECTIONS = ["concepts", "how-to", "reference", "contributing"];
const README = "docs/README.md";

const readme = readFileSync(README, "utf8");
const violations = [];

for (const section of SECTIONS) {
    const dir = join("docs", section);
    const stub = join(dir, `${section}.md`);
    const stubText = readFileSync(stub, "utf8");

    for (const name of readdirSync(dir)) {
        if (!name.endsWith(".md")) continue;
        if (name === `${section}.md`) continue; // the stub itself

        const rel = `${section}/${name}`;
        // The stub links pages as `./<name>.md`; README as `<section>/<name>.md`.
        if (!stubText.includes(`./${name}`)) {
            violations.push(`${rel} is not in ${stub} children: front-matter`);
        }
        if (!readme.includes(rel)) {
            violations.push(`${rel} is not linked from ${README}`);
        }
    }
}

if (violations.length) {
    console.error(
        `\ncheck-docs-index: ${violations.length} documentation page(s) missing from an index:\n`,
    );
    for (const v of violations) console.error(`  ${v}`);
    console.error(
        "\nEvery docs/<section>/<page>.md must be linked from both its section " +
            "stub's `children:` front-matter and docs/README.md.\nAdd the missing " +
            "link(s), or move the page out of the section directory.\n",
    );
    process.exit(1);
}
console.log("check-docs-index: every documentation page is indexed.");
