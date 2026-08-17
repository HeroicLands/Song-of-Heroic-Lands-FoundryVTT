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
 * Knowledgebase content prep — `assets/content/` + `kb/dev-docs/` → Hugo `kb/content/`.
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

import { slugify, resolveKbWikilinks } from "./kb-wikilinks.mjs";
import {
    writeManifests,
    loadForeignManifests,
    manifestsComplete,
} from "./kb-manifest.mjs";
import { contentSlug, findSlugCollisions } from "./content-slug.mjs";
import { expandContentTables } from "./content-tables.mjs";
import { applyRedirects, pageRedirects } from "./kb-redirects.mjs";
import { isItemDocType } from "./packs/item-docs.mjs";

const REPO = path.resolve(".");
const CONTENT_SRC = path.join(REPO, "assets/content");
// Developer-doc source. Authored under the KB tree (`kb/dev-docs/`) and
// generated into `kb/content/dev-docs/` (the `/dev-docs/` route) by this script.
const DOCS_REL = "kb/dev-docs";
const DOCS_SRC = path.join(REPO, DOCS_REL);
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
 * The URL segment each content note used **before** URLs were derived from the
 * shortcode (#1278), keyed by its `type:shortcode` identity. Authored `slug`
 * frontmatter is gone, so this committed map is the only record of the old URLs
 * — it exists to emit a Hugo `aliases` redirect for each one. Entries are
 * append-only history: never edit one, and only add a row when a page's URL
 * changes again.
 */
const legacySlugs = (() => {
    try {
        return JSON.parse(
            fs.readFileSync(
                path.join(REPO, "kb/data/legacy-slugs.json"),
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
 * link against the doc's own location under `kb/dev-docs/`:
 *
 * - a `*.md` link that lands under `kb/dev-docs/` → the KB dev route
 *   (`/dev-docs/<path>/`), preserving any `#anchor`.
 * - anything else (source under `src/`, `lang/`, `templates/`, `package.json`, or
 *   repo-root `*.md` like `CONTRIBUTING.md`) → its GitHub blob URL.
 *
 * Absolute URLs, anchor-only, `mailto:`, and site-root links are left untouched.
 * `docRel` is the doc's path relative to `kb/dev-docs/` (e.g. `how-to/testing.md`).
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

        let href2;
        if (repoRel.startsWith(`${DOCS_REL}/`) && repoRel.endsWith(".md")) {
            // Path under /dev-docs/, minus the leading `kb/dev-docs/` and `.md`.
            // A README is its directory's landing, so drop the `readme` segment.
            const rel2 = repoRel.slice(DOCS_REL.length + 1, -3).toLowerCase();
            const devPath =
                path.basename(rel2) === "readme" ?
                    path.posix.dirname(rel2)
                :   rel2;
            href2 = `/dev-docs/${devPath === "." ? "" : `${devPath}/`}${anchor}`;
        } else {
            href2 = `${GH_BLOB}${repoRel}${anchor}`;
        }
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

/**
 * Section a content entry routes to: its `type`, except `type: doc` pages route
 * by their `category` (so dev-docs / user-guide / rules / lore each become their
 * own section). This is the one rule; `sectionOf` is used everywhere a section
 * is computed.
 */
function sectionOf(fm) {
    return fm.type === "doc" ? fm.category : fm.type;
}

/**
 * Content section → landing-page title and hero banner. Each entry gets a
 * generated `_index.md` (title + banner) so the section landing shows the same
 * friendly label and image as its home-page card — instead of Hugo's
 * auto-humanized section name (e.g. "Armorgears") and the default banner. The
 * banner is a CDN fragment under `images/`; actor subtypes are included so
 * their landing exists (titled) even before any content of that type ships.
 */
const SECTION_META = {
    character: { title: "Characters", banner: "banners/character.webp" },
    creature: { title: "Creatures", banner: "banners/creature.webp" },
    weapongear: { title: "Weapons", banner: "banners/weapons.webp" },
    armorgear: {
        title: "Armor/Clothing",
        banner: "banners/armor-clothing.webp",
    },
    projectilegear: {
        title: "Projectiles",
        banner: "banners/projectiles.webp",
    },
    containergear: { title: "Containers", banner: "banners/containers.webp" },
    miscgear: { title: "Misc Gear", banner: "banners/misc-gear.webp" },
    affliction: { title: "Afflictions", banner: "banners/affliction.webp" },
    trauma: { title: "Trauma", banner: "banners/trauma.webp" },
    mysticalability: {
        title: "Mystical Abilities",
        banner: "banners/mystical-abilities.webp",
    },
    skill: {
        title: "Skills/Attributes",
        banner: "banners/skills-attributes.webp",
    },
    attribute: {
        title: "Skills/Attributes",
        banner: "banners/skills-attributes.webp",
    },
};

/**
 * Landing title + hero banner for the doc sections, whose index comes from a
 * README (see the README → `_index.md` routing below), matching their home-page
 * cards. Keyed by section (= the doc's `category`).
 */
const README_META = {
    "dev-docs": {
        title: "Developer Documentation",
        banner: "banners/dev-docs.webp",
    },
    "user-guide": { title: "User Guide", banner: "banners/user-guide.webp" },
    rules: { title: "Rules", banner: "banners/rules.webp" },
};

/** Gear item `type` → the `sohl.gear` group key the equipment sidebar renders. */
const GEAR_TYPE_TO_KEY = {
    weapongear: "weapons",
    armorgear: "armor",
    projectilegear: "projectiles",
    miscgear: "misc",
    containergear: "containers",
    concoctiongear: "concoctions",
};

/**
 * Derive a being's sidebar fields from its raw `sohl.items[]`.
 *
 * A character/creature note carries its embedded documents as `sohl.items` —
 * `{ shortcode, type, system? }` entries — but the shared theme's character /
 * creature sidebars read flattened, resolved shapes: a `skills` map, grouped
 * `gear`, a `corpus` reference, and `spells` / `talents`. Reproduce the vault
 * exporter's derivation here, resolving each item's `shortcode` against the
 * content-wide `index` (`"<type>:<shortcode>" → { name, url }`) for display
 * names and KB links. Attributes already match the sidebar shape and pass
 * through untouched.
 *
 * Only fields the author didn't already supply are derived (hand-authored
 * `sohl.skills` / `sohl.gear` / … win); an item's inline `name` beats the index,
 * and an unresolved shortcode falls back to itself rather than being dropped.
 * Returns a new `sohl` object; the input is not mutated.
 */
function deriveBeingSohl(sohl, index) {
    if (!sohl || typeof sohl !== "object") return sohl;
    const out = { ...sohl };
    const items = Array.isArray(out.items) ? out.items : [];
    if (items.length === 0) return out;

    const isMap = (v) => v && typeof v === "object" && !Array.isArray(v);
    const nonEmpty = (v) => Array.isArray(v) && v.length > 0;
    const lookup = (type, shortcode) =>
        shortcode ? index.get(`${type}:${shortcode}`) : undefined;

    // Skills: { shortcode: masteryLevelBase }.
    if (!(isMap(out.skills) && Object.keys(out.skills).length > 0)) {
        const skills = {};
        for (const it of items) {
            if (!isMap(it) || it.type !== "skill") continue;
            const level = it.system?.masteryLevelBase;
            if (typeof it.shortcode === "string" && typeof level === "number") {
                skills[it.shortcode] = level;
            }
        }
        if (Object.keys(skills).length > 0) out.skills = skills;
    }

    // Gear: { weapons: [{name, shortcode?, url?}], armor: [...], … }.
    if (!isMap(out.gear)) {
        const gear = {};
        for (const it of items) {
            if (!isMap(it)) continue;
            const key = GEAR_TYPE_TO_KEY[it.type];
            if (!key) continue;
            const shortcode =
                typeof it.shortcode === "string" ? it.shortcode : undefined;
            const ref = lookup(it.type, shortcode);
            const name =
                (typeof it.name === "string" && it.name) ||
                ref?.name ||
                shortcode;
            if (!name) continue;
            const entry = { name };
            if (shortcode) entry.shortcode = shortcode;
            if (ref?.url) entry.url = ref.url;
            (gear[key] ??= []).push(entry);
        }
        if (Object.keys(gear).length > 0) out.gear = gear;
    }

    // Corpus: { name, shortcode?, url? }.
    if (!isMap(out.corpus)) {
        const it = items.find((i) => isMap(i) && i.type === "corpus");
        if (it) {
            const shortcode =
                typeof it.shortcode === "string" ? it.shortcode : undefined;
            const ref = lookup("corpus", shortcode);
            const name =
                (typeof it.name === "string" && it.name) ||
                ref?.name ||
                shortcode;
            if (name) {
                out.corpus = { name };
                if (shortcode) out.corpus.shortcode = shortcode;
                if (ref?.url) out.corpus.url = ref.url;
            }
        }
    }

    // Mystical abilities split by subType → spells / talents ({name, url?}).
    const spells = [];
    const talents = [];
    for (const it of items) {
        if (!isMap(it) || it.type !== "mysticalability") continue;
        const shortcode =
            typeof it.shortcode === "string" ? it.shortcode : undefined;
        const ref = lookup("mysticalability", shortcode);
        const name = (typeof it.name === "string" && it.name) || ref?.name;
        if (!name) continue;
        const entry = { name };
        if (ref?.url) entry.url = ref.url;
        if (it.subType === "arcaneincantation") spells.push(entry);
        else if (it.subType === "arcanetalent") talents.push(entry);
    }
    if (spells.length > 0 && !nonEmpty(out.spells)) out.spells = spells;
    if (talents.length > 0 && !nonEmpty(out.talents)) out.talents = talents;

    return out;
}

let items = 0;
let docs = 0;
fs.rmSync(OUT, { recursive: true, force: true });

// --- Parse phase ---------------------------------------------------------
// Gather every KB page — assets/content reference pages AND kb/dev-docs/
// developer docs — into one `entries` list before writing, so wikilinks resolve across
// the whole KB and the section/slug index is complete first.
const KB_PACKAGES = new Set(["sohl", "thalorna"]);

// Manifests for packages this build does not publish (#1446). Vendored and
// committed, so a contributor without every repository still builds the same
// links CI does.
const MANIFEST_SRC = path.join(REPO, "assets/manifests");
const MANIFEST_OUT = path.join(REPO, "build/manifests");
// Loaded after the parse phase: which packages are *local* is what decides
// which manifests are foreign, and that is only known once the tree is walked.
// `KB_PACKAGES` is what this build would accept, not what it actually found —
// using it here silently discarded the manifest of any package it listed.
const entries = [];
const refIndex = new Map();
const slugErrors = [];

// assets/content → reference pages (SoHL + Thalorna packages).
for (const file of walk(CONTENT_SRC)) {
    let fm, body;
    try {
        ({ data: fm, content: body } = matter(fs.readFileSync(file, "utf8")));
    } catch {
        continue;
    }
    if (!KB_PACKAGES.has(fm.package) || !fm.type) continue;

    const name = fm.name?.full ?? path.basename(file, ".md");
    // The URL segment is derived from the name (#1278) — not from the shortcode,
    // which is identity referenced by saved world data, not presentation.
    let slug;
    try {
        slug = contentSlug(name);
    } catch (err) {
        slugErrors.push({
            file: path.relative(REPO, file),
            reason: err.message,
        });
        continue;
    }
    const base = path.basename(file);
    const isReadme = base.toLowerCase() === "readme.md";
    const sec = sectionOf(fm);
    const url = isReadme ? `/${sec}/` : `/${sec}/${slug}/`;
    entries.push({
        kind: "content",
        fm,
        body,
        name,
        slug,
        base,
        // Top-level content directory ("Rules", "Skills", …). Wikilinks do not
        // use it: they address a note as `type/shortcode`, wherever it is filed.
        tld: path.relative(CONTENT_SRC, file).split(path.sep)[0],
        // Location below the content root, POSIX-separated — what a generated
        // table reads as `file.path`, and scopes on with `FROM "…"`.
        relPath: path.relative(CONTENT_SRC, file).split(path.sep).join("/"),
        // Immediate source subfolder (Creatures/Animal/Aurochs.md → "Animal") —
        // the only surviving record of the authoring folder, for grouped landings.
        folder: path.basename(path.dirname(file)),
        sec,
        url,
        isReadme,
    });
    if (typeof fm.shortcode === "string") {
        refIndex.set(`${fm.type}:${fm.shortcode}`, { name, url });
    }
}

// kb/dev-docs/ → developer docs. They preserve their source tree under the section
// (e.g. /dev-docs/concepts/architecture/); a README is its directory's landing.
// Files carry `category: dev-docs`; the generated type-catalog.md has none, so
// default the section to "dev-docs".
for (const file of walk(DOCS_SRC)) {
    let fm, body;
    try {
        ({ data: fm, content: body } = matter(fs.readFileSync(file, "utf8")));
    } catch {
        continue;
    }
    const rel = path.relative(DOCS_SRC, file).replace(/\\/g, "/");
    const base = path.basename(rel);
    const isReadme = base.toLowerCase() === "readme.md";
    const sec = fm.category ?? "dev-docs";
    const h1 = /^#\s+(.+?)\s*$/m.exec(body);
    const h1Title = h1 ? h1[1].replace(/\{@link\s+[^}]*\}/g, "").trim() : null;
    const name =
        fm.name?.full ?? fm.title ?? h1Title ?? path.basename(base, ".md");
    const slug = fm.slug ?? slugify(path.basename(base, ".md"));
    const relNoExt = rel.slice(0, -3).toLowerCase();
    const dir = path.posix.dirname(relNoExt);
    const url =
        isReadme ?
            dir === "." ?
                `/${sec}/`
            :   `/${sec}/${dir}/`
        :   `/${sec}/${relNoExt}/`;
    entries.push({
        kind: "dev",
        fm,
        body: body.replace(/^\s*#\s+.*$\r?\n?/m, ""), // strip H1 (title renders it)
        name,
        slug,
        base,
        rel,
        sec,
        url,
        isReadme,
    });
}

// --- URL integrity -------------------------------------------------------
// A note that cannot derive a URL, or two notes deriving the same one, would
// silently drop or overwrite a page — fail the build naming the files instead.
if (slugErrors.length) {
    console.error(`\n\u2716 ${slugErrors.length} note(s) cannot derive a URL:`);
    for (const e of slugErrors) console.error(`  ${e.reason}  (in ${e.file})`);
    process.exit(1);
}
const collisions = findSlugCollisions(
    entries
        .filter((e) => e.kind === "content")
        .map((e) => ({ sec: e.sec, slug: e.slug, src: `${e.tld}/${e.base}` })),
);
if (collisions.length) {
    console.error(`\n\u2716 ${collisions.length} colliding page URL(s):`);
    for (const c of collisions) {
        console.error(`  ${c.url} claimed by ${c.sources.join(", ")}`);
    }
    process.exit(1);
}

// --- Wikilink index ------------------------------------------------------
// `section/slug` is unique by construction and always resolves. Name, filename,
// and bare slug are collision-aware fallbacks: a key mapping to two different
// pages is dropped and remembered as ambiguous, so `[[Name]]` on it fails the
// build (the author must disambiguate with `[[section/slug|Label]]`).
const wikiIndex = new Map(); // key → { url, name }
const wikiCollide = new Set();
const addFallback = (k, v) => {
    k = k.toLowerCase();
    if (wikiCollide.has(k)) return;
    const cur = wikiIndex.get(k);
    if (cur && cur.url !== v.url) {
        wikiIndex.delete(k);
        wikiCollide.add(k);
    } else if (!cur) {
        wikiIndex.set(k, v);
    }
};
for (const e of entries) {
    const v = { url: e.url, name: e.name };
    wikiIndex.set(`${e.sec}/${e.slug}`.toLowerCase(), v); // unique
    addFallback(e.name, v);
    if (!e.isReadme) addFallback(path.basename(e.base, ".md"), v);
    addFallback(e.slug, v);
}

// The authored form: `type/shortcode` — `(type, shortcode)` is the system's
// logical identity and is unique by rule, so this key is unique by construction,
// the same guarantee `section/slug` gives. Alongside it, every alias is indexed
// *scoped to its type*, which is what makes a bare `[[Text]]` resolvable even
// when the same name is used for another kind of document ("Shock" the rules
// page and "Shock" the trauma item both exist). Two notes of the *same* type
// sharing a name poison it: the bare form is then ambiguous and the author must
// write `[[type/shortcode|Text]]`.
// Packages this build actually publishes, and therefore is authoritative for.
const localPackages = new Set(
    entries.filter((e) => e.kind === "content").map((e) => e.fm.package),
);
const foreign = loadForeignManifests(MANIFEST_SRC, localPackages);
if (foreign.stale.length) {
    console.error("\n\u2716 unusable link manifest(s):");
    for (const s of foreign.stale) console.error(`  ${s.package}: ${s.reason}`);
    process.exit(1);
}
const manifests = manifestsComplete(localPackages, foreign.packages);

const typeAlias = new Map(); // `type|alias` → { url, name }
const typeCollide = new Set();
const contentTypes = new Set();
// A foreign package may use a type this build has never seen. Seeding those
// here is what lets `readQualifier` recognise `polity-xyz` as an address at
// all — without it the link is read as prose and silently loses its href.
for (const k of foreign.index.keys()) {
    const slash = k.indexOf("/");
    if (slash > 0) contentTypes.add(k.slice(0, slash));
}
for (const e of entries) {
    if (e.kind !== "content") continue; // developer docs carry no type/shortcode
    const type = String(e.fm.type).toLowerCase();
    contentTypes.add(type);
    const v = { url: e.url, name: e.name };
    if (typeof e.fm.shortcode === "string" && e.fm.shortcode) {
        wikiIndex.set(`${type}/${e.fm.shortcode}`.toLowerCase(), v);
        // In Foundry an item and its documentation are two separate documents,
        // so `skill/wpnc` and `docskill/wpnc` resolve to two different UUIDs
        // (#1362). Here the item note renders as one page which *is* its
        // documentation, so the two qualifiers are **aliases for the same URL**
        // and an anchor on either is an ordinary in-page anchor. One authored
        // link, correct in both builds. Restricted to the types that actually
        // have an item doc, so a qualifier the packs would reject is reported
        // broken here too.
        if (isItemDocType(type)) {
            contentTypes.add(`doc${type}`);
            wikiIndex.set(`doc${type}/${e.fm.shortcode}`.toLowerCase(), v);
        }
    }
    const aliases = [
        ...(Array.isArray(e.fm.aliases) ? e.fm.aliases : []),
        ...(Array.isArray(e.fm.name?.aliases) ? e.fm.name.aliases : []),
        e.name,
        path.basename(e.base, ".md").replace(/_/g, " "),
    ].filter((a) => typeof a === "string" && a);
    for (const a of aliases) {
        const k = `${type}|${a}`.toLowerCase();
        if (typeCollide.has(k)) continue;
        const cur = typeAlias.get(k);
        if (cur && cur.url !== v.url) {
            typeAlias.delete(k);
            typeCollide.add(k);
        } else if (!cur) {
            typeAlias.set(k, v);
        }
    }
}

// --- Generated tables ----------------------------------------------------
// The universe a `dataview` table searches: every reference page, grouped
// by package so a SoHL page never tabulates setting-package content. Reference
// pages only — a developer doc documents the syntax, it does not tabulate content.
const docsByPackage = new Map();
for (const e of entries) {
    if (e.kind !== "content") continue;
    const pkg = e.fm.package;
    if (!docsByPackage.has(pkg)) docsByPackage.set(pkg, []);
    docsByPackage.get(pkg).push({
        fm: e.fm,
        path: e.relPath,
        tld: e.tld,
        folder: e.folder,
    });
}
const tableErrors = [];
/** A cell can link to a note that has a shortcode to address it by. */
const tableLinkable = (d) => Boolean(d.fm.shortcode);

const knownSections = new Set(entries.map((e) => e.sec.toLowerCase()));
const wikiErrors = [];
const wikiCtx = (src, type = null) => ({
    index: wikiIndex,
    foreign: foreign.index,
    manifestsComplete: manifests.complete,
    collide: wikiCollide,
    sections: knownSections,
    typeAlias,
    typeCollide,
    contentTypes,
    type,
    errors: wikiErrors,
    src,
});

// --- Write phase ---------------------------------------------------------
for (const e of entries) {
    const { fm, name, slug, sec, base, isReadme } = e;
    const src = e.rel ?? `${sec}/${base}`;
    const resolve = (t) =>
        resolveKbWikilinks(resolveLinks(t), wikiCtx(src, e.fm.type));

    // Redirect the page's old URL(s) so pre-split links don't 404: docs used to
    // live under /guide/ (assets/content) or /dev/ (developer docs), and content
    // notes at a pre-shortcode slug. Wholly generated — an authored (Obsidian)
    // `aliases` is a list of *names*, never a URL, so it never lands here.
    const redirects = pageRedirects(e, legacySlugs);

    if (e.kind === "content") {
        const data = {
            ...fm,
            slug,
            title: fm.title ?? name,
            kbfolder: e.folder,
        };
        if (fm.type === "character" || fm.type === "creature") {
            data.sohl = deriveBeingSohl(fm.sohl, refIndex);
        }
        if (isReadme) {
            const meta = README_META[sec];
            if (meta)
                Object.assign(data, { title: meta.title, banner: meta.banner });
        }
        applyRedirects(data, redirects);
        const dest =
            isReadme ?
                path.join(OUT, sec, "_index.md")
            :   path.join(OUT, sec, `${slug}.md`);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        // Tables expand before wikilinks resolve, so a generated cell may
        // itself be a wikilink — the same order the pack compilers use. It also
        // runs *outside* protectCode: a table is authored as a fenced
        // `dataview` block, which protectCode would otherwise stash away before
        // the expander ever saw it. Expanding first leaves an ordinary markdown
        // table for `resolve` to walk, and every other fence still protected.
        const expandTables = (t) => {
            const { markdown, errors } = expandContentTables(t, {
                docs: docsByPackage.get(fm.package) ?? [],
                linkable: tableLinkable,
                source: src,
                self: { fm, path: e.relPath },
            });
            tableErrors.push(...errors);
            return markdown;
        };
        fs.writeFileSync(
            dest,
            matter.stringify(
                protectCode(expandTables(e.body), (t) => resolve(t)),
                data,
            ),
        );
        items++;
    } else {
        // Developer doc — preserve the source tree; a README is its dir's landing.
        const meta = isReadme ? README_META[sec] : null;
        const data = { ...fm, title: meta?.title ?? fm.title ?? name };
        if (meta?.banner) data.banner = meta.banner;
        applyRedirects(data, redirects);
        const relOut =
            isReadme ?
                path.posix.join(path.posix.dirname(e.rel), "_index.md")
            :   e.rel;
        const dest = path.join(OUT, sec, relOut);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(
            dest,
            matter.stringify(
                protectCode(e.body, (t) => rewriteRepoLinks(resolve(t), e.rel)),
                data,
            ),
        );
        docs++;
    }
}

// Titled `_index.md` (title + hero banner) for the item sections (see
// SECTION_META) so each landing matches its home-page card; an empty body lets
// the theme auto-list children (or show "Nothing here yet." for an empty
// section, e.g. an actor subtype with no content yet).
for (const [sec, meta] of Object.entries(SECTION_META)) {
    const dir = path.join(OUT, sec);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
        path.join(dir, "_index.md"),
        matter.stringify("", { title: meta.title, banner: meta.banner }),
    );
}

// Emit this build's own manifests, one per package it publishes (#1446), so
// another package can resolve links into it without reading this repository.
const byPackage = new Map();
for (const e of entries) {
    if (e.kind !== "content") continue;
    if (!byPackage.has(e.fm.package)) byPackage.set(e.fm.package, []);
    byPackage.get(e.fm.package).push(e);
}
for (const w of writeManifests(byPackage, MANIFEST_OUT)) {
    console.log(
        `kb-content: manifest ${w.package} — ${w.count} addressable note(s)`,
    );
}
if (!manifests.complete) {
    console.warn(
        `kb-content: cross-package address checking is OFF — no manifest for ` +
            `${manifests.missing.join(", ")}. Unresolved addresses are ` +
            `tolerated until every package publishes one (#1446).`,
    );
}

// Fail the build on any table directive that could not be honoured.
if (tableErrors.length) {
    console.error(`\n\u2716 ${tableErrors.length} bad content table(s):`);
    for (const e of tableErrors) {
        console.error(`  ${e.reason}  (in ${e.source})`);
    }
    process.exit(1);
}

// Fail the build on any unresolved or ambiguous wikilink.
if (wikiErrors.length) {
    console.error(`\n✖ ${wikiErrors.length} bad wikilink(s):`);
    for (const e of wikiErrors) {
        console.error(`  [${e.reason}] [[${e.target}]]  (in ${e.file})`);
    }
    process.exit(1);
}

console.log(
    `kb-content: wrote ${items} reference pages + ${docs} developer docs to kb/content/`,
);
