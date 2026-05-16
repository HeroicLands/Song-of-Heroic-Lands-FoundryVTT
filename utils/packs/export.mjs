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
 * Pack export CLI — vault → committed JSON tree.
 *
 * Reads the HeroicLands vault and writes per-entry JSON to each pack's
 * `assets/packs/<name>/_source/` tree. The compiled LevelDB packs are
 * produced later by `npm run build:compiledb`, which only needs the
 * committed JSON — contributors without the vault can build without
 * running export.
 *
 * Folder hierarchies are declared in each pack's `folders.yaml`. Vault
 * frontmatter references folders by id (e.g.
 * `sohl.folder: O9ilOMwjidmb04JY`); unknown ids fail the export.
 */

import fs from "fs";
import path from "path";
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";

import { Items } from "./items.mjs";
import { Journals } from "./journals.mjs";
import {
    buildStats,
    loadFolders,
    buildFolderResolver,
    writeFolderDocs,
} from "./helpers.mjs";

const VAULT_BASE = path.resolve("../HeroicLands");
const PACKS_ROOT = path.resolve("./assets/packs");
const STATS_VERSION = "0.6.0";

/**
 * Packs that source content from the vault. Each entry drives one
 * export pass: load folders.yaml, wipe and recreate `<packRoot>/_source/`,
 * write folder docs, then run the pack's compiler.
 */
const PACK_CONFIGS = [
    { name: "items", packClass: Items, documentType: "Item" },
    { name: "journals", packClass: Journals, documentType: "JournalEntry" },
];

log.setLevel("info");
prefix.reg(log);
prefix.apply(log, {
    format(level, _name, timestamp) {
        return `[${timestamp}] [${level.toUpperCase()}]:`;
    },
    timestampFormatter(date) {
        return date.toISOString();
    },
});

/* ------------------------------------------------------------------------ */
/*  Main                                                                    */
/* ------------------------------------------------------------------------ */

async function exportPack({ name, packClass, documentType }) {
    const packRoot = path.join(PACKS_ROOT, name);
    const sourceDir = path.join(packRoot, "_source");
    const foldersFile = path.join(packRoot, "folders.yaml");

    log.info(`Pack ${name}: → ${sourceDir}`);

    let folderList;
    let resolver;
    try {
        folderList = loadFolders(foldersFile);
        ({ resolver } = buildFolderResolver(folderList));
    } catch (err) {
        log.error(`${name} folders.yaml validation failed: ${err.message}`);
        return 1;
    }

    // Wipe and recreate _source/ so deleted vault notes don't leave stale JSON.
    fs.rmSync(sourceDir, { recursive: true, force: true });
    fs.mkdirSync(sourceDir, { recursive: true });

    writeFolderDocs(folderList, buildStats(STATS_VERSION), sourceDir, documentType);

    const pack = new packClass({
        vaultBase: VAULT_BASE,
        dest: sourceDir,
        folderResolver: resolver,
    });
    await pack.compile();
    return pack.errorCount;
}

async function main() {
    if (!fs.existsSync(VAULT_BASE)) {
        log.error(
            `HeroicLands vault not found at ${VAULT_BASE}. The export step requires the vault as a sibling repo.`,
        );
        process.exit(1);
    }

    log.info(`Vault: ${VAULT_BASE}`);

    let totalErrors = 0;
    for (const config of PACK_CONFIGS) {
        totalErrors += await exportPack(config);
    }

    if (totalErrors > 0) {
        log.error(
            `Export completed with ${totalErrors} error(s). _source/ tree(s) may be partial.`,
        );
        process.exit(1);
    }

    log.info("Export complete.");
}

main().catch((err) => {
    log.error(err.stack || err.message);
    process.exit(1);
});
