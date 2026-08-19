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
 * The **forward sweep**: run the whole e2e suite against a Foundry build other
 * than the one this repository pins.
 *
 * Routine runs go against the pinned build, which is the system manifest's
 * `compatibility.minimum` — the oldest Foundry the system claims to support, and
 * therefore the claim the suite exists to defend. That leaves the other
 * direction untested: a new Foundry release can break the system and nothing
 * would notice until a user did. So, roughly weekly and always before shipping,
 * the full suite is swept against the newest release.
 *
 * The sweep is exactly `FOUNDRYVTT_TEST_VERSION=<build> npm run e2e:full`, and
 * this script is that line with the traps removed:
 *
 * - **It must be `e2e:full`, not `e2e:fast`.** The seeded world is stamped with
 *   the build that created it, and Foundry refuses to auto-launch a world
 *   stamped by a different one (`The requested World … is not available to
 *   auto-launch`). Changing version therefore requires a reseed, which only the
 *   from-scratch path does.
 * - **It names one exact build, and has no default.** The product of a sweep is
 *   a citable result — "the full suite passed on <build>" — so there is nothing
 *   sensible to guess. Hardcoding "the newest release" would rot on Foundry's
 *   next release day and quietly turn the sweep back into a second pinned build.
 *
 * Usage:
 *   node utils/e2e-sweep.mjs <version>
 *
 *   npm run e2e:sweep -- 14.367     # sweep against the newest release
 *
 * A green sweep is what licenses moving `compatibility.verified` to that build.
 * A red one is the early warning it exists to produce — file it, don't silence
 * it. See
 * {@link https://www.heroiclands.org/sohl/kb/dev-docs/how-to/testing/ Testing}.
 *
 * Exits non-zero on a missing or malformed version, or with the suite's own exit
 * code.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * An exact Foundry build: a major and a build number, nothing else.
 *
 * felddy passes `FOUNDRY_VERSION` through verbatim, so a bare major (`14`) or a
 * tag (`latest`) would resolve to whatever the registry served that week — the
 * very drift the committed pin exists to prevent, reintroduced under a name that
 * looks deliberate.
 */
const EXACT_BUILD = /^\d+\.\d+$/;

/**
 * The build a sweep was asked to run against.
 *
 * @param {string[]} argv - Arguments after the script name.
 * @returns {string} The exact build, trimmed.
 * @throws {Error} When no version was given, or it is not an exact build.
 */
export function resolveSweepVersion(argv) {
    const version = (argv[0] ?? "").trim();
    if (!version) {
        throw new Error(
            "A sweep must name the build it runs against, e.g. " +
                "`npm run e2e:sweep -- 14.367`. There is no default: the point " +
                "of a sweep is a result you can cite, and the newest release is " +
                "not a constant this repository can hold.",
        );
    }
    if (!EXACT_BUILD.test(version)) {
        throw new Error(
            `"${version}" is not an exact Foundry build. Name a major and a ` +
                "build number (e.g. `14.367`) — a bare major or a tag resolves " +
                "to whatever the registry serves that day, so the run would " +
                "name no particular Foundry.",
        );
    }
    return version;
}

/**
 * Run the full e2e suite against the given build.
 *
 * @param {string[]} argv - Arguments after the script name.
 * @returns {number} The suite's exit code.
 */
function main(argv) {
    let version;
    try {
        version = resolveSweepVersion(argv);
    } catch (err) {
        console.error(`e2e:sweep: ${err.message}`);
        return 2;
    }

    console.log(
        `\ne2e sweep → Foundry ${version} (full suite, reseeded world)\n` +
            "This overrides the committed pin for this run only; nothing on " +
            "disk changes.\n",
    );

    // `e2e:full` is `push:test` → seed → run: the reseed is mandatory when the
    // version changes, and `FOUNDRYVTT_TEST_VERSION` is read by
    // `resolveVersion()` in utils/foundry-container.mjs on the way through.
    //
    // Exporting it also beats a `FOUNDRYVTT_TEST_VERSION` in `.env.local`:
    // `dotenv.config()` does not overwrite an already-set variable, so the build
    // named here wins even when the maintainer is sitting on another one.
    const result = spawnSync("npm", ["run", "e2e:full"], {
        stdio: "inherit",
        shell: process.platform === "win32",
        env: { ...process.env, FOUNDRYVTT_TEST_VERSION: version },
    });

    if (result.error) {
        console.error(`e2e:sweep: failed to start the suite: ${result.error}`);
        return 1;
    }
    return result.status ?? 1;
}

// Only sweep when executed directly (`node utils/e2e-sweep.mjs …`), not when a
// test imports `resolveSweepVersion` — importing must never launch the suite.
const invokedDirectly =
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
