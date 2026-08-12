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
 * CI guard: content links land somewhere, and the rules can be read through.
 *
 * Two link defects survive both content builds silently, so neither the pack
 * compilers nor the knowledgebase build catches them:
 *
 * 1. **Dead `#anchor` links.** `anchorPageId()` derives a Foundry page id by
 *    hashing `"<noteId>-<anchorSlug>"` — it never checks that a heading
 *    declaring that slug exists. A link to an anchor nobody declares compiles
 *    cleanly, emits a `@UUID` enricher, and dead-ends for the reader.
 * 2. **Unreachable rules documents.** A note with no inbound link is still
 *    compiled into the pack and still published to the knowledgebase; it is
 *    simply impossible to arrive at by reading. The rules are a book, so every
 *    `Rules/**` document must be reachable from the root introduction by
 *    following links.
 *
 * Both checks resolve wikilinks the way the builds do (see
 * `utils/kb-wikilinks.mjs`): `type/shortcode` first, then an alias scoped to the
 * source note's own type. `(@Table …)` directives are expanded first, so a
 * generated row link counts as a real link.
 *
 * Usage:
 *   npm run lint:content-links         // node utils/check-content-links.mjs
 *   node utils/check-content-links.mjs // direct invocation (no args)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { slugify } from "./kb-wikilinks.mjs";
import { expandContentTables } from "./content-tables.mjs";

const CONTENT = path.join("assets", "content");
/**
 * The rules are a book: this is page one, and everything must follow from it.
 *
 * It is a `README.md` because that is what the content build routes to a
 * section's landing page, so page one publishes at `/rules/` — the same shape
 * as the user guide's `User_Guide/README.md` at `/user-guide/`. Chapter openers
 * below it are ordinary pages and keep the `_Introduction.md` name.
 */
const RULES_ROOT = path.join(CONTENT, "Rules", "README.md");
const RULES_DIR = path.join(CONTENT, "Rules") + path.sep;
/**
 * Index pages are walked *to*, never *through*. The glossary links to nearly
 * every page in the corpus, so following it would make the reachability check
 * vacuous — a chapter could stop linking one of its own pages and the walk
 * would never notice. Reachability has to hold along the reading path.
 */
const INDEX_SHORTCODES = new Set(["glossary"]);

/** @returns {Generator<string>} every `.md` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir).sort()) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (p.endsWith(".md")) yield p;
    }
}

// --- Load every content note ---------------------------------------------

/** @type {Array<{file: string, fm: object, body: string, type: string}>} */
const notes = [];
for (const file of walk(CONTENT)) {
    const { data: fm, content: body } = matter(readFileSync(file, "utf8"));
    if (!fm || typeof fm.type !== "string") continue;
    notes.push({ file, fm, body, type: fm.type.toLowerCase() });
}

// --- Resolution index (mirrors the builds) -------------------------------

const byKey = new Map(); // `type/shortcode` → note
const byAlias = new Map(); // `type|alias`     → note
const aliasCollide = new Set();
for (const note of notes) {
    const { fm, type } = note;
    if (typeof fm.shortcode === "string" && fm.shortcode) {
        byKey.set(`${type}/${fm.shortcode}`.toLowerCase(), note);
    }
    const aliases = [
        ...(Array.isArray(fm.aliases) ? fm.aliases : []),
        ...(Array.isArray(fm.name?.aliases) ? fm.name.aliases : []),
        fm.name?.full,
        path.basename(note.file, ".md").replace(/_/g, " "),
    ].filter((a) => typeof a === "string" && a);
    for (const a of aliases) {
        const k = `${type}|${a}`.toLowerCase();
        if (aliasCollide.has(k)) continue;
        const cur = byAlias.get(k);
        if (cur && cur !== note) {
            byAlias.delete(k);
            aliasCollide.add(k);
        } else if (!cur) {
            byAlias.set(k, note);
        }
    }
}

/** The searchable universe a `(@Table …)` directive draws its rows from. */
const tableDocs = notes.map((n) => ({
    fm: n.fm,
    path: path.relative(CONTENT, n.file).split(path.sep).join("/"),
    tld: path.relative(CONTENT, n.file).split(path.sep)[0],
    folder: path.dirname(path.relative(CONTENT, n.file)).split(path.sep).pop(),
}));

/** Every `{#anchor}` a note declares on a heading. */
function anchorsOf(note) {
    const found = new Set();
    for (const line of note.body.split("\n")) {
        const m = /^#{1,6}\s+.*\{#([a-z0-9-]+)\}\s*$/.exec(line.trim());
        if (m) found.add(m[1]);
    }
    return found;
}
const anchors = new Map(notes.map((n) => [n, anchorsOf(n)]));

/**
 * Every wikilink in a note body, with its table directives already expanded.
 *
 * @returns {Array<{target: string, anchor: string}>} `target` is `""` for a
 *   same-page `[[#anchor]]` link.
 */
function linksOf(note) {
    let body = note.body;
    if (body.includes("(@Table ")) {
        body = expandContentTables(body, {
            docs: tableDocs.filter((d) => d.fm.package === note.fm.package),
            linkable: (d) => Boolean(d.fm.shortcode),
            source: note.file,
        }).markdown;
    }
    const out = [];
    for (const [, rawInner] of body.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const inner = rawInner.replace(/\\\|/g, "|");
        const bar = inner.indexOf("|");
        const linkPart = (bar === -1 ? inner : inner.slice(0, bar)).trim();
        const hash = linkPart.indexOf("#");
        out.push({
            target: (hash === -1 ? linkPart : linkPart.slice(0, hash)).trim(),
            anchor: hash === -1 ? "" : linkPart.slice(hash + 1).trim(),
        });
    }
    return out;
}

/** Resolves a link target the way both content builds do, or `undefined`. */
const resolve = (note, target) =>
    byAlias.get(`${note.type}|${target}`.toLowerCase()) ??
    byKey.get(target.toLowerCase());

// --- Check 1: every `#anchor` link points at a heading that declares it ---

const deadAnchors = [];
for (const note of notes) {
    for (const { target, anchor } of linksOf(note)) {
        if (!anchor) continue;
        const dest = target ? resolve(note, target) : note;
        // An unresolvable target is an external reference, not this check's
        // business — the KB build already rules on those.
        if (!dest) continue;
        if (!anchors.get(dest).has(slugify(anchor))) {
            deadAnchors.push({
                file: note.file,
                link: `${target}#${anchor}`,
                dest: dest.file,
            });
        }
    }
}

// --- Check 2: every rules document is reachable from the root ------------

const isRules = (note) => note.file.startsWith(RULES_DIR);
const root = notes.find((n) => n.file === RULES_ROOT);
if (!root) {
    console.error(`check-content-links: no rules root at ${RULES_ROOT}`);
    process.exit(1);
}

const reached = new Set([root]);
const queue = [root];
while (queue.length) {
    const note = queue.shift();
    if (INDEX_SHORTCODES.has(String(note.fm.shortcode))) continue;
    for (const { target } of linksOf(note)) {
        if (!target) continue;
        const dest = resolve(note, target);
        // The walk stays inside the book: a link out to an item or a creature
        // is a real link, but it is not a page of the rules.
        if (!dest || !isRules(dest) || reached.has(dest)) continue;
        reached.add(dest);
        queue.push(dest);
    }
}
const orphans = notes.filter((n) => isRules(n) && !reached.has(n));

// --- Report ---------------------------------------------------------------

let failed = false;

if (deadAnchors.length) {
    failed = true;
    console.error(
        `\ncheck-content-links: ${deadAnchors.length} link(s) to an anchor no heading declares:\n`,
    );
    for (const d of deadAnchors) {
        console.error(`  ${d.file}: [[${d.link}]] → ${d.dest}`);
    }
    console.error(
        "\nA `#anchor` link compiles even when nothing declares the anchor, and dead-ends\n" +
            "for the reader. Declare `{#the-anchor}` on the heading the link means, or point\n" +
            "the link at a heading that exists.\n",
    );
}

if (orphans.length) {
    failed = true;
    console.error(
        `\ncheck-content-links: ${orphans.length} rules document(s) unreachable from ${RULES_ROOT}:\n`,
    );
    for (const o of orphans) console.error(`  ${o.file}`);
    console.error(
        "\nThe rules are a book, not a pile of notes: a document nobody links to cannot be\n" +
            "arrived at by reading. Link each one from the chapter that owns it.\n",
    );
}

if (failed) process.exit(1);
console.log(
    `check-content-links: ${notes.length} notes, every anchor link lands; ` +
        `all ${reached.size} rules documents reachable from the root.`,
);
