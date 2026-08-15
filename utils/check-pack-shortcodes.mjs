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
 * CI guard (issues #766, #1397): every authored `shortcode` is **alphanumeric**,
 * and `(type, shortcode)` is **unique** within each compendium pack.
 *
 * `shortcode` is the system's lookup key. A duplicate makes one of the entries
 * unreachable by `(type, shortcode)`; a non-alphanumeric one breaks the
 * `[[type-shortcode]]` addressing scheme, whose parse depends on the separator
 * being the only hyphen in the string (#1398). Compendium content is authored as
 * Markdown under `assets/content/` with YAML frontmatter carrying `type` and
 * `shortcode`; each entry is routed to a pack purely by its `type`, so a
 * `(type, shortcode)` collision anywhere in the tree is a collision *within* the
 * pack that type belongs to.
 *
 * The character-set rule is {@link isValidShortcode}, imported from the same
 * framework-free module the runtime guard uses, so the build and the client
 * cannot disagree about what a legal key is.
 *
 * Runtime `_preCreate`/`_preUpdate` enforce both rules for live documents; this
 * is the authoritative guard for built packs, which are seeded via the compendium
 * CLI (bypassing `_preCreate`).
 *
 * Recursively scans every `.md` under `assets/content/`; writes nothing. Prints
 * each offending key and its files and exits non-zero on any violation.
 *
 * Usage:
 *   npm run lint:packs             // node utils/check-pack-shortcodes.mjs
 *   node utils/check-pack-shortcodes.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";

import { isValidShortcode } from "../src/utils/shortcode-charset.mjs";

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
    /** @type {Array<{key: string, file: string, shortcode: string}>} */
    const malformed = [];
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
        if (!isValidShortcode(shortcode)) {
            malformed.push({ key, file: relative(".", file), shortcode });
        }
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
    if (dupes.length === 0 && malformed.length === 0) {
        console.log(
            `✓ pack shortcodes alphanumeric and unique (${byKey.size} (type, shortcode) keys across ${files.length} entries).`,
        );
        return 0;
    }

    // Both are reported in one run: renaming a malformed key can itself collide,
    // so an author fixing one wants to see the other in the same pass.
    if (malformed.length) {
        console.error("✗ Shortcodes that are not alphanumeric:\n");
        for (const m of malformed) {
            console.error(`  ${m.key}`);
            console.error(`      ${m.file}`);
        }
        console.error(
            `\n${malformed.length} malformed shortcode(s). A shortcode is an ` +
                `identifier, not prose: use only letters and digits (no hyphens, ` +
                `spaces, or punctuation). A hyphen in particular breaks the ` +
                `[[type-shortcode]] address, whose parse splits at the first one.\n` +
                `Rename it in the vault, re-export, and add a world migration ` +
                `mapping the old key to the new one — the shortcode is identity, ` +
                `so a rename is a data change.`,
        );
    }

    if (dupes.length) {
        if (malformed.length) console.error("");
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
    }
    return 1;
}

process.exit(main());
