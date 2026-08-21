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
 * A description that is *only* a link is a **pointer**: the item is saying "my
 * description lives there" rather than carrying its own prose.
 *
 * The convention costs nothing to ignore. An item description remains a free
 * HTML field, and anyone can write whatever they like in it; the shorthand only
 * applies when an author deliberately writes a link and nothing else. It exists
 * because the alternative is every actor carrying its own copy of prose that
 * belongs to the compendium item.
 */

/** A raw `@UUID[target]` or `@UUID[target]{Label}` and nothing else. */
const BARE_LINK = /^@UUID\[([^\]]+)\](?:\{[^}]*\})?$/;

/** A single already-enriched content link, `<a data-uuid="target">Label</a>`. */
const ENRICHED_LINK = /^<a\b[^>]*\bdata-uuid="([^"]+)"[^>]*>[^<]*<\/a>$/;

/**
 * Markup that renders as nothing. Removed before asking whether anything but a
 * link remains, so a link survives however the editor happened to wrap it — in a
 * paragraph, a heading, bold, or trailed by empty paragraphs and line breaks.
 *
 * Only blank *content* is removed, never whitespace generally: an enriched
 * link's UUID lives in a tag attribute, and collapsing the spaces between
 * attributes would destroy the tag.
 */
const BLANK_CONTENT = /(<br\s*\/?>|&nbsp;|&#160;)+/gi;

/**
 * The link a description points at, or `null` when it is ordinary prose.
 *
 * A description counts as a pointer only when a link is **all** it contains.
 * Anything else — a following sentence, a second link, a word of preamble — is
 * prose that happens to include a link, and is left exactly as written. A GM's
 * own words are never discarded in favour of the target; someone who wants the
 * target's text inline embeds it deliberately.
 *
 * Pure and Foundry-free: this decides *whether* a description is a pointer, not
 * what the target contains.
 *
 * @param docHtml - The item's stored description.
 * @returns The target UUID, or `null` if the description is not a pointer.
 */
export function descriptionLinkTarget(
    docHtml: string | null | undefined,
): string | null {
    if (!docHtml) return null;

    // An enriched link is tested before tags are stripped, since its UUID lives
    // in an attribute rather than in the text.
    const enriched = tidy(docHtml).match(ENRICHED_LINK);
    if (enriched) return enriched[1];

    const bare = tidy(withoutTags(docHtml)).match(BARE_LINK);
    return bare ? bare[1] : null;
}

/**
 * Remove every tag, leaving only the text a reader would see.
 *
 * @param html - The description markup to strip.
 * @returns The same content with every tag removed.
 */
function withoutTags(html: string): string {
    return html.replace(/<[^>]*>/g, "");
}

/**
 * Drop the markup that renders as nothing, then trim what is left.
 *
 * @param html - The description markup to tidy.
 * @returns The same content without {@link BLANK_CONTENT}, trimmed.
 */
function tidy(html: string): string {
    return html.replace(BLANK_CONTENT, "").trim();
}
