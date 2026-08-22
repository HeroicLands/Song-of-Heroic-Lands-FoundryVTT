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
 * Make a bundled black-on-transparent icon SVG adapt to light/dark mode.
 *
 * The bundled icons (game-icons and the SoHL `other`/`noun` sets) are solid
 * black silhouettes, which vanish on a dark surface — the dark Being sheet and,
 * critically, the Foundry compendium/directory window, whose `<img>` thumbnails
 * SoHL's `.sohl`-scoped CSS cannot reach. The only styling that travels with an
 * `<img>`-loaded SVG is the SVG itself, so we inject a `<style>` block carrying a
 * `@media (prefers-color-scheme: dark)` fill swap: iron-gall ink in light, cream
 * in dark, matching the Manuscript tokens.
 *
 * Applied at build time only (see {@link transform}, which
 * `package-build assets` calls for every staged file) — the source SVGs stay
 * pristine black-on-transparent so the knowledgebase and website (which render
 * them on light ground) are unaffected.
 *
 * A CSS rule overrides a `fill` presentation attribute, so this recolors shapes
 * that are explicitly black (`fill="#000"` / `black`) or default-black (no `fill`
 * attribute), while leaving intentionally light-colored shapes alone. It does
 * **not** touch a file whose shapes carry an inline `style="fill:…"` (inline
 * style wins over a `<style>` rule) — those are returned unchanged rather than
 * half-recolored.
 */

import { readFileSync } from "node:fs";

// Iron-gall ink (light) / cream (dark) — mirrors `--sohl-color-text-primary` in
// scss/abstracts/_tokens.scss. Kept in sync by hand (a build script can't read
// the SCSS maps); if the token changes, change it here too.
const INK_LIGHT = "#211d16";
const INK_DARK = "#ece3cf";

// Recolor shapes that are explicitly black or default-black (no `fill`), leaving
// any intentionally light shape (e.g. a white highlight in a two-tone badge)
// untouched.
const SELECTOR = [
    '[fill="#000"]',
    '[fill="#000000"]',
    '[fill="black"]',
    "path:not([fill])",
    "rect:not([fill])",
    "circle:not([fill])",
    "ellipse:not([fill])",
    "polygon:not([fill])",
    "polyline:not([fill])",
    "line:not([fill])",
    "g:not([fill])",
].join(",");

const STYLE =
    `<style>${SELECTOR}{fill:${INK_LIGHT}}` +
    `@media(prefers-color-scheme:dark){${SELECTOR}{fill:${INK_DARK}}}</style>`;

// Every `style="…"` / `style='…'` attribute, capturing the declarations.
const STYLE_ATTR = /style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
// A `fill` *declaration* — the property itself, at the start of the attribute
// or after a `;`. Deliberately not `\bfill\b`, which also matches `fill-rule`,
// `fill-opacity` and `paint-order: fill`, none of which set a colour (#1677).
const FILL_DECL = /(?:^|;)\s*fill\s*:/i;

/**
 * Does any element carry a `fill` declaration in its `style` attribute?
 *
 * @param {string} svg - the SVG file contents.
 * @returns {boolean} `true` when at least one inline `fill:` is present.
 */
function hasInlineFill(svg) {
    for (const [, dq, sq] of svg.matchAll(STYLE_ATTR)) {
        if (FILL_DECL.test(dq ?? sq ?? "")) return true;
    }
    return false;
}

/**
 * Inject the adaptive-fill `<style>` into an SVG source string.
 *
 * @param {string} svg - the SVG file contents.
 * @returns {string} the themed SVG, or the input unchanged when it is already
 *   themed, has no `<svg>` tag, or carries inline `fill` styles.
 */
export function injectAdaptiveFill(svg) {
    if (typeof svg !== "string") return svg;
    // Already themed (idempotent) — our media query, or the author's own.
    if (svg.includes("prefers-color-scheme")) return svg;
    // Inline fill styles win over a <style> rule, so we can't reliably recolor
    // such a file — leave it rather than produce a half-recolored icon.
    if (hasInlineFill(svg)) return svg;
    const open = svg.match(/<svg\b[^>]*>/i);
    if (!open) return svg;
    const at = open.index + open[0].length;
    return svg.slice(0, at) + STYLE + svg.slice(at);
}

/**
 * The staging hook `package-build assets` calls for every file it copies.
 *
 * Returns replacement text for an SVG, and `null` for anything else — which is
 * the CLI's signal to copy the file through untouched. It exists so that the
 * *rule* (which files, and what to do to them) stays here, in the repository
 * that owns the icons, while the copying stays in the shared toolchain.
 *
 * @param {string} sourcePath - Absolute path of the file being staged.
 * @returns {string|null} The rewritten SVG, or `null` to copy verbatim.
 */
export function transform(sourcePath) {
    if (!sourcePath.endsWith(".svg")) return null;
    return injectAdaptiveFill(readFileSync(sourcePath, "utf8"));
}
