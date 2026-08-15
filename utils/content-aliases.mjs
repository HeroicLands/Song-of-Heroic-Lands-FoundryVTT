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
 * The rule that every content note carries its own address as an alias.
 *
 * Notes address one another as `[[type-shortcode|Text]]` (#1398). For that form
 * to resolve **in Obsidian**, where the content is authored, the string
 * `type-shortcode` has to physically exist in the target note's frontmatter
 * `aliases` — Obsidian resolves a wikilink against the files on disk and knows
 * nothing of `(type, shortcode)`. A build-time derivation cannot satisfy it: the
 * editor is not running the build.
 *
 * So the alias is **hand-authored**, and this module is the rule that verifies
 * it. Nothing here writes: a check reports, an author fixes. That is the same
 * courtesy the system extends to a player's characters, applied to the author's
 * own material.
 *
 * **Why *exactly one* address alias, rather than merely "the right one is
 * present".** When a shortcode changes and the previous alias is left behind,
 * every old inbound `[[type-oldcode|…]]` keeps resolving to the correct note.
 * Nothing degrades, nothing is reported, and the tree carries two live addresses
 * for one document — until the retired code is reused years later and the old
 * links silently land on the wrong note. Counting is what catches that; presence
 * never could.
 *
 * Extracted from `check-content-aliases.mjs` so the rule can be unit tested;
 * that script runs its work at import time and exports nothing.
 */

/**
 * Whether an alias is an **address** — a string a reader could write between
 * `[[…]]` and have resolved as `type-shortcode` rather than as a name.
 *
 * The test is the resolver's own (see `readQualifier` in
 * `utils/packs/wikilinks.mjs`): split at the **first** hyphen, and treat it as a
 * qualifier **only when what precedes it is a known type**. Note names are
 * hyphenated too — `Grukar-ahk` is an alias, not an address — which is exactly
 * why the mere presence of a hyphen cannot be the rule.
 *
 * Two forms are deliberately *not* addresses:
 *
 * - **`type/shortcode`**, the legacy separator. Obsidian reads `/` as a path, so
 *   a slash-qualified string could never be the alias that makes an address
 *   resolve in the editor — which is the entire reason the alias exists.
 * - **`doc<type>-shortcode`**, the virtual qualifier that addresses an item's
 *   *write-up*. That is a second document compiled from the same note, not this
 *   note's identity, so it is free to appear as an ordinary alias.
 *
 * @param {unknown} alias - A candidate alias.
 * @param {Set<string>} types - Every type the content tree contains, lowercase.
 * @returns {boolean} `true` when the alias reads as `type-shortcode`.
 */
export function isAddressAlias(alias, types) {
    if (typeof alias !== "string") return false;
    const hyphen = alias.indexOf("-");
    // `> 0` rather than `!== -1`: a leading hyphen leaves no type before it.
    if (hyphen <= 0 || hyphen === alias.length - 1) return false;
    return types.has(alias.slice(0, hyphen).toLowerCase());
}

/**
 * Audits one note's aliases against the rule.
 *
 * The shortcode's own **character set is not checked here** — that is
 * `lint:packs`' rule (#1397), and asserting it in two places would report the
 * same note twice for one defect while coupling two independent invariants. This
 * check owns a narrower question: does the note carry exactly one address-shaped
 * alias, and is it this note's address? Composed with the charset rule at its
 * source, the pair gives the guarantee in full.
 *
 * @param {{type: string, shortcode: unknown, aliases: unknown}} note - The
 *   note's frontmatter, as authored.
 * @param {Set<string>} types - Every type the content tree contains, lowercase.
 * @returns {{ok: true, skipped?: "no-shortcode"} |
 *   {ok: false, reason: "missing" | "duplicate" | "mismatch",
 *    expected: string, found: string[]}}
 */
export function auditNoteAliases(note, types) {
    const shortcode = typeof note.shortcode === "string" ? note.shortcode : "";
    // A note with no shortcode has no address to carry, and cannot be a link
    // target at all. `lint:packs` skips it for the same reason.
    if (!shortcode) return { ok: true, skipped: "no-shortcode" };

    const expected = `${note.type}-${shortcode}`;
    const aliases = Array.isArray(note.aliases) ? note.aliases : [];
    const found = aliases.filter((a) => isAddressAlias(a, types));

    if (found.length === 0)
        return { ok: false, reason: "missing", expected, found };
    if (found.length > 1)
        return { ok: false, reason: "duplicate", expected, found };
    // Exact, not case-insensitive: Obsidian would resolve a case-drifted alias
    // happily, so nothing else would ever notice it had stopped matching the
    // address the note actually declares.
    if (found[0] !== expected)
        return { ok: false, reason: "mismatch", expected, found };
    return { ok: true };
}
