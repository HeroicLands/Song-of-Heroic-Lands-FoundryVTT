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
 * CI guard: content links land somewhere, and the corpus can be read through.
 *
 * Two link defects survive both content builds silently, so neither the pack
 * compilers nor the knowledgebase build catches them:
 *
 * 1. **Dead `#anchor` links.** `anchorPageId()` derives a Foundry page id by
 *    hashing `"<noteId>-<anchorSlug>"` — it never checks that a heading
 *    declaring that slug exists. A link to an anchor nobody declares compiles
 *    cleanly, emits a `@UUID` enricher, and dead-ends for the reader.
 * 2. **Unreachable documents.** A note with no inbound link is still compiled
 *    into the pack and still published to the knowledgebase; it is simply
 *    impossible to arrive at by reading. The rules are a book and the user
 *    guide is a manual, so every `Rules/**` and `User_Guide/**` document must
 *    be reachable from its own root by following links.
 *
 * Both checks resolve wikilinks the way the builds do: an alias scoped to the
 * source note's own type, then the qualifier — `type-shortcode`, or the legacy
 * `type/shortcode` — read with the pack compilers' own {@link readQualifier}
 * rather than a second copy of the rule. Fenced `dataview` tables are expanded
 * first, so a generated row link counts as a real link.
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
import { readQualifier } from "./packs/wikilinks.mjs";

const CONTENT = path.join("assets", "content");
/**
 * The corpora that must be readable end to end, each declared as
 * `[label, root]`; the directory it owns is the root's own.
 *
 * The rules are a book and the user guide is a manual: each has a page one, and
 * everything in its tree must follow from it. Both roots are `README.md`,
 * because that is the filename the content build routes to a section's landing
 * page — so page one publishes at `/rules/` and `/user-guide/`. Chapter and
 * section openers below a root are ordinary pages and keep the
 * `_Introduction.md` name.
 */
const CORPORA = [
    ["rules", path.join(CONTENT, "Rules", "README.md")],
    ["user guide", path.join(CONTENT, "User_Guide", "README.md")],
].map(([label, root]) => ({
    label,
    root,
    dir: path.dirname(root) + path.sep,
}));
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

/** The searchable universe a `dataview` table draws its rows from. */
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
 * Every wikilink in a note body, with its `dataview` tables already expanded.
 *
 * @returns {Array<{target: string, anchor: string}>} `target` is `""` for a
 *   same-page `[[#anchor]]` link.
 */
function linksOf(note) {
    let body = note.body;
    if (/^[ \t]*(?:`{3,}|~{3,})[ \t]*dataview\b/im.test(body)) {
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

/** Every type the tree contains — what makes a hyphen read as a qualifier. */
const types = new Set(notes.map((n) => n.type));

/**
 * Resolves a link target the way both content builds do, or `undefined`.
 *
 * The qualifier is read with the pack compilers' own {@link readQualifier}
 * rather than a second copy of the rule, so this check cannot drift from what
 * the builds actually do — the two separators, the first-hyphen split, and the
 * known-type condition that keeps a hyphenated *name* an alias.
 *
 * That condition is why the type-scoped alias index is not enough on its own:
 * it only reaches a target of the source's **own** type, so before the
 * qualifier was read here, a cross-type `[[type-shortcode#anchor]]` resolved to
 * nothing and its anchor went unchecked — silently, since an unresolvable
 * target is treated as an external reference.
 *
 * A `doc<type>` target addresses an item's documentation rather than the item
 * (#1362). Both are compiled from the one note, so the note is what resolution
 * yields — which is also what makes the anchors of a `doc<type>` link
 * checkable, since the headings live in that same note.
 */
const resolve = (note, target) => {
    const direct =
        byAlias.get(`${note.type}|${target}`.toLowerCase()) ??
        byKey.get(target.toLowerCase());
    if (direct) return direct;
    const qualified = readQualifier(target, types);
    if (!qualified || qualified.reason) return undefined;
    return byKey.get(`${qualified.type}/${qualified.shortcode}`.toLowerCase());
};

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

// --- Check 3: every qualified target resolves to a note -------------------

/**
 * Addresses that name a real note in a package this repository does **not**
 * publish, and so cannot resolve here (#1414).
 *
 * `assets/content/` is the vault's `sohl` package only; its `setting` package —
 * campaign and world material — is never exported. A `Rules/` page may still
 * legitimately address that material, and does: the Bestiary links the Grukar
 * subspecies and two Helspawn, each a real note carrying exactly this alias in
 * the vault. Those links resolve in Obsidian and on heroiclands.org.
 *
 * Nothing in the syntax separates such a reference from a typo — both are
 * `<known type>-<shortcode that is not here>` — so the ones that are deliberate
 * are listed, and everything else fails. Keeping the list explicit is the point:
 * it is a handful of reviewed entries rather than a blanket tolerance, and each
 * says which note it means.
 *
 * When the tree gains a single source (#1385) every package becomes visible, the
 * distinction becomes decidable, and this list goes away.
 *
 * @type {Record<string, string>} address → the vault note it names
 */
const FOREIGN_ADDRESS_ALLOWLIST = {
    "creature-grkrahk": "Setting/Actors/Bestiary/Folk/Grukar-ahk.md",
    "creature-grukaruk": "Setting/Actors/Bestiary/Folk/Grukar-Uk.md",
    "creature-grkrsh": "Setting/Actors/Bestiary/Folk/Grukar-Sha.md",
    "creature-grkrh": "Setting/Actors/Bestiary/Folk/Grukar-Hai.md",
    "creature-nghtwght": "Setting/Actors/Bestiary/Helspawn/Nightwights.md",
    "creature-hlthrls": "Setting/Actors/Bestiary/Helspawn/Helthraals.md",
};

const deadAddresses = [];
const usedForeign = new Set();
for (const note of notes) {
    for (const { target } of linksOf(note)) {
        if (!target) continue; // a same-page `[[#anchor]]`
        // Only a *qualified* target is an address. A bare `[[Name]]` that finds
        // nothing is a worldbuilding placeholder by long-standing convention,
        // and is deliberately left alone.
        const qualified = readQualifier(target, types);
        if (!qualified) continue;
        if (resolve(note, target)) continue;
        const key = target.toLowerCase();
        if (Object.hasOwn(FOREIGN_ADDRESS_ALLOWLIST, key)) {
            usedForeign.add(key);
            continue;
        }
        deadAddresses.push({ file: note.file, target });
    }
}

// An entry that no longer matches anything is a stale tolerance: the link was
// fixed or removed, and leaving it listed would silently excuse the address if
// it ever came back. Reported, not fatal — the tree is still correct.
const staleForeign = Object.keys(FOREIGN_ADDRESS_ALLOWLIST).filter(
    (k) => !usedForeign.has(k),
);

// --- Check 2: every document is reachable from its corpus's root ---------

/**
 * Walks one corpus from its root and returns what it could and could not reach.
 *
 * @param {{label: string, root: string, dir: string}} corpus
 * @returns {{reached: Set<object>, orphans: object[]}}
 */
function walkCorpus(corpus) {
    const inCorpus = (note) => note.file.startsWith(corpus.dir);
    const root = notes.find((n) => n.file === corpus.root);
    if (!root) {
        console.error(
            `check-content-links: no ${corpus.label} root at ${corpus.root}`,
        );
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
            // The walk stays inside the corpus: a link out to an item, a
            // creature, or the other corpus is a real link, but it is not a
            // page of this one.
            if (!dest || !inCorpus(dest) || reached.has(dest)) continue;
            reached.add(dest);
            queue.push(dest);
        }
    }
    return {
        reached,
        orphans: notes.filter((n) => inCorpus(n) && !reached.has(n)),
    };
}

const walks = CORPORA.map((corpus) => ({ corpus, ...walkCorpus(corpus) }));

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

if (deadAddresses.length) {
    failed = true;
    console.error(
        `\ncheck-content-links: ${deadAddresses.length} link(s) to a document that does not exist:\n`,
    );
    for (const d of deadAddresses) {
        console.error(`  ${d.file}: [[${d.target}]]`);
    }
    console.error(
        "\nA qualified `[[type-shortcode]]` names a document by its identity, so one that\n" +
            "resolves to nothing is a dead address — it degrades to plain text, keeping its\n" +
            "label, so the prose still reads correctly while the link is simply gone.\n" +
            "Fix the shortcode, or — if it names a note in a package this build does not\n" +
            "publish — add it to FOREIGN_ADDRESS_ALLOWLIST with the note it means.\n",
    );
}

if (staleForeign.length) {
    console.warn(
        `\ncheck-content-links: ${staleForeign.length} unused FOREIGN_ADDRESS_ALLOWLIST ` +
            `entr${staleForeign.length === 1 ? "y" : "ies"} — nothing links ` +
            `${staleForeign.map((k) => `[[${k}]]`).join(", ")} any more. Remove ` +
            `${staleForeign.length === 1 ? "it" : "them"} so the list keeps meaning what it says.\n`,
    );
}

for (const { corpus, orphans } of walks) {
    if (!orphans.length) continue;
    failed = true;
    console.error(
        `\ncheck-content-links: ${orphans.length} ${corpus.label} document(s) unreachable from ${corpus.root}:\n`,
    );
    for (const o of orphans) console.error(`  ${o.file}`);
    console.error(
        "\nA corpus is a book, not a pile of notes: a document nobody links to cannot be\n" +
            "arrived at by reading. Link each one from the chapter or section that owns it.\n",
    );
}

if (failed) process.exit(1);
console.log(
    `check-content-links: ${notes.length} notes, every anchor link lands and every ` +
        `qualified address resolves (${usedForeign.size} cross-package reference(s) ` +
        `allowlisted); ` +
        walks
            .map((w) => `all ${w.reached.size} ${w.corpus.label} documents`)
            .join(" and ") +
        " reachable from their roots.",
);
