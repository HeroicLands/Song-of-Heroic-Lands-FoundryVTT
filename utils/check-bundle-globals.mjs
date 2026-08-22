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
 * CI guard: `system.json` must load `sohl.js` the way Vite built it.
 *
 * **The rule is `@heroiclands/package-build`'s** — every HeroicLands package
 * that ships behavior declares an entry point, and the manifest key it uses
 * decides whether the browser parses that file as an ES module or as a classic
 * script. Under `"scripts"` every top-level declaration becomes a global
 * lexical binding, and one colliding with a non-configurable `window` property
 * throws at parse time, before a single line runs. Shipping `"scripts"` is
 * exactly how v0.8.0 broke; `sohl-thalorna`'s vite config carries a
 * hand-copied paraphrase of the same reasoning, which is the drift this move
 * removes.
 *
 * What stays here is this repository's half: which files to read, and how to
 * report. See {@link https://www.heroiclands.org/sohl/kb/dev-docs/how-to/build-and-deployment/}.
 *
 * Usage:
 *   npm run lint:bundle-globals         // node utils/check-bundle-globals.mjs
 *   node utils/check-bundle-globals.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { checkBundleLoading } from "@heroiclands/package-build/bundle";

import { reportDiagnostic } from "./lint-diagnostics.mjs";

const STAGE = resolve("build/stage");
const ENTRY = "sohl.js";
const BUNDLE = resolve(STAGE, ENTRY);
const MANIFEST = resolve(STAGE, "system.json");

/** How many findings to print before summarising the rest. */
const SHOWN = 25;

for (const path of [MANIFEST, BUNDLE]) {
    if (!existsSync(path)) {
        console.error(
            `❌ ${path} not found. Run 'npm run build:system build:code' before this check.`,
        );
        process.exit(1);
    }
}

const { findings, declaredAs } = checkBundleLoading({
    manifest: JSON.parse(readFileSync(MANIFEST, "utf8")),
    source: readFileSync(BUNDLE, "utf8"),
    entry: ENTRY,
    manifestName: "system.json",
});

if (findings.length) {
    for (const finding of findings.slice(0, SHOWN)) {
        reportDiagnostic({ file: ENTRY, ...finding });
    }
    if (findings.length > SHOWN) {
        console.error(`   … and ${findings.length - SHOWN} more.`);
    }
    console.error(
        `\nFix: list ${ENTRY} under "esmodules" in ` +
            `assets/templates/system.template.json — Vite builds it as an ES ` +
            `module (see 'build.lib.formats' in vite.config.ts), and a module's ` +
            `top-level declarations are module-scoped rather than global.\n`,
    );
    process.exit(1);
}

console.log(
    declaredAs === "esmodules" ?
        `✅ system.json loads ${ENTRY} as an ES module — every top-level\n` +
            `   declaration is module-scoped and cannot collide with a browser global.`
    :   `✅ ${ENTRY} is loaded as a classic script but declares nothing at global scope.`,
);
