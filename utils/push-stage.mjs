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
 * Loads `.env.local` (then `.env`) from the repo root and reads the
 * destination from `FOUNDRYVTT_<STAGE>_DATA` (dev/qa/prod). Mirrors
 * `build/stage/` → `<dataRoot>/Data/systems/sohl/`, deleting stale files at
 * the destination so it ends up an exact copy of the staged build.
 *
 * Two transports are chosen automatically from the destination value:
 *   - **Local path** (e.g. `/Users/me/fvtt/data`) → intrinsic Node file copy.
 *   - **Remote target** (`[user@]host:/path`) → SFTP over SSH.
 *
 * SFTP authentication (remote only), resolved per stage:
 *   - username:  `user@` prefix, else `FOUNDRYVTT_<STAGE>_USER`, else $USER
 *   - port:      `FOUNDRYVTT_<STAGE>_PORT` or `SOHL_SFTP_PORT`, else 22
 *   - auth: the running SSH agent by default, cross-platform — `$SSH_AUTH_SOCK`
 *       (macOS/Linux), else the Windows OpenSSH named pipe. Override the agent
 *       endpoint with `FOUNDRYVTT_<STAGE>_AGENT` / `SOHL_SFTP_AGENT` (e.g.
 *       "pageant" for PuTTY). Or set `FOUNDRYVTT_<STAGE>_KEY` to a private-key
 *       file to skip the agent entirely (pure-JS, needs no `ssh` binary or
 *       agent — the universal fallback; intended for unencrypted keys, since
 *       no passphrase/password env vars are read — keep secrets out of
 *       `.env.local`).
 *
 * Exits non-zero on a missing stage/env var or a deploy failure.
 *
 * Usage:
 *   npm run push:dev                       // → node utils/push-stage.mjs dev
 *   npm run push:qa                        // → node utils/push-stage.mjs qa
 *   npm run push:prod                      // → node utils/push-stage.mjs prod
 *   node utils/push-stage.mjs <dev|qa|prod>
 */

import path from "path";
import process from "process";
import fs from "fs/promises";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import Client from "ssh2-sftp-client";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

const SOURCE = path.join(repoRoot, "build", "stage");
const SYSTEM_SUBPATH = ["Data", "systems", "sohl"];

const STAGE_ENV_MAP = {
    dev: "FOUNDRYVTT_DEV_DATA",
    qa: "FOUNDRYVTT_QA_DATA",
    prod: "FOUNDRYVTT_PROD_DATA",
    test: "FOUNDRYVTT_TEST_DATA",
};

function resolveStage(stageArg) {
    return String(stageArg || "")
        .trim()
        .toLowerCase();
}

/**
 * Parse a `[user@]host:/path` remote target into its parts.
 *
 * @param {string} target
 * @returns {{ username: string | undefined, host: string, remotePath: string }}
 */
function parseRemote(target) {
    const colonIdx = target.indexOf(":");
    const authority = target.slice(0, colonIdx);
    const remotePath = target.slice(colonIdx + 1);
    const atIdx = authority.indexOf("@");
    const username = atIdx > 0 ? authority.slice(0, atIdx) : undefined;
    const host = atIdx > 0 ? authority.slice(atIdx + 1) : authority;
    return { username, host, remotePath };
}

/**
 * Locate the SSH agent endpoint for agent-based auth, cross-platform.
 *
 * Precedence: an explicit `FOUNDRYVTT_<STAGE>_AGENT` / `SOHL_SFTP_AGENT`
 * override (use "pageant" for PuTTY, or a named-pipe path), then
 * `$SSH_AUTH_SOCK` (set by ssh-agent on macOS/Linux and by some Windows
 * setups), then the Windows OpenSSH agent's default named pipe. Returns
 * undefined when no agent is available (callers then rely on a key file).
 *
 * @param {NodeJS.ProcessEnv} env
 * @param {string} stageUpper - uppercased stage name (e.g. "QA").
 * @returns {string | undefined}
 */
function resolveAgent(env, stageUpper) {
    return (
        env[`FOUNDRYVTT_${stageUpper}_AGENT`] ||
        env.SOHL_SFTP_AGENT ||
        env.SSH_AUTH_SOCK ||
        (process.platform === "win32" ?
            "\\\\.\\pipe\\openssh-ssh-agent"
        :   undefined)
    );
}

/**
 * Assemble an ssh2-sftp-client connection config for a stage.
 *
 * @param {string} stageUpper - uppercased stage name (e.g. "QA").
 * @param {{ username: string | undefined, host: string }} remote
 * @returns {Promise<object>}
 */
async function buildConnection(stageUpper, remote) {
    const env = process.env;
    const port = Number(
        env[`FOUNDRYVTT_${stageUpper}_PORT`] ?? env.SOHL_SFTP_PORT ?? 22,
    );
    const username =
        remote.username || env[`FOUNDRYVTT_${stageUpper}_USER`] || env.USER;

    const conn = { host: remote.host, port, username };

    // Default to the SSH agent so no secret is ever read from disk. An explicit
    // key *path* (not a secret) is the escape hatch for agent-less setups.
    const keyPath = env[`FOUNDRYVTT_${stageUpper}_KEY`];
    if (keyPath) {
        conn.privateKey = await fs.readFile(keyPath);
    } else {
        const agent = resolveAgent(env, stageUpper);
        if (agent) conn.agent = agent;
    }

    return conn;
}

/**
 * Mirror the staged build into a local directory, removing stale files.
 *
 * @param {string} srcAbs
 * @param {string} destDir
 */
async function deployLocal(srcAbs, destDir) {
    console.log(`Deploying ${srcAbs} → ${destDir} (local copy)`);
    await fs.rm(destDir, { recursive: true, force: true });
    await fs.mkdir(destDir, { recursive: true });
    await fs.cp(srcAbs, destDir, { recursive: true });
}

/**
 * Mirror the staged build into a remote directory over SFTP.
 *
 * @param {object} conn - ssh2-sftp-client connection config.
 * @param {string} srcAbs
 * @param {string} remoteDir
 */
async function deployRemote(conn, srcAbs, remoteDir) {
    console.log(
        `Deploying ${srcAbs} → ${conn.username}@${conn.host}:${remoteDir} (sftp)`,
    );
    const sftp = new Client();
    sftp.on("upload", ({ source }) => console.log(`  ${source}`));
    await sftp.connect(conn);
    try {
        if (await sftp.exists(remoteDir)) {
            await sftp.rmdir(remoteDir, true);
        }
        await sftp.mkdir(remoteDir, true);
        await sftp.uploadDir(srcAbs, remoteDir);
    } finally {
        await sftp.end();
    }
}

async function main() {
    const stage = resolveStage(process.argv[2]);
    if (!stage) {
        console.error("Usage: node utils/push-stage.mjs <dev|qa|prod|test>");
        process.exit(1);
    }

    const envVarName = STAGE_ENV_MAP[stage];
    if (!envVarName) {
        console.error(
            `Invalid stage '${stage}'. Valid stages are: ${Object.keys(STAGE_ENV_MAP).join(", ")}.`,
        );
        process.exit(1);
    }

    const dataRoot = process.env[envVarName]?.trim() ?? "";

    if (!dataRoot) {
        console.error(
            `No destination configured for stage '${stage}'. Set environment variable ${envVarName}.`,
        );
        console.error(`Example: ${envVarName}="/path/to/foundryvtt/data"`);
        process.exit(1);
    }

    // Remote targets look like `[user@]host:/path`; a leading "/" means local.
    const colonIdx = dataRoot.indexOf(":");
    const isRemote = colonIdx > 0 && !dataRoot.startsWith("/");

    try {
        if (isRemote) {
            const remote = parseRemote(dataRoot);
            const remoteDir = path.posix.join(
                remote.remotePath,
                ...SYSTEM_SUBPATH,
            );
            const conn = await buildConnection(stage.toUpperCase(), remote);
            await deployRemote(conn, SOURCE, remoteDir);
        } else {
            const destDir = path.join(dataRoot, ...SYSTEM_SUBPATH);
            await deployLocal(SOURCE, destDir);
        }
    } catch (err) {
        console.error(`Deploy failed: ${err.message}`);
        process.exit(1);
    }

    console.log(`Deployed stage '${stage}' successfully.`);
}

main();
