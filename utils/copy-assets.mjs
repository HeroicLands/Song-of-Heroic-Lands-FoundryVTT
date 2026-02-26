/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

function copyFolder(src, dest) {
    mkdirSync(dest, { recursive: true });
    for (const file of readdirSync(src)) {
        const srcPath = join(src, file);
        const destPath = join(dest, file);
        if (statSync(srcPath).isDirectory()) copyFolder(srcPath, destPath);
        else {
            mkdirSync(dirname(destPath), { recursive: true });
            copyFileSync(srcPath, destPath);
        }
    }
}

function copyFile(src, dest) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
}

// Copy custom documentation markdown to doc directory
copyFolder("assets/docs", "build/docs");

// Copy static assets to build/stage
copyFolder("assets/audio", "build/stage/assets/audio");
copyFolder("assets/icons", "build/stage/assets/icons");
copyFolder("assets/silhouette", "build/stage/assets/silhouette");
copyFolder("assets/fonts", "build/stage/assets/fonts");
copyFolder("assets/ui", "build/stage/assets/ui");
copyFolder("lang", "build/stage/lang");
copyFolder("templates", "build/stage/templates");
copyFile("LICENSE.md", "build/stage/LICENSE.md");
copyFile("README.md", "build/stage/README.md");

console.log("✅ Static assets copied.");
