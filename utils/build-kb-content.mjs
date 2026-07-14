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
 * Knowledgebase content prep — `assets/content/` + `docs/` → Hugo `kb/content/`.
 *
 * The KB is a Hugo site on the shared Heroic Lands theme, which dispatches its
 * info-block sidebars by frontmatter `type` (weapongear, character, …). SoHL
 * content already carries that frontmatter, so this step mostly relocates it
 * into Hugo's content tree and supplies the `title` Hugo needs (from `name.full`)
 * — the analogue of heroiclands-site's vault exporter.
 *
 * Output is a build artifact (`kb/content/` is gitignored), regenerated here.
 *
 * Usage: node utils/build-kb-content.mjs
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const REPO = path.resolve(".");
const CONTENT_SRC = path.join(REPO, "assets/content");
const DOCS_SRC = path.join(REPO, "docs");
const OUT = path.join(REPO, "kb/content");

/** Recursively collect every `.md` under `dir`. */
function walk(dir) {
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walk(full));
        else if (e.isFile() && e.name.endsWith(".md")) out.push(full);
    }
    return out;
}

const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

/** Section a content entry routes to, keyed by its Foundry `type`. */
function section(type) {
    if (type === "character" || type === "creature") return "beings";
    if (type === "doc") return "guide";
    return type; // weapongear, armorgear, skill, …
}

let items = 0;
let docs = 0;
fs.rmSync(OUT, { recursive: true, force: true });

// --- assets/content → reference pages (SoHL package only) ---
for (const file of walk(CONTENT_SRC)) {
    const raw = fs.readFileSync(file, "utf8");
    let fm, body;
    try {
        ({ data: fm, content: body } = matter(raw));
    } catch {
        continue;
    }
    if (fm.package !== "sohl" || !fm.type) continue;

    const name = fm.name?.full ?? path.basename(file, ".md");
    const slug = fm.slug ?? slugify(name);
    const data = { ...fm, title: fm.title ?? name };

    const dest = path.join(OUT, section(fm.type), `${slug}.md`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, matter.stringify(body, data));
    items++;
}

// --- docs/ → developer section (title from first H1) ---
for (const file of walk(DOCS_SRC)) {
    const raw = fs.readFileSync(file, "utf8");
    const { data: fm, content: body } = matter(raw);
    const rel = path.relative(DOCS_SRC, file).replace(/\\/g, "/");
    const h1 = /^#\s+(.+?)\s*$/m.exec(body);
    const title =
        fm.title ?? (h1 ? h1[1].replace(/\{@link\s+[^}]*\}/g, "").trim() : rel);
    // Strip the leading H1 (title renders it) and route under /dev/.
    const stripped = body.replace(/^\s*#\s+.*$\r?\n?/m, "");
    const dest = path.join(OUT, "dev", rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, matter.stringify(stripped, { ...fm, title }));
    docs++;
}

console.log(
    `kb-content: wrote ${items} reference pages + ${docs} developer docs to kb/content/`,
);
