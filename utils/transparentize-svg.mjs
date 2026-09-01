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

/*
 * Normalize a Game-Icons.net SVG to "transparent background, black foreground":
 * drop the full-canvas background rect (a lone `d="M0 0h512v512H0z"` path) and
 * force every remaining drawable to `fill="#000"`. Game-Icons ship white-on-black
 * (`<path d="M0 0h512v512H0z"/><path fill="#fff" .../>`); this yields a bare black
 * glyph on transparency — required both for in-document display and so the icon
 * font does not rasterize every glyph as a solid square.
 */

import { parseSync, stringify } from "svgson";

const BG_RECT = "M0 0h512v512H0z";

/** @param {string} svgString  @returns {string} transparentized SVG markup */
export function transparentizeSvg(svgString) {
    const svg = parseSync(svgString);
    svg.children = (svg.children || []).reduce((acc, child) => {
        const entries = Object.entries(child.attributes || {});
        // Drop the background rect (its only attribute is the full-canvas `d`).
        if (entries.length === 1 && entries[0][0] === "d" && entries[0][1] === BG_RECT) {
            return acc;
        }
        child.attributes.fill = "#000";
        acc.push(child);
        return acc;
    }, []);
    return stringify(svg);
}
