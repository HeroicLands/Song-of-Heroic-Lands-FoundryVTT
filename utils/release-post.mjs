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
 * The two things that happen *after* a release is cut, and that only this
 * repository does.
 *
 * Every HeroicLands Foundry package now releases through one shared workflow
 * (HeroicLands/.github#12), which knows how to version, build, package and cut
 * the Release — and deliberately knows nothing about what any one package does
 * afterwards. This script is that seam: the shared workflow runs
 * `npm run release:post` once the Release exists, with `GH_TOKEN` and
 * `RELEASE_TAG` in the environment, and takes no interest in what it contains.
 *
 * It runs **after** the Release, so nothing here can be the reason a release
 * was not cut.
 *
 * The two steps have deliberately different failure behaviour, which is the
 * whole reason this is a script rather than two workflow steps. The workflow it
 * replaces marked the npm publish `continue-on-error: true` — but that
 * attribute is per-step and blunt: it swallows *everything* the step does. A
 * script can say which half is best-effort and which is not.
 *
 *   1. **Republish /sohl/ — required.** A published release moves the API half
 *      of the site, which documents the newest release tag rather than `main`.
 *      A failure here means the site still describes the previous release, so
 *      it fails the job.
 *
 *   2. **Publish @heroiclands/sohl-types — best effort.** Foundry installs from
 *      the Release's `system.zip`, never from npm, so a registry failure must
 *      not mark a successful release as failed. It is reported as a workflow
 *      error annotation (loud, visible in the run summary) without failing.
 *
 * The publish is idempotent: a version already on the registry is skipped, so
 * re-running the workflow for an existing release republishes nothing.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Run a command, inheriting stdio; throws on a non-zero exit. */
function run(command, args, options = {}) {
    execFileSync(command, args, { stdio: "inherit", ...options });
}

/** Read a package.json `version` without importing the file as a module. */
function versionOf(packageJsonPath) {
    return JSON.parse(readFileSync(packageJsonPath, "utf8")).version;
}

/**
 * Ask the deploy workflow to rebuild the whole of `/sohl/` from the new
 * release tag.
 *
 * Dispatched from here rather than watched from outside: the release workflow
 * completes successfully on every push to `main` whether it released or not, so
 * a `workflow_run` trigger on that completion fired a second, redundant deploy
 * every time (#1484). `workflow_dispatch` is one of the two events a
 * `GITHUB_TOKEN` may still use to start a workflow run.
 */
function republishSite() {
    console.log("Republishing /sohl/ from the new release…");
    run("gh", ["workflow", "run", "deploy-sohl.yml", "--ref", "main"]);
}

/**
 * Publish the types-only npm package via npm Trusted Publishing (OIDC) — no
 * `NPM_TOKEN`.
 *
 * Requires a Trusted Publisher configured on npm for `@heroiclands/sohl-types`
 * pointing at this repository and `.github/workflows/release.yml`, plus
 * `id-token: write`. **The workflow filename is the load-bearing part**: npm
 * authorizes the workflow that *initiates* the run, not the reusable one it
 * calls, so moving the body of the release into a shared workflow needs no
 * change on npm — as long as the caller here keeps its name.
 *
 * The package is versioned by hand in `packages/sohl-types/package.json`,
 * independently of the system version; its `prepack` regenerates `index.d.ts`
 * from source at pack time. npm >= 11.5 is required for OIDC, so the runner's
 * npm is upgraded first.
 */
function publishTypes() {
    const cwd = "packages/sohl-types";
    const version = versionOf(`${cwd}/package.json`);
    const spec = `@heroiclands/sohl-types@${version}`;

    let published = false;
    try {
        execFileSync("npm", ["view", spec, "version"], { stdio: "pipe" });
        published = true;
    } catch {
        // `npm view` exits non-zero for a version that does not exist, which is
        // the ordinary case on a release — not an error worth reporting.
    }

    if (published) {
        console.log(`${spec} is already published — skipping.`);
        return;
    }

    console.log(`Publishing ${spec}…`);
    run("npm", ["install", "-g", "npm@latest"]);
    run("npm", ["publish"], { cwd });
}

republishSite();

try {
    publishTypes();
} catch (error) {
    // Best effort by design: Foundry installs from the Release's system.zip,
    // never from npm. Loud, but not fatal.
    console.log(
        `::error title=sohl-types was not published::${error.message} — the release itself is unaffected; publish by hand from packages/sohl-types.`,
    );
}
