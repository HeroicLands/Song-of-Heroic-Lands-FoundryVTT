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
 * CI guard: every relative link in the developer docs lands on something real.
 *
 * `kb/dev-docs/**` links by **relative path**, deliberately — the tree is read
 * in the repository and on GitHub as much as on the knowledgebase, and a path is
 * what those renderers follow. Wikilinks cannot address these pages at all: the
 * KB index is keyed by `(type, shortcode)` and developer docs carry no
 * frontmatter (see `utils/build-kb-content.mjs`).
 *
 * The cost of a path is that it encodes location, so moving a page breaks every
 * link into it and nothing says so. That is not hypothetical: when this guard
 * was first run it found **25** dead links (#1364). The `docs/` → `kb/dev-docs/`
 * move had left 22 repo-root links one directory too high — invisible in both
 * places it mattered, since the knowledgebase rewrote them to a GitHub 404 under
 * `blob/main/kb/src/…` and in the repository they simply pointed at nothing.
 *
 * `check-content-links.mjs` does this job for `assets/content`; this is its
 * counterpart for the developer tree. Two things are checked:
 *
 * 1. **The target exists.** Any relative link — to a doc, a source file, a
 *    config — is resolved against the linking file's directory.
 * 2. **The `#anchor` exists**, when the target is markdown. Anchors are matched
 *    against the headings the target declares, using GitHub's slug rules, which
 *    is what both GitHub and Hugo generate for a heading.
 *
 * External links (`http:`, `https:`, `mailto:`), site-root links (`/sohl/api/`
 * — a published address, not a path in this tree), in-page links on a
 * non-markdown target, and anything inside a code fence or code span are left
 * alone.
 *
 * Usage:
 *   npm run lint:doc-links
 *   node utils/check-doc-links.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.join("kb", "dev-docs");

/** @returns {Generator<string>} every `.md` file under `dir`, recursively. */
function* walk(dir) {
    for (const name of readdirSync(dir).sort()) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (p.endsWith(".md")) yield p;
    }
}

/**
 * Blanks out fenced blocks and code spans so that a link *shown as an example*
 * is not mistaken for one the page actually makes. Replacing them with spaces
 * of equal length keeps every remaining offset — and so every line number —
 * exactly where it was.
 *
 * @param {string} body - The markdown source.
 * @returns {string} The source with code masked.
 */
export function maskCode(body) {
    return body.replace(
        /```[\s\S]*?```|~~~[\s\S]*?~~~|``[^`]*``|`[^`]*`/g,
        (m) => m.replace(/[^\n]/g, " "),
    );
}

/**
 * Masks fenced blocks only, leaving code **spans** intact.
 *
 * Headings are read from this rather than from {@link maskCode}: a heading
 * routinely contains a code span — ``## The `toChat` card-data contract`` — and
 * that span is part of the text the anchor is generated from. Blanking it would
 * compute an anchor no renderer produces and reject a link that works.
 *
 * @param {string} body - The markdown source.
 * @returns {string} The source with fenced blocks masked.
 */
export function maskFences(body) {
    return body.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, (m) =>
        m.replace(/[^\n]/g, " "),
    );
}

/**
 * GitHub's heading-slug rules: lowercase, drop punctuation, then replace each
 * remaining space with a hyphen.
 *
 * Runs of whitespace are **not** collapsed, and that is not a detail — dropping
 * an `&` or an em dash leaves the spaces that surrounded it, so
 * `Player & GM rules (external)` slugs to `player--gm-rules-external` with two
 * hyphens. Collapsing them would reject the very anchors the docs already use.
 *
 * @param {string} text - The heading text, without its leading `#`s.
 * @returns {string} The anchor a renderer will generate for it.
 */
export function slugify(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s/g, "-");
}

/**
 * Every anchor a markdown body offers: one per heading, plus any explicit
 * `id="…"`/`name="…"` an inline HTML anchor declares.
 *
 * @param {string} source - The markdown source.
 * @returns {Set<string>} The anchors it declares.
 */
export function anchorsIn(source) {
    const body = maskFences(source);
    const found = new Set();
    for (const [, text] of body.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
        // A heading may carry an explicit `{#slug}`, which wins.
        const explicit = text.match(/\{#([^}]+)\}\s*$/);
        found.add(
            explicit ?
                explicit[1].trim()
            :   slugify(text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")),
        );
    }
    for (const [, id] of body.matchAll(/<a\s[^>]*(?:id|name)="([^"]+)"/g)) {
        found.add(id);
    }
    return found;
}

/**
 * Every relative link a markdown body makes, with its line number.
 *
 * @param {string} source - The markdown source.
 * @returns {Array<{raw: string, rel: string, anchor: string, line: number}>}
 *   `rel` is `""` for a same-page `#anchor` link.
 */
export function linksIn(source) {
    const body = maskCode(source);
    const out = [];
    for (const m of body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
        const raw = m[1];
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) continue; // external
        // A site-root link is a published address, not a path in this tree:
        // the knowledgebase renders under /sohl/kb/, so a page reaching a
        // sibling surface writes `/sohl/api/` (#1470). Resolving it here would
        // look for that path inside `kb/dev-docs/` and call it dead.
        if (raw.startsWith("/")) continue;
        const hash = raw.indexOf("#");
        out.push({
            raw,
            rel: hash === -1 ? raw : raw.slice(0, hash),
            anchor: hash === -1 ? "" : raw.slice(hash + 1),
            line: body.slice(0, m.index).split("\n").length,
        });
    }
    return out;
}

/**
 * Walks the tree and reports every link that goes nowhere.
 *
 * @param {string} [root] - The directory to scan.
 * @returns {{missing: Array<object>, deadAnchors: Array<object>}} The findings.
 */
export function scan(root = ROOT) {
    const anchorCache = new Map();
    const anchorsFor = (file) => {
        if (!anchorCache.has(file))
            anchorCache.set(file, anchorsIn(readFileSync(file, "utf8")));
        return anchorCache.get(file);
    };

    const missing = [];
    const deadAnchors = [];

    for (const file of walk(root)) {
        const dir = path.dirname(file);
        for (const { raw, rel, anchor, line } of linksIn(
            readFileSync(file, "utf8"),
        )) {
            // `#anchor` alone is a link within this same page.
            const target =
                rel === "" ? file : (
                    path.normalize(path.join(dir, decodeURI(rel)))
                );

            if (!existsSync(target)) {
                missing.push({ file, line, link: raw, target });
                continue;
            }
            if (!anchor || !target.endsWith(".md")) continue;
            if (!anchorsFor(target).has(anchor)) {
                deadAnchors.push({ file, line, link: raw, target });
            }
        }
    }
    return { missing, deadAnchors };
}

// Importing this module for its helpers must neither scan nor exit.
if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
    const { missing, deadAnchors } = scan();

    if (missing.length || deadAnchors.length) {
        console.error(
            "\ncheck-doc-links: developer-doc links that go nowhere.\n",
        );
        if (missing.length) {
            console.error(
                `  ${missing.length} link(s) to a file that does not exist:`,
            );
            for (const v of missing) {
                console.error(`    ${v.file}:${v.line}: ${v.link}`);
                console.error(`      resolves to ${v.target}`);
            }
        }
        if (deadAnchors.length) {
            console.error(
                `\n  ${deadAnchors.length} link(s) to an anchor nobody declares:`,
            );
            for (const v of deadAnchors) {
                console.error(`    ${v.file}:${v.line}: ${v.link}`);
            }
        }
        console.error(
            "\nA relative link encodes where a file lives, so moving one breaks every\n" +
                "link into it. Repoint the link, or restore what it referred to.\n",
        );
        process.exit(1);
    }

    console.log(
        `check-doc-links: every relative link and anchor in ${ROOT} lands.`,
    );
}
