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
 * Is there any content to compile?
 *
 * The pack build's worst failure is not an error but a **success on nothing**: a
 * content tree that is absent or empty compiles zero documents, reports no
 * error, and ships compendiums that are simply empty. Nothing downstream
 * notices — the LevelDB packs are written, the deploy mirrors them, and the
 * defect surfaces as "my compendiums are blank" long after the build went green.
 *
 * `assets/content/` is this repository's own source (#1445), but an empty or
 * partial tree is still possible — a bad checkout, or a sparse clone. This
 * counts what is actually there so the build can refuse.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Count the Markdown notes below a content tree.
 *
 * Only notes count. The per-pack folder manifests are not content, so a tree
 * holding nothing but manifests counts zero — which is correct, because it
 * compiles zero documents. Dot directories are skipped so stale editor caches
 * cannot make an empty tree look populated.
 *
 * @param {string} root - Absolute path to the content tree.
 * @returns {number} The number of `.md` notes, or 0 when the tree is absent.
 */
export function countContentNotes(root) {
    if (!fs.existsSync(root)) return 0;

    let count = 0;
    /** @param {string} dir */
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith(".")) continue;
            if (entry.isDirectory()) walk(path.join(dir, entry.name));
            else if (entry.isFile() && entry.name.endsWith(".md")) count += 1;
        }
    };
    walk(root);
    return count;
}
