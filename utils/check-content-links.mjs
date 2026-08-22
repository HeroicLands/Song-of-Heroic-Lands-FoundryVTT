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
 * **Resolving links is `@heroiclands/content-build`'s job**, not this script's:
 * three defects survive both content builds silently — a dead `#anchor`, a
 * dead qualified address, and a wikilink authored in frontmatter — and every
 * package authors notes against the same rules, so the checks live where every
 * package gets them (content-build#20). This repository's copy also carried its
 * own wikilink pattern, which had drifted from the compilers' own.
 *
 * One check stays here, because it is a statement about what *this* package
 * publishes rather than about the note format:
 *
 * - **Corpus reachability.** The rules are a book and the user guide is a
 *   manual, so every `Rules/**` and `User_Guide/**` document must be reachable
 *   from its own root by following links. A note with no inbound link is still
 *   compiled and still published; it is simply impossible to arrive at by
 *   reading.
 *
 * It is answered from the link graph the package returns rather than from a
 * second resolver.
 *
 * **Retired hostnames are no longer checked here.** 71 links to a withdrawn host
 * shipped once (#1485), and the scan that caught them has reported nothing since
 * — an author reintroduces a dead hostname only by typing one they never use.
 * What still needs guarding is *generated* output, where a URL is emitted rather
 * than authored: `utils/build-site.mjs` repairs retired hrefs in the assembled
 * site and refuses to publish one it cannot repair. That is where the risk
 * actually lives.
 *
 * Usage:
 *   npm run lint:content-links        // node utils/check-content-links.mjs
 *   node utils/check-content-links.mjs
 */
import path from "node:path";

import {
    auditLinks,
    buildLinkIndex,
} from "@heroiclands/content-build/engine/content-links";

import { assertForeignManifestsAddressable } from "./kb-foreign-manifest.mjs";
import { reportDiagnostic, positionOf } from "./lint-diagnostics.mjs";

const CONTENT = path.join("assets", "content");
const MANIFEST_DIR = path.join("assets", "manifests");

/**
 * The corpora that must be readable end to end, each declared as
 * `[label, rootRelativeToContent]`; the directory it owns is the root's own.
 *
 * The rules are a book and the user guide is a manual: each has a page one, and
 * everything in its tree must follow from it. Both roots are `README.md`,
 * because that is the filename the content build routes to a section's landing
 * page — so page one publishes at `/rules/` and `/user-guide/`. Chapter and
 * section openers below a root are ordinary pages and keep the
 * `_Introduction.md` name.
 */
const CORPORA = [
    ["rules", "Rules/README.md"],
    ["user guide", "User_Guide/README.md"],
].map(([label, root]) => ({ label, root, dir: `${path.dirname(root)}/` }));

/**
 * Index pages are walked *to*, never *through*. The glossary links to nearly
 * every page in the corpus, so following it would make the reachability check
 * vacuous — a chapter could stop linking one of its own pages and the walk
 * would never notice. Reachability has to hold along the reading path.
 */
const INDEX_SHORTCODES = new Set(["glossary"]);

const index = buildLinkIndex(CONTENT, {
    manifestDir: MANIFEST_DIR,
    skipDirectories: ["Templates"],
});

if (index.foreign.stale.length) {
    // An unusable manifest would otherwise surface as a pile of dead addresses
    // pointing at the notes that cite it, rather than at the file at fault.
    console.error("\ncheck-content-links: unusable link manifest(s):");
    for (const s of index.foreign.stale) {
        reportDiagnostic({
            file: path.join(MANIFEST_DIR, `${s.package}.json`),
            severity: "error",
            message: `unusable link manifest: ${s.reason}`,
        });
    }
    console.error(
        "\nRefresh the vendored copy from that package's own build (#1465).\n",
    );
    process.exit(1);
}

// Readable is not the same as addressable (#1664). Every lookup reaches the
// manifest through `readCanonicalKey`, so a key shape it cannot parse makes
// each one miss — and the audit then blames the *notes*, reporting correct
// cross-package addresses as dead, which reads as a pile of typos.
assertForeignManifestsAddressable(index.foreign.index, MANIFEST_DIR);

const { deadAnchors, deadAddresses, frontmatterLinks, usedManifest } =
    auditLinks(index);

// --- Reachability: every document follows from its corpus's root ----------

/**
 * Walk one corpus from its root and report what it could not reach.
 *
 * @param {{label: string, root: string, dir: string}} corpus - The corpus.
 * @returns {{orphans: object[]}} The documents nothing links to.
 */
function walkCorpus(corpus) {
    const inCorpus = (note) => note.rel.startsWith(corpus.dir);
    const root = index.notes.find((n) => n.rel === corpus.root);
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
        for (const { target } of index.linksOf(note)) {
            if (!target) continue;
            const dest = index.resolve(note, target);
            // The walk stays inside the corpus: a link out to an item, a
            // creature, or the other corpus is a real link, but it is not a
            // page of this one.
            if (!dest || !inCorpus(dest) || reached.has(dest)) continue;
            reached.add(dest);
            queue.push(dest);
        }
    }
    return {
        orphans: index.notes.filter((n) => inCorpus(n) && !reached.has(n)),
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
        reportDiagnostic({
            file: d.note.file,
            ...positionOf(d.note.raw, d.text, d.occurrence),
            severity: "error",
            message: `link [[${d.link}]] points at an anchor no heading in ${d.dest.rel} declares`,
        });
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
        reportDiagnostic({
            file: d.note.file,
            ...positionOf(d.note.raw, d.text, d.occurrence),
            severity: "error",
            message: `dead address [[${d.target}]] — no document has that identity`,
        });
    }
    console.error(
        "\nA qualified `[[type-shortcode]]` names a document by its identity, so one that\n" +
            "resolves to nothing is a dead address — it degrades to plain text, keeping its\n" +
            "label, so the prose still reads correctly while the link is simply gone.\n" +
            "Fix the shortcode, or — if it names a note in another package — make sure\n" +
            "that package's manifest in assets/manifests/ is current (#1446).\n",
    );
}

if (frontmatterLinks.length) {
    failed = true;
    console.error(
        `\ncheck-content-links: ${frontmatterLinks.length} wikilink(s) authored in frontmatter:\n`,
    );
    for (const f of frontmatterLinks) {
        reportDiagnostic({
            file: f.note.file,
            // The link text is a literal in the frontmatter, so its position
            // is a search away even though the value was reached by key.
            ...positionOf(f.note.raw, f.link),
            severity: "error",
            message: `wikilink ${f.link} authored in frontmatter at ${f.path} — frontmatter is data and is never resolved`,
        });
    }
    console.error(
        "\nWikilinks are resolved in a note's body only. Frontmatter is data: the pack\n" +
            "compilers and the knowledgebase build both copy it through untouched, so the\n" +
            "link is never resolved and the reader is shown the brackets. Move the link into\n" +
            "the prose the field summarises, or write the value as plain text.\n",
    );
}

for (const { corpus, orphans } of walks) {
    if (!orphans.length) continue;
    failed = true;
    console.error(
        `\ncheck-content-links: ${orphans.length} ${corpus.label} document(s) unreachable from ${corpus.root}:\n`,
    );
    for (const o of orphans) {
        // Unreachability is a property of the whole document, so there is no
        // line to name — the file alone is the honest locator.
        reportDiagnostic({
            file: o.file,
            severity: "error",
            message: `unreachable from ${corpus.root} — nothing in the ${corpus.label} corpus links to it`,
        });
    }
    console.error(
        "\nA corpus is a book, not a pile of notes: a document nobody links to cannot be\n" +
            "arrived at by reading. Link each one from the chapter or section that owns it.\n",
    );
}

if (failed) process.exit(1);

const reachable = walks
    .map(({ corpus, orphans }) => {
        const total = index.notes.filter((n) =>
            n.rel.startsWith(corpus.dir),
        ).length;
        return `all ${total - orphans.length} ${corpus.label} documents`;
    })
    .join(" and ");

console.log(
    `check-content-links: ${index.notes.length} notes, every anchor link lands ` +
        `and every qualified address resolves (${usedManifest.size} cross-package ` +
        `reference(s) via manifest), no wikilink in frontmatter; ${reachable} reachable from their roots.`,
);
