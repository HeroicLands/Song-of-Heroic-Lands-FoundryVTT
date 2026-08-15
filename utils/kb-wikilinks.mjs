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
 *   `[[type/shortcode|Text]]`       → `[Text](/section/slug/)`
 *   `[[Text]]`                      → the same, via a type-scoped alias
 *   `[[type/shortcode#slug|Text]]`   → `[Text](/section/slug/#slug)`
 *   `[[#slug|Text]]`                 → `[Text](#slug)`
 *
 * The KB *section* is not always the type: prose pages (`type: doc`) route by
 * their `category`, so `doc/quickstart` lands on `/user-guide/sohl-quickstart/`.
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
 * Rewrites a `type-shortcode` target to the canonical `type/shortcode` index
 * key, or `null` when the target is not qualified at all.
 *
 * The hyphen is the canonical separator (#1398) because Obsidian reads `/`
 * inside a wikilink as a path, and the content is authored in Obsidian. It
 * qualifies **only when what precedes it is a known type**: names are
 * hyphenated too, and `[[Grukar-ahk]]` has to keep resolving as an alias rather
 * than being reported as a broken `grukar/ahk`. The split is at the *first*
 * hyphen, so a shortcode may itself contain one.
 *
 * `types` carries the virtual `doc<type>` qualifiers as well as the real types
 * (the KB build adds them), so `docskill-climb` is recognised here too.
 *
 * @param {string} key - The lowercased link target, anchor already removed.
 * @param {Set<string>} types - Known content types, including `doc<type>`.
 * @returns {string | null} The `type/shortcode` index key, or `null`.
 */
function qualifiedKey(key, types) {
    const hyphen = key.indexOf("-");
    // `> 0` rather than `!== -1`: a leading hyphen leaves no type before it.
    if (hyphen <= 0 || hyphen === key.length - 1) return null;
    const type = key.slice(0, hyphen);
    return types.has(type) ? `${type}/${key.slice(hyphen + 1)}` : null;
}

/**
 * Rewrites the wikilinks in a markdown body as KB-local markdown links.
 *
 * A target is looked up case-insensitively: first as an alias scoped to the
 * source's own **type** (`ctx.typeAlias`, keyed `type|alias`) — a note's
 * directory and `category` play no part — then in the KB-wide `ctx.index` (keyed
 * by the unambiguous `section/slug` and `type/shortcode`, plus name/filename/slug
 * fallbacks).
 *
 * An unresolved target fails the build only when it is a genuine intra-KB
 * problem — an ambiguous alias, or a qualified `prefix/key` whose prefix is a
 * real KB section or content directory. Anything else is treated as an external
 * reference (worldbuilding notes kept outside this repository) and rendered as
 * plain text. Failures are collected in `ctx.errors`.
 *
 * @param {string} body - The markdown body.
 * @param {object} ctx - `{ index, typeAlias, collide, typeCollide, sections,
 *   contentTypes, type, errors, src }`.
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
        const typeKey = ctx.type ? `${ctx.type}|${key}`.toLowerCase() : null;
        // The canonical separator (#1398), read the way the pack resolver reads
        // it (`readQualifier` in `utils/packs/wikilinks.mjs`): split at the
        // *first* hyphen, and treat it as a qualifier **only when what precedes
        // it is a known type** — note names are hyphenated too (`Grukar-ahk`)
        // and must keep resolving as aliases. The index is keyed by the
        // canonical `type/shortcode`, so a recognised qualifier is rewritten to
        // it. Without this the form resolved only when source and target shared
        // a type, by way of the seeded alias; every *cross-type* link written in
        // the canonical separator silently lost its href.
        const hyphenKey = qualifiedKey(key, ctx.contentTypes);
        const hit =
            (typeKey ? ctx.typeAlias.get(typeKey) : undefined) ??
            ctx.index.get(key) ??
            (hyphenKey ? ctx.index.get(hyphenKey) : undefined);
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
        // Deliberately *not* extended to the hyphen form. A slash is written
        // only by this repository's own older links, so an unresolved one is a
        // dead shortcode. The hyphen is what the vault writes, and the vault
        // holds packages this build does not publish: `Rules/Bestiary.md`
        // addresses `creature-grkrahk` — a real note, with exactly that alias,
        // in the vault's `setting` package. Nothing in the syntax separates that
        // legitimate cross-package reference from a genuine typo, so treating
        // the form as definitely-local would fail the build on correct content.
        // Restoring the guard needs the single-source tree (#1385), where every
        // package is visible and the distinction becomes decidable.
        const badQualified =
            prefix !== null &&
            (ctx.sections.has(prefix) || ctx.contentTypes.has(prefix));
        if ((typeKey && ctx.typeCollide.has(typeKey)) || ctx.collide.has(key)) {
            ctx.errors.push({ file: ctx.src, target, reason: "ambiguous" });
        } else if (badQualified) {
            ctx.errors.push({
                file: ctx.src,
                target,
                reason: "broken type/shortcode",
            });
        }
        return display ?? target;
    });
}
