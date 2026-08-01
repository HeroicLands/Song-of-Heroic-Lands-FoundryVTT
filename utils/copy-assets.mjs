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
 * Copies static assets into the build output tree.
 *
 * Recursively copies `assets/docs` into `build/docs`, and the audio/icons/
 * silhouette/fonts/ui asset folders plus `lang` and `templates` into
 * `build/stage/...`; also copies `LICENSE.md` and `README.md` into
 * `build/stage`. Destination directories are created as needed.
 *
 * Usage:
 *   npm run build:assets        // node utils/copy-assets.mjs
 *   node utils/copy-assets.mjs  // direct invocation (no args)
 */

import {
    copyFileSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from "fs";
import { join, dirname } from "path";
import { injectAdaptiveFill } from "./svg-theme.mjs";

/**
 * Recursively copy `src` → `dest`. An optional `transformFile(srcPath)` may
 * return a string to write instead of a raw byte copy (used to theme SVGs);
 * returning `null`/`undefined` falls back to `copyFileSync`.
 */
function copyFolder(src, dest, transformFile) {
    mkdirSync(dest, { recursive: true });
    for (const file of readdirSync(src)) {
        const srcPath = join(src, file);
        const destPath = join(dest, file);
        if (statSync(srcPath).isDirectory()) {
            copyFolder(srcPath, destPath, transformFile);
        } else {
            mkdirSync(dirname(destPath), { recursive: true });
            const transformed = transformFile ? transformFile(srcPath) : null;
            if (transformed != null) writeFileSync(destPath, transformed);
            else copyFileSync(srcPath, destPath);
        }
    }
}

// Make bundled icon SVGs adapt to light/dark mode (#893). Only `.svg` files are
// transformed; everything else copies byte-for-byte.
function themeSvg(srcPath) {
    if (!srcPath.endsWith(".svg")) return null;
    return injectAdaptiveFill(readFileSync(srcPath, "utf8"));
}

function copyFile(src, dest) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
}

// Copy custom documentation markdown to doc directory
copyFolder("assets/docs", "build/docs");

// Copy static assets to build/stage
copyFolder("assets/audio", "build/stage/assets/audio");
copyFolder("assets/icons", "build/stage/assets/icons", themeSvg);
copyFolder("assets/silhouette", "build/stage/assets/silhouette");
copyFolder("assets/fonts", "build/stage/assets/fonts");
copyFolder("assets/ui", "build/stage/assets/ui");
copyFolder("lang", "build/stage/lang");
copyFolder("templates", "build/stage/templates");
copyFile("LICENSE.md", "build/stage/LICENSE.md");
copyFile("README.md", "build/stage/README.md");

console.log("✅ Static assets copied.");
