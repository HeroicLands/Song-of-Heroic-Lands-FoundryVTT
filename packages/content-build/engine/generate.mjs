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
 * Reads the authoritative content tree at the configured content root and
 * compiles each pack's entries to per-entry JSON under its build directory
 * (`build/packs-json/<pack>/` in this repository). The JSON is
 * a disposable build intermediate consumed by `build:compiledb` (which turns it
 * into the shipped LevelDB packs) — it is never committed.
 *
 * Each `*` compiler walks the whole content tree and selects its own entries by
 * frontmatter (a `package:` matching the configured `contentPackage` + `type`),
 * so routing is directory-agnostic: a file lands in a pack because of its
 * `type`, not its location. Which packs exist, in what order, and which folder
 * hierarchy each one loads are all declared in `content-build.config.mjs`;
 * folder files live under the content root and are referenced from entry
 * frontmatter via `sohl.folder: <id>`.
 *
 * This replaces the retired `packs:export` (vault → committed `_source/`); the
 * HeroicLands vault is no longer a build input for SoHL content.
 */

import fs from "fs";
import path from "path";
import log from "loglevel";

import { Items } from "../sohl/items.mjs";
import { Journals } from "./journals.mjs";
import { Actors } from "../sohl/actors.mjs";
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
import { packConfig } from "./pack-config.mjs";
import { routerFor } from "./pack-router.mjs";

/**
 * The compiler class for each Foundry document type a pack may hold.
 *
 * The pack list is data (`content-build.config.mjs`), so the one thing it
 * cannot carry is the code that compiles it — a document type maps to its
 * compiler here. Unknown types fail the build rather than defaulting, so a pack
 * declaring a type nothing can compile is loud at the first pass instead of
 * shipping empty.
 */
const COMPILERS = {
    Item: Items,
    JournalEntry: Journals,
    Actor: Actors,
    Macro: Macros,
    Scene: Scenes,
};

/**
 * Root of the build-only JSON tree for one pack.
 *
 * @param {string} name - The pack name.
 * @param {object} [config] - The resolved build configuration. Defaults to this
 *   repository's.
 * @returns {string} The pack's JSON directory.
 */
export const packJsonDir = (name, config = packConfig) =>
    path.join(config.paths.packJson, name);

/**
 * The generated JSON of **every** configured Item pack — what the actors pass
 * reads its predefined items from.
 *
 * All of them, not the first: a repository may ship several Item packs (#1566),
 * and an actor's embedded items may be sourced from any of them. Finding one
 * pack and stopping is how embedded-item resolution would silently miss every
 * item that landed in another. Returned in configured order, which is also the
 * order they compile in, so a pack later in the list cannot be read before it
 * is written.
 *
 * @param {object} [config] - The resolved build configuration. Defaults to this
 *   repository's.
 * @returns {string[]} Each Item pack's JSON directory. Empty when the
 *   repository ships no items at all — the actors pass, which is the only
 *   caller that needs one, refuses that itself.
 */
export function itemPackJsonDirs(config = packConfig) {
    return config.packs
        .filter((pack) => pack.type === "Item")
        .map((pack) => packJsonDir(pack.name, config));
}

/**
 * Generate the per-entry JSON for one pack into `build/packs-json/<name>/`.
 *
 * @param {object} pack - One entry of the configured pack list.
 * @param {object} config - The resolved build configuration.
 * @param {object} router - The pack router, which decides which pack of this
 *     pass's document type each claimed note belongs in.
 * @param {boolean} routingReporter - Whether this pass reports a note of its
 *     document type that routes nowhere. True for the first configured pack of
 *     the type, so one unroutable note yields one error rather than one per
 *     pack.
 * @returns {Promise<{errors: number, compiled: number}>} The compiler's error
 *     count (0 on success) and the number of entries it wrote.
 */
async function generatePack(
    { name, type, folders, companions },
    config,
    router,
    routingReporter,
) {
    const contentBase = config.paths.content;
    const dest = packJsonDir(name, config);

    const packClass = COMPILERS[type];
    if (!packClass) {
        log.error(
            `Pack ${name}: no compiler for document type "${type}" — the ` +
                `configured pack list names a type this toolchain cannot compile.`,
        );
        return { errors: 1, compiled: 0 };
    }

    log.info(`Pack ${name}: ${contentBase} → ${dest}`);

    let folderList;
    let resolver;
    try {
        folderList =
            folders ? loadFolders(path.join(contentBase, folders)) : [];
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
        const companionDest = packJsonDir(companion.name, config);
        fs.rmSync(companionDest, { recursive: true, force: true });
        fs.mkdirSync(companionDest, { recursive: true });
        companionDests[companion.name] = companionDest;
    }

    writeFolderDocs(folderList, buildStats(undefined, config), dest, type);

    const pack = new packClass({
        contentBase,
        dest,
        companionDests,
        // The actors pass resolves each being's embedded items against the items
        // passes' output. That used to be an unwritten sibling-directory contract
        // (`path.resolve(dest, "..", "items")`); the configured pack list names
        // the Item packs, so the dependency is stated rather than assumed
        // (#1508) — and it is every Item pack, since a repository may ship more
        // than one (#1566).
        itemsSourceDirs: itemPackJsonDirs(config),
        folderResolver: resolver,
        packName: name,
        docType: type,
        router,
        routingReporter,
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
                `declare the package this build compiles (\`contentPackage\` in ` +
                `content-build.config.mjs), or declare the pack ` +
                `\`mayBeEmpty\` if it genuinely ships nothing.`,
        );
}

/**
 * Generate the build-only JSON for every pack (or one, when `only` is given).
 *
 * @param {object} [opts]
 * @param {string} [opts.only] - Restrict to a single pack name.
 * @param {object} [opts.config] - The resolved build configuration. Defaults to
 *   this repository's. Supplying one is how a caller compiles a *different*
 *   package's tree — and how the guard-order test below induces id drift, now
 *   that the manifest is located by configuration rather than by the working
 *   directory.
 * @returns {Promise<number>} Total error count across the generated packs.
 * @throws {Error} If the configured Foundry package id has drifted from the
 *   shipped manifest's `id` (see `package-manifest.mjs`).
 */
export async function generatePacksJson({ only, config = packConfig } = {}) {
    // Before anything is generated: every UUID written below is addressed to
    // FOUNDRY_PACKAGE_ID, so a value that has drifted from the shipped
    // manifest's `id` produces a whole pack of links that resolve nowhere.
    // Throws rather than counting an error — there is nothing worth compiling.
    //
    // This guard runs FIRST, before any pass; the empty-output guard below runs
    // LAST, folded into the same error total. Reversed, the build would still
    // exit non-zero, but only after emitting a whole tree of documents
    // addressing a package that does not ship them.
    assertPackageIdMatchesManifestFile(
        config.foundryPackage,
        config.paths.packageManifest,
    );

    const contentBase = config.paths.content;
    if (!fs.existsSync(contentBase)) {
        log.error(`Content tree not found at ${contentBase}.`);
        return 1;
    }
    // A tree that is present but empty compiles zero documents *without an
    // error*, and ships blank compendiums. Refuse instead: this only happens
    // when the generated tree was never exported, or exported from the wrong
    // place, and neither is something to build on.
    const noteCount = countContentNotes(contentBase);
    if (noteCount === 0) {
        log.error(
            `Content tree at ${contentBase} holds no notes, so every pack would ` +
                `compile empty. The configured content root is ` +
                `this repository's own source — check out the tree.`,
        );
        return 1;
    }
    log.info(`Content tree: ${noteCount} note(s) at ${contentBase}`);
    fs.mkdirSync(config.paths.packJson, { recursive: true });

    // A companion pack has no pass of its own — naming it selects the pass that
    // writes it, so `compile adventures` is not a silent no-op.
    const packs = config.packs.filter(
        (pack) =>
            !only ||
            pack.name === only ||
            pack.companions.some((companion) => companion.name === only),
    );
    // One router per configuration, so every pass agrees about where a note
    // goes, and the first pack of each document type owns the error message for
    // a note of that type that goes nowhere.
    const router = routerFor(config);
    const firstOfType = new Map();
    for (const pack of config.packs) {
        if (!firstOfType.has(pack.type)) firstOfType.set(pack.type, pack.name);
    }

    let totalErrors = 0;
    const passes = [];
    for (const pack of packs) {
        const { errors, compiled } = await generatePack(
            pack,
            config,
            router,
            firstOfType.get(pack.type) === pack.name,
        );
        totalErrors += errors;
        passes.push({
            name: pack.name,
            compiled,
            mayBeEmpty: pack.mayBeEmpty,
        });
    }

    for (const message of emptyPassErrors(passes)) {
        log.error(message);
        totalErrors++;
    }
    return totalErrors;
}
