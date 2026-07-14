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
 * — the analogue of heroiclands-site's vault exporter. For developer docs it also
 * rewrites the in-repo links (`{@link}`, relative `*.md` and source paths) to
 * their KB / API / GitHub destinations.
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

/** Base URL of the generated API site; the KB tracks `main`, so link to `/main`. */
const API_BASE = "https://api.heroiclands.org/main/";

/** GitHub blob base for repo files the KB does not render (source, config, …). */
const GH_BLOB =
    "https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/blob/main/";

/**
 * The `qualified name → API page URL` map emitted by the TypeDoc symbol-map
 * plugin (`npm run docs`) and committed as a Hugo data file. Absent → `{@link}`
 * references degrade to code spans (below) rather than breaking the build.
 */
const symbols = (() => {
    try {
        return JSON.parse(
            fs.readFileSync(
                path.join(REPO, "kb/data/api-symbols.json"),
                "utf8",
            ),
        );
    } catch {
        return {};
    }
})();

/**
 * Resolve inline TypeDoc `{@link}` / `{@linkcode}` / `{@linkplain}` tags in a
 * Markdown body against the API symbol map.
 *
 * - `sohl.*` targets (classes, namespaces, and `Class.member` forms) become
 *   Markdown links to the symbol's page on the API site; `@linkcode` renders the
 *   text as code.
 * - Optional display text (`{@link Target | text}` or `{@link Target text}`) wins;
 *   otherwise the last dotted segment is the link text.
 * - External-URL targets become plain Markdown links.
 * - Anything the map doesn't know (e.g. `{@link Symbol.member}` syntax examples)
 *   degrades to a code span — never a broken link, never a build failure.
 */
function resolveLinks(body) {
    return body.replace(
        /\{@link(code|plain)?\s+([^}]+)\}/g,
        (_m, kind, inner) => {
            inner = inner.trim();
            let target, text;
            const pipe = inner.indexOf("|");
            const space = inner.search(/\s/);
            if (pipe !== -1) {
                target = inner.slice(0, pipe).trim();
                text = inner.slice(pipe + 1).trim();
            } else if (space !== -1) {
                target = inner.slice(0, space);
                text = inner.slice(space + 1).trim();
            } else {
                target = inner;
                text = "";
            }

            if (/^https?:\/\//.test(target)) {
                return `[${text || target}](${target})`;
            }

            const url = symbols[target];
            const display = text || target.split(".").pop();
            if (url) {
                const href = API_BASE + url;
                return kind === "code" ?
                        `[\`${display}\`](${href})`
                    :   `[${display}](${href})`;
            }
            return kind === "plain" ? display : `\`${display}\``;
        },
    );
}

/**
 * Rewrite the relative links in a developer-doc body so they resolve in the KB.
 *
 * Dev docs are authored to link one another and the source tree with repo-relative
 * paths; neither target exists at the same path in the rendered KB. Resolving each
 * link against the doc's own location under `docs/`:
 *
 * - a `*.md` link that lands under `docs/` → the KB dev route (`/dev/<path>/`),
 *   preserving any `#anchor`.
 * - anything else (source under `src/`, `lang/`, `templates/`, `package.json`, or
 *   repo-root `*.md` like `CONTRIBUTING.md`) → its GitHub blob URL.
 *
 * Absolute URLs, anchor-only, `mailto:`, and site-root links are left untouched.
 * `docRel` is the doc's path relative to `docs/` (e.g. `how-to/testing.md`).
 */
function rewriteRepoLinks(body, docRel) {
    const docDir = path.dirname(docRel);
    return body.replace(/\]\(([^)]+)\)/g, (whole, raw) => {
        // Peel an optional link title: [text](url "title").
        const sp = raw.search(/\s/);
        const href = sp === -1 ? raw : raw.slice(0, sp);
        const title = sp === -1 ? "" : raw.slice(sp);
        if (/^(https?:|mailto:|tel:|#|\/)/.test(href)) return whole;

        const hash = href.indexOf("#");
        const filePart = hash === -1 ? href : href.slice(0, hash);
        const anchor = hash === -1 ? "" : href.slice(hash);
        if (!filePart) return whole;

        const repoRel = path
            .relative(REPO, path.resolve(DOCS_SRC, docDir, filePart))
            .replace(/\\/g, "/");

        const href2 =
            repoRel.startsWith("docs/") && repoRel.endsWith(".md") ?
                `/dev/${repoRel.slice(5, -3).toLowerCase()}/${anchor}`
            :   `${GH_BLOB}${repoRel}${anchor}`;
        return `](${href2}${title})`;
    });
}

/**
 * Run `transform` over a Markdown body while leaving fenced code blocks and inline
 * code spans untouched — the link rewriters must not fire on `](` or `{@link}`
 * sequences that appear inside code examples (e.g. a `'return this'` exploit
 * snippet, or a `` `{@link Symbol}` `` syntax illustration).
 *
 * Each code run is stashed and replaced with a `\u0000<index>\u0000` sentinel; a
 * NUL never occurs in Markdown source, so the sentinel cannot collide with prose
 * and survives the transforms unchanged before being restored.
 */
function protectCode(body, transform) {
    const stash = [];
    const masked = body.replace(
        /```[\s\S]*?```|~~~[\s\S]*?~~~|``[^`]*``|`[^`]*`/g,
        (m) => `\u0000${stash.push(m) - 1}\u0000`,
    );
    return transform(masked).replace(
        /\u0000(\d+)\u0000/g,
        (_m, i) => stash[Number(i)],
    );
}

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
    fs.writeFileSync(
        dest,
        matter.stringify(protectCode(body, resolveLinks), data),
    );
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
    fs.writeFileSync(
        dest,
        matter.stringify(
            protectCode(stripped, (t) =>
                rewriteRepoLinks(resolveLinks(t), rel),
            ),
            { ...fm, title },
        ),
    );
    docs++;
}

console.log(
    `kb-content: wrote ${items} reference pages + ${docs} developer docs to kb/content/`,
);
