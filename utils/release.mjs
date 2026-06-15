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
 * Legacy local GitHub-release helper — cuts a release from a local build.
 *
 * Reads the version from `build/stage/system.json`, then creates a GitHub
 * release tagged `v<version>` on the `main` commit of
 * `HeroicLands/Song-of-Heroic-Lands-FoundryVTT` (the tag is created if
 * absent) and uploads `build/system-<version>.zip` (as `sohl-<version>.zip`)
 * and `system.json` as release assets. Needs a GitHub token — either
 * `gh auth login` (preferred; keychain-backed) or `GITHUB_TOKEN` in the
 * environment — plus a prior `npm run build` and `npm run build:pack-release`.
 *
 * NOTE: Legacy — CI normally cuts releases (see the release workflow); no
 * npm script wires this in. Kept for manual/local releases.
 *
 * Usage:
 *   node utils/release.mjs                 // after `gh auth login`
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

/**
 * Resolve a GitHub token without requiring a PAT on disk.
 *
 * Prefers `GITHUB_TOKEN` from the environment (for CI / explicit overrides),
 * then falls back to the `gh` CLI's keychain-backed token (`gh auth token`),
 * so a local release works after `gh auth login` with no secret in
 * `.env.local`.
 *
 * @returns {string | undefined}
 */
function resolveGithubToken() {
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
    try {
        const token = execFileSync("gh", ["auth", "token"], {
            encoding: "utf8",
        }).trim();
        return token || undefined;
    } catch {
        return undefined;
    }
}

const GITHUB_TOKEN = resolveGithubToken();
const REPO_OWNER = "HeroicLands";
const REPO_NAME = "Song-of-Heroic-Lands-FoundryVTT";

if (!GITHUB_TOKEN) {
    console.error(
        "No GitHub token available. Run 'gh auth login', or set GITHUB_TOKEN " +
            "in your environment (avoid committing it to a file).",
    );
    process.exit(1);
}

const systemJsonPath = path.join(repoRoot, "build", "stage", "system.json");
if (!fs.existsSync(systemJsonPath)) {
    console.error(
        "Missing build/stage/system.json. Run 'npm run build' first.",
    );
    process.exit(1);
}

const system = JSON.parse(fs.readFileSync(systemJsonPath, "utf8"));
const version = system.version;
const tag = `v${version}`;

const zipPath = path.join(repoRoot, "build", `system-${version}.zip`);
const jsonPath = systemJsonPath;

if (!fs.existsSync(zipPath)) {
    console.error(
        `Missing build/system-${version}.zip. Run 'npm run build:pack-release' first.`,
    );
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createRelease() {
    console.log(`Creating GitHub release ${tag}...`);

    // createRelease automatically creates the tag on the target commit
    // if it doesn't already exist — no local git needed.
    const release = await octokit.repos.createRelease({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        tag_name: tag,
        name: `Song of Heroic Lands v${version}`,
        target_commitish: "main",
        body: `Release v${version}`,
        draft: false,
        prerelease: false,
    });

    const releaseId = release.data.id;
    console.log(`Created release: ${release.data.html_url}`);

    // Upload release assets
    async function uploadAsset(filePath, name, contentType) {
        const content = fs.readFileSync(filePath);
        await octokit.repos.uploadReleaseAsset({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            release_id: releaseId,
            name,
            data: content,
            headers: {
                "content-type": contentType,
                "content-length": content.length,
            },
        });
        console.log(`Uploaded ${name}`);
    }

    await uploadAsset(zipPath, `sohl-${version}.zip`, "application/zip");
    await uploadAsset(jsonPath, "system.json", "application/json");

    console.log("Release complete!");
}

createRelease().catch((err) => {
    console.error("Release failed:", err.message ?? err);
    process.exit(1);
});
