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

/**
 * Pin `api.heroiclands.org/latest` links to the current version in the GENERATED
 * documentation output.
 *
 * The doc sources keep `…/latest/` as a stable, maintainable placeholder; this
 * step runs after the TypeDoc build and rewrites every `api.heroiclands.org/latest`
 * occurrence in the generated site to `api.heroiclands.org/v<version>` (from
 * `package.json`). Because the published docs are versioned per ref
 * (`/v0.7.0/`, `/main/`, …; see docs/contributing/api-docs-hosting.md), this makes
 * each generated page link to the matching versioned docs instead of always
 * following `/latest`.
 *
 * Operates only on the build output — source files are never modified — so it is
 * idempotent and safe to run on every docs build. Run by `npm run docs` and by the
 * deploy workflow after `npm run docs:html`.
 */

import fs from "fs";
import { globSync } from "glob";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

// No trailing slash: matches both `…/latest/documents/…` and a bare `…/latest`.
const NEEDLE = "api.heroiclands.org/latest";
const REPLACEMENT = `api.heroiclands.org/v${version}`;

const outDir = process.env.SOHL_DOCS_OUT || "build/stage/docs";

if (!fs.existsSync(outDir)) {
    console.warn(
        `⚠️  ${outDir} not found — run the docs build first. Skipping version pin.`,
    );
    process.exit(0);
}

const files = globSync(`${outDir}/**/*.{html,js,md,json,yml,yaml,txt,css}`, {
    nodir: true,
});

let fileCount = 0;
let hitCount = 0;
for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    if (!before.includes(NEEDLE)) continue;
    hitCount += before.split(NEEDLE).length - 1;
    fs.writeFileSync(file, before.split(NEEDLE).join(REPLACEMENT));
    fileCount++;
}

console.log(
    `✅ Pinned ${hitCount} "${NEEDLE}" reference(s) to "v${version}" across ` +
        `${fileCount} file(s) in ${outDir}.`,
);
