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
 * Fail if the committed `docs/reference/type-catalog.md` is out of date with the
 * code. The catalog is generated (from the kind enums, `lang/en.json`, and each
 * Logic class's TSDoc) yet tracked in git because docs link to it; this guard —
 * wired into `npm run lint` — keeps the committed copy current, the same way
 * `check-docs-index.mjs` guards the docs index. Regenerate with
 * `npm run docs:catalog` and commit the result.
 */

import fs from "fs";
import path from "path";
import { buildTypeCatalog } from "./build-type-catalog.mjs";

const OUT = path.resolve("docs/reference/type-catalog.md");
const rel = path.relative(process.cwd(), OUT);

const { md, warnings } = buildTypeCatalog();
for (const w of warnings) console.warn(`⚠️  ${w}`);

const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
if (current !== md) {
    console.error(
        `✗ ${rel} is out of date with the code.\n` +
            `  Run \`npm run docs:catalog\` and commit the regenerated file.`,
    );
    process.exit(1);
}

console.log(`✓ ${rel} is up to date.`);
