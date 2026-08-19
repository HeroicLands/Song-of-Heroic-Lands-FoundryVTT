#!/usr/bin/env node
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
 * Compendium pack CLI — compile / unpack / clean LevelDB packs.
 *
 * A thin `yargs` front end over `../compendiums.mjs`. **Every side effect the
 * pack pipeline has lives here**: argv parsing, `loglevel` configuration,
 * directory creation, reading the shipped Foundry package manifest, and the
 * process exit code. The library itself is import-safe, so another repository's
 * build — or a test — can call it without any of this happening (#1507).
 *
 * Usage:
 *   npm run build:compiledb                // → … package compile (all packs)
 *   npm run build:unpackdb                 // → … package unpack
 *   node ./utils/packs/bin/build-compendiums.mjs package compile [pack]
 *   node ./utils/packs/bin/build-compendiums.mjs package unpack [pack] [entry]
 *   node ./utils/packs/bin/build-compendiums.mjs package clean [pack] [entry]
 */

import fs from "fs";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { compilePacks, cleanPacks, unpackPacks } from "../compendiums.mjs";

/**
 * Packs compiled from the authoritative `assets/content/` Markdown. Each pack's
 * per-entry JSON is generated into a build-only intermediate
 * (`build/packs-json/<name>/`) and compiled to LevelDB from there — no committed
 * JSON and no vault access.
 */
const SOURCE_PACKS = [
    "items",
    "journals",
    "actors",
    "macros",
    "scenes",
    "adventures",
];

/** Where `unpack` writes extracted JSON, and where `clean` operates. */
const PACK_DEST = path.resolve("./build/tmp/packs");
const STAGE_DEST = path.resolve("./build/stage/packs");

/** The shipped Foundry package manifest, read only where it is needed. */
const SYSTEM_TEMPLATE = "./assets/templates/system.template.json";

/**
 * The packs the shipped Foundry package declares — what `unpack` extracts.
 *
 * Read on demand rather than at load: a repository that has no system manifest
 * still has a working `compile`, whose own package-id guard
 * (`assertPackageIdMatchesManifestFile`) resolves either manifest kind. A
 * missing manifest is still loud — it throws, and the handler below turns that
 * into a reported failure.
 *
 * @returns {Array<{name: string}>}
 */
function manifestPacks() {
    return JSON.parse(fs.readFileSync(SYSTEM_TEMPLATE, { encoding: "utf8" }))
        .packs;
}

fs.mkdirSync(PACK_DEST, { recursive: true });

// Configure loglevel
log.setLevel("info"); // Set desired logging level

// Configure prefix
prefix.reg(log);
prefix.apply(log, {
    format(level, _name, timestamp) {
        return `[${timestamp}] [${level.toUpperCase()}]:`;
    },
    timestampFormatter(date) {
        return date.toISOString();
    },
});

const argv = yargs(hideBin(process.argv))
    .command(packageCommand())
    .help()
    .alias("help", "h").argv;

// eslint-disable-next-line
function packageCommand() {
    return {
        command: "package [action] [pack] [entry]",
        describe: "Manage packages",
        builder: (yargs) => {
            yargs.positional("action", {
                describe: "The action to perform.",
                type: "string",
                choices: ["compile", "unpack", "clean"],
            });
            yargs.positional("pack", {
                describe: "Name of the pack upon which to work.",
                type: "string",
            });
            yargs.positional("entry", {
                describe:
                    "Name of any entry within a pack upon which to work. Only applicable to extract & clean commands.",
                type: "string",
            });
        },
        handler: async (argv) => {
            const { action, pack, entry } = argv;
            // yargs does not await this handler, so a rejection would surface as
            // an unhandled-rejection stack trace. Report the message and set a
            // failing exit code, so a build guard reads as a build failure.
            try {
                switch (action) {
                    case "compile":
                        return await compilePacks({
                            sourcePacks: SOURCE_PACKS,
                            stageDest: STAGE_DEST,
                            packName: pack,
                        });
                    case "clean":
                        return await cleanPacks({
                            packDest: PACK_DEST,
                            packName: pack,
                            entryName: entry,
                        });
                    case "unpack":
                        return await unpackPacks({
                            packs: manifestPacks(),
                            stageDest: STAGE_DEST,
                            packDest: PACK_DEST,
                            packName: pack,
                            entryName: entry,
                        });
                }
            } catch (err) {
                log.error(err.message);
                process.exitCode = 1;
            }
        },
    };
}
