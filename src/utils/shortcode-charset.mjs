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
 * The character set a `shortcode` may use: ASCII letters and digits, nothing
 * else (#1397).
 *
 * `shortcode` is an **identifier**, not prose. With `type` it forms the system's
 * logical identity, and that key is compared, embedded in wikilinks, and read by
 * three separate consumers — the compendium packs, the knowledgebase build, and
 * Obsidian, where the content is authored. Every non-alphanumeric character
 * costs something in at least one of them:
 *
 * - **A hyphen breaks addressing.** Notes are addressed `[[type-shortcode]]`
 *   (#1398) and the parse splits at the *first* hyphen, so `trauma-self-pro` is
 *   only readable as `trauma` + `self-pro` by accident of the type being known.
 *   A shortcode with its own hyphen makes the address ambiguous to look at.
 * - **A slash reads as a path**, both in the legacy qualifier form and to
 *   Obsidian.
 * - **Punctuation and spaces** end up in an alias that has to be typed exactly
 *   (`weapongear-B&CFl`), and `&` is markup in several of the places these keys
 *   are rendered.
 *
 * This module is a **framework-free `.mjs` deliberately**, the same seam as
 * `default-item-art.mjs`: the rule has to hold at runtime (the create/update
 * guard, in TypeScript) *and* at build time (`lint:packs`, in a plain-ESM build
 * script), and stating it twice is how the two drift apart.
 *
 * Case is **not** settled here: `^[A-Za-z0-9]+$` admits both, and 418 authored
 * shortcodes are mixed case. Tightening to lowercase would be a consistency
 * decision costing 418 renames and a world migration, and belongs to its own
 * issue.
 *
 * @module
 */

/**
 * The shortcode character-set rule: one or more ASCII alphanumerics, anchored.
 *
 * Deliberately **not** a `/g` regex: `RegExp.prototype.test` on a global regex
 * advances `lastIndex` and so alternates between `true` and `false` for the same
 * input, which in a validation loop passes every other document.
 *
 * @type {RegExp}
 */
export const SHORTCODE_PATTERN = /^[A-Za-z0-9]+$/;

/**
 * Whether a value is a usable `shortcode`.
 *
 * @param {unknown} code - The candidate shortcode.
 * @returns {boolean} `true` when it is a non-empty ASCII-alphanumeric string.
 */
export function isValidShortcode(code) {
    return typeof code === "string" && SHORTCODE_PATTERN.test(code);
}
