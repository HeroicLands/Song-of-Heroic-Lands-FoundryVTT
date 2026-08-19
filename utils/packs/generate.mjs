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
 * Pack JSON generation — in-repo Markdown → per-entry JSON (build-only).
 *
 * Reads the authoritative content tree at `assets/content/` and compiles each
 * pack's entries to per-entry JSON under `build/packs-json/<pack>/`. The JSON is
 * a disposable build intermediate consumed by `build:compiledb` (which turns it
 * into the shipped LevelDB packs) — it is never committed.
 *
 * Each `*` compiler walks the whole content tree and selects its own entries by
 * frontmatter (a `package:` matching `CONTENT_PACKAGE` + `type`), so routing is
 * directory-agnostic: a file lands in a pack because of its `type`, not its
 * location. Folder
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
import { Macros } from "./macros.mjs";
import { Scenes } from "./scenes.mjs";
import {
    buildStats,
    loadFolders,
    buildFolderResolver,
    writeFolderDocs,
} from "./helpers.mjs";
import { countContentNotes } from "./content-tree.mjs";
import { assertPackageIdMatchesManifestFile } from "./package-manifest.mjs";

/** Authoritative in-repo content tree — the single source for shipped content. */
const CONTENT_BASE = path.resolve("./assets/content");

/** Build-only JSON intermediate root (gitignored; consumed by build:compiledb). */
const BUILD_JSON_ROOT = path.resolve("./build/packs-json");

const STATS_VERSION = "0.6.0";

/**
 * One entry per compiled pack. `folders` names the pack's folder-hierarchy file
 * under {@link CONTENT_BASE}; `packClass` selects its own entries from the tree
 * by frontmatter.
 *
 * A pass is expected to compile at least one entry: every pack listed here has
 * notes in this repository's tree, so zero output means the selection went
 * wrong, not that there was nothing to select. A package whose tree genuinely
 * holds no notes of a pack's kind says so with `mayBeEmpty: true` — an explicit
 * declaration, so the guard stays meaningful for every other pack.
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
    {
        name: "macros",
        packClass: Macros,
        documentType: "Macro",
        folders: "macro-folders.yaml",
    },
    // One pass, two packs: every map note's Scene, and the Adventure bundling
    // the pinned ones with their journals so `keepId: true` import makes the
    // pins resolve (#1525).
    {
        name: "scenes",
        packClass: Scenes,
        documentType: "Scene",
        folders: "scene-folders.yaml",
        companions: ["adventures"],
    },
];

/** Root of the build-only JSON tree for one pack. */
export const packJsonDir = (name) => path.join(BUILD_JSON_ROOT, name);

/**
 * Generate the per-entry JSON for one pack into `build/packs-json/<name>/`.
 *
 * @param {object} config - A {@link PACK_CONFIGS} entry.
 * @returns {Promise<{errors: number, compiled: number}>} The compiler's error
 *     count (0 on success) and the number of entries it wrote.
 */
async function generatePack({
    name,
    packClass,
    documentType,
    folders,
    companions = [],
}) {
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
        return { errors: 1, compiled: 0 };
    }

    // Wipe and recreate so removed content notes leave no stale JSON.
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });

    // A companion pack is written by the same pass — the scenes pass also emits
    // the adventures that bundle them — so it is wiped on the same schedule.
    const companionDests = {};
    for (const companion of companions) {
        const companionDest = packJsonDir(companion);
        fs.rmSync(companionDest, { recursive: true, force: true });
        fs.mkdirSync(companionDest, { recursive: true });
        companionDests[companion] = companionDest;
    }

    writeFolderDocs(folderList, buildStats(STATS_VERSION), dest, documentType);

    const pack = new packClass({
        contentBase: CONTENT_BASE,
        dest,
        companionDests,
        folderResolver: resolver,
    });
    await pack.compile();
    return { errors: pack.errorCount, compiled: pack.compiledCount };
}

/**
 * The passes that compiled nothing when they were expected to compile
 * something — a build failure, not a quiet no-op.
 *
 * A pack compiler selects its entries by the configured content package, so a
 * single wrong package id rejects every note in a perfectly good tree and every
 * pack ships blank while the build exits 0 (#1502). The empty-tree guard in
 * {@link generatePacksJson} cannot see that: the tree is full, it is the
 * *output* that is empty.
 *
 * @param {Array<{name: string, compiled: number, mayBeEmpty?: boolean}>} passes -
 *     One entry per generated pack.
 * @returns {string[]} One message per pass that must not have been empty.
 */
export function emptyPassErrors(passes) {
    return passes
        .filter((pass) => !pass.mayBeEmpty && pass.compiled === 0)
        .map(
            (pass) =>
                `Pack "${pass.name}" compiled 0 entries from a non-empty ` +
                `content tree. Every note was rejected — check that the notes ` +
                `declare the package this build compiles (CONTENT_PACKAGE in ` +
                `utils/packs/content-package.mjs), or declare the pack ` +
                `\`mayBeEmpty\` if it genuinely ships nothing.`,
        );
}

/**
 * Generate the build-only JSON for every pack (or one, when `only` is given).
 *
 * @param {object} [opts]
 * @param {string} [opts.only] - Restrict to a single pack name.
 * @returns {Promise<number>} Total error count across the generated packs.
 * @throws {Error} If the configured Foundry package id has drifted from the
 *   shipped manifest's `id` (see `package-manifest.mjs`).
 */
export async function generatePacksJson({ only } = {}) {
    // Before anything is generated: every UUID written below is addressed to
    // FOUNDRY_PACKAGE_ID, so a value that has drifted from the shipped
    // manifest's `id` produces a whole pack of links that resolve nowhere.
    // Throws rather than counting an error — there is nothing worth compiling.
    assertPackageIdMatchesManifestFile();

    if (!fs.existsSync(CONTENT_BASE)) {
        log.error(`Content tree not found at ${CONTENT_BASE}.`);
        return 1;
    }
    // A tree that is present but empty compiles zero documents *without an
    // error*, and ships blank compendiums. Refuse instead: this only happens
    // when the generated tree was never exported, or exported from the wrong
    // place, and neither is something to build on.
    const noteCount = countContentNotes(CONTENT_BASE);
    if (noteCount === 0) {
        log.error(
            `Content tree at ${CONTENT_BASE} holds no notes, so every pack would ` +
                `compile empty. assets/content/ is this ` +
                `repository's own source — check out the tree.`,
        );
        return 1;
    }
    log.info(`Content tree: ${noteCount} note(s) at ${CONTENT_BASE}`);
    fs.mkdirSync(BUILD_JSON_ROOT, { recursive: true });

    // A companion pack has no config of its own — naming it selects the pass
    // that writes it, so `compile adventures` is not a silent no-op.
    const configs = PACK_CONFIGS.filter(
        (c) => !only || c.name === only || (c.companions ?? []).includes(only),
    );
    let totalErrors = 0;
    const passes = [];
    for (const config of configs) {
        const { errors, compiled } = await generatePack(config);
        totalErrors += errors;
        passes.push({
            name: config.name,
            compiled,
            mayBeEmpty: config.mayBeEmpty === true,
        });
    }

    for (const message of emptyPassErrors(passes)) {
        log.error(message);
        totalErrors++;
    }
    return totalErrors;
}
