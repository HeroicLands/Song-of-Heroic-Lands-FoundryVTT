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
 * The URL redirects a knowledgebase page publishes.
 *
 * `aliases` is one word for two unrelated things, and the difference is the
 * whole point of this module:
 *
 * - In **Obsidian**, a note's `aliases` are alternative **names** — what a
 *   reader might call the thing, and what makes a bare `[[Text]]` wikilink
 *   resolve to it. They are vault addressing, and they stay in the vault.
 * - In **Hugo**, a page's `aliases` are **URL redirects** — old addresses that
 *   must keep resolving to the page's current one.
 *
 * A display name is not an old URL, so it is never a redirect (#1399).
 * Redirects are *generated*, and only from a record of where the page used to
 * be published: the legacy-slug map (#1278/#1280) and the pre-split section
 * move. That makes this module the single answer to "what does this page
 * redirect from" — nothing an author types becomes a public URL.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable —
 * see `tests/build/kb-redirects.test.ts`.
 */

import path from "node:path";

/**
 * Which retired section a `being` page published under, by its `sohl.kbcat`.
 *
 * `character` and `creature` were one distinction with two spellings; retiring
 * them in favour of `being` (#1580) moved 95 published URLs, and the section
 * segment each page used to carry is the one thing the retype erases from the
 * note. It does not have to be stored per note, because `kbcat` — the field
 * that now carries the taxonomy — already implies it.
 *
 * **Absence is a valid answer, not a gap.** A being added *after* the merge has
 * never published anywhere else and must emit no redirect at all, so an
 * unlisted `kbcat` falls through to "no move" rather than being reported. That
 * is why this maps only the values that existed when the sections merged; a new
 * one means new content, which is exactly the case with no old URL to preserve.
 *
 * @type {Readonly<Record<string, string>>}
 */
const RETIRED_BEING_SECTION = Object.freeze({
    animal: "creature",
    npc: "character",
    archetype: "character",
});

/**
 * Developer-doc pages that have moved between sections, keyed by their current
 * path under `kb/dev-docs/` (lowercased, no extension) and valued by the path
 * they used to publish at.
 *
 * A dev doc's URL is its path, so moving a page between sections moves a
 * published address — and unlike a content note, nothing the page still carries
 * records where it used to be. A dev doc has no frontmatter at all: its section
 * is the directory it sits in, and after the move that directory only names the
 * new one. So the move has to be recorded, here, exactly as the legacy-slug map
 * records a content note's pre-shortcode URL.
 *
 * **Only real former addresses belong here.** The point is not "this page is
 * related to that path" — it is "this page was served at that URL and links to
 * it exist in the wild". A page created in its current section has never
 * published anywhere else and takes no entry.
 *
 * @type {Readonly<Record<string, string>>}
 */
const MOVED_DEV_DOCS = Object.freeze({
    // The content-authoring pages, gathered out of `reference/` into the
    // Content Creator section (#1572).
    "content-creator/content-links": "reference/content-links",
    "content-creator/content-tables": "reference/content-tables",
    "content-creator/macro-notes": "reference/macro-notes",
    "content-creator/map-notes": "reference/map-notes",
});

/**
 * Old (pre-split) section URL a moved page redirects from, so existing links and
 * bookmarks don't 404: every `type: doc` page used to live under `/guide/`
 * except the developer docs, which were under `/dev/`. A `being` page used to
 * live under `/character/` or `/creature/` — see {@link RETIRED_BEING_SECTION}.
 *
 * @param {{type?: string, sohl?: {kbcat?: string}}} fm - The note's frontmatter.
 * @param {boolean} isDevDoc - Whether the page is a developer doc.
 * @returns {string | undefined} The old section segment. Equal to the current
 *   section when the page has not moved, which is how the caller tells "no
 *   redirect" from one.
 */
export function oldSectionOf(fm, isDevDoc) {
    if (fm.type === "being") {
        return RETIRED_BEING_SECTION[fm.sohl?.kbcat] ?? fm.type;
    }
    if (fm.type !== "doc") return fm.type;
    return isDevDoc ? "dev" : "guide";
}

/**
 * Every URL one page redirects from.
 *
 * Two sources, both generated and both a record of a URL this page really did
 * publish at before:
 *
 * - the **legacy slug** for its `type:shortcode` identity, from the committed
 *   `kb/data/legacy-slugs.json` — the only record of the pre-shortcode URLs;
 * - the **pre-split section**, when the page has since moved out of `/guide/`
 *   or `/dev/`.
 *
 * The page's own current URL is never among them (a self-redirect is a loop),
 * and `fm.aliases` — display names — is deliberately not consulted.
 *
 * @param {object} entry - One prepared page.
 * @param {"content" | "dev"} entry.kind - Content note or developer doc.
 * @param {object} entry.fm - Its frontmatter (`type`, `shortcode`).
 * @param {string} entry.sec - The section it publishes into.
 * @param {string} entry.slug - Its URL segment.
 * @param {string} entry.url - Its current URL (`/sec/slug/`).
 * @param {string} [entry.rel] - Source path relative to the doc root (dev only).
 * @param {boolean} [entry.isReadme] - Whether the page is its section landing.
 * @param {Record<string, string>} [legacySlugs] - `type:shortcode` → old slug.
 * @param {string} [base] - Where the knowledgebase is mounted (#1470), e.g.
 *   `"/sohl/kb/"`. Every redirect is an address inside it, and so is the
 *   `entry.url` the self-redirect check compares against — the two must be
 *   spelled the same way, or a page acquires an alias at its own URL and Hugo
 *   publishes the redirect stub over the page itself.
 * @returns {string[]} The redirect URLs, in first-claim order; empty when the
 *   page has never published anywhere else.
 */
export function pageRedirects(entry, legacySlugs = {}, base = "/") {
    const { kind, fm, sec, slug, url, rel, isReadme } = entry;
    const redirects = new Set();

    // The pre-shortcode URL (#1278), so existing links and bookmarks still land.
    const legacy =
        kind === "content" ?
            legacySlugs[`${fm.type}:${fm.shortcode}`]
        :   undefined;
    if (legacy) redirects.add(`${base}${sec}/${legacy}/`);

    const oldSec = kind === "dev" ? "dev" : oldSectionOf(fm, false);
    if (oldSec !== sec) {
        if (kind === "dev") {
            const relNoExt = rel.slice(0, -3).toLowerCase();
            const dir = path.posix.dirname(relNoExt);
            if (isReadme) {
                redirects.add(
                    dir === "." ?
                        `${base}${oldSec}/`
                    :   `${base}${oldSec}/${dir}/`,
                );
            } else {
                // Where this page published before it moved sections, if it
                // has — the pre-split address is the *old* path's, since the
                // new one did not exist when `/dev/` was the mount.
                const former = MOVED_DEV_DOCS[relNoExt] ?? relNoExt;
                redirects.add(`${base}${oldSec}/${former}/`);
                if (former !== relNoExt) {
                    redirects.add(`${base}${sec}/${former}/`);
                }
            }
        } else {
            redirects.add(`${base}${oldSec}/${legacy ?? slug}/`);
            if (isReadme) redirects.add(`${base}${oldSec}/`);
        }
    }
    redirects.delete(url);
    return [...redirects];
}

/**
 * Set a page's Hugo `aliases` to exactly its generated redirects.
 *
 * The written frontmatter is built by spreading the note's own, so an authored
 * Obsidian `aliases` would otherwise ride along into the published page and
 * become a redirect at a display-name URL. Clearing it first makes the emitted
 * value wholly generated: what {@link pageRedirects} returned, or nothing.
 *
 * **An alias is publishDir-relative, not a site URL** (#1470). Hugo writes one
 * at `publishDir + alias` and never subtracts the path its `baseURL` carries,
 * so a page under `/sohl/` whose alias reads `/sohl/kb/x/` publishes it at
 * `/sohl/sohl/kb/x/` — a redirect that builds, deploys, and is unreachable.
 * The site root is stripped here, at the single point where a real URL becomes
 * a Hugo field; everything upstream reasons in mounted URLs, which is what
 * makes the self-redirect check in {@link pageRedirects} comparable.
 *
 * @param {object} data - The frontmatter about to be written (mutated).
 * @param {string[]} redirects - The page's redirect URLs, mounted.
 * @param {string} [siteRoot] - The path this Hugo site is published at, i.e.
 *   its `baseURL` path (`"/sohl/"`). Stripped from each redirect.
 * @returns {object} The same `data`, for chaining.
 * @throws {Error} If a redirect does not sit under `siteRoot` — it would
 *   publish at an address the deploy never serves.
 */
export function applyRedirects(data, redirects, siteRoot = "/") {
    delete data.aliases;
    if (!redirects.length) return data;
    data.aliases = redirects.map((url) => {
        if (!url.startsWith(siteRoot)) {
            throw new Error(
                `applyRedirects: redirect ${JSON.stringify(url)} is not under ` +
                    `the site root ${JSON.stringify(siteRoot)}`,
            );
        }
        return `/${url.slice(siteRoot.length)}`;
    });
    return data;
}
