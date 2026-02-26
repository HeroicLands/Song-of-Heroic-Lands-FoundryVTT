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

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

// Load GitHub token from .env or environment
dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "your-github-username"; // 🔁 Replace with your GitHub username
const REPO_NAME = "your-repo-name";        // 🔁 Replace with your repository name

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN is not set in environment or .env file.");
  process.exit(1);
}

const system = JSON.parse(fs.readFileSync("system.json", "utf8"));
const version = system.version;
const tag = `v${version}`;

const zipPath = path.resolve(`./build/system-${version}.zip`);
const jsonPath = path.resolve(`./build/system-${version}.json`);

if (!fs.existsSync(zipPath) || !fs.existsSync(jsonPath)) {
  console.error("❌ Missing build artifacts. Run `npm run build:code` first.");
  process.exit(1);
}

// Create a Git tag and push it
try {
  execSync(`git tag ${tag}`);
  execSync(`git push origin ${tag}`);
  console.log(`✅ Created and pushed tag ${tag}`);
} catch (err) {
  console.error("⚠️ Git tag might already exist. Continuing...");
}

// Create GitHub release
const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createRelease() {
  const release = await octokit.repos.createRelease({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tag_name: tag,
    name: `System v${version}`,
    target_commitish: "master",
    body: "Automated release.",
  });

  const releaseId = release.data.id;

  // Upload assets
  const upload = async (filePath, name) => {
    const content = fs.readFileSync(filePath);
    await octokit.repos.uploadReleaseAsset({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      release_id: releaseId,
      name,
      data: content,
      headers: {
        "content-type": "application/zip",
        "content-length": content.length,
      },
    });
    console.log(`📦 Uploaded ${name}`);
  };

  await upload(zipPath, "system.zip");
  await upload(jsonPath, "system.json");

  console.log("🚀 GitHub release complete!");
}

createRelease().catch((err) => {
  console.error("❌ Release failed:", err);
  process.exit(1);
});

