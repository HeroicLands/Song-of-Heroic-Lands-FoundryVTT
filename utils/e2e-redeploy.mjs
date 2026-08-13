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
 * The **fast e2e loop**: rebuild what changed, redeploy it to the running test
 * container, make sure the world is actually serving, and run Cypress.
 *
 * `npm run test:e2e` is the from-scratch path — it reseeds the world and
 * recreates the container every run, which costs about a minute before the
 * first assertion. While iterating you want the container left up, and then the
 * loop is: build → `push:test` → (sometimes) restart → wait for the world →
 * `cypress run --spec …`. Every step of that has a way to go quietly wrong:
 *
 * - Building the wrong target. Handlebars edits need `build:assets`, TypeScript
 *   needs `build:code`, content needs `build:db`, and `system.json` needs a
 *   container recreate because it is read only at world launch.
 * - Deploying a partial stage. `vite` empties `build/stage`, so a bare
 *   `push:test` after the wrong build mirrors an incomplete tree — and the push
 *   is destructive, deleting whatever is not in the stage.
 * - Racing the world. `docker start` returns long before Foundry is serving, so
 *   Cypress opens on a dead port and every spec fails for no visible reason.
 * - `ELECTRON_RUN_AS_NODE`. VS Code's terminal and most agent shells export it;
 *   with it set, Cypress's Electron launches as plain Node and dies with a
 *   `MODULE_NOT_FOUND` that names nothing relevant.
 *
 * This script does all of it in the right order, so the loop is one command.
 *
 * Usage:
 *   node utils/e2e-redeploy.mjs [--build=<targets>] [--recreate] [--no-run]
 *                               [--spec <glob>] [-- <cypress args…>]
 *
 *   npm run e2e -- --spec cypress/e2e/birthsign-mystery.cy.js
 *   npm run e2e -- --build=code --spec cypress/e2e/skill-*.cy.js
 *   npm run e2e -- --build=all            # every spec, full rebuild
 *   npm run e2e -- --no-run               # just get the environment current
 *
 * `--build` takes a comma-separated list of `assets`, `code`, `db`, `system`,
 * `all`, or `none` (default `all`). Naming `system` implies `--recreate`.
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

const STAGE = "test";
const CONTAINER = `sohl-foundry-${STAGE}`;
const DEFAULT_PORT = 30003;

/** Build targets → the npm script that produces them. */
const BUILD_SCRIPTS = {
    assets: "build:assets",
    code: "build:code",
    db: "build:db",
    system: "build:system",
};

/**
 * Run a command, inheriting stdio, and abort the script if it fails.
 * @param {string} command - Executable to run.
 * @param {string[]} args - Arguments.
 * @param {object} [options] - Extra spawn options (merged over the defaults).
 * @returns {import("node:child_process").SpawnSyncReturns<Buffer>} The result.
 */
function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        stdio: "inherit",
        shell: process.platform === "win32",
        ...options,
    });
    if (result.error) throw result.error;
    if ((result.status ?? 0) !== 0) {
        console.error(`\n✖ ${command} ${args.join(" ")} failed.`);
        process.exit(result.status ?? 1);
    }
    return result;
}

/**
 * Run a command and capture its stdout, tolerating failure.
 * @param {string} command - Executable to run.
 * @param {string[]} args - Arguments.
 * @returns {string} Trimmed stdout, or "" when the command failed.
 */
function capture(command, args) {
    const result = spawnSync(command, args, { encoding: "utf8" });
    if (result.error || result.status !== 0) return "";
    return (result.stdout ?? "").trim();
}

/**
 * Parse argv into the script's options, passing anything after `--` through to
 * Cypress verbatim.
 * @param {string[]} argv - Raw arguments (without node/script).
 * @returns {{targets: string[], recreate: boolean, runSpecs: boolean, cypressArgs: string[]}}
 */
function parseArgs(argv) {
    const passthroughAt = argv.indexOf("--");
    const own = passthroughAt === -1 ? argv : argv.slice(0, passthroughAt);
    const cypressArgs =
        passthroughAt === -1 ? [] : argv.slice(passthroughAt + 1);

    let build = "all";
    let recreate = false;
    let runSpecs = true;

    for (let i = 0; i < own.length; i += 1) {
        const arg = own[i];
        if (arg.startsWith("--build=")) build = arg.slice("--build=".length);
        else if (arg === "--recreate") recreate = true;
        else if (arg === "--no-run") runSpecs = false;
        else if (arg === "--spec") {
            cypressArgs.push("--spec", own[i + 1] ?? "");
            i += 1;
        } else if (arg.startsWith("--spec=")) {
            cypressArgs.push("--spec", arg.slice("--spec=".length));
        } else cypressArgs.push(arg);
    }

    const targets =
        build === "none" ? []
        : build === "all" ? Object.keys(BUILD_SCRIPTS)
        : build
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

    for (const target of targets) {
        if (!BUILD_SCRIPTS[target]) {
            console.error(
                `Unknown build target '${target}'. Valid: ${Object.keys(BUILD_SCRIPTS).join(", ")}, all, none.`,
            );
            process.exit(1);
        }
    }

    // `system.json` is read once at world launch, so changing it without a
    // recreate deploys a file the running world will never look at.
    if (targets.includes("system")) recreate = true;

    return { targets, recreate, runSpecs, cypressArgs };
}

/**
 * Poll the container's `/join` route until the world is serving.
 * @param {number} port - Host port the container publishes.
 * @param {number} [timeoutMs] - How long to wait before giving up.
 * @returns {Promise<void>} Resolves once the world answers 200.
 */
async function waitForWorld(port, timeoutMs = 180_000) {
    const url = `http://localhost:${port}/join`;
    const deadline = Date.now() + timeoutMs;
    process.stdout.write(`Waiting for the world at ${url} `);
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url, { redirect: "manual" });
            if (response.status === 200) {
                console.log("— active.");
                return;
            }
        } catch {
            // Connection refused while Foundry boots; keep polling.
        }
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    console.error(
        `\n✖ The world did not become active within ${Math.round(timeoutMs / 1000)}s.` +
            `\n  Check \`node utils/foundry-container.mjs ${STAGE} logs\`.`,
    );
    process.exit(1);
}

const { targets, recreate, runSpecs, cypressArgs } = parseArgs(
    process.argv.slice(2),
);
const port = Number(
    process.env[`FOUNDRYVTT_${STAGE.toUpperCase()}_PORT`] ?? DEFAULT_PORT,
);

// 1. Build. `build:code` (vite) empties `build/stage`, so it must run before
//    the passes that copy assets and packs into it — otherwise the push mirrors
//    a stage missing exactly what was just rebuilt.
const ordered = ["code", "assets", "db", "system"].filter((t) =>
    targets.includes(t),
);
for (const target of ordered) {
    console.log(`\n▸ ${BUILD_SCRIPTS[target]}`);
    run("npm", ["run", BUILD_SCRIPTS[target]]);
}

// 2. Make sure a container exists before deploying into its data root.
const exists = capture("docker", [
    "ps",
    "-a",
    "--filter",
    `name=^${CONTAINER}$`,
    "--format",
    "{{.Names}}",
])
    .split("\n")
    .includes(CONTAINER);

// 3. Deploy the stage.
console.log("\n▸ push:test");
run("npm", ["run", "push:test"]);

// 4. Bring the world up on the new build. A running Foundry holds the old packs
//    open, so a content change is invisible until it reopens them — always
//    cycle rather than leaving a stale world serving deployed-but-unread files.
//    Both paths sweep a stale lock (see `clearStaleLock`).
const command = !exists || recreate ? "recreate" : "restart";
console.log(`\n▸ container ${command}`);
run("node", ["utils/foundry-container.mjs", STAGE, command]);

await waitForWorld(port);

if (!runSpecs) {
    console.log("\n✅ Environment is current. Skipping Cypress (--no-run).");
    process.exit(0);
}

// 5. Run Cypress with ELECTRON_RUN_AS_NODE stripped — with it set, Cypress's
//    bundled Electron starts as plain Node and dies on its own flags.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

console.log("\n▸ cypress run");
const cypress = spawnSync("npx", ["cypress", "run", ...cypressArgs], {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
});
process.exit(cypress.status ?? 1);
