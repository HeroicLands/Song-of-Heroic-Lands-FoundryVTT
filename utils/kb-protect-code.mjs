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
 * Shielding code runs from the knowledgebase build's text rewriters.
 *
 * Extracted from `build-kb-content.mjs` for the same reason `kb-wikilinks.mjs`
 * was: that script does its work at import time and exports nothing, so a rule
 * living inside it cannot be unit tested — and this one shipped two silent
 * corruptions before anyone could have written a test that caught them (#1665).
 */

// What counts as code is the pack build's rule, not a second copy of it.
import { codeRegions } from "@heroiclands/content-build/engine/code-fences";

/**
 * Run `transform` over a Markdown body while leaving fenced code blocks and inline
 * code spans untouched — the link rewriters must not fire on `](` or `{@link}`
 * sequences that appear inside code examples (e.g. a `'return this'` exploit
 * snippet, or a `` `{@link Symbol}` `` syntax illustration).
 *
 * Each code run is stashed and replaced with a `\u0000<index>\u0000` sentinel; a
 * NUL never occurs in Markdown source, so the sentinel cannot collide with prose
 * and survives the transforms unchanged before being restored.
 *
 * **Which runs count as code is the pack build's rule, not a second copy of
 * it.** This used to carry its own regex, and it was weaker in two ways that
 * both corrupted `content-links.md` — the one page whose subject *is* the link
 * syntax, so its examples are exactly the input a looser rule mangles (#1665).
 * A single-backtick span was allowed to cross newlines, so one odd backtick
 * paired with another paragraphs away and every span after it paired wrongly:
 * prose was masked as code while real spans were left exposed, which is how
 * that page's `[[Grukar-ahk]]` example silently lost its brackets. And only
 * three-backtick fences were recognised, so a ````-fenced example holding a
 * ```js block — the documented "fences of any length" case (#1505) — leaked
 * its contents.
 *
 * {@link codeRegions} already decides this correctly for the pack compilers,
 * covering indented blocks, tilde fences and fences of any length. Sharing it
 * means the knowledgebase cannot drift from what the packs treat as verbatim,
 * which is the point: one authored note compiles through both.
 */
export function protectCode(body, transform) {
    const src = String(body ?? "");
    const stash = [];
    let masked = "";
    let last = 0;
    for (const region of codeRegions(src)) {
        const sentinel = `\u0000${stash.push(src.slice(region.start, region.end)) - 1}\u0000`;
        masked += src.slice(last, region.start) + sentinel;
        last = region.end;
    }
    masked += src.slice(last);
    return transform(masked).replace(
        /\u0000(\d+)\u0000/g,
        (_m, i) => stash[Number(i)],
    );
}
