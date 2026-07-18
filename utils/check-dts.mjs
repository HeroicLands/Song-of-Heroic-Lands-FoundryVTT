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
 * CI guard: type-check the project's own declaration files with `skipLibCheck`
 * OFF, and fail on any error in a file we own.
 *
 * `tsconfig.json` keeps `skipLibCheck: true` globally — deliberately — because
 * third-party declaration files we don't control (`fvtt-types`, `jsep`) contain
 * type errors that would otherwise break every build. But that flag also hides
 * errors in OUR own `.d.ts` files: `types/sohl-globals.d.ts` once rotted into a
 * set of imports from a non-existent source layout, which silently degraded the
 * `sohl` global and every SoHL document type to `any` without failing the build.
 *
 * This guard runs a one-off `tsc --skipLibCheck false` and reports only the
 * errors outside `node_modules/` — catching regressions in our declaration
 * files while ignoring the library noise that `skipLibCheck` exists to suppress.
 *
 * Usage:
 *   npm run lint:dts        // node utils/check-dts.mjs
 *   node utils/check-dts.mjs
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const tsc = resolve("node_modules", "typescript", "bin", "tsc");

const { stdout = "", stderr = "" } = spawnSync(
    process.execPath,
    [tsc, "-p", "tsconfig.json", "--skipLibCheck", "false", "--noEmit"],
    { encoding: "utf8" },
);

// tsc always exits non-zero here (the ignored library errors), so parse output
// rather than trusting the exit code.
const projectErrors = `${stdout}${stderr}`
    .split("\n")
    .filter(
        (line) => /error TS\d+/.test(line) && !line.includes("node_modules"),
    );

if (projectErrors.length > 0) {
    console.error(
        "Type errors in project files with skipLibCheck OFF " +
            "(hidden by the normal build — fix them in the offending file):\n",
    );
    for (const line of projectErrors) console.error(`  ${line}`);
    console.error(`\n${projectErrors.length} error(s).`);
    process.exit(1);
}

console.log(
    "✅ Project declaration files type-check cleanly with skipLibCheck off " +
        "(library errors ignored).",
);
