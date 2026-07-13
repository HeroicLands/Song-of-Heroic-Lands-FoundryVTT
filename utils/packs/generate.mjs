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
 * Pack JSON generation — in-repo Markdown → per-entry JSON (build-only).
 *
 * Reads the authoritative content tree at `assets/content/` and compiles each
 * pack's entries to per-entry JSON under `build/packs-json/<pack>/`. The JSON is
 * a disposable build intermediate consumed by `build:compiledb` (which turns it
 * into the shipped LevelDB packs) — it is never committed.
 *
 * Each `*` compiler walks the whole content tree and selects its own entries by
 * frontmatter (`package: sohl` + `type`), so routing is directory-agnostic: a
 * file lands in a pack because of its `type`, not its location. Folder
 * hierarchies are declared per pack in `assets/content/<singular>-folders.yaml`
 * and referenced from entry frontmatter via `sohl.folder: <id>`.
 *
 * This replaces the retired `packs:export` (vault → committed `_source/`); the
 * HeroicLands vault is no longer a build input for SoHL content.
 */

import fs from "fs";
import path from "path";
import log from "loglevel";

import { Items } from "./items.mjs";
import { Journals } from "./journals.mjs";
import { Actors } from "./actors.mjs";
import {
    buildStats,
    loadFolders,
    buildFolderResolver,
    writeFolderDocs,
} from "./helpers.mjs";

/** Authoritative in-repo content tree — the single source for shipped content. */
const CONTENT_BASE = path.resolve("./assets/content");

/** Build-only JSON intermediate root (gitignored; consumed by build:compiledb). */
const BUILD_JSON_ROOT = path.resolve("./build/packs-json");

const STATS_VERSION = "0.6.0";

/**
 * One entry per compiled pack. `folders` names the pack's folder-hierarchy file
 * under {@link CONTENT_BASE}; `packClass` selects its own entries from the tree
 * by frontmatter.
 */
const PACK_CONFIGS = [
    {
        name: "items",
        packClass: Items,
        documentType: "Item",
        folders: "item-folders.yaml",
    },
    {
        name: "journals",
        packClass: Journals,
        documentType: "JournalEntry",
        folders: "journal-folders.yaml",
    },
    {
        name: "actors",
        packClass: Actors,
        documentType: "Actor",
        folders: "actor-folders.yaml",
    },
];

/** Root of the build-only JSON tree for one pack. */
export const packJsonDir = (name) => path.join(BUILD_JSON_ROOT, name);

/**
 * Generate the per-entry JSON for one pack into `build/packs-json/<name>/`.
 *
 * @param {object} config - A {@link PACK_CONFIGS} entry.
 * @returns {Promise<number>} The compiler's error count (0 on success).
 */
async function generatePack({ name, packClass, documentType, folders }) {
    const dest = packJsonDir(name);
    const foldersFile = path.join(CONTENT_BASE, folders);

    log.info(`Pack ${name}: ${CONTENT_BASE} → ${dest}`);

    let folderList;
    let resolver;
    try {
        folderList = loadFolders(foldersFile);
        ({ resolver } = buildFolderResolver(folderList));
    } catch (err) {
        log.error(`${name} ${folders} validation failed: ${err.message}`);
        return 1;
    }

    // Wipe and recreate so removed content notes leave no stale JSON.
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });

    writeFolderDocs(folderList, buildStats(STATS_VERSION), dest, documentType);

    const pack = new packClass({
        contentBase: CONTENT_BASE,
        dest,
        folderResolver: resolver,
    });
    await pack.compile();
    return pack.errorCount;
}

/**
 * Generate the build-only JSON for every pack (or one, when `only` is given).
 *
 * @param {object} [opts]
 * @param {string} [opts.only] - Restrict to a single pack name.
 * @returns {Promise<number>} Total error count across the generated packs.
 */
export async function generatePacksJson({ only } = {}) {
    if (!fs.existsSync(CONTENT_BASE)) {
        log.error(`Content tree not found at ${CONTENT_BASE}.`);
        return 1;
    }
    fs.mkdirSync(BUILD_JSON_ROOT, { recursive: true });

    const configs = PACK_CONFIGS.filter((c) => !only || c.name === only);
    let totalErrors = 0;
    for (const config of configs) {
        totalErrors += await generatePack(config);
    }
    return totalErrors;
}
