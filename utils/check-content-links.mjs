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
 * Three link defects survive both content builds silently, so neither the pack
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
 * 3. **Links to a retired hostname.** An absolute URL is opaque to the two
 *    checks above — they read wikilinks — so a link to a host this project has
 *    withdrawn compiles and publishes looking exactly like a working one, and
 *    fails at DNS with no redirect to follow. 71 of them shipped that way
 *    (#1485); {@link RETIRED_HOSTS} is the list that now fails the build.
 *
 * The wikilink checks resolve links the way the builds do: an alias scoped to the
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
import { matchAllOutsideCode } from "./code-fences.mjs";
import { readQualifier } from "./packs/wikilinks.mjs";
import { hasDocEntry } from "./packs/item-docs.mjs";
import {
    canonicalKey,
    readCanonicalKey,
    loadForeignManifests,
    manifestsComplete,
} from "./kb-manifest.mjs";
import { RETIRED_HOSTS, findRetiredLinks } from "./retired-hosts.mjs";

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

/**
 * Every note, with its raw text kept alongside the parsed body — a retired
 * hostname can sit in frontmatter (a `url:` field) as readily as in prose, and
 * the parsed body has already dropped it.
 *
 * @type {Array<{file: string, fm: object, body: string, raw: string, type: string}>}
 */
const notes = [];
for (const file of walk(CONTENT)) {
    const raw = readFileSync(file, "utf8");
    const { data: fm, content: body } = matter(raw);
    if (!fm || typeof fm.type !== "string") continue;
    notes.push({ file, fm, body, raw, type: fm.type.toLowerCase() });
}

// --- Resolution index (mirrors the builds) -------------------------------

const byKey = new Map(); // `type/shortcode` → note
const byAlias = new Map(); // `type|alias`     → note
const aliasCollide = new Set();
for (const note of notes) {
    const { fm, type } = note;
    if (typeof fm.shortcode === "string" && fm.shortcode) {
        byKey.set(`${type}/${fm.shortcode}`.toLowerCase(), note);
        // The canonical, fully qualified address alongside the short one, so a
        // package-qualified link checks the same way a bare one does (#1499).
        if (fm.package) {
            byKey.set(canonicalKey(fm.package, type, fm.shortcode), note);
        }
        // An item's documentation is a document — and an address — in its own
        // right, so it is indexed as one. It has to be: once a manifest
        // publishes `doc<type>` entries, `doc<type>` is a *known type*, and the
        // virtual reading that used to answer for it no longer fires (a real
        // type owns its own name).
        if (hasDocEntry(type)) {
            byKey.set(`doc${type}/${fm.shortcode}`.toLowerCase(), note);
            if (fm.package) {
                byKey.set(
                    canonicalKey(fm.package, `doc${type}`, fm.shortcode),
                    note,
                );
            }
        }
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
    // Code is verbatim, so a `[[…]]` inside a fence, an indented block or an
    // inline span is not a link to check — the compilers do not make one of
    // it either (#1505).
    for (const [, rawInner] of matchAllOutsideCode(body, /\[\[([^\]]+)\]\]/g)) {
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

// Cross-package manifests (#1446). A foreign package may use a type this
// repository has never seen, so its types join `types` — otherwise
// `readQualifier` reads the link as prose and it is never checked at all.
const foreign = loadForeignManifests(
    path.join("assets", "manifests"),
    new Set(notes.map((n) => n.fm?.package).filter(Boolean)),
);
if (foreign.stale.length) {
    // An unusable manifest would otherwise surface as a pile of dead addresses
    // pointing at the notes that cite it, rather than at the file at fault.
    console.error("\ncheck-content-links: unusable link manifest(s):");
    for (const s of foreign.stale) console.error(`  ${s.package}: ${s.reason}`);
    console.error(
        "\nRefresh the vendored copy from that package's own build (#1465).\n",
    );
    process.exit(1);
}
const manifests = manifestsComplete(
    new Set(notes.map((n) => n.fm?.package).filter(Boolean)),
    foreign.packages,
);
for (const v of foreign.index.values()) {
    if (v.type) types.add(v.type);
}
// Every package an address may name: the ones this tree publishes, plus every
// one a vendored manifest speaks for.
const packages = new Set([
    ...[...byKey.values()].map((n) => n.fm?.package).filter(Boolean),
    ...foreign.packages,
]);
for (const k of []) {
    const slash = k.indexOf("/");
    if (slash > 0) types.add(k.slice(0, slash));
}

/** The manifest entry a qualified address names in another package, or null. */
const manifestHit = (target) => {
    const q = readQualifier(target, types, packages);
    if (!q || q.reason) return null;
    if (q.package) {
        return (
            foreign.index.get(canonicalKey(q.package, q.type, q.shortcode)) ??
            null
        );
    }
    // A bare address names no package, so it resolves against any foreign one
    // that publishes it. Claimed by two, it is ambiguous and the author must
    // write the qualified form.
    const type = String(q.type).toLowerCase();
    const shortcode = String(q.shortcode).toLowerCase();
    const hits = [...foreign.index].filter(([k]) => {
        const parts = readCanonicalKey(k);
        return parts?.type === type && parts.shortcode === shortcode;
    });
    return hits.length === 1 ? hits[0][1] : null;
};

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
    const qualified = readQualifier(target, types, packages);
    if (!qualified || qualified.reason) return undefined;
    return byKey.get(
        qualified.package ?
            canonicalKey(qualified.package, qualified.type, qualified.shortcode)
        :   `${qualified.type}/${qualified.shortcode}`.toLowerCase(),
    );
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

const deadAddresses = [];
const usedManifest = new Set();
for (const note of notes) {
    for (const { target } of linksOf(note)) {
        if (!target) continue; // a same-page `[[#anchor]]`
        // Only a *qualified* target is an address. A bare `[[Name]]` that finds
        // nothing is a worldbuilding placeholder by long-standing convention,
        // and is deliberately left alone.
        const qualified = readQualifier(target, types, packages);
        if (!qualified) continue;
        if (resolve(note, target)) continue;
        // A manifest answers the question the allowlist was standing in for,
        // and answers it with the target package's own build output rather
        // than a reviewed guess.
        if (manifestHit(target)) {
            usedManifest.add(target.toLowerCase());
            continue;
        }
        deadAddresses.push({ file: note.file, target });
    }
}

// --- Check 4: no absolute link points at a hostname we retired -----------

const retiredLinks = [];
for (const note of notes) {
    for (const hit of findRetiredLinks(note.raw)) {
        retiredLinks.push({ file: note.file, ...hit });
    }
}

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
            "Fix the shortcode, or — if it names a note in another package — make sure\n" +
            "that package's manifest in assets/manifests/ is current (#1446).\n",
    );
}

if (retiredLinks.length) {
    failed = true;
    console.error(
        `\ncheck-content-links: ${retiredLinks.length} link(s) to a retired hostname:\n`,
    );
    for (const r of retiredLinks) {
        console.error(`  ${r.file}:${r.line}: ${r.url}`);
        if (r.hint) console.error(`    → ${r.hint}`);
    }
    console.error(
        "\nThese hostnames have been withdrawn, so the link fails at DNS — there is no\n" +
            "redirect to follow, and nothing else in the build notices, because an absolute\n" +
            "URL is opaque to the wikilink checks above. Use the surviving address:\n" +
            [...RETIRED_HOSTS]
                .map(([host, base]) => `  ${host} → ${base}`)
                .join("\n") +
            "\n\nThe API site publishes one unversioned tree, so drop any /main/ or /latest/\n" +
            "segment rather than merely rehosting it (#1485).\n",
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
        `qualified address resolves (${usedManifest.size} cross-package reference(s) ` +
        `via manifest` +
        (manifests.complete ? "" : (
            `; no manifest for ${manifests.missing.join(", ")}`
        )) +
        `), no link to a retired hostname; ` +
        walks
            .map((w) => `all ${w.reached.size} ${w.corpus.label} documents`)
            .join(" and ") +
        " reachable from their roots.",
);
