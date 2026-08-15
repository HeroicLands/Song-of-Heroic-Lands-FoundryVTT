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
 * CI guard: every content note carries its own `type-shortcode` address as an
 * alias, and carries exactly one.
 *
 * Notes address one another as `[[type-shortcode|Text]]` (#1398). Obsidian — where
 * the content is now authored — resolves a wikilink against the files on disk, so
 * that form only resolves in the editor if the string is physically present in the
 * target note's frontmatter `aliases`. Miss it and the link still compiles in both
 * content builds while being dead in the editor: no autocomplete, no backlink, no
 * warning on rename. The alias is what buys the safety net the move to Obsidian was
 * for, and this check is what says it is still there.
 *
 * **This check never writes.** It reports and fails; an author fixes the note. The
 * aliases were populated once, deliberately, by the maintainer; nothing has written
 * to the vault since and nothing here does either.
 *
 * See {@link auditNoteAliases} for the rule itself and for why *exactly one*
 * address alias is required rather than merely the right one being present.
 *
 * Scope: notes carrying a `type` — the content notes. Vault scaffolding
 * (`Templates/`, `Blog/`, `Projects/`, root `CLAUDE.md` / `TASKS.md`) has no type
 * and is neither addressed nor addressable, so flagging it would fail the build on
 * files that can never satisfy the rule.
 *
 * Usage:
 *   npm run lint:content-aliases        // node utils/check-content-aliases.mjs
 *   node utils/check-content-aliases.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";

import { auditNoteAliases } from "./content-aliases.mjs";

const ROOT = "assets/content";

/** @returns {Generator<string>} every `.md` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir).sort()) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (name.endsWith(".md")) yield p;
    }
}

/** How each failure reads, and what to do about it. */
const REASONS = {
    missing: "carries no address alias",
    duplicate: "carries more than one address alias",
    mismatch: "carries an address alias that is not its own address",
};

function main() {
    let files;
    try {
        files = [...walk(ROOT)];
    } catch {
        console.log(`check-content-aliases: no ${ROOT}/ — skipping.`);
        return 0;
    }

    /** @type {Array<{file: string, fm: object, type: string}>} */
    const notes = [];
    for (const file of files) {
        let fm;
        try {
            fm = matter(readFileSync(file, "utf8")).data;
        } catch {
            continue; // not frontmatter — ignore
        }
        if (!fm || typeof fm.type !== "string" || !fm.type) continue;
        notes.push({
            file: relative(".", file),
            fm,
            type: fm.type.toLowerCase(),
        });
    }

    // "Every one of nothing carries its address" is a vacuous pass, and it is
    // exactly what an unexported (generated) content tree produces — so the check
    // would go green on the one state it most needs to catch.
    if (notes.length === 0) {
        console.error(
            `check-content-aliases: ${ROOT}/ holds no typed content, so the ` +
                `check is vacuous. assets/content/ is generated — run ` +
                `"npm run content:export" (maintainers) or check out the tree.`,
        );
        return 1;
    }

    const types = new Set(notes.map((n) => n.type));
    const failures = [];
    let skipped = 0;
    for (const note of notes) {
        const verdict = auditNoteAliases(
            {
                type: note.type,
                shortcode: note.fm.shortcode,
                aliases: note.fm.aliases,
            },
            types,
        );
        if (verdict.skipped) skipped++;
        else if (!verdict.ok) failures.push({ ...verdict, file: note.file });
    }

    if (failures.length === 0) {
        const tail = skipped ? `; ${skipped} with no shortcode skipped` : "";
        console.log(
            `✓ content aliases (${notes.length - skipped} notes each carry exactly ` +
                `one \`type-shortcode\` alias${tail}).`,
        );
        return 0;
    }

    console.error("✗ Notes whose `type-shortcode` alias is wrong:\n");
    for (const f of failures) {
        console.error(`  ${f.file}`);
        console.error(`      ${REASONS[f.reason]}`);
        console.error(`      expected: ${f.expected}`);
        console.error(
            `      found:    ${f.found.length ? f.found.join(", ") : "(none)"}`,
        );
    }
    console.error(
        `\n${failures.length} note(s). Every content note carries its own ` +
            `\`type-shortcode\` in frontmatter \`aliases\`, and exactly one — that ` +
            `string is what makes \`[[type-shortcode]]\` resolve in Obsidian, and a ` +
            `second one left behind by a shortcode change keeps resolving old links ` +
            `silently. Edit the note; nothing fixes this for you.`,
    );
    return 1;
}

process.exit(main());
