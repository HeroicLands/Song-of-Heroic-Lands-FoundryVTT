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
 * The thing that happens *after* a release is cut, and that only this
 * repository does.
 *
 * Every HeroicLands Foundry package now releases through one shared workflow,
 * which knows how to version, build, package and cut
 * the Release — and deliberately knows nothing about what any one package does
 * afterwards. This script is that seam: the shared workflow runs
 * `npm run release:post` once the Release exists, with `GH_TOKEN` and
 * `RELEASE_TAG` in the environment, and takes no interest in what it contains.
 *
 * It runs **after** the Release, so nothing here can be the reason a release
 * was not cut.
 *
 * **Republish /sohl/.** A published release moves the API half of the site,
 * which documents the newest release tag rather than `main`. A failure here
 * means the site still describes the previous release, so it fails the job.
 */

import { execFileSync } from "node:child_process";

/** Run a command, inheriting stdio; throws on a non-zero exit. */
function run(command, args, options = {}) {
    execFileSync(command, args, { stdio: "inherit", ...options });
}

/**
 * Ask the deploy workflow to rebuild the whole of `/sohl/` from the new
 * release tag.
 *
 * Dispatched from here rather than watched from outside: the release workflow
 * completes successfully on every push to `main` whether it released or not, so
 * a `workflow_run` trigger on that completion fired a second, redundant deploy
 * every time. `workflow_dispatch` is one of the two events a
 * `GITHUB_TOKEN` may still use to start a workflow run.
 */
function republishSite() {
    console.log("Republishing /sohl/ from the new release…");
    run("gh", ["workflow", "run", "deploy-sohl.yml", "--ref", "main"]);
}

republishSite();
