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
 * Each publishing package emits one file naming every note it publishes, keyed
 * by the canonical `type/shortcode` address and valued with every address that
 * note has: a `path` on the web, a `uuid` in Foundry.
 * {@link loadForeignManifests} resolves each `path` into the `{ url, name }`
 * the knowledgebase already uses as its own index value, so a foreign entry and
 * a local one are interchangeable at the point of use.
 *
 * **Both addresses are optional, independently** (#1516). A note that publishes
 * a page and compiles into no document has no `uuid`; a package that ships
 * compendiums and publishes no site has no `path` on any entry. Neither is an
 * error, and a consumer that cannot use the address it wanted must degrade —
 * inventing the missing one asserts a target that does not exist, which is the
 * silent dead link this whole format exists to prevent.
 *
 * The manifest exists to make one question decidable: when a link addresses
 * `creature-grkrahk` and this build has never heard of it, is that a typo or a
 * note belonging to another package? Before the manifest nothing in the syntax
 * answered that, so the dead-link guard had to be left off for the hyphen form
 * or correct content would fail the build (see `kb-wikilinks.mjs`). With every
 * package's manifest vendored, an address that resolves in none of them is a
 * typo, and the guard can be restored.
 *
 * `kethira` is deliberately absent, on a **licensing** ground rather than a
 * technical one: nothing may depend on it, because the module has to stay
 * withdrawable (see that repository's `CLAUDE.md`), and a manifest edge
 * pointing into it is exactly such a dependency. That it ships only packs is
 * not the reason — since #1516 a pack-only package can publish a manifest.
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

/**
 * Packages that publish a manifest and therefore exchange addresses.
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
    return `${pkg}-${type}-${shortcode}`.toLowerCase();
}

/**
 * Reads a canonical key back into its parts.
 *
 * Unambiguous because no package, type or shortcode contains a hyphen — types
 * are bare words and shortcodes are `^[A-Za-z0-9]+$` (#1397).
 *
 * @param {string} key - A canonical key.
 * @returns {{package: string, type: string, shortcode: string}|null} The parts,
 *   or `null` when the key is not in canonical form.
 */
export function readCanonicalKey(key) {
    const parts = String(key).split("-");
    if (parts.length !== 3) return null;
    const [pkg, type, shortcode] = parts;
    if (!pkg || !type || !shortcode) return null;
    return { package: pkg, type, shortcode };
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
 * Bumped to 4 by #1499: keys use the authored hyphen separator
 * (`sohl-affliction-aconite`) so a key *is* the address an author writes; an
 * item's documentation became an entry in its own right
 * (`sohl-docaffliction-aconite`) rather than a second field; and entries gained
 * `anchors`, mapping a note's named sections to the full UUID each compiled to.
 *
 * Bumped to 3 by #1499: keys became **canonical** — fully qualified
 * `package/type/shortcode` rather than `type/shortcode` — and entries gained the
 * Foundry `uuid` / `docUuid` beside the web `path`. A v2 key read as a v3 one
 * addresses a package named after a type, so again the version is what turns a
 * stale vendored file into an error.
 *
 * Bumped to 5 by #1516: `path` became optional, so a package that ships
 * compendiums and publishes no site can still publish the Foundry addresses of
 * its documents — the mirror of an entry that has a `path` and no `uuid`.
 */
export const MANIFEST_VERSION = 5;

/**
 * Every version this build can read, newest last.
 *
 * A version exists to stop a file whose values *read differently* from being
 * resolved anyway, and that is the only thing it is allowed to gate. Every bump
 * so far did change a reading — a v2 key read as a v4 one addresses a package
 * named after a type — so each dropped its predecessors. **v5 did not**: it
 * only permits an absent `path`, so every v4 value still means exactly what it
 * meant, and refusing v4 would make a purely relaxing change a flag day in
 * which every package must re-emit on the same afternoon or every build breaks
 * (#1516).
 *
 * The unsafe direction is unchanged and still hard-fails: an older consumer
 * meeting a newer file rejects it, because it cannot know what the new shape
 * permits. Widening is therefore always safe to do here first and adopt
 * elsewhere later.
 */
export const READABLE_VERSIONS = Object.freeze([4, MANIFEST_VERSION]);

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
 * @param {string} [base] - Where *this* build serves `pkg`, stripped from each
 *   entry's URL so the recorded address is package-relative (#1465). Omitted,
 *   this build publishes no web surface for the package and no entry carries a
 *   `path` — see below.
 * @param {string} [foundryPackage] - The Foundry package this build ships the
 *   compiled documents in. Given, each entry also carries the `uuid` /
 *   `docUuid` a pack build resolves against; omitted, the manifest describes
 *   the web surface only.
 * @returns {object} The manifest document.
 */
export function buildManifest(pkg, entries, base, foundryPackage) {
    // A base is what a `path` is recorded relative to, so having none is
    // exactly the statement "this build publishes no pages for this package"
    // (#1516). Making it a package-level decision the caller states once — not
    // a per-note condition — is what stops a web-publishing package from
    // half-emitting, where the notes that quietly lost a `path` would degrade
    // to unlinked prose in every consumer with nothing erroring anywhere.
    const web = base != null;
    if (web) checkBase(base, `buildManifest(${pkg})`);
    const out = {};
    for (const e of entries) {
        const type = e.fm?.type;
        const shortcode = e.fm?.shortcode;
        if (!type || typeof shortcode !== "string" || !shortcode) continue;
        const entry = {
            // The web address, for consumers rendering pages. Absent for a
            // pack-only package, which has no page to point at — the mirror of
            // the `uuid` case below, and stating a `path` anyway would assert a
            // page that does not exist.
            ...(web ? { path: packageRelative(e.url, base) } : {}),
            name: e.name,
        };
        // The Foundry address, for consumers compiling packs rather than pages.
        // Supplied by the caller rather than derived here: only the build that
        // splits a note into pages knows its anchors, and a note that compiles
        // into no document has no UUID to state. Inventing one would assert a
        // target that does not exist, so an entry without one is normal and a
        // consumer must tolerate it.
        if (foundryPackage && e.uuid) entry.uuid = e.uuid;
        // The address of this item's documentation — a pointer to the entry
        // that owns that UUID, not a second copy of it.
        if (e.doc) entry.doc = e.doc;
        // A note's named sections, each mapped to the *whole* UUID it compiled
        // to. Whole, not a fragment appended to `uuid`: nothing owns a page
        // address, so there is no fact being restated, and an anchor is not
        // required to live inside its own entry. Publishing the complete link
        // also keeps the page-id hash out of the published contract entirely.
        if (e.anchors && Object.keys(e.anchors).length)
            entry.anchors = e.anchors;
        out[e.key ?? canonicalKey(pkg, type, shortcode)] = entry;
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
 *   `index` maps the canonical `package-type-shortcode` → `{ url, name, uuid,
 *   doc, anchors, type, package }`. Keys are globally unique, so this merges
 *   directly into a local index with no prefixing and no separate lookup path.
 *   `url` is `undefined` for an entry with no page (#1516) and `uuid` for one
 *   that compiles into no document, so a caller must check the address it
 *   intends to use rather than assume a hit carries it.
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
        if (!READABLE_VERSIONS.includes(doc.version)) {
            // A v1 file is the site-absolute shape (#1465). Prefixing one of
            // its URLs would produce `/thalorna/thalorna/…` — a link that
            // resolves here and 404s for the reader — so the mismatch has to
            // stop the load rather than be resolved anyway.
            stale.push({
                package: pkg,
                reason:
                    `manifest version ${doc.version}, expected one of ` +
                    `${READABLE_VERSIONS.join(", ")}`,
            });
            continue;
        }
        const entriesIn = Object.entries(doc.entries ?? {});
        // A base is only needed to resolve a `path`, so a pack-only manifest —
        // Foundry addresses and no pages (#1516) — needs none, and demanding
        // one would make its documents uncitable from anywhere. Any entry that
        // does carry a `path` brings the requirement straight back: dropping
        // the package silently would turn every link into it back into an
        // unresolved address, which reads as a typo far from the cause.
        const base = bases?.[pkg];
        const needsBase = entriesIn.some(([, v]) => v?.path != null);
        if (needsBase && (typeof base !== "string" || !base)) {
            stale.push({
                package: pkg,
                reason: `no package base configured for "${pkg}" (PACKAGE_BASE in packages/content-build/engine/kb-manifest.mjs)`,
            });
            continue;
        }
        const resolved = [];
        try {
            for (const [key, v] of entriesIn) {
                // The type is read back out of the canonical key so a consumer
                // can recognise a foreign package's types as addresses at all.
                const type = readCanonicalKey(key)?.type;
                resolved.push([
                    key,
                    {
                        name: v.name,
                        // Absent for an entry with no page. A consumer must
                        // tolerate that rather than invent an href, exactly as
                        // it already tolerates an entry with no `uuid`.
                        url:
                            v.path == null ?
                                undefined
                            :   resolvePackageUrl(v.path, base),
                        uuid: v.uuid,
                        doc: v.doc,
                        anchors: v.anchors,
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
