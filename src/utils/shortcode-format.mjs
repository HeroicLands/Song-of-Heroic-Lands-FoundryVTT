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

/**
 * Letters that carry no combining mark to strip, and so must be spelled out.
 *
 * `String.prototype.normalize("NFD")` splits an accented letter into its base
 * plus a combining mark, which makes `û` → `u` and `ó` → `o` free. It does
 * nothing for a letter that is its own character rather than a decorated one —
 * eth, thorn, the ligatures — so those are named here.
 *
 * **This is deliberately not `unidecode`.** The transliteration would be
 * identical, but `unidecode` is CommonJS with 185 static `require()`s of its
 * data tables, none of which a bundler can drop: importing it would add ~740 KB
 * to a ~2.6 MB shipped bundle to spell a handful of letters. NFD plus this map
 * agrees with it on every case this content uses.
 *
 * @type {Readonly<Record<string, string>>}
 */
const ASCII_LETTERS = Object.freeze({
    æ: "ae",
    Æ: "AE",
    œ: "oe",
    Œ: "OE",
    ß: "ss",
    þ: "th",
    Þ: "TH",
    ð: "d",
    Ð: "D",
    ø: "o",
    Ø: "O",
    đ: "d",
    Đ: "D",
    ł: "l",
    Ł: "L",
    ħ: "h",
    Ħ: "H",
    ŋ: "ng",
    Ŋ: "NG",
    ĳ: "ij",
    Ĳ: "IJ",
    ſ: "s",
});

/** Combining marks, which NFD separates from the letter they decorate. */
const COMBINING = /[\u0300-\u036F]/g;

/**
 * Carry a name into ASCII, spelling letters out rather than dropping them.
 *
 * Dropping is what the build's slug rules used to do, and it turned `Kûrbúl`
 * into `k-rb-l`; here it would turn `Æthelred` into `thelred`, losing the first
 * letter of the name.
 *
 * @param {unknown} text - Any name.
 * @returns {string} The same name, in ASCII.
 */
export function toAsciiLetters(text) {
    return (
        String(text ?? "")
            // Matched positively rather than as "not ASCII": negating the ASCII
            // range would put a NUL in the pattern, which `no-control-regex`
            // rightly refuses.
            .replace(/[\u0080-\uFFFF]/g, (ch) => ASCII_LETTERS[ch] ?? ch)
            .normalize("NFD")
            .replace(COMBINING, "")
    );
}

/**
 * The length past which a suggested shortcode is worth reducing.
 *
 * A guideline rather than a limit: nothing rejects a longer code, and the
 * reduction below stops as soon as it has done what it can.
 */
export const SHORTCODE_TARGET_LENGTH = 10;

/** Vowels, for the reduction below. `y` is left alone — it often carries one. */
const VOWEL = /[aeiou]/;

/** The run of vowels a word opens with, which is never eligible for removal. */
const LEADING_VOWELS = /^[aeiou]+/;

/**
 * Shorten a name towards the target length by removing vowels, one at a time,
 * from the end.
 *
 * **One vowel per pass, end-most first, re-measuring after each.** That is what
 * keeps a name only slightly too long from being stripped bare: `roundshield`
 * is eleven characters and loses exactly one vowel to become `roundshild`,
 * where removing every eligible vowel at once would have left `rndshld`. The
 * shortest readable form is the goal, not the shortest form.
 *
 * **A word's opening vowels are never eligible.** A reader recovers a name from
 * the sound it starts with, so `aeldred` reduces to `aeldrd` and never to
 * `ldrd`. The protection is per *word*, applied before the words are joined, so
 * each component of a compound name keeps its own opening.
 *
 * Reduction stops when the result fits, or when no eligible vowel is left —
 * whichever comes first. The target is a guideline, so a name that cannot reach
 * it simply stays long; nothing is truncated.
 *
 * @param {readonly string[]} words - Lowercase alphanumeric words, already
 *   abbreviated.
 * @param {number} [target] - The length to shorten towards.
 * @returns {string} The words, joined with nothing.
 */
export function reduceToTarget(words, target = SHORTCODE_TARGET_LENGTH) {
    // Each word keeps the vowels it opens with; everything after that run is
    // fair game.
    const parts = words.map((word) => ({
        text: word,
        keep: (LEADING_VOWELS.exec(word)?.[0] ?? "").length,
    }));

    const joined = () => parts.map((p) => p.text).join("");

    while (joined().length > target) {
        // The end-most eligible vowel: last word first, and within a word its
        // last character first.
        let removed = false;
        for (let w = parts.length - 1; w >= 0 && !removed; w--) {
            const part = parts[w];
            for (let i = part.text.length - 1; i >= part.keep; i--) {
                if (VOWEL.test(part.text[i])) {
                    part.text = part.text.slice(0, i) + part.text.slice(i + 1);
                    removed = true;
                    break;
                }
            }
        }
        // Nothing eligible left: the name stays as long as it is.
        if (!removed) break;
    }

    return joined();
}
