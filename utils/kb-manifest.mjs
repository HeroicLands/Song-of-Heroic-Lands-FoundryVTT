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
 * `{ path, name }`. {@link loadForeignManifests} resolves each `path` into the
 * `{ url, name }` the knowledgebase already uses as its own index value, so a
 * foreign entry and a local one are interchangeable at the point of use.
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
 *
 * **An entry's address is relative to its own package's base** (#1465), never a
 * site-absolute path. Where a package is *mounted* is the consumer's knowledge,
 * held in {@link PACKAGE_BASE} and prefixed at resolve time — so moving a
 * package to another path or origin is one string per consumer rather than a
 * regenerated manifest, and an inbound link survives the move. A path recorded
 * in the manifest would not: it resolves, emits an `href`, and 404s, which is
 * the silent failure the manifest exists to end.
 */

import fs from "node:fs";
import path from "node:path";

import { compendiumUuid } from "./packs/ids.mjs";
import { itemDocEntryId } from "./packs/item-docs.mjs";

/**
 * Packages that publish a web surface and therefore exchange manifests.
 *
 * The guard in {@link manifestsComplete} stays off until every one of these is
 * accounted for, so adding a package here without also publishing its manifest
 * relaxes the build rather than breaking it.
 */
export const LINK_PACKAGES = Object.freeze(["sohl", "thalorna"]);

/**
 * The **canonical** address of a note: fully qualified, one spelling per
 * document, and globally unique.
 *
 * The written form of a link may omit the package (`[[skill-lang]]`), which
 * defaults it to the citing note's own. Everything internal — index keys,
 * manifest keys, every lookup — uses this instead, so no consumer has to know
 * what a short form defaulted to.
 *
 * Global uniqueness is what lets a foreign manifest merge straight into a local
 * index: the keys cannot collide by accident, so a key already present on merge
 * is a real conflict rather than an artefact of two packages sharing a
 * namespace. `(type, shortcode)` alone is unique only *within* a package, and
 * two independently authored packages reaching for the same short string is a
 * matter of time (#1499).
 *
 * @param {string} pkg - The owning **content** package (`sohl`, `thalorna`) —
 *   not the Foundry package, which varies per compilation target.
 * @param {string} type - The note's `type`.
 * @param {string} shortcode - The note's `shortcode`.
 * @returns {string} `package/type/shortcode`, lowercased.
 */
export function canonicalKey(pkg, type, shortcode) {
    return `${pkg}/${type}/${shortcode}`.toLowerCase();
}

/**
 * Manifest format version.
 *
 * Bumped to 2 by #1465: entries changed from a site-absolute `url` to a
 * package-relative `path`. The two shapes are indistinguishable to a naive
 * reader — prefixing a v1 `url` yields `/thalorna/thalorna/…`, which resolves,
 * renders, and 404s — so the version is what makes a stale vendored file an
 * error rather than a wrong link.
 *
 * Bumped to 3 by #1499: keys became **canonical** — fully qualified
 * `package/type/shortcode` rather than `type/shortcode` — and entries gained the
 * Foundry `uuid` / `docUuid` beside the web `path`. A v2 key read as a v3 one
 * addresses a package named after a type, so again the version is what turns a
 * stale vendored file into an error.
 */
export const MANIFEST_VERSION = 3;

/**
 * Where this build serves each package, keyed by package name.
 *
 * One line per package, and the only edit a relocation requires: point a
 * package at another path (`"/setting/thalorna/"`) or another origin
 * (`"https://thalorna.example.org/"`) and every inbound link into it follows.
 * A base is a prefix, so it must end in `/`.
 *
 * Only *foreign* packages are consulted — a package this build publishes is
 * authoritative in its own entries and never resolves through a manifest — but
 * every linkable package is listed, because which are foreign depends on the
 * consuming repository and this file is vendored into each of them.
 */
export const PACKAGE_BASE = Object.freeze({
    sohl: "/sohl/",
    thalorna: "/thalorna/",
});

/**
 * Asserts a base is usable as a prefix and returns it.
 *
 * @param {string} base - The package base.
 * @param {string} what - What is being resolved, for the error message.
 * @returns {string} The base.
 */
function checkBase(base, what) {
    if (typeof base !== "string" || !base.endsWith("/")) {
        throw new Error(
            `${what}: package base ${JSON.stringify(base)} must end in a slash`,
        );
    }
    return base;
}

/**
 * The package-relative address a site-absolute URL records as.
 *
 * Strips the emitting package's own base, so what lands in the manifest says
 * *where in the package* a page is and nothing about where the package itself
 * is mounted. A URL outside the base is an error rather than a best effort: it
 * would record an address that silently resolves to the wrong place once a
 * consumer prefixes its own base.
 *
 * @param {string} url - The site-absolute URL the emitting build publishes at.
 * @param {string} base - That build's base for the package, e.g. `"/thalorna/"`.
 * @returns {string} The address relative to `base`, with no leading slash.
 */
export function packageRelative(url, base) {
    checkBase(base, "packageRelative");
    if (typeof url !== "string" || !url.startsWith(base)) {
        throw new Error(
            `packageRelative: ${JSON.stringify(url)} does not sit under base ` +
                `${JSON.stringify(base)}`,
        );
    }
    return url.slice(base.length);
}

/**
 * The URL a package-relative address resolves to in this build.
 *
 * Plain concatenation, which is what makes an absolute-origin base work: a base
 * of `"https://thalorna.example.org/"` yields an absolute link, and one of
 * `"/thalorna/"` a root-relative one, with no other rule to keep in step.
 *
 * @param {string} rel - The package-relative address from a manifest entry.
 * @param {string} base - This build's base for that package.
 * @returns {string} The resolved URL.
 */
export function resolvePackageUrl(rel, base) {
    checkBase(base, "resolvePackageUrl");
    if (typeof rel !== "string" || !rel || rel.startsWith("/")) {
        throw new Error(
            `resolvePackageUrl: ${JSON.stringify(rel)} is not a package-` +
                `relative address`,
        );
    }
    return `${base}${rel}`;
}

/**
 * Builds one package's manifest from the KB build's own entries.
 *
 * Only notes carrying a `shortcode` appear: the shortcode is the stable
 * identity another package addresses them by, and a note without one cannot be
 * the target of a cross-package link at all.
 *
 * @param {string} pkg - The package name, e.g. `"sohl"`.
 * @param {Array<object>} entries - KB entries (`{ fm, name, url }`).
 * @param {string} base - Where *this* build serves `pkg`, stripped from each
 *   entry's URL so the recorded address is package-relative (#1465).
 * @param {string} [foundryPackage] - The Foundry package this build ships the
 *   compiled documents in. Given, each entry also carries the `uuid` /
 *   `docUuid` a pack build resolves against; omitted, the manifest describes
 *   the web surface only.
 * @returns {object} The manifest document.
 */
export function buildManifest(pkg, entries, base, foundryPackage) {
    checkBase(base, `buildManifest(${pkg})`);
    const out = {};
    for (const e of entries) {
        const type = e.fm?.type;
        const shortcode = e.fm?.shortcode;
        if (!type || typeof shortcode !== "string" || !shortcode) continue;
        const entry = {
            path: packageRelative(e.url, base),
            name: e.name,
        };
        // The Foundry address, for consumers compiling packs rather than pages.
        // Omitted when the note carries no `id`: it then compiles into no
        // document, and inventing a UUID for it would assert a target that
        // does not exist. A consumer must tolerate an entry without one.
        if (foundryPackage && e.fm?.id) {
            entry.uuid = compendiumUuid(foundryPackage, type, e.fm.id);
            entry.docUuid = compendiumUuid(
                foundryPackage,
                "doc",
                itemDocEntryId(e.fm.id),
            );
        }
        out[canonicalKey(pkg, type, shortcode)] = entry;
    }
    return {
        version: MANIFEST_VERSION,
        package: pkg,
        ...(foundryPackage ? { foundryPackage } : {}),
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
 * @param {Record<string, string>} bases - Package → where *this* build serves
 *   it, which is what each entry's address is recorded relative to. This is the
 *   emitting build's own layout, not {@link PACKAGE_BASE}: a package's own site
 *   commonly serves it at `"/"` while a consumer mounts it under a prefix.
 * @param {Record<string, string>} [foundryPackages] - Package → the Foundry
 *   package shipping its documents. Only a package this build publishes can
 *   have one, since the UUID names where *this* repository ships them.
 * @returns {Array<{ package: string, file: string, count: number }>} What was written.
 */
export function writeManifests(entriesByPackage, dir, bases, foundryPackages) {
    fs.mkdirSync(dir, { recursive: true });
    const written = [];
    for (const [pkg, entries] of entriesByPackage) {
        const doc = buildManifest(
            pkg,
            entries,
            bases?.[pkg],
            foundryPackages?.[pkg],
        );
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
 * Each entry's package-relative address is resolved against this build's base
 * for that package (#1465), so what the index holds is a usable `url` and every
 * consumer downstream is unchanged by the format.
 *
 * @param {string} dir - Directory of vendored `<package>.json` manifests.
 * @param {Iterable<string>} localPackages - Packages this build publishes.
 * @param {Record<string, string>} [bases] - Package → base to resolve against;
 *   defaults to {@link PACKAGE_BASE}.
 * @returns {{ index: Map<string, object>, packages: Set<string>, stale: Array<object> }}
 *   `index` maps the canonical `package/type/shortcode` → `{ url, name, uuid,
 *   docUuid, type, package }`. Keys are globally unique, so this merges
 *   directly into a local index with no prefixing and no separate lookup path.
 */
export function loadForeignManifests(dir, localPackages, bases = PACKAGE_BASE) {
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
            // A v1 file is the site-absolute shape (#1465). Prefixing one of
            // its URLs would produce `/thalorna/thalorna/…` — a link that
            // resolves here and 404s for the reader — so the mismatch has to
            // stop the load rather than be resolved anyway.
            stale.push({
                package: pkg,
                reason: `manifest version ${doc.version}, expected ${MANIFEST_VERSION}`,
            });
            continue;
        }
        const base = bases?.[pkg];
        if (typeof base !== "string" || !base) {
            // Skipping it silently would turn every link into that package back
            // into an unresolved address — which, once the guard is on, reads as
            // a typo and fails the build somewhere far from the cause.
            stale.push({
                package: pkg,
                reason: `no package base configured for "${pkg}" (PACKAGE_BASE in utils/kb-manifest.mjs)`,
            });
            continue;
        }
        const resolved = [];
        try {
            for (const [key, v] of Object.entries(doc.entries ?? {})) {
                // Canonical keys are `package/type/shortcode` (v3). The type is
                // read back out so a consumer can recognise a foreign package's
                // types as addresses at all.
                const [, type] = key.split("/");
                resolved.push([
                    key,
                    {
                        name: v.name,
                        url: resolvePackageUrl(v.path, base),
                        uuid: v.uuid,
                        docUuid: v.docUuid,
                        type,
                    },
                ]);
            }
        } catch (err) {
            stale.push({ package: pkg, reason: err.message });
            continue;
        }
        packages.add(pkg);
        for (const [key, v] of resolved) {
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
