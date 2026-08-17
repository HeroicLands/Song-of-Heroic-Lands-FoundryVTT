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
 * The cross-package link manifest (#1446).
 *
 * Each package that publishes a web surface emits one file naming every note it
 * publishes, keyed by the canonical `type/shortcode` address and valued
 * `{ url, name }` — the same shape the knowledgebase already uses as its own
 * index value, so a foreign entry and a local one are interchangeable at the
 * point of use.
 *
 * The manifest exists to make one question decidable: when a link addresses
 * `creature-grkrahk` and this build has never heard of it, is that a typo or a
 * note belonging to another package? Before the manifest nothing in the syntax
 * answered that, so the dead-link guard had to be left off for the hyphen form
 * or correct content would fail the build (see `kb-wikilinks.mjs`). With every
 * package's manifest vendored, an address that resolves in none of them is a
 * typo, and the guard can be restored.
 *
 * `kethira` is deliberately absent. It ships only compendium packs, publishes
 * no pages, and nothing may depend on it — the module has to stay withdrawable
 * (see that repository's `CLAUDE.md`), which a manifest edge pointing into it
 * would quietly prevent.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Packages that publish a web surface and therefore exchange manifests.
 *
 * The guard in {@link manifestsComplete} stays off until every one of these is
 * accounted for, so adding a package here without also publishing its manifest
 * relaxes the build rather than breaking it.
 */
export const LINK_PACKAGES = Object.freeze(["sohl", "thalorna"]);

/** Manifest format version, so a stale vendored file is recognisable as such. */
export const MANIFEST_VERSION = 1;

/**
 * Builds one package's manifest from the KB build's own entries.
 *
 * Only notes carrying a `shortcode` appear: the shortcode is the stable
 * identity another package addresses them by, and a note without one cannot be
 * the target of a cross-package link at all.
 *
 * @param {string} pkg - The package name, e.g. `"sohl"`.
 * @param {Array<object>} entries - KB entries (`{ fm, name, url }`).
 * @returns {object} The manifest document.
 */
export function buildManifest(pkg, entries) {
    const out = {};
    for (const e of entries) {
        const type = e.fm?.type;
        const shortcode = e.fm?.shortcode;
        if (!type || typeof shortcode !== "string" || !shortcode) continue;
        out[`${type}/${shortcode}`.toLowerCase()] = {
            url: e.url,
            name: e.name,
        };
    }
    return {
        version: MANIFEST_VERSION,
        package: pkg,
        // Sorted so the file is stable across builds and a diff shows only real
        // change — it is committed by whoever vendors it.
        entries: Object.fromEntries(
            Object.entries(out).sort(([a], [b]) =>
                a < b ? -1
                : a > b ? 1
                : 0,
            ),
        ),
    };
}

/**
 * Writes one manifest per package into `dir`.
 *
 * @param {Map<string, Array<object>>} entriesByPackage - Package → entries.
 * @param {string} dir - Output directory; created if absent.
 * @returns {Array<{ package: string, file: string, count: number }>} What was written.
 */
export function writeManifests(entriesByPackage, dir) {
    fs.mkdirSync(dir, { recursive: true });
    const written = [];
    for (const [pkg, entries] of entriesByPackage) {
        const doc = buildManifest(pkg, entries);
        const file = path.join(dir, `${pkg}.json`);
        fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
        written.push({
            package: pkg,
            file,
            count: Object.keys(doc.entries).length,
        });
    }
    return written;
}

/**
 * Loads vendored manifests for packages this build does not itself publish.
 *
 * A package built locally is skipped even if a manifest for it is present: the
 * live build is authoritative and a vendored copy of it can only be stale.
 *
 * @param {string} dir - Directory of vendored `<package>.json` manifests.
 * @param {Iterable<string>} localPackages - Packages this build publishes.
 * @returns {{ index: Map<string, object>, packages: Set<string>, stale: Array<object> }}
 *   `index` maps `type/shortcode` → `{ url, name, package }`.
 */
export function loadForeignManifests(dir, localPackages) {
    const local = new Set(localPackages);
    const index = new Map();
    const packages = new Set();
    const stale = [];
    let names;
    try {
        names = fs.readdirSync(dir);
    } catch {
        return { index, packages, stale };
    }
    for (const name of names) {
        if (!name.endsWith(".json")) continue;
        const pkg = path.basename(name, ".json");
        if (local.has(pkg)) continue;
        let doc;
        try {
            doc = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
        } catch (err) {
            stale.push({ package: pkg, reason: `unreadable: ${err.message}` });
            continue;
        }
        if (doc.version !== MANIFEST_VERSION) {
            stale.push({
                package: pkg,
                reason: `manifest version ${doc.version}, expected ${MANIFEST_VERSION}`,
            });
            continue;
        }
        packages.add(pkg);
        for (const [key, v] of Object.entries(doc.entries ?? {})) {
            // First writer wins, so two packages claiming one address cannot
            // make the build depend on directory order.
            if (!index.has(key)) index.set(key, { ...v, package: pkg });
        }
    }
    return { index, packages, stale };
}

/**
 * Whether every linkable package is accounted for, locally or by manifest.
 *
 * This is what gates the dead-link guard. It is deliberately derived from data
 * rather than set by a flag: the guard turns itself on the moment the last
 * missing manifest appears, instead of waiting for someone to remember.
 *
 * @param {Iterable<string>} localPackages - Packages this build publishes.
 * @param {Iterable<string>} manifestPackages - Packages loaded from manifests.
 * @returns {{ complete: boolean, missing: Array<string> }}
 */
export function manifestsComplete(localPackages, manifestPackages) {
    const have = new Set([...localPackages, ...manifestPackages]);
    const missing = LINK_PACKAGES.filter((p) => !have.has(p));
    return { complete: missing.length === 0, missing };
}
