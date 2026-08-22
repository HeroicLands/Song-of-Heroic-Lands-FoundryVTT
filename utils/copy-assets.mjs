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
 * Copy this system's static assets into the build stage.
 *
 * The copying is `@heroiclands/package-build`'s — every HeroicLands package
 * stages a list of paths the same way, and it refuses to start if any of them
 * is missing rather than shipping a package that silently lacks its
 * localization or its templates. What is written here is only *this* package's
 * list, and the one transform it applies.
 *
 * Usage:
 *   npm run build:assets        // node utils/copy-assets.mjs
 *   node utils/copy-assets.mjs  // direct invocation (no args)
 */

import { readFileSync } from "fs";

import { stageAssets } from "@heroiclands/package-build/stage";

import { injectAdaptiveFill } from "./svg-theme.mjs";

/**
 * Everything this system ships, as `[source, destination]` pairs.
 *
 * The compendium packs are not listed: `build:compiledb` compiles them into
 * `build/stage/packs` directly from `assets/content`. Neither is `system.json`,
 * which `build:system` generates.
 */
const ASSETS = [
    ["assets/audio", "build/stage/assets/audio"],
    ["assets/icons", "build/stage/assets/icons"],
    ["assets/silhouette", "build/stage/assets/silhouette"],
    ["assets/fonts", "build/stage/assets/fonts"],
    ["assets/ui", "build/stage/assets/ui"],
    ["lang", "build/stage/lang"],
    ["templates", "build/stage/templates"],
    ["LICENSE.md", "build/stage/LICENSE.md"],
    ["README.md", "build/stage/README.md"],
];

/**
 * Make bundled icon SVGs adapt to light and dark mode as they are staged
 * (#893).
 *
 * Applied at build time only, so the source SVGs stay pristine
 * black-on-transparent for the knowledgebase and the website, which render them
 * on light ground. Everything that is not an `.svg` copies byte-for-byte.
 *
 * @param {string} sourcePath - The file being staged.
 * @returns {string|null} The themed SVG, or `null` to copy the bytes.
 */
function themeSvg(sourcePath) {
    if (!sourcePath.endsWith(".svg")) return null;
    return injectAdaptiveFill(readFileSync(sourcePath, "utf8"));
}

const { entries, files } = stageAssets(ASSETS, { transform: themeSvg });

console.log(`✅ Static assets copied (${entries} entries, ${files} files).`);
