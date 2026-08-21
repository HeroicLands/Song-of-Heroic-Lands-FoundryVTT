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
 * (see `@heroiclands/content-build/engine/wikilinks`) become site-local hrefs here:
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

// Whether a target is an *address* rather than prose is read with the pack
// build's own rule, so the two builds cannot drift apart on it: they disagreed
// once over the unlabelled hyphen form, which the packs showed as a raw
// shortcode and the knowledgebase as a name (#1409).
import { readQualifier } from "@heroiclands/content-build/engine/wikilinks";
import { replaceOutsideCode } from "@heroiclands/content-build/engine/code-fences";

/** KB heading/anchor slug: lowercase, non-alphanumerics to single hyphens. */
export const slugify = (s) =>
    String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

/**
 * Whether a link target addresses a document as `type-shortcode` (or the legacy
 * `type/shortcode`) rather than naming it in prose.
 *
 * Delegates to the pack build's {@link readQualifier} so one rule serves both
 * builds. A `reason` is as much an address as a resolved qualifier is — the
 * target is qualified either way, it just names no known type — and the caller
 * only ever asks this of a target that already resolved.
 *
 * @param {string} target - The link target, anchor already removed.
 * @param {Set<string>} [contentTypes] - Every content type the KB build saw.
 * @returns {boolean} `true` when the target is an address.
 */
function isAddress(target, contentTypes) {
    return readQualifier(target, contentTypes ?? new Set()) !== null;
}

/**
 * The `type/shortcode` index key a qualified target resolves to, or `null`.
 *
 * The KB index is keyed by the canonical `type/shortcode`, so a target written
 * in the hyphen separator — which is what the vault authors (#1398) — has to be
 * rewritten to it before lookup. Uses the same {@link readQualifier} as
 * {@link isAddress}, so recognising an address and resolving one can never
 * disagree: the first-hyphen split and the known-type condition that keeps
 * `[[Grukar-ahk]]` an alias are stated once, in the pack build.
 *
 * The build indexes an item note under both `skill/climb` and `docskill/climb`,
 * and `contentTypes` carries both qualifiers, so either form finds the page.
 *
 * @param {string} target - The link target, anchor already removed.
 * @param {Set<string>} [contentTypes] - Every content type the KB build saw.
 * @returns {string | null} The index key, or `null` when not qualified.
 */
function qualifiedKey(target, contentTypes) {
    const read = readQualifier(target, contentTypes ?? new Set());
    if (!read || read.reason) return null;
    return `${read.type}/${read.shortcode}`.toLowerCase();
}

/**
 * A wikilink, as it is written, anywhere in a value that is not markdown.
 *
 * Deliberately its own pattern rather than the body resolver's: nothing here is
 * markdown, so there is no fence or code span to step around, and a frontmatter
 * value is a single line by construction (`[^\]\n]` keeps a runaway match from
 * swallowing the rest of a folded scalar).
 */
const FRONTMATTER_WIKILINK = /\[\[[^\]\n]+\]\]/g;

/**
 * Every wikilink authored inside a frontmatter value (#1428).
 *
 * Wikilinks are resolved in a note's **body** — by {@link resolveKbWikilinks}
 * here, and by the pack compilers' `convertWikilinks` for Foundry. Frontmatter
 * is not markdown and is never walked by either, so a link written in one is
 * copied through verbatim and reaches the reader as literal `[[…]]` text, in
 * whatever the theme renders that field as (an infobox row, a description, a
 * card subtitle). Nothing downstream notices: the value is a valid string, the
 * page builds, and the defect is visible only to someone who looks at it.
 *
 * So the form is refused rather than resolved. Resolving it would mean choosing
 * an output syntax for a field whose renderer is unknown to this build — a
 * markdown link is inert in a Hugo template that prints the value as text, and
 * an `<a>` is unusable in one that escapes it — and would quietly bless an
 * authoring habit that the pack build has no way to honour at all. Frontmatter
 * carries data; a link belongs in prose.
 *
 * Values are read from the *parsed* frontmatter, so a `[[` inside a YAML comment
 * is not a hit, and every hit can be named by the path a reader would look at.
 *
 * @param {unknown} fm - Parsed frontmatter, as `gray-matter` returns it.
 * @returns {Array<{path: string, link: string}>} In reading order; `path` is the
 *   dotted key path of the offending value (`government.summary`, `aliases.1`).
 */
export function frontmatterWikilinks(fm) {
    const hits = [];
    const visit = (value, trail) => {
        if (typeof value === "string") {
            for (const m of value.matchAll(FRONTMATTER_WIKILINK)) {
                hits.push({ path: trail, link: m[0] });
            }
        } else if (Array.isArray(value)) {
            value.forEach((v, i) => visit(v, `${trail}.${i}`));
        } else if (isPlainMap(value)) {
            for (const [k, v] of Object.entries(value)) {
                visit(v, trail ? `${trail}.${k}` : k);
            }
        }
    };
    if (!isPlainMap(fm)) return hits;
    visit(fm, "");
    return hits;
}

/**
 * Whether a value is a YAML mapping rather than a scalar the parser built into
 * an object of its own (a `Date`, which is what an unquoted date becomes).
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isPlainMap(value) {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
    );
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
 * reference and rendered as plain text — until every package's manifest is
 * present, after which any `type-shortcode` address resolving nowhere fails
 * too. Failures are collected in `ctx.errors`.
 *
 * @param {string} body - The markdown body.
 * @param {object} ctx - `{ index, typeAlias, collide, typeCollide, sections,
 *   contentTypes, foreign, manifestsComplete, type, errors, src }`. `foreign`
 *   is the cross-package manifest index (#1446); `manifestsComplete` says
 *   whether every linkable package is accounted for. Together they decide
 *   whether an unresolved address is a typo or a package merely absent.
 * @returns {string} The body with wikilinks rewritten.
 */
export function resolveKbWikilinks(body, ctx) {
    // Code is verbatim: a `[[…]]` inside a code fence, an indented block or an
    // inline span is source text, not a link (#1505).
    return replaceOutsideCode(body, /\[\[([^\]]+)\]\]/g, (_m, rawInner) => {
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
        // The canonical separator (#1398) has to be resolved, not merely
        // recognised. Without this the form resolved only when source and
        // target shared a type, by way of the seeded alias below; every
        // *cross-type* link written in it silently lost its href.
        const hyphenKey = qualifiedKey(target, ctx.contentTypes);
        const hit =
            (typeKey ? ctx.typeAlias.get(typeKey) : undefined) ??
            ctx.index.get(key) ??
            (hyphenKey ? ctx.index.get(hyphenKey) : undefined) ??
            // A manifest entry carries the same `{ url, name }` shape as a
            // local one (#1446), so a cross-package hit needs no special case
            // below. Local wins: a live build is authoritative and a vendored
            // manifest can only be staler.
            (hyphenKey ? ctx.foreign?.get(hyphenKey) : undefined);
        if (hit) {
            // With no explicit label, a *qualified* target has no prose to show
            // (a shortcode is not display text), so fall back to the document's
            // name. A bare `[[Text]]` is already the prose the author wrote —
            // substituting the canonical name there would rewrite the sentence
            // ("worsens the [[Shock State]]" must not render as "Shock").
            // Both separators qualify: `type-shortcode` is the canonical form
            // (#1398), and a hyphen inside a note *name* ("Grukar-ahk") is not
            // one, which is why the rule is the packs' own (#1409).
            const text =
                display ??
                (isAddress(target, ctx.contentTypes) ? hit.name : target);
            // A pack-only package publishes Foundry addresses and no pages
            // (#1516), so its entries carry no `path` and resolve to no URL.
            // The address is real — this is not a typo and must not fail the
            // build — but there is nothing on the web to point at, so the
            // reader gets the text and no href. Emitting the href anyway is
            // what the manifest exists to prevent: `[Name](undefined)` renders
            // as a link and goes nowhere.
            if (!hit.url) return text;
            return `[${text}](${anchor ? `${hit.url}#${slugify(anchor)}` : hit.url})`;
        }

        const slash = target.indexOf("/");
        const prefix =
            slash === -1 ? null : target.slice(0, slash).toLowerCase();
        // Deliberately *not* extended to the hyphen form, which is also how a
        // note addresses content in a package this build does not publish
        // (`Rules/Bestiary.md` → `being-grkrahk`, a real note in the `thalorna`
        // package). Nothing in the syntax separates that from a typo,
        // so failing here would break the build on correct content.
        //
        // A dead address is caught instead by `lint:content-links` (#1414),
        // which holds the reviewed list of cross-package exceptions — and which,
        // unlike this build, runs as part of `npm run lint` on every change.
        const badQualified =
            prefix !== null &&
            (ctx.sections.has(prefix) || ctx.contentTypes.has(prefix));
        // The hyphen form is the canonical address (#1398) and is what the
        // authored content writes. It could not be guarded while some packages
        // were invisible here: `Rules/Bestiary.md` addresses `being-grkrahk`,
        // a real note in the `thalorna` package, and nothing in the syntax
        // separated that legitimate cross-package reference from a typo — so
        // treating the form as definitely-local would have failed the build on
        // correct content.
        //
        // The link manifest settles it (#1446). Once every linkable package is
        // accounted for — built here or vendored as a manifest — an address
        // resolving in none of them is a typo and nothing else. Until then
        // `manifestsComplete` is false and the form stays unguarded, so the
        // check returns exactly when it becomes decidable rather than on a date
        // someone has to remember.
        const badAddress = ctx.manifestsComplete === true && hyphenKey !== null;

        if ((typeKey && ctx.typeCollide.has(typeKey)) || ctx.collide.has(key)) {
            ctx.errors.push({ file: ctx.src, target, reason: "ambiguous" });
        } else if (badQualified || badAddress) {
            ctx.errors.push({
                file: ctx.src,
                target,
                reason: "broken type/shortcode",
            });
        }
        return display ?? target;
    });
}
