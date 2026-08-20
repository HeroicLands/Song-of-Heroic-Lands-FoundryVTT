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
 * The `content-build` command line — compile / unpack / clean LevelDB packs.
 *
 * A thin `yargs` front end over `../engine/compendiums.mjs`. **Every side
 * effect the pack pipeline has lives here**: argv parsing, `loglevel`
 * configuration, directory creation, reading the shipped Foundry package
 * manifest, and the process exit code. The library itself is import-safe, so a
 * consuming repository's build — or a test — can call it without any of this
 * happening (#1507).
 *
 * Every path and pack name it hands the library comes from the consuming
 * repository's `content-build.config.mjs` (#1508), located by
 * `engine/pack-config.mjs`; nothing about any one repository's layout is
 * written here.
 *
 * Usage:
 *   npx content-build package compile [pack]
 *   npx content-build package unpack [pack] [entry]
 *   npx content-build package clean [pack] [entry]
 *
 * In the SoHL repository, which consumes the package by workspace path:
 *   npm run build:compiledb                // → … package compile (all packs)
 *   npm run build:unpackdb                 // → … package unpack
 *   node ./packages/content-build/bin/content-build.mjs package compile [pack]
 */

import fs from "fs";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
    compilePacks,
    cleanPacks,
    unpackPacks,
} from "../engine/compendiums.mjs";
import { packConfig } from "../engine/pack-config.mjs";
import { readPackageManifest } from "../engine/package-manifest.mjs";

/**
 * The packs the shipped Foundry package declares — what `unpack` extracts.
 *
 * Read on demand rather than at load: a repository that has no package manifest
 * still has a working `compile`, whose own package-id guard
 * (`assertPackageIdMatchesManifestFile`) resolves either manifest kind. A
 * missing manifest is still loud — it throws, and the handler below turns that
 * into a reported failure.
 *
 * @returns {Array<{name: string}>}
 */
function manifestPacks() {
    return readPackageManifest().manifest.packs;
}

/**
 * This package's own version, for `--version`.
 *
 * Read from the package's `package.json` rather than left to yargs, which
 * defaults to the *nearest* `package.json` walking up from the working
 * directory — inside a consuming repository that is the consumer's manifest, so
 * `content-build --version` reported the consumer's version instead of the
 * toolchain's (#1557).
 *
 * @returns {string} The `version` field of this package's manifest.
 */
function ownVersion() {
    return JSON.parse(
        fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ).version;
}

fs.mkdirSync(packConfig.paths.unpack, { recursive: true });

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
    .version(ownVersion())
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
                    // Every path and pack list the library needs is defaulted
                    // from the resolved configuration, so nothing is restated
                    // here (#1508). Only `packs` is passed: it comes from the
                    // shipped manifest, not from configuration.
                    case "compile":
                        return await compilePacks({ packName: pack });
                    case "clean":
                        return await cleanPacks({
                            packName: pack,
                            entryName: entry,
                        });
                    case "unpack":
                        return await unpackPacks({
                            packs: manifestPacks(),
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
