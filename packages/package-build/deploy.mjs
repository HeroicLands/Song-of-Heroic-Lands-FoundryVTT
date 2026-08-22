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
 * Deploying a staged package into a Foundry data directory.
 *
 * **The deploy is staged and swapped, never written in place.** That is the
 * whole design, and it exists for one reason: a running Foundry holds its
 * LevelDB compendium packs open. Replacing pack files underneath a live server
 * leaves LevelDB an inconsistent directory, which it "repairs" on its next open
 * — to zero. So the build is written to a sibling `…​.staging-<pid>` directory
 * and renamed into place; the old tree is renamed aside first, so a process
 * holding its inodes keeps reading the bytes it already had, and the new build
 * takes effect on the next world reload.
 *
 * Two transports, chosen from the destination rather than configured: a local
 * path is copied, and a `[user@]host:/path` target is uploaded over SFTP. Both
 * perform the same staged swap.
 *
 * **No secret is ever read from disk by default.** SFTP authenticates through
 * the running SSH agent, cross-platform; an explicit key *path* is the escape
 * hatch for agent-less setups, and no passphrase or password is read from the
 * environment.
 *
 * The rules are pure functions over data; the functions that touch a
 * filesystem or a network are named for what they do.
 *
 * @module
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/**
 * The environment variable naming each stage's Foundry data root.
 *
 * The set is a shared convention rather than one repository's: every
 * HeroicLands package deploys to the same four stages, and a `test` root is
 * what the end-to-end harness seeds its throwaway world into.
 */
export const STAGE_ENV_MAP = Object.freeze({
    dev: "FOUNDRYVTT_DEV_DATA",
    qa: "FOUNDRYVTT_QA_DATA",
    prod: "FOUNDRYVTT_PROD_DATA",
    test: "FOUNDRYVTT_TEST_DATA",
});

/**
 * Normalise a stage argument.
 *
 * @param {unknown} stageArg - Whatever the caller was given.
 * @returns {string} The trimmed, lowercased stage name, `""` when absent.
 */
export function resolveStage(stageArg) {
    return String(stageArg || "")
        .trim()
        .toLowerCase();
}

/**
 * Where a package installs beneath a Foundry data root.
 *
 * Foundry keeps systems and modules in sibling trees under `Data`, and the leaf
 * is the package id — the same id the manifest declares and every compendium
 * UUID starts with. Deriving it here is what lets one deploy serve a system and
 * a module without either naming its own path.
 *
 * @param {"systems"|"modules"} packageKind - Which tree it installs into.
 * @param {string} packageId - The Foundry package id.
 * @returns {string[]} Path segments beneath the data root.
 */
export function packageSubpath(packageKind, packageId) {
    if (packageKind !== "systems" && packageKind !== "modules") {
        throw new TypeError(
            `packageKind must be "systems" or "modules", not ${JSON.stringify(packageKind)}.`,
        );
    }
    if (!packageId) {
        throw new TypeError("packageId is required to locate the deploy path.");
    }
    return ["Data", packageKind, packageId];
}

/**
 * Whether a destination names a remote host rather than a local directory.
 *
 * A remote target is `[user@]host:/path`. The colon is what distinguishes it —
 * **except on Windows, where `C:\Foundry\Data` also has one**. A bare drive
 * letter followed by a separator is therefore read as local; without that, a
 * Windows developer's perfectly ordinary path is parsed as a host called `C`
 * and the deploy fails trying to open an SSH connection to it.
 *
 * @param {string} target - The configured destination.
 * @returns {boolean} True when it should be deployed over SFTP.
 */
export function isRemoteTarget(target) {
    const value = String(target ?? "").trim();
    if (!value || value.startsWith("/")) return false;
    // A Windows drive root: one letter, a colon, then a separator.
    if (/^[A-Za-z]:[\\/]/.test(value)) return false;
    return value.indexOf(":") > 0;
}

/**
 * Parse a `[user@]host:/path` remote target into its parts.
 *
 * @param {string} target - The remote destination.
 * @returns {{username: string|undefined, host: string, remotePath: string}}
 */
export function parseRemote(target) {
    const colonIdx = target.indexOf(":");
    const authority = target.slice(0, colonIdx);
    const remotePath = target.slice(colonIdx + 1);
    const atIdx = authority.indexOf("@");
    const username = atIdx > 0 ? authority.slice(0, atIdx) : undefined;
    const host = atIdx > 0 ? authority.slice(atIdx + 1) : authority;
    return { username, host, remotePath };
}

/**
 * Locate the SSH agent endpoint, cross-platform.
 *
 * Precedence: an explicit per-stage override (use `"pageant"` for PuTTY, or a
 * named-pipe path), then `$SSH_AUTH_SOCK`, then the Windows OpenSSH agent's
 * default named pipe. `undefined` when no agent is available, at which point a
 * caller falls back to a key file.
 *
 * @param {NodeJS.ProcessEnv} env - The environment to read.
 * @param {string} stageUpper - Uppercased stage name, e.g. `"QA"`.
 * @param {string} [prefix] - Fallback variable prefix for a shared override.
 * @returns {string|undefined} The agent endpoint.
 */
export function resolveAgent(env, stageUpper, prefix = "SOHL") {
    return (
        env[`FOUNDRYVTT_${stageUpper}_AGENT`] ||
        env[`${prefix}_SFTP_AGENT`] ||
        env.SSH_AUTH_SOCK ||
        (process.platform === "win32" ?
            "\\\\.\\pipe\\openssh-ssh-agent"
        :   undefined)
    );
}

/**
 * Assemble an `ssh2-sftp-client` connection config for a stage.
 *
 * Defaults to the SSH agent so no secret is read from disk. An explicit key
 * *path* — not a secret — is the escape hatch; no passphrase or password is
 * read from the environment, deliberately, so none ends up in a `.env` file.
 *
 * @param {string} stageUpper - Uppercased stage name, e.g. `"QA"`.
 * @param {{username: string|undefined, host: string}} remote - Parsed target.
 * @param {object} [opts]
 * @param {NodeJS.ProcessEnv} [opts.env] - The environment to read.
 * @param {string} [opts.prefix] - Fallback variable prefix.
 * @returns {Promise<object>} The connection config.
 */
export async function buildConnection(
    stageUpper,
    remote,
    { env = process.env, prefix = "SOHL" } = {},
) {
    const port = Number(
        env[`FOUNDRYVTT_${stageUpper}_PORT`] ??
            env[`${prefix}_SFTP_PORT`] ??
            22,
    );
    const username =
        remote.username || env[`FOUNDRYVTT_${stageUpper}_USER`] || env.USER;

    const conn = { host: remote.host, port, username };

    const keyPath = env[`FOUNDRYVTT_${stageUpper}_KEY`];
    if (keyPath) conn.privateKey = await fs.readFile(keyPath);
    else {
        const agent = resolveAgent(env, stageUpper, prefix);
        if (agent) conn.agent = agent;
    }

    return conn;
}

/** @param {string} p @returns {Promise<boolean>} Whether the path exists. */
async function exists(p) {
    try {
        await fs.stat(p);
        return true;
    } catch {
        return false;
    }
}

/**
 * Mirror the staged build into a local directory via a staged, atomic swap.
 *
 * The live destination is never mutated in place — see the module header for
 * why that matters under a running server.
 *
 * @param {string} srcAbs - The staged tree.
 * @param {string} destDir - Where the package installs.
 * @returns {Promise<void>}
 */
export async function deployLocal(srcAbs, destDir) {
    const staging = `${destDir}.staging-${process.pid}`;
    const old = `${destDir}.old-${process.pid}`;

    // 1. Build a fresh staging copy alongside the destination.
    await fs.rm(staging, { recursive: true, force: true });
    await fs.mkdir(path.dirname(destDir), { recursive: true });
    await fs.cp(srcAbs, staging, { recursive: true });

    // 2. Swap it in with renames. Renaming onto a non-existent name is atomic;
    //    the old tree is moved aside first — its inodes stay alive for any
    //    process holding them open — and only then removed.
    await fs.rm(old, { recursive: true, force: true });
    const hadDest = await exists(destDir);
    if (hadDest) await fs.rename(destDir, old);
    await fs.rename(staging, destDir);
    if (hadDest) await fs.rm(old, { recursive: true, force: true });
}

/**
 * Mirror the staged build into a remote directory over SFTP, with the same
 * staged swap {@link deployLocal} performs.
 *
 * `ssh2-sftp-client` is imported here rather than at module scope so that the
 * pure helpers above — and a local deploy — cost nothing to import.
 *
 * @param {object} conn - Connection config from {@link buildConnection}.
 * @param {string} srcAbs - The staged tree.
 * @param {string} remoteDir - Where the package installs on the host.
 * @param {object} [opts]
 * @param {(uploaded: string) => void} [opts.onUpload] - Per-file progress.
 * @returns {Promise<void>}
 */
export async function deployRemote(conn, srcAbs, remoteDir, { onUpload } = {}) {
    const { default: Client } = await import("ssh2-sftp-client");
    const staging = `${remoteDir}.staging-${process.pid}`;
    const old = `${remoteDir}.old-${process.pid}`;
    const sftp = new Client();
    if (onUpload) sftp.on("upload", ({ source }) => onUpload(source));
    await sftp.connect(conn);
    try {
        // `mkdir` is recursive, so it also creates the parent tree on a
        // first-ever deploy.
        if (await sftp.exists(staging)) await sftp.rmdir(staging, true);
        await sftp.mkdir(staging, true);
        await sftp.uploadDir(srcAbs, staging);

        if (await sftp.exists(old)) await sftp.rmdir(old, true);
        const hadDest = Boolean(await sftp.exists(remoteDir));
        if (hadDest) await sftp.rename(remoteDir, old);
        await sftp.rename(staging, remoteDir);
        if (hadDest) await sftp.rmdir(old, true);
    } finally {
        await sftp.end();
    }
}

/**
 * Deploy a staged package to one stage, choosing the transport from the
 * configured destination.
 *
 * @param {object} opts
 * @param {string} opts.stage - `dev` / `qa` / `prod` / `test`.
 * @param {string} opts.source - The staged tree.
 * @param {"systems"|"modules"} opts.packageKind - Which Foundry tree.
 * @param {string} opts.packageId - The Foundry package id.
 * @param {NodeJS.ProcessEnv} [opts.env] - The environment to read.
 * @param {string} [opts.prefix] - Fallback variable prefix for SFTP overrides.
 * @param {(message: string) => void} [opts.log] - Progress reporting.
 * @returns {Promise<{stage: string, destination: string, remote: boolean}>}
 * @throws {Error} On an unknown stage, or one with no destination configured.
 */
export async function deployStage({
    stage,
    source,
    packageKind,
    packageId,
    env = process.env,
    prefix = "SOHL",
    log = () => {},
}) {
    const name = resolveStage(stage);
    const envVarName = STAGE_ENV_MAP[name];
    if (!envVarName) {
        throw new Error(
            `Invalid stage ${JSON.stringify(stage)}. Valid stages are: ` +
                `${Object.keys(STAGE_ENV_MAP).join(", ")}.`,
        );
    }

    const dataRoot = env[envVarName]?.trim() ?? "";
    if (!dataRoot) {
        throw new Error(
            `No destination configured for stage '${name}'. Set ${envVarName} ` +
                `— for example ${envVarName}="/path/to/foundryvtt/data".`,
        );
    }

    const segments = packageSubpath(packageKind, packageId);

    if (isRemoteTarget(dataRoot)) {
        const remote = parseRemote(dataRoot);
        const remoteDir = path.posix.join(remote.remotePath, ...segments);
        const conn = await buildConnection(name.toUpperCase(), remote, {
            env,
            prefix,
        });
        log(
            `Deploying ${source} → ${conn.username}@${conn.host}:${remoteDir} (sftp)`,
        );
        await deployRemote(conn, source, remoteDir, {
            onUpload: (f) => log(`  ${f}`),
        });
        return { stage: name, destination: remoteDir, remote: true };
    }

    const destDir = path.join(dataRoot, ...segments);
    log(`Deploying ${source} → ${destDir} (local copy)`);
    await deployLocal(source, destDir);
    return { stage: name, destination: destDir, remote: false };
}
