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

import * as prettier from "prettier";

/**
 * Format generated file content exactly as Prettier would, so a generator emits
 * a file Prettier never wants to change.
 *
 * Every file this repository generates is written through here, which is what
 * keeps `.prettierignore` down to the files Prettier genuinely cannot format
 * (Handlebars templates, Hugo layouts, binaries, vendored copies) rather than a
 * growing list of generated ones. A generated file that Prettier disagrees with
 * has to be either excluded or reformatted on every run, and both answers rot:
 * the exclusion hides real drift, and the reformatting fights the generator.
 *
 * Note this asks Prettier rather than imitating it. Reproducing its output by
 * hand means reimplementing table-column alignment and emphasis normalisation,
 * and then silently drifting the next time Prettier changes either — the
 * generator would keep claiming compliance while producing something Prettier
 * would rewrite. Calling the formatter is the only version of "compliant by
 * construction" that stays true.
 *
 * @param {string} text - The generated file content.
 * @param {string} filepath - Absolute path the content will be written to. Used
 *   to resolve the right parser and any per-file overrides from the Prettier
 *   config (e.g. markdown's narrower `tabWidth`).
 * @returns {Promise<string>} The content as Prettier would write it.
 */
export async function formatGenerated(text, filepath) {
    const config = await prettier.resolveConfig(filepath);
    return prettier.format(text, { ...config, filepath });
}
