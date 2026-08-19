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
 *     contentPackage: "sohl",
 *     foundryPackage: "sohl",
 *     packageKind: "systems",
 *     packs: [
 *         { name: "items", type: "Item", label: "Items" },
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
 * @module
 */

/**
 * The two kinds of Foundry package a content module can be built into. The
 * value is also the directory Foundry installs the package under, which is why
 * it is plural.
 *
 * @satisfies {readonly PackageKind[]}
 */
export const PACKAGE_KINDS = /** @type {const} */ (["systems", "modules"]);

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
 * @typedef {object} PackSpec
 * @property {string} name              Pack name — the manifest `name`, and the
 *                                      directory under `packs/`.
 * @property {PackDocumentType} type    Foundry document type the pack holds.
 * @property {string} [label]           Human-readable label. Defaults to `name`.
 * @property {boolean} [private]        Whether the pack is GM-only. Default `false`.
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
 * @property {string} contentPackage        Content package name — the value each
 *                                          content note carries in its `package:`
 *                                          frontmatter.
 * @property {string} foundryPackage        Foundry package id, as it appears in
 *                                          `system.json` / `module.json`.
 * @property {PackageKind} packageKind      Whether the package is a system or a module.
 * @property {PackSpec[]} packs             Packs to compile.
 * @property {AssetSpec[]} [assets]         Assets to stage. Default `[]`.
 * @property {PublishSwitchesInput} [publish]  Publishing switches. Each defaults to off.
 */

/**
 * The normalized, frozen configuration the toolchain reads.
 *
 * @typedef {object} ContentBuildConfig
 * @property {string} contentPackage
 * @property {string} foundryPackage
 * @property {PackageKind} packageKind
 * @property {readonly Readonly<PackSpec>[]} packs
 * @property {readonly Readonly<AssetSpec>[]} assets
 * @property {Readonly<PublishSwitches>} publish
 */

const CONFIG_KEYS = [
    "contentPackage",
    "foundryPackage",
    "packageKind",
    "packs",
    "assets",
    "publish",
];
const PACK_KEYS = ["name", "type", "label", "private"];
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
 * @param {number} index
 * @returns {Readonly<PackSpec>}
 */
function normalizePack(value, index) {
    const where = `packs[${index}]`;
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

    /** @type {PackSpec} */
    const normalized = {
        name,
        type: /** @type {PackDocumentType} */ (type),
        label:
            pack.label === undefined ?
                name
            :   requireNonEmptyString(pack.label, `${where}.label`),
        private: optionalBoolean(pack.private, `${where}.private`, false),
    };
    return Object.freeze(normalized);
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
    const packs = input.packs.map(normalizePack);

    const seen = new Set();
    for (const pack of packs) {
        if (seen.has(pack.name)) {
            fail("packs", `declares the pack \`${pack.name}\` more than once`);
        }
        seen.add(pack.name);
    }

    if (input.assets !== undefined && !Array.isArray(input.assets)) {
        fail("assets", "must be an array");
    }
    const assets = (input.assets ?? []).map(normalizeAsset);

    return Object.freeze({
        contentPackage: requireNonEmptyString(
            input.contentPackage,
            "contentPackage",
        ),
        foundryPackage: requireNonEmptyString(
            input.foundryPackage,
            "foundryPackage",
        ),
        packageKind: /** @type {PackageKind} */ (packageKind),
        packs: Object.freeze(packs),
        assets: Object.freeze(assets),
        publish: normalizePublish(input.publish),
    });
}
