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
 * The per-repository configuration contract for `@heroiclands/content-build`.
 *
 * Every consuming repository declares one `content-build.config.mjs` at its
 * root:
 *
 * ```js
 * import { defineConfig } from "@heroiclands/content-build";
 *
 * export default defineConfig({
 *     rootDir: import.meta.dirname,
 *     contentPackage: "sohl",
 *     foundryPackage: "sohl",
 *     packageKind: "systems",
 *     stats: {
 *         systemId: "sohl",
 *         systemVersion: "0.6.0",
 *         lastModifiedBy: "sohlbuilder00000",
 *     },
 *     skipDirectories: ["Templates"],
 *     packs: [
 *         { name: "items", type: "Item", folders: "item-folders.yaml" },
 *         { name: "journals", type: "JournalEntry", label: "Journals" },
 *     ],
 *     assets: [{ from: "assets/icons", to: "assets/icons" }],
 *     publish: { site: true, manifests: { publish: true, consume: true } },
 * });
 * ```
 *
 * `defineConfig` is the whole of the contract: it validates the object, fills
 * the optional halves with their defaults, and returns a deeply frozen copy.
 * It performs no I/O and knows nothing about any particular package's content —
 * a consumer's config is data, and the compilers read it.
 *
 * **Configuration supplies paths, never captured values (#1508).** `rootDir`
 * anchors every path so the build reads the same files whatever directory it
 * was launched from, and `paths.packageManifest` is the *one* place the shipped
 * Foundry manifest is located — the package-id guard and the compiled packs'
 * `_stats.coreVersion` stamp both read it from there. The core version itself is
 * deliberately absent: it lives in the manifest's `compatibility.minimum`, which
 * moves with test evidence, and a copy here would silently stop following it.
 *
 * @module
 */

import path from "node:path";

// A leaf with no local imports of its own, so naming it here cannot close a
// cycle around a consumer's config file (see `engine/pack-config.mjs`).
import { MAP_TYPES } from "./engine/ids.mjs";

/**
 * The two kinds of Foundry package a content module can be built into. The
 * value is also the directory Foundry installs the package under, which is why
 * it is plural.
 *
 * @satisfies {readonly PackageKind[]}
 */
export const PACKAGE_KINDS = /** @type {const} */ (["systems", "modules"]);

/**
 * The directories the build reads from and writes to, relative to `rootDir`,
 * with the layout a HeroicLands content repository conventionally uses. A
 * consumer overrides only the ones it moves.
 *
 * `packageManifest` is the directory holding `system.template.json` or
 * `module.template.json` — hoisted once, and read by both the package-id drift
 * guard and the `_stats.coreVersion` stamp (#1508).
 */
export const DEFAULT_PATHS = /** @type {const} */ ({
    content: "assets/content",
    packageManifest: "assets/templates",
    manifests: "assets/manifests",
    packJson: "build/packs-json",
    stage: "build/stage/packs",
    unpack: "build/tmp/packs",
});

/**
 * The Foundry document types a compendium pack may hold. This is the set the
 * toolchain is able to compile a pack of; a document type Foundry supports but
 * this toolchain does not compile is deliberately absent (see #1501 — playlists
 * and roll tables are out of scope).
 *
 * @satisfies {readonly PackDocumentType[]}
 */
export const PACK_DOCUMENT_TYPES = /** @type {const} */ ([
    "Actor",
    "Adventure",
    "Item",
    "JournalEntry",
    "Macro",
    "Scene",
]);

/**
 * @typedef {"systems" | "modules"} PackageKind
 */

/**
 * @typedef {"Actor" | "Adventure" | "Item" | "JournalEntry" | "Macro" | "Scene"} PackDocumentType
 */

/**
 * One compendium pack the build compiles, named exactly as it is declared in
 * the package manifest's `packs` array.
 *
 * Several packs may share a `type`. The `type` selects the **compiler** that
 * fills the pack; a note's `pack:` frontmatter selects **which pack of that
 * type** receives its document. The two are orthogonal, and both are needed
 * once a repository groups same-type documents editorially — which it may have
 * to, since a compendium UUID carries its pack name and collapsing such a
 * layout breaks every stored reference (#1566).
 *
 * @typedef {object} PackSpec
 * @property {string} name              Pack name — the manifest `name`, and the
 *                                      directory under `packs/`.
 * @property {PackDocumentType} type    Foundry document type the pack holds.
 * @property {string} [label]           Human-readable label. Defaults to `name`.
 * @property {boolean} [private]        Whether the pack is GM-only. Default `false`.
 * @property {string|null} [folders]    The pack's folder-hierarchy file, relative
 *                                      to `paths.content`. Default `null` — no
 *                                      folder documents are emitted.
 * @property {PackSpec[]} [companions]  Packs written by this pack's own compiler
 *                                      pass rather than a pass of their own (the
 *                                      scenes pass also emits the adventures
 *                                      bundling them). Default `[]`.
 * @property {boolean} [mayBeEmpty]     Whether a pass compiling zero entries is
 *                                      legitimate rather than a build failure.
 *                                      Default `false`.
 * @property {boolean} [default]        Whether this is the pack of its `type`
 *                                      that receives notes declaring no `pack:`
 *                                      of their own. Default `false`. A type
 *                                      with exactly one pack is its default
 *                                      implicitly; a type with several and no
 *                                      `default: true` requires every note of
 *                                      that type to declare one. Not permitted
 *                                      on a companion — no note is routed into
 *                                      one. See `engine/pack-router.mjs`.
 */

/**
 * The normalized form of a {@link PackSpec}: every optional half filled in.
 *
 * @typedef {object} ResolvedPackSpec
 * @property {string} name
 * @property {PackDocumentType} type
 * @property {string} label
 * @property {boolean} private
 * @property {string|null} folders
 * @property {readonly Readonly<ResolvedPackSpec>[]} companions
 * @property {boolean} mayBeEmpty
 * @property {boolean} default
 */

/**
 * The directories a consumer may relocate, each relative to `rootDir`.
 *
 * @typedef {object} PathsInput
 * @property {string} [content]          Content tree root.
 * @property {string} [packageManifest]  Directory holding the Foundry manifest template.
 * @property {string} [manifests]        Vendored cross-package link manifests.
 * @property {string} [packJson]         Build-only per-entry JSON intermediate.
 * @property {string} [stage]            Compiled LevelDB packs.
 * @property {string} [unpack]           Where `unpack` extracts JSON back to.
 */

/**
 * {@link PathsInput}, resolved to absolute paths against `rootDir`.
 *
 * @typedef {object} ResolvedPaths
 * @property {string} content
 * @property {string} packageManifest
 * @property {string} manifests
 * @property {string} packJson
 * @property {string} stage
 * @property {string} unpack
 */

/**
 * The identity every compiled document's `_stats` block carries.
 *
 * `coreVersion` is **not** here: it is read from the manifest at
 * `paths.packageManifest`, so it always follows the floor the package actually
 * declares (#1508).
 *
 * @typedef {object} StatsSpec
 * @property {string} systemId          The game system the documents are for —
 *                                      `"sohl"` even for a module, which ships
 *                                      content *for* the system rather than being it.
 * @property {string} systemVersion     The system version the packs were built against.
 * @property {string} lastModifiedBy    The 16-character id stamped as the author.
 */

/**
 * One asset copy the build performs, relative to the repository root and the
 * staged package root respectively.
 *
 * @typedef {object} AssetSpec
 * @property {string} from  Source path, relative to the repository root.
 * @property {string} to    Destination path, relative to the staged package root.
 */

/**
 * The two manifest switches. A package may publish a link manifest, consume
 * other packages' manifests, both, or neither — the four combinations are all
 * real (see #1385/#1446: `kethira` consumes but never publishes).
 *
 * @typedef {object} ManifestSwitches
 * @property {boolean} publish  Emit this package's link manifest.
 * @property {boolean} consume  Resolve cross-package links through vendored manifests.
 */

/**
 * @typedef {object} PublishSwitches
 * @property {boolean} site           Render this package's knowledgebase/site pages.
 * @property {ManifestSwitches} manifests
 */

/**
 * @typedef {object} ManifestSwitchesInput
 * @property {boolean} [publish]
 * @property {boolean} [consume]
 */

/**
 * @typedef {object} PublishSwitchesInput
 * @property {boolean} [site]
 * @property {ManifestSwitchesInput} [manifests]
 */

/**
 * The configuration a consumer writes.
 *
 * @typedef {object} ContentBuildConfigInput
 * @property {string} rootDir               Absolute path of the consuming
 *                                          repository — every configured path is
 *                                          resolved against it, so the build never
 *                                          depends on the working directory.
 * @property {string} contentPackage        Content package name — the value each
 *                                          content note carries in its `package:`
 *                                          frontmatter.
 * @property {string} foundryPackage        Foundry package id, as it appears in
 *                                          `system.json` / `module.json`.
 * @property {PackageKind} packageKind      Whether the package is a system or a module.
 * @property {StatsSpec} stats              Identity stamped into every document's `_stats`.
 * @property {Record<string, Function>} [itemBuilders]  The consumer's item-type
 *                                          registry: each content `type` that
 *                                          compiles into an Item, paired with the
 *                                          builder producing its `system` block.
 *                                          Default `{}` — a content module that
 *                                          ships no items declares none.
 * @property {PackSpec[]} packs             Packs to compile. More than one entry
 *                                          may share a `type`: a note then names
 *                                          the pack it belongs in with its
 *                                          `pack:` frontmatter, and one pack of
 *                                          the type is marked `default: true` to
 *                                          receive the notes that name none
 *                                          (#1566).
 * @property {PathsInput} [paths]           Layout overrides. See {@link DEFAULT_PATHS}.
 * @property {string[]} [skipDirectories]   Directory names the content walk ignores
 *                                          wherever they appear (e.g. Obsidian's
 *                                          `Templates`). Default `[]`.
 * @property {AssetSpec[]} [assets]         Assets to stage. Default `[]`.
 * @property {PublishSwitchesInput} [publish]  Publishing switches. Each defaults to off.
 */

/**
 * The normalized, frozen configuration the toolchain reads.
 *
 * @typedef {object} ContentBuildConfig
 * @property {string} rootDir
 * @property {string} contentPackage
 * @property {string} foundryPackage
 * @property {PackageKind} packageKind
 * @property {string} assetRoot        Derived: the served Foundry asset root,
 *                                     `<packageKind>/<foundryPackage>/assets`.
 * @property {Readonly<ResolvedPaths>} paths
 * @property {Readonly<StatsSpec>} stats
 * @property {Readonly<Record<string, Function>>} itemBuilders
 * @property {ReadonlySet<string>} itemTypes       Derived: the keys of
 *                                     {@link ContentBuildConfigInput.itemBuilders},
 *                                     so the accepted item types and the builder
 *                                     table are one list (#1504).
 * @property {ReadonlySet<string>} docEntryTypes   Derived: every type whose prose
 *                                     compiles into a JournalEntry of its own —
 *                                     the item types, plus `macro`, plus the map
 *                                     types. The one set the compilers and the
 *                                     link-manifest emitter both read.
 * @property {readonly string[]} skipDirectories
 * @property {readonly Readonly<ResolvedPackSpec>[]} packs
 * @property {readonly string[]} packDirectories  Derived: every pack directory
 *                                     the build produces, in compile order —
 *                                     each pack followed by its companions.
 * @property {readonly Readonly<AssetSpec>[]} assets
 * @property {Readonly<PublishSwitches>} publish
 */

const CONFIG_KEYS = [
    "rootDir",
    "contentPackage",
    "foundryPackage",
    "packageKind",
    "stats",
    "itemBuilders",
    "paths",
    "skipDirectories",
    "packs",
    "assets",
    "publish",
];
const PACK_KEYS = [
    "name",
    "type",
    "label",
    "private",
    "folders",
    "companions",
    "mayBeEmpty",
    "default",
];
const PATH_KEYS = Object.keys(DEFAULT_PATHS);
const STATS_KEYS = ["systemId", "systemVersion", "lastModifiedBy"];
const ASSET_KEYS = ["from", "to"];
const PUBLISH_KEYS = ["site", "manifests"];
const MANIFEST_KEYS = ["publish", "consume"];

/** @param {unknown} value */
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {string} field
 * @param {string} problem
 * @returns {never}
 */
function fail(field, problem) {
    throw new TypeError(`content-build config: \`${field}\` ${problem}.`);
}

/**
 * @param {object} object
 * @param {readonly string[]} allowed
 * @param {string} where
 */
function rejectUnknownKeys(object, allowed, where) {
    for (const key of Object.keys(object)) {
        if (!allowed.includes(key)) {
            fail(
                `${where}${key}`,
                `is not a recognized option (expected one of: ${allowed.join(", ")})`,
            );
        }
    }
}

/**
 * @param {unknown} value
 * @param {string} field
 * @returns {string}
 */
function requireNonEmptyString(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
        fail(field, "must be a non-empty string");
    }
    return /** @type {string} */ (value);
}

/**
 * @param {unknown} value
 * @param {string} field
 * @param {boolean} fallback
 * @returns {boolean}
 */
function optionalBoolean(value, field, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") fail(field, "must be a boolean");
    return /** @type {boolean} */ (value);
}

/**
 * @param {unknown} value
 * @param {string} where       Field path used in error messages.
 * @param {boolean} [nested]   Whether this is a companion, which may not nest
 *                             companions of its own.
 * @returns {Readonly<ResolvedPackSpec>}
 */
function normalizePack(value, where, nested = false) {
    if (!isPlainObject(value)) fail(where, "must be an object");
    const pack = /** @type {Record<string, unknown>} */ (value);
    rejectUnknownKeys(pack, PACK_KEYS, `${where}.`);

    const name = requireNonEmptyString(pack.name, `${where}.name`);
    const type = pack.type;
    if (
        typeof type !== "string" ||
        !(/** @type {readonly string[]} */ (PACK_DOCUMENT_TYPES).includes(type))
    ) {
        fail(
            `${where}.type`,
            `must be one of: ${PACK_DOCUMENT_TYPES.join(", ")}`,
        );
    }

    if (pack.folders !== undefined && pack.folders !== null) {
        requireNonEmptyString(pack.folders, `${where}.folders`);
    }

    const companionsInput = pack.companions;
    if (companionsInput !== undefined && !Array.isArray(companionsInput)) {
        fail(`${where}.companions`, "must be an array");
    }
    if (nested && pack.default !== undefined) {
        fail(
            `${where}.default`,
            "may not be declared on a companion: a companion is written by " +
                "another pack's pass, so no note is ever routed into one",
        );
    }
    if (nested && Array.isArray(companionsInput) && companionsInput.length) {
        fail(
            `${where}.companions`,
            "may not nest: a companion is written by another pack's pass, and " +
                "that pass is the only level of indirection the build has",
        );
    }
    const companions = (companionsInput ?? []).map((companion, index) =>
        normalizePack(companion, `${where}.companions[${index}]`, true),
    );

    /** @type {ResolvedPackSpec} */
    const normalized = {
        name,
        type: /** @type {PackDocumentType} */ (type),
        label:
            pack.label === undefined ?
                name
            :   requireNonEmptyString(pack.label, `${where}.label`),
        private: optionalBoolean(pack.private, `${where}.private`, false),
        folders:
            pack.folders === undefined || pack.folders === null ?
                null
            :   /** @type {string} */ (pack.folders),
        companions: Object.freeze(companions),
        mayBeEmpty: optionalBoolean(
            pack.mayBeEmpty,
            `${where}.mayBeEmpty`,
            false,
        ),
        // Which pack of a type receives a note that declares none. Validated
        // across the whole list in `defineConfig` — at most one per type.
        default: optionalBoolean(pack.default, `${where}.default`, false),
    };
    return Object.freeze(normalized);
}

/**
 * Resolve the layout a consumer supplies against its `rootDir`, filling every
 * unnamed directory from {@link DEFAULT_PATHS}.
 *
 * Configured paths are **relative by contract**: an absolute one would escape
 * the repository the config anchors, which is never what a consumer means and
 * is what made these paths working-directory-dependent in the first place.
 *
 * @param {unknown} value
 * @param {string} rootDir
 * @returns {Readonly<ResolvedPaths>}
 */
function normalizePaths(value, rootDir) {
    if (value !== undefined && !isPlainObject(value)) {
        fail("paths", "must be an object");
    }
    const input = /** @type {Record<string, unknown>} */ (value ?? {});
    rejectUnknownKeys(input, PATH_KEYS, "paths.");

    /** @type {Record<string, string>} */
    const resolved = {};
    for (const key of PATH_KEYS) {
        const raw =
            input[key] === undefined ?
                /** @type {Record<string, string>} */ (DEFAULT_PATHS)[key]
            :   requireNonEmptyString(input[key], `paths.${key}`);
        if (path.isAbsolute(raw)) {
            fail(
                `paths.${key}`,
                "must be relative to rootDir, so a consumer's layout travels " +
                    "with its repository",
            );
        }
        resolved[key] = path.resolve(rootDir, raw);
    }
    return Object.freeze(/** @type {ResolvedPaths} */ (resolved));
}

/**
 * @param {unknown} value
 * @returns {Readonly<StatsSpec>}
 */
function normalizeStats(value) {
    if (!isPlainObject(value)) fail("stats", "must be an object");
    const input = /** @type {Record<string, unknown>} */ (value);
    rejectUnknownKeys(input, STATS_KEYS, "stats.");

    return Object.freeze({
        systemId: requireNonEmptyString(input.systemId, "stats.systemId"),
        systemVersion: requireNonEmptyString(
            input.systemVersion,
            "stats.systemVersion",
        ),
        lastModifiedBy: requireNonEmptyString(
            input.lastModifiedBy,
            "stats.lastModifiedBy",
        ),
    });
}

/**
 * @param {unknown} value
 * @param {number} index
 * @returns {Readonly<AssetSpec>}
 */
function normalizeAsset(value, index) {
    const where = `assets[${index}]`;
    if (!isPlainObject(value)) fail(where, "must be an object");
    const asset = /** @type {Record<string, unknown>} */ (value);
    rejectUnknownKeys(asset, ASSET_KEYS, `${where}.`);

    return Object.freeze({
        from: requireNonEmptyString(asset.from, `${where}.from`),
        to: requireNonEmptyString(asset.to, `${where}.to`),
    });
}

/**
 * Validate a consumer's item-type registry.
 *
 * The registry is *code* a consumer supplies — the only place the configuration
 * carries any — because the type list and the builder table have to be the same
 * list. They were two, and `trait` sat in the whitelist for a release with no
 * builder behind it (#1504).
 *
 * @param {unknown} value
 * @returns {Readonly<Record<string, Function>>}
 */
function normalizeItemBuilders(value) {
    if (value === undefined) return Object.freeze({});
    if (!isPlainObject(value)) fail("itemBuilders", "must be an object");
    const input = /** @type {Record<string, unknown>} */ (value);
    for (const [type, builder] of Object.entries(input)) {
        if (typeof builder !== "function") {
            fail(`itemBuilders.${type}`, "must be a function");
        }
    }
    return Object.freeze({ ...input });
}

/**
 * @param {unknown} value
 * @returns {Readonly<PublishSwitches>}
 */
function normalizePublish(value) {
    if (value === undefined) {
        return Object.freeze({
            site: false,
            manifests: Object.freeze({ publish: false, consume: false }),
        });
    }
    if (!isPlainObject(value)) fail("publish", "must be an object");
    const publish = /** @type {Record<string, unknown>} */ (value);
    rejectUnknownKeys(publish, PUBLISH_KEYS, "publish.");

    const manifestsInput = publish.manifests;
    if (manifestsInput !== undefined && !isPlainObject(manifestsInput)) {
        fail("publish.manifests", "must be an object");
    }
    const manifests = /** @type {Record<string, unknown>} */ (
        manifestsInput ?? {}
    );
    rejectUnknownKeys(manifests, MANIFEST_KEYS, "publish.manifests.");

    return Object.freeze({
        site: optionalBoolean(publish.site, "publish.site", false),
        manifests: Object.freeze({
            publish: optionalBoolean(
                manifests.publish,
                "publish.manifests.publish",
                false,
            ),
            consume: optionalBoolean(
                manifests.consume,
                "publish.manifests.consume",
                false,
            ),
        }),
    });
}

/**
 * Validate and normalize a content-build configuration.
 *
 * Consumers call this from `content-build.config.mjs` so that a malformed
 * configuration fails at load with a message naming the offending field,
 * rather than surfacing much later as an empty pack or a missing asset. The
 * returned object is a deeply frozen **copy**: mutating the input afterwards
 * cannot reach the configuration the build reads.
 *
 * @param {ContentBuildConfigInput} config  The configuration to validate.
 * @returns {ContentBuildConfig}            The frozen, defaulted configuration.
 * @throws {TypeError} If any field is missing, mistyped, or unrecognized.
 */
export function defineConfig(config) {
    if (!isPlainObject(config)) {
        throw new TypeError(
            "content-build config: expected a configuration object.",
        );
    }
    const input = /** @type {Record<string, unknown>} */ (
        /** @type {unknown} */ (config)
    );
    rejectUnknownKeys(input, CONFIG_KEYS, "");

    const rootDir = requireNonEmptyString(input.rootDir, "rootDir");
    if (!path.isAbsolute(rootDir)) {
        fail(
            "rootDir",
            "must be an absolute path — it is what makes the build independent " +
                "of the directory it was launched from (pass `import.meta.dirname`)",
        );
    }

    const packageKind = input.packageKind;
    if (
        typeof packageKind !== "string" ||
        !(
            /** @type {readonly string[]} */ (PACKAGE_KINDS).includes(
                packageKind,
            )
        )
    ) {
        fail("packageKind", `must be one of: ${PACKAGE_KINDS.join(", ")}`);
    }

    if (!Array.isArray(input.packs)) fail("packs", "must be an array");
    if (input.packs.length === 0)
        fail("packs", "must declare at least one pack");
    const packs = input.packs.map((pack, index) =>
        normalizePack(pack, `packs[${index}]`),
    );

    // One list, so the compile order and the directory list cannot disagree —
    // they used to be `PACK_CONFIGS` and `SOURCE_PACKS`, maintained apart (#1508).
    const packDirectories = packs.flatMap((pack) => [
        pack.name,
        ...pack.companions.map((companion) => companion.name),
    ]);
    const seen = new Set();
    for (const name of packDirectories) {
        if (seen.has(name)) {
            fail("packs", `declares the pack \`${name}\` more than once`);
        }
        seen.add(name);
    }

    // Several packs of one document type are allowed — editorial grouping of
    // same-type documents is ordinary Foundry practice, and collapsing such a
    // layout breaks every stored compendium UUID (#1566). What is not allowed
    // is two candidates for the same undeclared note.
    const defaultsByType = new Map();
    for (const pack of packs) {
        if (!pack.default) continue;
        const already = defaultsByType.get(pack.type);
        if (already) {
            fail(
                "packs",
                `marks both \`${already}\` and \`${pack.name}\` as the ` +
                    `default ${pack.type} pack; a note declaring no \`pack:\` ` +
                    `must have one destination`,
            );
        }
        defaultsByType.set(pack.type, pack.name);
    }

    if (
        input.skipDirectories !== undefined &&
        !Array.isArray(input.skipDirectories)
    ) {
        fail("skipDirectories", "must be an array");
    }
    const skipDirectories = (input.skipDirectories ?? []).map((name, index) =>
        requireNonEmptyString(name, `skipDirectories[${index}]`),
    );

    if (input.assets !== undefined && !Array.isArray(input.assets)) {
        fail("assets", "must be an array");
    }
    const assets = (input.assets ?? []).map(normalizeAsset);

    const foundryPackage = requireNonEmptyString(
        input.foundryPackage,
        "foundryPackage",
    );

    const itemBuilders = normalizeItemBuilders(input.itemBuilders);
    const itemTypes = Object.freeze(new Set(Object.keys(itemBuilders)));

    return Object.freeze({
        rootDir,
        contentPackage: requireNonEmptyString(
            input.contentPackage,
            "contentPackage",
        ),
        foundryPackage,
        packageKind: /** @type {PackageKind} */ (packageKind),
        // Foundry serves a package's files from `<kind>/<id>/`, so this is the
        // one place `systems/sohl` (or `modules/sohl-thalorna`) is spelled.
        assetRoot: `${packageKind}/${foundryPackage}/assets`,
        paths: normalizePaths(input.paths, rootDir),
        stats: normalizeStats(input.stats),
        itemBuilders,
        // Resolved once, here, and read everywhere as `packConfig.itemTypes` /
        // `packConfig.docEntryTypes`. The doc-entry *concept* is the engine's —
        // a note that carries documentation is not a SoHL idea — but the
        // membership is the consumer's, and there is exactly one resolved set at
        // runtime. Two would drift, which is the whole reason the composition
        // was written down in one place to begin with.
        itemTypes,
        docEntryTypes: Object.freeze(
            new Set([...itemTypes, "macro", ...MAP_TYPES]),
        ),
        skipDirectories: Object.freeze(skipDirectories),
        packs: Object.freeze(packs),
        packDirectories: Object.freeze(packDirectories),
        assets: Object.freeze(assets),
        publish: normalizePublish(input.publish),
    });
}
