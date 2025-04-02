import fs from "fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";
import { Characteristics } from "./characteristics.mjs";
import { Characters } from "./characters.mjs";
import { Creatures } from "./creatures.mjs";
import { Mysteries } from "./mysteries.mjs";
import { Possessions } from "./possessions.mjs";

const PACKS = {
    "characteristics": Characteristics,
    "mysteries": Mysteries,
    "possessions": Possessions,
    "characters": Characters,
    "creatures": Creatures,
};

/**
 * Base folder for the data files.
 * @type {string}
 */
const DATA_BASE = path.resolve("./assets/packs");
const PACK_DEST = path.resolve("./build/tmp/packs");
const STAGE_DEST = path.resolve("./build/stage/packs");

fs.mkdirSync(PACK_DEST, { recursive: true });

// Load system.json.
const system = JSON.parse(
    fs.readFileSync("./assets/system.template.json", { encoding: "utf8" }),
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
                choices: ["compile", "unpack", "pack", "clean"],
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
                case "pack":
                    return await packPacks(pack);
                case "unpack":
                    return await extractPacks(pack, entry);
            }
        },
    };
}

/* ----------------------------------------- */
/*  Compile Packs                            */
/* ----------------------------------------- */

async function compilePacks(packName) {
    const packs = system.packs.filter((p) => !packName || p.name === packName);

    for (const packInfo of packs) {
        const packClass = PACKS[packInfo.name];
        if (!packClass) {
            log.warn(
                `No pack class found for ${packInfo.name}, skipping...`,
            );
            continue;
        }

        const src = path.join(DATA_BASE, packInfo.name, "data");
        const dest = path.join(PACK_DEST, packInfo.name);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        log.info(`Compiling pack ${packInfo.name}`);
        const pack = new packClass(src, dest);
        await pack.compile();
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
        data._stats.lastModifiedBy = "sohlbuilder0000";

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

async function packPacks(packName) {
    const packs = system.packs.filter((p) => !packName || p.name === packName);

    for (const packInfo of packs) {
        const src = path.join(PACK_DEST, packInfo.name);
        const dest = path.join(STAGE_DEST, packInfo.name);
        if (!fs.existsSync(src)) {
            log.warn(
                `No source files exist for pack ${packInfo.name}, skipping...`,
            );
            continue;
        }
        log.info(`Packing pack ${packInfo.name}`);
        await compilePack(src, dest, {
            recursive: true,
            log: false,
            transformEntry: cleanPackEntry,
        });
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
