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
 * The URL segment of a content note — derived from its name.
 *
 * Content notes carry no authored `slug`: it was a hand-maintained second
 * spelling of something already determined, free to drift from the page it
 * named. The URL is derived instead.
 *
 * It is derived from the **name**, deliberately not from the `shortcode`, even
 * though `(type, shortcode)` is unique by rule and would be a tempting key. A
 * shortcode is *identity*: it is referenced from saved world data — actions,
 * cohorts, expressions, archetypes, pack lookups — so binding the public URL to
 * it would make a cosmetic URL change into a data migration. A URL is
 * presentation, and it should read like one (`/creature/nusvorroth/`, not
 * `/creature/nsvrroth/`). Renames are what a URL must survive, and they do:
 * every change appends to the legacy-URL map, which emits a redirect.
 *
 * This is document identity, and it is deliberately **not** the same operation
 * as the other slug-shaped transforms in the build:
 *
 * - heading **anchor** slugs (`[[#some-heading]]`, `{#slug}`) — position within
 *   a page, in `utils/kb-wikilinks.mjs` and `packages/content-build/engine/journals.mjs`;
 * - pack **filename** slugs, in `packages/content-build/engine/compendiums.mjs`;
 * - `slugifyShortcode` in `src/utils/helpers.ts`, which runs the other way —
 *   suggesting a shortcode _from_ a name when an item is created.
 *
 * Plain ESM with no Foundry and no filesystem access, so it is unit-testable —
 * see `packages/content-build/tests/content-slug.test.ts`.
 */

import unidecode from "unidecode";

/**
 * The URL segment for one content note.
 *
 * The name is **transliterated** before it is reduced, so an accented character
 * is carried across rather than dropped — dropping is what turned `Nüsvōrroth`
 * into `n-sv-rroth` and forced a hand-written slug. Ligatures expand the way a
 * reader would spell them out: `þ`→`th`, `æ`→`ae`, `œ`→`oe`, `ß`→`ss`, `ĳ`→`ij`,
 * `ﬁ`→`fi`, and eth (`ð`) follows the Icelandic convention of a bare `d`.
 *
 * Two reductions are ours rather than the transliterator's:
 *
 * - **apostrophes are removed**, not treated as separators (`Armorer's Kit` →
 *   `armorers-kit`), matching the URLs these pages already publish at;
 * - **a fraction keeps its digits together** — a vulgar fraction expands to
 *   `3/4`, and the solidus would otherwise split it into `3-4`, so a slash
 *   *between digits* is closed up (`Kûrbúl ¾-Helm` → `kurbul-34-helm`).
 *
 * @param {string | undefined} name - The note's display name (`name.full`),
 *   which a malformed note may not have at all.
 * @returns {string} The URL segment (never empty).
 * @throws {Error} When there is no name, or the name carries no URL-safe
 *   characters — either way the note cannot be addressed, which is a content
 *   error rather than something to paper over with a fallback.
 */
export function contentSlug(name) {
    const raw = typeof name === "string" ? name.trim() : "";
    if (!raw) {
        throw new Error("content note has no name, so it has no URL");
    }
    const slug = unidecode(raw)
        .toLowerCase()
        .replace(/['\u2019]/g, "")
        .replace(/(\d)\/(\d)/g, "$1$2")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    if (!slug) {
        throw new Error(
            `name "${raw}" has no URL-safe characters, so it cannot address a page`,
        );
    }
    return slug;
}

/**
 * Find pages that would publish to the same URL.
 *
 * Nothing constrains two notes in one section from sharing a name, and a
 * collision silently overwrites one page with the other. This turns it into a
 * build failure that names every claimant, so the fix is a more specific title.
 * (The content tree has no collisions today.)
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
