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
 * The URL segment of a content note — derived from its `shortcode`.
 *
 * `(type, shortcode)` is already the system's logical identity and is unique by
 * rule (enforced by `npm run lint:packs`; see the Shortcode Integrity doc). A KB
 * page routes into a section that _is_ its type, so the shortcode alone
 * addresses it unambiguously — an authored `slug` property would only be a
 * second, drift-prone spelling of the same identity.
 *
 * This is document identity, and it is deliberately **not** the same operation
 * as the other slug-shaped transforms in the build:
 *
 * - heading **anchor** slugs (`[[#some-heading]]`, `{#slug}`) — position within
 *   a page, in `utils/kb-wikilinks.mjs` and `utils/packs/journals.mjs`;
 * - pack **filename** slugs, in `utils/packs/build-compendiums.mjs`;
 * - `slugifyShortcode` in `src/utils/helpers.ts`, which runs the other way —
 *   suggesting a shortcode _from_ a name when an item is created.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable —
 * see `tests/build/content-slug.test.ts`.
 */

import unidecode from "unidecode";

/**
 * The URL segment for one content note.
 *
 * The shortcode is transliterated before it is reduced, so a non-ASCII
 * character is carried across rather than dropped: dropping is what let
 * `Ālverrik` and `lverrik` collapse onto one URL under the old name-derived
 * slugifier.
 *
 * @param {{shortcode?: string, type?: string}} fm - The note's frontmatter.
 * @returns {string} The URL segment (never empty).
 * @throws {Error} When the note has no shortcode, or its shortcode carries no
 *   URL-safe characters — either way the note cannot be addressed, which is a
 *   content error rather than something to paper over with a fallback.
 */
export function contentSlug(fm) {
    const raw = typeof fm?.shortcode === "string" ? fm.shortcode.trim() : "";
    if (!raw) {
        throw new Error(
            `content note has no shortcode, so it has no URL${fm?.type ? ` (type: ${fm.type})` : ""}`,
        );
    }
    const slug = unidecode(raw)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    if (!slug) {
        throw new Error(
            `shortcode "${raw}" has no URL-safe characters, so it cannot address a page`,
        );
    }
    return slug;
}

/**
 * Find pages that would publish to the same URL.
 *
 * `(type, shortcode)` uniqueness makes this impossible in principle, but the
 * derivation lowercases and reduces, so two shortcodes differing only in case or
 * punctuation would still collide — and a collision silently overwrites one page
 * with the other. This turns that into a build failure that names both notes.
 *
 * @param {Array<{sec: string, slug: string, src: string}>} pages
 * @returns {Array<{url: string, sources: string[]}>} One entry per collision, in
 *   first-claim order; empty when every URL is unique.
 */
export function findSlugCollisions(pages) {
    const byUrl = new Map();
    for (const { sec, slug, src } of pages) {
        const url = `/${sec}/${slug}/`;
        if (!byUrl.has(url)) byUrl.set(url, []);
        byUrl.get(url).push(src);
    }
    return [...byUrl.entries()]
        .filter(([, sources]) => sources.length > 1)
        .map(([url, sources]) => ({ url, sources }));
}
