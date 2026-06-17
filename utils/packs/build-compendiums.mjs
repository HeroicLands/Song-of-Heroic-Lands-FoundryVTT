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
 * Compendium pack CLI — compile / unpack / clean LevelDB packs.
 *
 * Wraps `@foundryvtt/foundryvtt-cli` behind a yargs `package <action>`
 * command over the `items`, `journals`, and `actors` packs:
 *   - compile: builds LevelDB at `build/stage/packs/<name>/` from each pack's
 *     committed `assets/packs/<name>/_source/` tree (produced by
 *     `npm run packs:export`); no vault access needed.
 *   - unpack: extracts `build/stage/packs/<name>/` back to per-entry JSON
 *     under `build/tmp/packs/<name>/`, rebuilding folder paths.
 *   - clean: normalizes/strips committed JSON under `build/tmp/packs/`.
 * Reads the system version from `assets/templates/system.template.json`.
 *
 * Usage:
 *   npm run build:compiledb                // → … package compile (all packs)
 *   npm run build:unpackdb                 // → … package unpack
 *   node ./utils/packs/build-compendiums.mjs package compile [pack]
 *   node ./utils/packs/build-compendiums.mjs package unpack [pack] [entry]
 *   node ./utils/packs/build-compendiums.mjs package clean [pack] [entry]
 */

import fs from "fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

/**
 * Packs that compile from a committed per-entry JSON tree. Each entry's
 * `_source/` directory is produced by `npm run packs:export` and consumed
 * directly here — no vault access is needed during compile.
 */
const SOURCE_PACKS = ["items", "journals", "actors"];

/** Root of each pack's committed `_source/` tree. */
const PACK_SOURCE_DIR = (name) =>
    path.resolve(`./assets/packs/${name}/_source`);

/** Where `unpack` writes extracted JSON, and where `clean` operates. */
const PACK_DEST = path.resolve("./build/tmp/packs");
const STAGE_DEST = path.resolve("./build/stage/packs");

fs.mkdirSync(PACK_DEST, { recursive: true });

// Load system.json.
const system = JSON.parse(
    fs.readFileSync("./assets/templates/system.template.json", { encoding: "utf8" }),
);

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
            switch (action) {
                case "compile":
                    return await compilePacks(pack);
                case "clean":
                    return await cleanPacks(pack, entry);
                case "unpack":
                    return await extractPacks(pack, entry);
            }
        },
    };
}

/* ----------------------------------------- */
/*  Compile Packs                            */
/* ----------------------------------------- */

/**
 * Builds the LevelDB output for each pack from its committed `_source`
 * tree (produced by `npm run packs:export`). No vault access is needed
 * here. Destination: `build/stage/packs/<name>/`.
 */
async function compilePacks(packName) {
    const packNames = SOURCE_PACKS.filter(
        (name) => !packName || name === packName,
    );

    for (const name of packNames) {
        const source = PACK_SOURCE_DIR(name);
        if (!fs.existsSync(source)) {
            log.error(
                `Pack ${name}: _source/ not found at ${source}. Run 'npm run packs:export' first.`,
            );
            continue;
        }
        log.info(`Pack ${name}: using committed _source tree`);

        const stage = path.join(STAGE_DEST, name);
        log.info(`Pack ${name}: compiling to LevelDB at ${stage}`);
        await compilePack(source, stage, {
            recursive: true,
            log: false,
            transformEntry: cleanPackEntry,
        });
    }
    log.info("Pack compilation complete.");
}

/* ----------------------------------------- */
/*  Clean Packs                              */
/* ----------------------------------------- */

/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data                           Data for a single entry to clean.
 * @param {object} [options={}]
 * @param {boolean} [options.clearSourceId=true]  Should the core sourceId flag be deleted.
 * @param {number} [options.ownership=0]          Value to reset default ownership to.
 */
function cleanPackEntry(data, { clearSourceId = true, ownership = 0 } = {}) {
    if (data.ownership) data.ownership = { default: ownership };
    if (clearSourceId) {
        delete data._stats?.compendiumSource;
        delete data.flags?.core?.sourceId;
    }
    delete data.flags?.importSource;
    delete data.flags?.exportSource;
    if (data._stats?.lastModifiedBy)
        data._stats.lastModifiedBy = "sohlbuilder00000";

    // Remove empty entries in flags
    if (!data.flags) data.flags = {};
    Object.entries(data.flags).forEach(([key, contents]) => {
        if (Object.keys(contents).length === 0) delete data.flags[key];
    });

    if (data.effects)
        data.effects.forEach((i) =>
            cleanPackEntry(i, { clearSourceId: false }),
        );
    if (data.items)
        data.items.forEach((i) => cleanPackEntry(i, { clearSourceId: false }));
    if (data.pages)
        data.pages.forEach((i) => cleanPackEntry(i, { ownership: -1 }));
    if (data.system?.description)
        data.system.description = cleanString(data.system.description);
    if (data.system?.biography)
        data.system.biography = cleanString(data.system.biography);
    if (data.system?.textReference)
        data.system.textReference = cleanString(data.system.textReference);
    if (data.system?.notes) data.system.notes = cleanString(data.system.notes);
    if (data.label) data.label = cleanString(data.label);
    if (data.name) data.name = cleanString(data.name);
}

/**
 * Removes invisible whitespace characters and normalizes single- and double-quotes.
 * @param {string} str  The string to be cleaned.
 * @returns {string}    The cleaned string.
 */
function cleanString(str) {
    return str
        .replace(/\u2060/gu, "")
        .replace(/[‘’]/gu, "'")
        .replace(/[“”]/gu, '"');
}

/**
 * Cleans and formats source JSON files, removing unnecessary permissions and flags and adding the proper spacing.
 * @param {string} [packName]   Name of pack to clean. If none provided, all packs will be cleaned.
 * @param {string} [entryName]  Name of a specific entry to clean.
 *
 * - `npm run build:clean` - Clean all source JSON files.
 * - `npm run build:clean -- classes` - Only clean the source files for the specified compendium.
 * - `npm run build:clean -- classes Barbarian` - Only clean a single item from the specified compendium.
 */
async function cleanPacks(packName, entryName) {
    entryName = entryName?.toLowerCase();

    const folders = fs
        .readdirSync(PACK_DEST, { withFileTypes: true })
        .filter(
            (file) =>
                file.isDirectory() && (!packName || packName === file.name),
        );

    /**
     * Walk through directories to find JSON files.
     * @param {string} directoryPath
     * @yields {string}
     */
    async function* _walkDir(directoryPath) {
        const directory = await readdir(directoryPath, { withFileTypes: true });
        for (const entry of directory) {
            const entryPath = path.join(directoryPath, entry.name);
            if (path.extname(entry.name) === ".json") yield entryPath;
        }
    }

    for (const folder of folders) {
        log.info(`Cleaning pack ${folder.name}`);
        for await (const src of _walkDir(path.join(PACK_DEST, folder.name))) {
            const json = JSON.parse(await readFile(src, { encoding: "utf8" }));
            if (entryName && entryName !== json.name.toLowerCase()) continue;
            if (!json._id || !json._key) {
                log.info(
                    `Failed to clean \x1b[31m${src}\x1b[0m, must have _id and _key.`,
                );
                continue;
            }
            cleanPackEntry(json);
            fs.rmSync(src, { force: true });
            writeFile(src, `${JSON.stringify(json, null, 2)}\n`, {
                mode: 0o664,
            });
        }
    }
}

async function extractPacks(packName, entryName) {
    entryName = entryName?.toLowerCase();

    // Determine which source packs to process.
    const packs = system.packs.filter((p) => !packName || p.name === packName);

    for (const packInfo of packs) {
        const src = path.join(STAGE_DEST, packInfo.name);
        const dest = path.join(PACK_DEST, packInfo.name);
        log.info(`Extracting pack ${packInfo.name}`);

        const folders = {};
        const containers = {};
        await extractPack(src, dest, {
            log: false,
            transformEntry: (e) => {
                if (e._key.startsWith("!folders"))
                    folders[e._id] = {
                        name: slugify(e.name),
                        folder: e.folder,
                    };
                return false;
            },
        });
        const buildPath = (collection, entry, parentKey) => {
            let parent = collection[entry[parentKey]];
            entry.path = entry.name;
            while (parent) {
                entry.path = path.join(parent.name, entry.path);
                parent = collection[parent[parentKey]];
            }
        };
        Object.values(folders).forEach((f) => buildPath(folders, f, "folder"));

        await extractPack(src, dest, {
            log: true,
            transformEntry: (entry) => {
                if (entryName && entryName !== entry.name.toLowerCase())
                    return false;
                cleanPackEntry(entry);
            },
            transformName: (entry) => {
                if (entry._id in folders)
                    return path.join(
                        "folder_",
                        folders[entry._id].path,
                        ".json",
                    );
                const outputName = slugify(entry.name);
                const parent =
                    containers[entry.system?.container] ??
                    folders[entry.folder];
                return path.join(parent?.path ?? "", `${outputName}.json`);
            },
        });
    }
}

/**
 * Standardize name format.
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
    return name
        .toLowerCase()
        .replace("'", "")
        .replace(/[^a-z0-9]+/gi, " ")
        .trim()
        .replace(/\s+|-{2,}/g, "-");
}
