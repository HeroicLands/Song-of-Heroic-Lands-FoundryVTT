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
 * Compendium pack library — compile / unpack / clean LevelDB packs.
 *
 * Wraps `@foundryvtt/foundryvtt-cli` over the packs a consuming repository
 * declares:
 *   - {@link compilePacks}: generates each pack's per-entry JSON from the
 *     `assets/content/` Markdown into `build/packs-json/<name>/` (via
 *     generate.mjs), then builds LevelDB from it; no committed JSON, no vault.
 *   - {@link unpackPacks}: extracts a compiled pack back to per-entry JSON,
 *     rebuilding folder paths.
 *   - {@link cleanPacks}: normalizes/strips extracted JSON.
 *
 * **This module has no import-time side effects.** It creates no directories,
 * reads no manifest, configures no logger, and parses no argv — every path and
 * pack list is a parameter, defaulted from the resolved build configuration
 * (#1508), which a caller may replace wholesale to compile another package's
 * tree. Those side effects belong to the command
 * line that drives it (`bin/build-compendiums.mjs`), so the library can be
 * imported by another repository's build, or by a test, without a stray
 * `build/` tree appearing or the shared `loglevel` singleton being
 * reconfigured (#1507). In particular, a *module* repository ships
 * `module.json` rather than `system.template.json`, so importing must not
 * depend on the latter existing.
 *
 * @module
 */

import fs from "fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import log from "loglevel";
import path from "path";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";
import { generatePacksJson, packJsonDir } from "./generate.mjs";
import { verifyPackSceneLevels } from "./scene-levels.mjs";
import { packConfig } from "./pack-config.mjs";

/* ----------------------------------------- */
/*  Compile Packs                            */
/* ----------------------------------------- */

/**
 * Generates each pack's per-entry JSON from `assets/content/` into
 * `build/packs-json/<name>/`, then builds the LevelDB output from it. No
 * committed JSON and no vault access. Destination: `<stageDest>/<name>/`.
 *
 * @param {object} opts
 * @param {object} [opts.config]         The resolved build configuration, which
 *     the two path arguments below default from. Supplying one is how a caller
 *     compiles a package other than this repository's (#1508).
 * @param {string[]} [opts.sourcePacks]  Every pack compiled from the content
 *     tree, in compile order. Defaults to the configured pack directories.
 * @param {string} [opts.stageDest]      Directory the LevelDB packs are built
 *     into, one subdirectory per pack. Defaults to the configured stage.
 * @param {string} [opts.packName]       Restrict the run to a single pack.
 * @throws {Error} If pack JSON generation reported any error. Packs compiled
 *     from incomplete or empty JSON ship blank or short compendiums, and the
 *     omission is invisible until a player looks for content that is not there
 *     (#1502) — so this is fatal, not a warning, and the caller is expected to
 *     turn it into a failing exit code.
 * @throws {Error} If a compiled pack ships a Scene that has lost its embedded
 *     Level (#1538). Fatal for the same reason: Foundry reads a missing Level
 *     record as "no levels" and persists that on the next world launch, so the
 *     map image is gone before anyone notices it was ever at risk. See
 *     {@link verifyPackSceneLevels}.
 */
export async function compilePacks({
    config = packConfig,
    sourcePacks = config.packDirectories,
    stageDest = config.paths.stage,
    packName,
} = {}) {
    const packNames = sourcePacks.filter(
        (name) => !packName || name === packName,
    );

    // Generate the per-entry JSON from the content tree into the build-only
    // JSON intermediate. The package-id guard runs first, inside this call,
    // before any pack is written.
    const errors = await generatePacksJson({ only: packName, config });
    if (errors > 0) {
        throw new Error(
            `Pack JSON generation reported ${errors} error(s); refusing to ` +
                `compile packs from incomplete output.`,
        );
    }

    for (const name of packNames) {
        const source = packJsonDir(name, config);
        if (!fs.existsSync(source)) {
            log.error(`Pack ${name}: generated JSON not found at ${source}.`);
            continue;
        }

        const stage = path.join(stageDest, name);
        log.info(`Pack ${name}: compiling to LevelDB at ${stage}`);
        await compilePack(source, stage, {
            recursive: true,
            log: false,
            transformEntry: cleanPackEntry,
        });

        // A Scene's map image lives on an embedded Level, stored under its own
        // LevelDB key. Nothing in Foundry ties the two together on read: a
        // missing Level record only warns, and the next world launch persists
        // the emptied `levels` array — so the map is lost for good and the
        // only symptom is a blank battlemap (#1538). Assert it on the bytes
        // just written, which is the one place the compendium CLI's write path
        // is observable.
        const problems = await verifyPackSceneLevels(stage);
        if (problems.length) {
            throw new Error(
                `Pack ${name}: ${problems.length} Scene/Level integrity ` +
                    `problem(s) in the compiled pack:\n  ` +
                    problems.join("\n  "),
            );
        }
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
 * @param {string} [options.lastModifiedBy]       The stamped author id. Defaults to
 *     the configured one — the same value `buildStats` stamps, so a compiled
 *     entry and a re-cleaned one never disagree (#1508).
 */
function cleanPackEntry(
    data,
    {
        clearSourceId = true,
        ownership = 0,
        lastModifiedBy = packConfig.stats.lastModifiedBy,
    } = {},
) {
    if (data.ownership) data.ownership = { default: ownership };
    if (clearSourceId) {
        delete data._stats?.compendiumSource;
        delete data.flags?.core?.sourceId;
    }
    delete data.flags?.importSource;
    delete data.flags?.exportSource;
    if (data._stats?.lastModifiedBy)
        data._stats.lastModifiedBy = lastModifiedBy;

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
 * @param {object} opts
 * @param {object} [opts.config]       The resolved build configuration, which
 *                                     `packDest` defaults from.
 * @param {string} [opts.packDest]     Directory holding the extracted per-entry
 *                                     JSON, one subdirectory per pack.
 * @param {string} [opts.packName]     Name of pack to clean. If none provided, all packs will be cleaned.
 * @param {string} [opts.entryName]    Name of a specific entry to clean.
 *
 * - `npm run build:clean` - Clean all source JSON files.
 * - `npm run build:clean -- classes` - Only clean the source files for the specified compendium.
 * - `npm run build:clean -- classes Barbarian` - Only clean a single item from the specified compendium.
 */
export async function cleanPacks({
    config = packConfig,
    packDest = config.paths.unpack,
    packName,
    entryName,
} = {}) {
    entryName = entryName?.toLowerCase();

    const folders = fs
        .readdirSync(packDest, { withFileTypes: true })
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
        for await (const src of _walkDir(path.join(packDest, folder.name))) {
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

/* ----------------------------------------- */
/*  Unpack Packs                             */
/* ----------------------------------------- */

/**
 * Extracts compiled LevelDB packs back to per-entry JSON, rebuilding the folder
 * hierarchy as directories.
 *
 * @param {object} opts
 * @param {Array<{name: string}>} opts.packs  The packs the shipped Foundry
 *     package declares — the manifest's `packs` array.
 * @param {object} [opts.config]       The resolved build configuration, which
 *                                     the two directories below default from.
 * @param {string} [opts.stageDest]    Directory holding the compiled LevelDB
 *                                     packs, one subdirectory per pack.
 * @param {string} [opts.packDest]     Directory the extracted JSON is written
 *                                     to, one subdirectory per pack.
 * @param {string} [opts.packName]     Restrict the run to a single pack.
 * @param {string} [opts.entryName]    Restrict the run to a single entry.
 */
export async function unpackPacks({
    packs,
    config = packConfig,
    stageDest = config.paths.stage,
    packDest = config.paths.unpack,
    packName,
    entryName,
}) {
    entryName = entryName?.toLowerCase();

    // Determine which source packs to process.
    const selected = packs.filter((p) => !packName || p.name === packName);

    for (const packInfo of selected) {
        const src = path.join(stageDest, packInfo.name);
        const dest = path.join(packDest, packInfo.name);
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
