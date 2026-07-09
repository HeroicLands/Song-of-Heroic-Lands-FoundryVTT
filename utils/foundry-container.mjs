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
 * Run a built SoHL system inside a Foundry VTT Docker container.
 *
 * Loads `.env.local` (then `.env`) from the repo root and reads the Foundry
 * user-data root from `FOUNDRYVTT_<STAGE>_DATA` (dev/qa/prod) — the same
 * variable `push-stage.mjs` deploys into. That directory is bind-mounted at
 * `/data` in the container, so the system pushed to `<root>/Data/systems/sohl/`
 * is served directly.
 *
 * The container runs the community `felddy/foundryvtt` image, which downloads
 * the correct Foundry build for its platform at runtime. A local Foundry
 * install is deliberately NOT bind-mounted: Foundry's Node distribution bundles
 * per-platform native modules (`better-sqlite3`, `classic-level`), so a macOS
 * install cannot run inside a Linux container.
 *
 * Foundry licensing/provisioning is left to the image: every `FOUNDRY_*` (and
 * `CONTAINER_*`) environment variable present in the process (e.g. from
 * `.env.local`) is passed through to the container. Supply credentials
 * (`FOUNDRY_USERNAME`/`FOUNDRY_PASSWORD`), a timed `FOUNDRY_RELEASE_URL`, or a
 * pre-seeded cache — the choice is yours and needs no code change. See
 * https://hub.docker.com/r/felddy/foundryvtt.
 *
 * Download cache: to avoid re-downloading Foundry, either drop
 * `foundryvtt-<version>.zip` into `<dataRoot>/container_cache/` (felddy's
 * default `/data/container_cache`, no config needed), or point `FOUNDRYVTT_CACHE`
 * at a separate host directory holding the zip — it is bind-mounted and
 * `CONTAINER_CACHE` is set for you. (A raw `CONTAINER_CACHE` in `.env.local` is
 * NOT forwarded, since it names a container path with no matching mount.)
 *
 * Configuration (all optional, resolved from the environment / `.env.local`):
 *   - image:      `FOUNDRYVTT_CONTAINER_IMAGE` (default `felddy/foundryvtt:14`)
 *   - version:    `FOUNDRYVTT_<STAGE>_VERSION` pins the exact Foundry build
 *                 (e.g. `FOUNDRYVTT_TEST_VERSION=14.364`,
 *                 `FOUNDRYVTT_LEG_VERSION=12.331`) — passed to felddy as
 *                 `FOUNDRY_VERSION` and used to pick the matching major image tag
 *                 when `FOUNDRYVTT_CONTAINER_IMAGE` is not set.
 *   - host port:  `FOUNDRYVTT_<STAGE>_PORT` (defaults dev 30000, qa 30001,
 *                 prod 30002, test 30003, leg 30000 — distinct except leg/dev)
 *   - world:      `FOUNDRYVTT_<STAGE>_WORLD` selects the auto-launched world
 *                 (overrides a global `FOUNDRY_WORLD`); the `leg` stage always
 *                 leaves the world null (managed by hand).
 *   - cache dir:  `FOUNDRYVTT_CACHE` (host dir with a pre-downloaded zip)
 *   - license:    `FOUNDRYVTT_<STAGE>_LICENSE_KEY` dedicates a license to a
 *                 stage (overrides a global `FOUNDRY_LICENSE_KEY`) — so e.g.
 *                 dev and test can run at once on different licenses.
 *   - any `FOUNDRY_*` / `CONTAINER_*` var: passed straight through.
 *
 * Docker is assumed to be installed and on `PATH`.
 *
 * Exits non-zero on a missing/invalid stage or command, a remote (non-local)
 * data target, a missing data directory, or a `docker` failure.
 *
 * Env baked in at create time: `FOUNDRY_*`/`CONTAINER_*` values are fixed when
 * the container is first created (`docker run`). A plain `start`/`restart` does
 * NOT pick up changes to them (e.g. `FOUNDRY_WORLD`) — use `recreate` to remove
 * and re-create the container with the current environment.
 *
 * Usage:
 *   npm run container:dev start            // → node utils/foundry-container.mjs dev start
 *   npm run container:dev stop
 *   npm run container:dev recreate         // apply changed FOUNDRY_ / CONTAINER_ env
 *   npm run container:dev <start|stop|restart|recreate|rm|status|logs|pull>
 *   npm run container:leg start            // legacy (old system, pinned Foundry, no world)
 *   node utils/foundry-container.mjs <dev|qa|prod|test|leg> <command>
 */

import path from "path";
import process from "process";
import fs from "fs";
import { spawnSync } from "child_process";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

const STAGE_ENV_MAP = {
    dev: "FOUNDRYVTT_DEV_DATA",
    qa: "FOUNDRYVTT_QA_DATA",
    prod: "FOUNDRYVTT_PROD_DATA",
    test: "FOUNDRYVTT_TEST_DATA",
    // The `leg` (legacy) stage runs the previous, pre-TypeScript system on an
    // older Foundry (e.g. 12.331) from its own data root. It never auto-launches
    // a world (the world is managed by hand — see stageWorldArgs).
    leg: "FOUNDRYVTT_LEG_DATA",
};

/**
 * Default host port per stage, chosen so stages can run concurrently. `leg`
 * defaults to 30000 (matching the usual legacy setup); it shares dev's default,
 * so run one of dev/leg at a time or set `FOUNDRYVTT_LEG_PORT`.
 */
const DEFAULT_PORT = {
    dev: 30000,
    qa: 30001,
    prod: 30002,
    test: 30003,
    leg: 30000,
};

const DEFAULT_IMAGE = "felddy/foundryvtt:14";

/** The port Foundry listens on inside the container. */
const CONTAINER_PORT = 30000;

/**
 * The exact Foundry version pinned for a stage, from
 * `FOUNDRYVTT_<STAGE>_VERSION` (e.g. `FOUNDRYVTT_TEST_VERSION=14.364`,
 * `FOUNDRYVTT_LEG_VERSION=12.331`). Returns `null` when unset.
 * @param {string} stage
 * @returns {string|null}
 */
function resolveVersion(stage) {
    return (
        process.env[`FOUNDRYVTT_${stage.toUpperCase()}_VERSION`]?.trim() || null
    );
}

/**
 * The image to run for a stage. An explicit `FOUNDRYVTT_CONTAINER_IMAGE` wins;
 * otherwise, if a pinned version is set, use felddy's matching major tag
 * (`14.364` → `felddy/foundryvtt:14`); else the default image.
 * @param {string} stage
 * @returns {string}
 */
function resolveImage(stage) {
    const explicit = process.env.FOUNDRYVTT_CONTAINER_IMAGE?.trim();
    if (explicit) return explicit;
    const version = resolveVersion(stage);
    if (version) return `felddy/foundryvtt:${version.split(".")[0]}`;
    return DEFAULT_IMAGE;
}

/**
 * Pass the pinned exact version to felddy as `FOUNDRY_VERSION` so it downloads
 * that specific build (not just the latest of the major tag). Empty when unset.
 * @param {string} stage
 * @returns {string[]}
 */
function versionEnvArgs(stage) {
    const version = resolveVersion(stage);
    return version ? ["--env", `FOUNDRY_VERSION=${version}`] : [];
}

/**
 * Per-stage world selection, overriding any global `FOUNDRY_WORLD` passthrough.
 * `FOUNDRYVTT_<STAGE>_WORLD` sets an explicit world; the `leg` stage always
 * forces an empty `FOUNDRY_WORLD` (never auto-launch — the legacy world is
 * managed by hand). Placed after the env passthrough so it takes precedence.
 * @param {string} stage
 * @returns {string[]}
 */
function stageWorldArgs(stage) {
    const perStage = process.env[`FOUNDRYVTT_${stage.toUpperCase()}_WORLD`];
    if (perStage !== undefined) {
        return ["--env", `FOUNDRY_WORLD=${perStage.trim()}`];
    }
    if (stage === "leg") return ["--env", "FOUNDRY_WORLD="];
    return [];
}

/**
 * Container mount point for a host-provided download cache. When
 * `FOUNDRYVTT_CACHE` (a host directory holding a pre-downloaded
 * `foundryvtt-<version>.zip`) is set, that directory is bind-mounted here and
 * `CONTAINER_CACHE` is pointed at it so felddy reuses the zip instead of
 * downloading. A dedicated mount point (not a subpath of `/data`) keeps it
 * independent of the data root.
 */
const CACHE_MOUNT = "/container_cache";

const COMMANDS = new Set([
    "start",
    "stop",
    "restart",
    "recreate",
    "rm",
    "status",
    "logs",
    "pull",
]);

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

/**
 * Run the `docker` CLI, inheriting stdio. A missing binary is reported clearly
 * rather than as an opaque spawn error.
 *
 * @param {string[]} args
 * @returns {import("child_process").SpawnSyncReturns<Buffer>}
 */
function docker(args) {
    const result = spawnSync("docker", args, { stdio: "inherit" });
    if (result.error) {
        if (result.error.code === "ENOENT") {
            console.error(
                "docker not found on PATH. Install Docker and ensure the `docker` CLI is available.",
            );
            process.exit(1);
        }
        console.error(`Failed to run docker: ${result.error.message}`);
        process.exit(1);
    }
    return result;
}

/**
 * Capture `docker` output instead of inheriting stdio (for existence checks).
 *
 * @param {string[]} args
 * @returns {string} trimmed stdout, or "" on any failure.
 */
function dockerCapture(args) {
    const result = spawnSync("docker", args, { encoding: "utf8" });
    if (result.error || result.status !== 0) return "";
    return (result.stdout ?? "").trim();
}

/**
 * @param {string} name
 * @returns {boolean} whether a container with exactly this name exists.
 */
function containerExists(name) {
    const out = dockerCapture([
        "ps",
        "-a",
        "--filter",
        `name=^${name}$`,
        "--format",
        "{{.Names}}",
    ]);
    return out.split("\n").includes(name);
}

/**
 * Collect the felddy image's env vars (`FOUNDRY_*` and `CONTAINER_*`) as
 * repeated `-e KEY=VALUE` docker args. `CONTAINER_CACHE` is deliberately
 * excluded — it names a *container* path and is set by {@link cacheArgs} to
 * match a matching bind mount, so a raw host path in `.env.local` never leaks
 * through unmounted.
 *
 * @returns {string[]}
 */
function passthroughEnvArgs() {
    const args = [];
    for (const [key, value] of Object.entries(process.env)) {
        if (value == null) continue;
        const passes =
            key.startsWith("FOUNDRY_") ||
            (key.startsWith("CONTAINER_") && key !== "CONTAINER_CACHE");
        if (passes) args.push("-e", `${key}=${value}`);
    }
    return args;
}

/**
 * If `FOUNDRYVTT_CACHE` names a host directory, bind-mount it into the
 * container and point `CONTAINER_CACHE` at that mount so felddy reuses a
 * pre-downloaded `foundryvtt-<version>.zip` instead of downloading. Returns no
 * args when unset — felddy then falls back to its default `/data/container_cache`
 * (i.e. `<dataRoot>/container_cache/` on the host, since `/data` is mounted).
 *
 * @returns {string[]}
 */
function cacheArgs() {
    const cacheDir = process.env.FOUNDRYVTT_CACHE?.trim();
    if (!cacheDir) return [];
    if (!fs.existsSync(cacheDir)) {
        console.error(
            `FOUNDRYVTT_CACHE directory does not exist: ${cacheDir}.`,
        );
        process.exit(1);
    }
    return [
        "--volume",
        `${cacheDir}:${CACHE_MOUNT}`,
        "-e",
        `CONTAINER_CACHE=${CACHE_MOUNT}`,
    ];
}

/**
 * Per-stage Foundry license override. With multiple licenses you can dedicate a
 * distinct key to each stage — `FOUNDRYVTT_<STAGE>_LICENSE_KEY` becomes this
 * container's `FOUNDRY_LICENSE_KEY`, overriding any global one (appended after
 * {@link passthroughEnvArgs} so docker's last `-e` wins). Signing still needs
 * `FOUNDRY_USERNAME`/`FOUNDRY_PASSWORD` (account-wide) or a one-time browser sign.
 *
 * @param {string} stage
 * @returns {string[]}
 */
function stageLicenseArgs(stage) {
    const key =
        process.env[`FOUNDRYVTT_${stage.toUpperCase()}_LICENSE_KEY`]?.trim();
    return key ? ["-e", `FOUNDRY_LICENSE_KEY=${key}`] : [];
}

/**
 * @param {string} stage
 * @returns {string} absolute local data root (exits on error).
 */
function resolveDataRoot(stage) {
    const envVarName = STAGE_ENV_MAP[stage];
    const dataRoot = process.env[envVarName]?.trim() ?? "";

    if (!dataRoot) {
        console.error(
            `No data directory configured for stage '${stage}'. Set environment variable ${envVarName}.`,
        );
        console.error(`Example: ${envVarName}="/path/to/foundryvtt/data"`);
        process.exit(1);
    }

    // Remote SFTP targets (`[user@]host:/path`) can't be bind-mounted by Docker.
    const colonIdx = dataRoot.indexOf(":");
    const isRemote = colonIdx > 0 && !dataRoot.startsWith("/");
    if (isRemote) {
        console.error(
            `${envVarName} is a remote target ('${dataRoot}'). Containers require a local path to bind-mount.`,
        );
        process.exit(1);
    }

    if (!fs.existsSync(dataRoot)) {
        console.error(
            `Data directory does not exist: ${dataRoot} (from ${envVarName}).`,
        );
        process.exit(1);
    }

    return dataRoot;
}

/**
 * @param {string} stage
 * @param {string} name - container name.
 * @param {string} dataRoot
 */
function start(stage, name, dataRoot) {
    const port = Number(
        process.env[`FOUNDRYVTT_${stage.toUpperCase()}_PORT`] ??
            DEFAULT_PORT[stage],
    );
    const image = resolveImage(stage);
    const url = `http://localhost:${port}`;

    if (containerExists(name)) {
        console.log(`Starting existing container '${name}' → ${url}`);
        const result = docker(["start", name]);
        process.exit(result.status ?? 0);
    }

    console.log(
        `Creating container '${name}' from ${image}\n  data: ${dataRoot}\n  url:  ${url}`,
    );
    const result = docker([
        "run",
        "--detach",
        "--name",
        name,
        // Foundry binds the signed license to the hostname; without a STABLE one
        // Docker assigns a random container id each run and the license reverts to
        // "requires signature" every recreate. Pin it to the container name.
        "--hostname",
        name,
        "--publish",
        `${port}:${CONTAINER_PORT}`,
        "--volume",
        `${dataRoot}:/data`,
        ...cacheArgs(),
        ...passthroughEnvArgs(),
        ...versionEnvArgs(stage),
        ...stageWorldArgs(stage),
        ...stageLicenseArgs(stage),
        image,
    ]);
    if ((result.status ?? 0) === 0) {
        console.log(
            `Started. Open ${url} (first run installs Foundry — see \`logs\`).`,
        );
    }
    process.exit(result.status ?? 0);
}

/**
 * Stop and remove the container if it exists, tolerating "not running" /
 * "no such container". Used by `rm` and `recreate` — the latter so a changed
 * `FOUNDRY_*`/`CONTAINER_*` env (baked in at `docker run` time) is re-applied.
 *
 * @param {string} name - container name.
 */
function removeContainer(name) {
    if (!containerExists(name)) {
        console.log(`No container '${name}' to remove.`);
        return;
    }
    docker(["stop", name]);
    docker(["rm", name]);
}

function main() {
    const stage = normalize(process.argv[2]);
    const command = normalize(process.argv[3]);

    if (!STAGE_ENV_MAP[stage]) {
        console.error(
            `Invalid stage '${process.argv[2] ?? ""}'. Valid stages: ${Object.keys(STAGE_ENV_MAP).join(", ")}.`,
        );
        console.error(
            "Usage: node utils/foundry-container.mjs <dev|qa|prod|test|leg> <start|stop|restart|recreate|rm|status|logs|pull>",
        );
        process.exit(1);
    }

    if (!COMMANDS.has(command)) {
        console.error(
            `Invalid command '${process.argv[3] ?? ""}'. Valid commands: ${[...COMMANDS].join(", ")}.`,
        );
        console.error(`Example: npm run container:${stage} start`);
        process.exit(1);
    }

    const name = `sohl-foundry-${stage}`;

    switch (command) {
        case "start":
            start(stage, name, resolveDataRoot(stage));
            break;
        case "stop": {
            const result = docker(["stop", name]);
            process.exit(result.status ?? 0);
            break;
        }
        case "restart": {
            const result = docker(["restart", name]);
            process.exit(result.status ?? 0);
            break;
        }
        case "recreate":
            // Remove the old container, then create a fresh one so the current
            // env (FOUNDRY_WORLD, credentials, cache, …) is applied.
            removeContainer(name);
            start(stage, name, resolveDataRoot(stage));
            break;
        case "rm":
            removeContainer(name);
            process.exit(0);
            break;
        case "status": {
            const result = docker(["ps", "-a", "--filter", `name=^${name}$`]);
            process.exit(result.status ?? 0);
            break;
        }
        case "logs": {
            const result = docker(["logs", "-f", name]);
            process.exit(result.status ?? 0);
            break;
        }
        case "pull": {
            const image = resolveImage(stage);
            const result = docker(["pull", image]);
            process.exit(result.status ?? 0);
            break;
        }
    }
}

main();
