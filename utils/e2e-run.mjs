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
 * Orchestrate an end-to-end run against the seeded test world:
 *   1. (re)create the `test` container with `FOUNDRY_WORLD` set to the seed,
 *   2. wait until the world is actually ACTIVE (not just the HTTP port up),
 *   3. run Cypress (`run` headless, or `open` interactive),
 *   4. tear the container down (only in `run` mode).
 *
 * Assumes the world has already been seeded (`test:e2e:seed`) and the system
 * pushed (`push:test`). Foundry is single-seat: only one licensed instance can
 * run at a time, so this warns if another `sohl-foundry-*` container is up, and
 * surfaces a license-verification failure with a clear message.
 *
 * Usage:
 *   node utils/e2e-run.mjs run     // headless (CI); stops the container after
 *   node utils/e2e-run.mjs open    // interactive; leaves the container running
 */

import path from "path";
import process from "process";
import { spawnSync } from "child_process";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { e2eConfig } from "./seed-test-world.mjs";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

const CONTAINER = "sohl-foundry-test";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

/** @param {string[]} args @returns {string} trimmed stdout, "" on failure. */
function capture(cmd, args) {
    const r = spawnSync(cmd, args, { encoding: "utf8" });
    return r.error || r.status !== 0 ? "" : (r.stdout ?? "").trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll until the test world is active, or throw with a diagnosis.
 *
 * @param {number} port
 * @param {number} timeoutMs
 */
async function waitForWorld(port, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    const url = `http://localhost:${port}/join`;
    while (Date.now() < deadline) {
        // A license failure never recovers — fail fast with guidance.
        const logs = capture("docker", ["logs", "--tail", "40", CONTAINER]);
        if (/license verification failed/i.test(logs)) {
            throw new Error(
                "Foundry license verification failed. The test container needs its own SIGNED " +
                    "license. Best: dedicate a license via FOUNDRYVTT_TEST_LICENSE_KEY in .env.local " +
                    "plus FOUNDRY_USERNAME/FOUNDRY_PASSWORD so felddy signs it (a bare key stays " +
                    "unsigned). Reusing another installation's license.json does NOT verify. If the " +
                    "test shares a license with a running dev/qa container, that's single-seat — give " +
                    "it a separate key or stop the other container.",
            );
        }
        try {
            const res = await fetch(url);
            const body = await res.text();
            // The join screen renders this only once the world is active.
            if (body.includes('id="join-game"')) return;
        } catch {
            // Server not answering yet — keep waiting.
        }
        await sleep(2000);
    }
    throw new Error(
        `Timed out after ${Math.round(timeoutMs / 1000)}s waiting for the test world to activate. ` +
            `Check \`npm run container:test logs\`.`,
    );
}

async function main() {
    const mode = (process.argv[2] || "run").trim().toLowerCase();
    if (mode !== "run" && mode !== "open") {
        console.error("Usage: node utils/e2e-run.mjs <run|open>");
        process.exit(1);
    }

    const { worldId } = e2eConfig();
    const port = Number(process.env.FOUNDRYVTT_TEST_PORT ?? 30003);

    // Warn about the single-seat license clash before we start.
    const running = capture("docker", [
        "ps",
        "--filter",
        "name=^sohl-foundry-",
        "--format",
        "{{.Names}}",
    ])
        .split("\n")
        .filter((n) => n && n !== CONTAINER);
    if (running.length) {
        console.warn(
            `⚠ Other Foundry container(s) running: ${running.join(", ")}. ` +
                "Fine if the test uses a DIFFERENT license (FOUNDRYVTT_TEST_LICENSE_KEY); " +
                "a shared license is single-seat and will fail to verify.",
        );
    }

    // Launch the seeded world (FOUNDRY_WORLD is read by the container script).
    process.env.FOUNDRY_WORLD = worldId;
    console.log(`Recreating ${CONTAINER} with FOUNDRY_WORLD=${worldId} …`);
    const up = spawnSync(
        "node",
        [
            path.join(repoRoot, "utils", "foundry-container.mjs"),
            "test",
            "recreate",
        ],
        { stdio: "inherit", env: process.env },
    );
    if ((up.status ?? 1) !== 0) process.exit(up.status ?? 1);

    let cypressStatus = 1;
    try {
        console.log("Waiting for the test world to activate …");
        await waitForWorld(port, 180000);
        console.log(
            `World active at http://localhost:${port}. Running Cypress (${mode}) …`,
        );
        const cy = spawnSync(npx, ["cypress", mode], {
            stdio: "inherit",
            cwd: repoRoot,
            env: process.env,
        });
        cypressStatus = cy.status ?? 1;
    } finally {
        // Leave the server up in interactive mode; tear down after a headless run.
        if (mode === "run") {
            spawnSync(
                "node",
                [
                    path.join(repoRoot, "utils", "foundry-container.mjs"),
                    "test",
                    "stop",
                ],
                { stdio: "inherit" },
            );
        }
    }

    process.exit(cypressStatus);
}

main().catch((err) => {
    console.error(err.message);
    // Best-effort teardown on failure in headless mode.
    if ((process.argv[2] || "run").toLowerCase() === "run") {
        spawnSync("docker", ["stop", CONTAINER], { stdio: "ignore" });
    }
    process.exit(1);
});
