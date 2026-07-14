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
 * Seed a disposable Foundry test world for end-to-end (Cypress) runs.
 *
 * Writes `<FOUNDRYVTT_TEST_DATA>/Data/worlds/<id>/world.json` and compiles a
 * `data/users` LevelDB collection holding a single Gamemaster whose password is
 * a KNOWN value — so a Cypress test can log in deterministically. The world is
 * wiped and rewritten each run (idempotent).
 *
 * The GM password hash is produced exactly as Foundry does (`pbkdf2Sync`, 1000
 * rounds, 64 bytes, sha512 — see `dist/core/auth.mjs`), and the LevelDB is
 * written with `@foundryvtt/foundryvtt-cli` (already a dependency), so the
 * result is a genuine world Foundry launches without migration or setup.
 *
 * The GM's `_id` is a fixed constant so Cypress knows it without any handoff.
 * Foundry re-stamps `coreVersion`/`systemVersion`/`compatibility` from the
 * running core on launch, so a generation-level `compatibility` is enough.
 *
 * Configuration (env / `.env.local`, all optional except the data root):
 *   - `FOUNDRYVTT_TEST_DATA`   (required) the test Foundry user-data root.
 *   - `SOHL_E2E_WORLD_ID`      world id / directory name (default "sohl-e2e").
 *   - `SOHL_E2E_WORLD_TITLE`   world title (default "SoHL E2E").
 *   - `SOHL_E2E_GM_NAME`       GM user name (default "Gamemaster").
 *   - `SOHL_E2E_GM_PASSWORD`   GM password (default "sohl-e2e").
 *
 * Usage:
 *   npm run test:e2e:seed
 *   node utils/seed-test-world.mjs
 */

import path from "path";
import process from "process";
import fs from "fs/promises";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";
import { compilePack } from "@foundryvtt/foundryvtt-cli";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

/** Fixed GM document id (16 alphanumeric chars) so Cypress can target it. */
export const E2E_GM_ID = "sohlE2EGameMastr";

/**
 * Fixed id of the seeded, pre-activated default scene. A non-empty world means
 * Foundry's New User Experience manager does not auto-start the "welcome" tour
 * (whose callout overlays sheets, #451), and an _active_ scene at load makes the
 * canvas ready — several read paths (token placement,
 * `SohlCombatantLogic.computedMove`) depend on a ready canvas / active scene and
 * otherwise fail with no scene present.
 */
export const E2E_SCENE_ID = "sohlE2EDefScene1";

/** Resolve the seed configuration from the environment. */
export function e2eConfig() {
    return {
        worldId: process.env.SOHL_E2E_WORLD_ID || "sohl-e2e",
        worldTitle: process.env.SOHL_E2E_WORLD_TITLE || "SoHL E2E",
        gmName: process.env.SOHL_E2E_GM_NAME || "Gamemaster",
        gmPassword: process.env.SOHL_E2E_GM_PASSWORD || "sohl-e2e",
    };
}

/**
 * Hash a password the way Foundry's `core/auth.mjs` does.
 *
 * @param {string} password
 * @param {string} salt - hex salt.
 * @returns {string} hex hash.
 */
function hashPassword(password, salt) {
    return crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");
}

async function main() {
    const dataRoot = process.env.FOUNDRYVTT_TEST_DATA?.trim() ?? "";
    if (!dataRoot) {
        console.error(
            "No test data directory configured. Set environment variable FOUNDRYVTT_TEST_DATA.",
        );
        console.error(
            'Example: FOUNDRYVTT_TEST_DATA="/path/to/foundryvtt/data-e2e"',
        );
        process.exit(1);
    }

    // The test data root must be its own directory. Pointing it at a real stage
    // dir would let the seed wipe worlds there and make felddy reuse that stage's
    // Config/license.json (ignoring FOUNDRY_LICENSE_KEY) — a data-loss + license
    // footgun. Refuse it.
    const resolved = path.resolve(dataRoot);
    for (const stage of ["DEV", "QA", "PROD"]) {
        const other = process.env[`FOUNDRYVTT_${stage}_DATA`]?.trim();
        if (other && path.resolve(other) === resolved) {
            console.error(
                `FOUNDRYVTT_TEST_DATA must be a separate, empty directory — it currently ` +
                    `matches FOUNDRYVTT_${stage}_DATA (${resolved}). Point it at a fresh dir ` +
                    `(e.g. .../data-e2e) so the E2E world and license stay isolated.`,
            );
            process.exit(1);
        }
    }

    const { worldId, worldTitle, gmName, gmPassword } = e2eConfig();
    const systemVersion = JSON.parse(
        await fs.readFile(path.join(repoRoot, "package.json"), "utf8"),
    ).version;

    const worldDir = path.join(dataRoot, "Data", "worlds", worldId);
    const usersDir = path.join(worldDir, "data", "users");

    // Wipe and recreate for a clean, repeatable world.
    await fs.rm(worldDir, { recursive: true, force: true });
    await fs.mkdir(worldDir, { recursive: true });

    const world = {
        id: worldId,
        title: worldTitle,
        description: "Disposable world for SoHL end-to-end tests.",
        system: "sohl",
        coreVersion: "14",
        systemVersion,
        compatibility: { minimum: "14", verified: "14" },
        background: "",
        nextSession: null,
        resetKeys: false,
        safeMode: false,
    };
    await fs.writeFile(
        path.join(worldDir, "world.json"),
        JSON.stringify(world, null, 2) + "\n",
    );

    // Build the users collection from a JSON source dir, then compile to LevelDB.
    const salt = crypto.randomBytes(32).toString("hex");
    const gm = {
        _id: E2E_GM_ID,
        name: gmName,
        role: 4, // GAMEMASTER
        password: hashPassword(gmPassword, salt),
        passwordSalt: salt,
        permissions: {},
        flags: {},
        _key: `!users!${E2E_GM_ID}`,
    };

    const srcDir = path.join(worldDir, ".seed-src-users");
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(
        path.join(srcDir, "gamemaster.json"),
        JSON.stringify(gm, null, 2) + "\n",
    );
    await compilePack(srcDir, usersDir, { log: false });
    await fs.rm(srcDir, { recursive: true, force: true });

    // A single pre-activated scene. It keeps the world non-empty (so the NUE
    // "welcome" tour never auto-starts and overlays sheets — #451) and gives the
    // client a ready canvas at load (so canvas-coupled read paths resolve).
    const scenesDir = path.join(worldDir, "data", "scenes");
    const scene = {
        _id: E2E_SCENE_ID,
        name: "E2E Default Scene",
        active: true,
        width: 2000,
        height: 2000,
        padding: 0.25,
        grid: { type: 1, size: 100 }, // 1 = CONST.GRID_TYPES.SQUARE
        _key: `!scenes!${E2E_SCENE_ID}`,
    };
    const scenesSrc = path.join(worldDir, ".seed-src-scenes");
    await fs.mkdir(scenesSrc, { recursive: true });
    await fs.writeFile(
        path.join(scenesSrc, "default-scene.json"),
        JSON.stringify(scene, null, 2) + "\n",
    );
    await compilePack(scenesSrc, scenesDir, { log: false });
    await fs.rm(scenesSrc, { recursive: true, force: true });

    console.log(`Seeded test world '${worldId}' at ${worldDir}`);
    console.log(`  GM user:  ${gmName} (id ${E2E_GM_ID})`);
    console.log(`  password: ${gmPassword}`);
    console.log(`  launch with FOUNDRY_WORLD=${worldId}`);
}

// Run only when invoked directly, so the config constants can be imported
// (e.g. by cypress.config.mjs / e2e-run.mjs) without re-seeding.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
    main().catch((err) => {
        console.error(`Seed failed: ${err.message}`);
        process.exit(1);
    });
}
