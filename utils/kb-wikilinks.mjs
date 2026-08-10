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
 * Wikilink resolution for the knowledgebase build.
 *
 * The same authored links the pack compilers turn into Foundry `@UUID` enrichers
 * (see `utils/packs/wikilinks.mjs`) become site-local hrefs here:
 *
 *   `[[TLD/shortcode|Text]]`        → `[Text](/section/slug/)`
 *   `[[Text]]`                      → the same, via a directory-scoped alias
 *   `[[TLD/shortcode#slug|Text]]`    → `[Text](/section/slug/#slug)`
 *   `[[#slug|Text]]`                 → `[Text](#slug)`
 *
 * The KB *section* is not the content directory: a document routes by its `type`
 * (or `category` for prose pages), so `Skills/climb` lands on `/skill/climbing/`.
 * The caller supplies that mapping already resolved, in the index it builds.
 *
 * Extracted from `build-kb-content.mjs` so the resolution rules can be unit
 * tested; that script runs its work at import time and exports nothing.
 */

/** KB heading/anchor slug: lowercase, non-alphanumerics to single hyphens. */
export const slugify = (s) =>
    String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

/**
 * Rewrites the wikilinks in a markdown body as KB-local markdown links.
 *
 * A target is looked up case-insensitively: first as an alias scoped to the
 * source's own content directory (`ctx.tldAlias`, keyed `tld|alias`), which is
 * where authoring guarantees uniqueness, then in the KB-wide `ctx.index` (keyed
 * by the unambiguous `section/slug` and `TLD/shortcode`, plus name/filename/slug
 * fallbacks).
 *
 * An unresolved target fails the build only when it is a genuine intra-KB
 * problem — an ambiguous alias, or a qualified `prefix/key` whose prefix is a
 * real KB section or content directory. Anything else is treated as an external
 * reference (worldbuilding notes kept outside this repository) and rendered as
 * plain text. Failures are collected in `ctx.errors`.
 *
 * @param {string} body - The markdown body.
 * @param {object} ctx - `{ index, tldAlias, collide, tldCollide, sections,
 *   contentTlds, tld, errors, src }`.
 * @returns {string} The body with wikilinks rewritten.
 */
export function resolveKbWikilinks(body, ctx) {
    return body.replace(/\[\[([^\]]+)\]\]/g, (_m, rawInner) => {
        // A pipe inside a markdown table is escaped as `\|`; undo that first.
        const inner = rawInner.replace(/\\\|/g, "|");
        const bar = inner.indexOf("|");
        const linkPart = (bar === -1 ? inner : inner.slice(0, bar)).trim();
        const hash = linkPart.indexOf("#");
        const target = (
            hash === -1 ? linkPart : linkPart.slice(0, hash)).trim();
        const anchor = hash === -1 ? "" : linkPart.slice(hash + 1).trim();
        const display = bar === -1 ? null : inner.slice(bar + 1).trim();

        // `[[#section-slug|Text]]` — a section of this same page.
        if (!target && anchor) {
            return `[${display ?? anchor}](#${slugify(anchor)})`;
        }

        const key = target.toLowerCase();
        const tldKey = ctx.tld ? `${ctx.tld}|${key}`.toLowerCase() : null;
        const hit =
            (tldKey ? ctx.tldAlias.get(tldKey) : undefined) ??
            ctx.index.get(key);
        if (hit) {
            // With no explicit label, a *qualified* target has no prose to show
            // (a shortcode is not display text), so fall back to the document's
            // name. A bare `[[Text]]` is already the prose the author wrote —
            // substituting the canonical name there would rewrite the sentence
            // ("worsens the [[Shock State]]" must not render as "Shock").
            const text = display ?? (target.includes("/") ? hit.name : target);
            return `[${text}](${anchor ? `${hit.url}#${slugify(anchor)}` : hit.url})`;
        }

        const slash = target.indexOf("/");
        const prefix =
            slash === -1 ? null : target.slice(0, slash).toLowerCase();
        const badQualified =
            prefix !== null &&
            (ctx.sections.has(prefix) || ctx.contentTlds.has(prefix));
        if ((tldKey && ctx.tldCollide.has(tldKey)) || ctx.collide.has(key)) {
            ctx.errors.push({ file: ctx.src, target, reason: "ambiguous" });
        } else if (badQualified) {
            ctx.errors.push({
                file: ctx.src,
                target,
                reason: "broken section/slug",
            });
        }
        return display ?? target;
    });
}
