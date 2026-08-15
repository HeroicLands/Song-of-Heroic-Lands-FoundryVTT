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
 * CI guard (issue #766): `(type, shortcode)` must be unique within each
 * compendium pack. `shortcode` is the system's lookup key; a duplicate makes one
 * of the entries unreachable by `(type, shortcode)`. Compendium content is
 * authored as Markdown under `assets/content/` with YAML frontmatter carrying
 * `type` and `shortcode`; each entry is routed to a pack purely by its `type`, so
 * a `(type, shortcode)` collision anywhere in the tree is a collision *within* the
 * pack that type belongs to.
 *
 * Runtime `_preCreate`/`_preUpdate` enforce uniqueness for live documents; this
 * is the authoritative guard for built packs, which are seeded via the compendium
 * CLI (bypassing `_preCreate`).
 *
 * Recursively scans every `.md` under `assets/content/`; writes nothing. Prints
 * each duplicate key and its files and exits non-zero on any collision.
 *
 * Usage:
 *   npm run lint:packs             // node utils/check-pack-shortcodes.mjs
 *   node utils/check-pack-shortcodes.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";

const ROOT = "assets/content";

/** @returns {Generator<string>} every `.md` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (name.endsWith(".md")) yield p;
    }
}

function main() {
    /** @type {Map<string, string[]>} `${type}:${shortcode}` → source files */
    const byKey = new Map();
    let files;
    try {
        files = [...walk(ROOT)];
    } catch {
        console.log(`check-pack-shortcodes: no ${ROOT}/ — skipping.`);
        return 0;
    }

    for (const file of files) {
        let data;
        try {
            data = matter(readFileSync(file, "utf8")).data;
        } catch {
            continue; // not frontmatter — ignore
        }
        const type = data?.type;
        const shortcode = data?.shortcode;
        // Folder documents and keyless entries carry no `(type, shortcode)` key.
        if (!type || !shortcode) continue;
        const key = `${type}:${shortcode}`;
        const arr = byKey.get(key);
        if (arr) arr.push(relative(".", file));
        else byKey.set(key, [relative(".", file)]);
    }

    // "Every one of nothing is unique" is a vacuous pass, and it is exactly what
    // an unexported (generated) content tree produces — so the check would go
    // green on the one state it most needs to catch.
    if (byKey.size === 0) {
        console.error(
            `check-pack-shortcodes: ${ROOT}/ holds no keyed content, so ` +
                `uniqueness is vacuous. assets/content/ is generated — run ` +
                `"npm run content:export" (maintainers) or check out the tree.`,
        );
        return 1;
    }

    const dupes = [...byKey.entries()].filter(([, fs]) => fs.length > 1);
    if (dupes.length === 0) {
        console.log(
            `✓ pack shortcodes unique (${byKey.size} (type, shortcode) keys across ${files.length} entries).`,
        );
        return 0;
    }

    console.error(
        "✗ Duplicate (type, shortcode) keys within a compendium pack:\n",
    );
    for (const [key, fs] of dupes) {
        console.error(`  ${key}`);
        for (const f of fs) console.error(`      ${f}`);
    }
    console.error(
        `\n${dupes.length} duplicate key(s). Each (type, shortcode) must be unique within its pack.`,
    );
    return 1;
}

process.exit(main());
