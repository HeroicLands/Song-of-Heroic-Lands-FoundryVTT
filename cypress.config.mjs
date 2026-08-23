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

import { defineConfig } from "cypress";
import dotenv from "dotenv";
import { loadPackageBuildConfig } from "@heroiclands/package-build/config";
import { resolveStagePort } from "@heroiclands/package-build/container";
import { resolveE2EWorld } from "@heroiclands/package-build/e2e";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// The seeded world and the specs that drive it read the *same* resolution the
// harness seeds with, so neither the port nor the credentials are stated twice
// — `package-build e2e seed` and this file cannot disagree about the world.
const buildConfig = loadPackageBuildConfig();
const port = resolveStagePort(buildConfig.e2eStage, {
    stages: buildConfig.containerStages,
});
const { worldId, gmId, gmName, gmPassword } = resolveE2EWorld(buildConfig);

export default defineConfig({
    e2e: {
        baseUrl: `http://localhost:${port}`,
        supportFile: "cypress/support/e2e.js",
        specPattern: "cypress/e2e/**/*.cy.js",
        // Specs log in once (in `before`) and persist the game session across
        // their tests, resetting world state (documents) rather than the page
        // between tests. The default (true) would reload to about:blank between
        // tests, dropping `game`/login. Isolation across SPECS still holds — each
        // spec file gets a fresh browser context.
        testIsolation: false,
        // Foundry is a live server driven through the browser; fixtures/videos
        // add little here, and specs share login state within a run.
        fixturesFolder: false,
        video: false,
        // The seeded world + GM are the contract between the seed and the
        // specs — exposed so `cy.login()` needs no hard-coded credentials.
        env: {
            worldId,
            gmId,
            gmName,
            gmPassword,
        },
    },
});
