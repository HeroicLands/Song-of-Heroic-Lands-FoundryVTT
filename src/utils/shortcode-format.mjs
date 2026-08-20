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
 * The shape rule for `shortcode` — the system's identity key must be strictly
 * ASCII-alphanumeric (issue #1397). This is the single source of truth for that
 * rule, shared by the runtime create/update guard (`resolveShortcodeKey` in
 * `src/utils/helpers.ts`), the world migration that repairs legacy keys, and
 * the build-time `lint:packs` guard.
 *
 * Like `@heroiclands/content-build/sohl/default-item-art`, this module is
 * deliberately **plain ESM** — no
 * TypeScript, no `@src` aliases, no Foundry — because the pack/lint scripts run
 * under bare `node` (no bundler to resolve aliases or strip types) while the
 * bundled runtime imports the very same file. One copy of the pattern is what
 * keeps the build-time and runtime rules from drifting apart.
 *
 * **Why alphanumeric-only.** `shortcode` is a logical identity referenced from
 * saved world data, and it is also half of the `type-shortcode` address that
 * content wikilinks and knowledgebase pages parse — a parse that depends on the
 * separating hyphen being the only hyphen in the string. Any other punctuation
 * likewise has to survive URLs, YAML frontmatter, and expression source
 * unescaped. Case is *not* constrained: 418 authored shortcodes are mixed-case
 * and collide with nothing, so tightening that would be a separate decision.
 *
 * @module shortcode-format
 */

/** The shape every `shortcode` must match: ASCII letters and digits only. */
export const SHORTCODE_PATTERN = /^[A-Za-z0-9]+$/;

/**
 * Whether a value is a well-formed shortcode: a non-empty string of ASCII
 * letters and digits.
 *
 * A blank value is **not** valid here. Blank is handled separately by the
 * runtime resolver (it derives a key from the document name), so this predicate
 * answers only "is this an acceptable key", never "is this key present".
 *
 * @param {unknown} value - the candidate shortcode.
 * @returns {boolean} `true` when it matches {@link SHORTCODE_PATTERN}.
 */
export function isValidShortcode(value) {
    return typeof value === "string" && SHORTCODE_PATTERN.test(value);
}

/**
 * Reduce a shortcode to the characters the rule allows, **preserving case** —
 * `B&CFl` → `BCFl`, `self-pro` → `selfpro`.
 *
 * This is the repair used where rejecting is not an option (the world migration,
 * and a create that opted into `shortcodeDedupe`). It differs from
 * `slugifyShortcode` (`src/utils/helpers.ts`), which lowercases as well because
 * it derives a *new* key from a display name; here an existing key is being
 * kept as recognizable as possible.
 *
 * @param {unknown} value - the shortcode to repair.
 * @returns {string} the alphanumeric residue (`""` when nothing survives).
 */
export function sanitizeShortcode(value) {
    return typeof value === "string" ? value.replace(/[^A-Za-z0-9]+/g, "") : "";
}
