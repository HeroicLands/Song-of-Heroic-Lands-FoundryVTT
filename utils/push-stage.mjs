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
 * Deploy the staged build to a Foundry data directory.
 *
 * **The deploy itself is `@heroiclands/package-build`'s** — the staged,
 * atomic swap that makes it safe to run against a live server, the choice
 * between a local copy and SFTP, and the SSH-agent-first authentication are the
 * same for every HeroicLands package. `sohl-thalorna`'s `package.json` already
 * calls a `utils/push-stage.mjs` it does not have, which is what a per-repository
 * copy of this eventually costs.
 *
 * What is written here is only this repository's: it ships a **system** whose
 * Foundry package id is `sohl`, and its build stages to `build/stage`.
 *
 * Configuration is read from `.env.local` (then `.env`), one file per
 * developer:
 *
 *   - `FOUNDRYVTT_<STAGE>_DATA` — the destination, required. A local path, or a
 *     `[user@]host:/path` target to deploy over SFTP.
 *   - `FOUNDRYVTT_<STAGE>_USER` / `_PORT` / `_AGENT` / `_KEY` — SFTP overrides.
 *     Authentication defaults to the running SSH agent, so no secret is read
 *     from disk; `_KEY` names a key *file* for agent-less setups. No passphrase
 *     or password is ever read from the environment, deliberately.
 *
 * Usage:
 *   npm run push:qa                     // node utils/push-stage.mjs qa
 *   node utils/push-stage.mjs <dev|qa|prod|test>
 */

import path from "path";
import process from "process";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

import { deployStage } from "@heroiclands/package-build/deploy";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

const stage = process.argv[2];
if (!stage) {
    console.error("Usage: node utils/push-stage.mjs <dev|qa|prod|test>");
    process.exit(1);
}

try {
    const { stage: name } = await deployStage({
        stage,
        source: path.join(repoRoot, "build", "stage"),
        packageKind: "systems",
        packageId: "sohl",
        log: (message) => console.log(message),
    });
    console.log(`Deployed stage '${name}' successfully.`);
} catch (err) {
    console.error(`Deploy failed: ${err.message}`);
    process.exit(1);
}
