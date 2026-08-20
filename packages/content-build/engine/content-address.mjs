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
 * Where a content note publishes on the web.
 *
 * One rule, in one place, because two builds need the same answer: the
 * knowledgebase build renders the page, and the link manifest records the
 * address other packages link to. Stating it twice is how a manifest comes to
 * assert a URL that resolves at build time and 404s for the reader.
 */

import { contentSlug } from "./content-slug.mjs";

/** The knowledgebase's mount within this package's site (#1470). */
export const KB_PREFIX = "kb/";

/**
 * The URL section a note routes to.
 *
 * A `doc` is narrative content whose only identity is its subtype label, so it
 * routes by `category`; every other type names its own section.
 *
 * @param {object} fm - Parsed frontmatter.
 * @returns {string|undefined} The section, or `undefined` when the note has
 *   none — a `doc` with no category has no address and is not published.
 */
export function sectionOf(fm) {
    return fm.type === "doc" ? fm.category : fm.type;
}

/**
 * A note's address below the knowledgebase mount, e.g. `affliction/aconite/`.
 *
 * A `README.md` **is** its section's landing page rather than a page within it,
 * so it addresses the section itself and has no slug of its own.
 *
 * @param {object} fm - Parsed frontmatter.
 * @param {string} name - The note's display name; the slug derives from it
 *   (#1278), never from the shortcode, which is identity rather than
 *   presentation.
 * @param {boolean} isReadme - Whether the file is a `README.md`.
 * @returns {string} The section-relative address, with a trailing slash.
 * @throws {Error} When the name yields no usable slug.
 */
export function contentAddress(fm, name, isReadme) {
    const sec = sectionOf(fm);
    return isReadme ? `${sec}/` : `${sec}/${contentSlug(name)}/`;
}
