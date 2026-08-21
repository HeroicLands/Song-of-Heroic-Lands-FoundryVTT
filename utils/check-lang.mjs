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
 * CI guard: every localization file this package ships is one Foundry can
 * actually load.
 *
 * **The rules live in `@heroiclands/package-build`**, not here. Every
 * HeroicLands package ships `lang/*.json` and declares it under `languages` in
 * its manifest, so every package can break it the same ways — and each way
 * fails silently, which is precisely when a shared rule beats a shared
 * convention. `sohl-kethira-basic` ships a `lang/en.json` that has never
 * loaded; nothing told it so, because the guard was here rather than in
 * something it consumes.
 *
 * What stays here is this repository's half: finding the files and printing the
 * findings. See {@link https://www.heroiclands.org/sohl/kb/dev-docs/reference/localization-keys/}
 * for the key-naming standard the segment rule freezes in place.
 *
 * Scans every `lang/*.json`; writes nothing. Prints each finding as
 * `file:line:column: severity: message` and exits non-zero on any.
 *
 * Usage:
 *   npm run lint:lang         // node utils/check-lang.mjs
 *   node utils/check-lang.mjs // direct invocation (no args)
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";

import { validateLangSource } from "@heroiclands/package-build/lang";

import { reportDiagnostic } from "./lint-diagnostics.mjs";

const files = globSync("lang/*.json");
if (!files.length) {
    console.error("check-lang: no lang/*.json files found.");
    process.exit(1);
}

let total = 0;
for (const file of files.sort()) {
    for (const finding of validateLangSource(readFileSync(file, "utf8"))) {
        total++;
        reportDiagnostic({ file, ...finding });
    }
}

if (total) {
    console.error(
        "\nA dotted-prefix collision makes foundry.utils.expandObject throw, and " +
            "Foundry\nthen drops the whole translation file (issue #636). Make each " +
            "key a leaf OR a\nbranch, never both. See kb/dev-docs/reference/" +
            "localization-keys.md for the\nplaceholder and key-segment rules.\n",
    );
    process.exit(1);
}
console.log(
    `check-lang: ${files.length} localization file(s) are expandObject-safe.`,
);
