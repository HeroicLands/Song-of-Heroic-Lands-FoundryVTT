/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The guard that keeps a vendored link manifest readable by the build that
 * consumes it (#1664).
 *
 * A cross-package address is looked up by a key this build derives, and the
 * manifest is written with a key the *publishing* build derives. When those two
 * shapes agree the link resolves; when they drift apart the lookup cannot match
 * on any input, and — because an unresolved wikilink falls through to its own
 * display text — the page still reads correctly and nothing reports a thing.
 * That is how the v3 key change (#1499) left this repository reading 2,367
 * `thalorna` entries through a lookup that could never hit one of them.
 *
 * The lookup is bridged at the call site now, but bridging alone is not enough:
 * it fails silently again the next time either side moves. So the shapes are
 * *checked* rather than merely converted, and a manifest that yields no
 * addressable key at all fails the build. A lookup that cannot match anything
 * reports nothing, which is the one failure a dead-link check can never catch.
 */

import fs from "node:fs";
import path from "node:path";

import { readCanonicalKey } from "@heroiclands/content-build/engine/kb-manifest";

/**
 * Every foreign package whose manifest entries this build cannot address.
 *
 * A package is reported only when it contributes entries and **none** of them
 * yields a readable canonical key — the total, silent failure described above.
 * Partial drift is deliberately not reported here: it resolves something, and
 * whatever it fails to resolve surfaces as an ordinary dead address, pointed at
 * the note that cites it. A package contributing no entries at all is likewise
 * not a finding; a pack-only package publishes no addressable pages by design
 * (#1516), and one being brought up publishes nothing yet.
 *
 * @param {Map<string, { package?: string }>} foreignIndex - `foreign.index` as
 *   returned by `loadForeignManifests`, keyed by canonical key.
 * @returns {{ package: string, entries: number, sampleKey: string }[]} One
 *   finding per drifted package, in the order the index first names each.
 */
export function unaddressableForeignPackages(foreignIndex) {
    /** @type {Map<string, { entries: number, readable: number, sampleKey: string }>} */
    const byPackage = new Map();
    for (const [key, value] of foreignIndex ?? new Map()) {
        // The package is read from the entry rather than the key, since the key
        // is the very thing under suspicion — deriving it from a shape that may
        // not parse would report the finding against `undefined`.
        const pkg = value?.package;
        if (!pkg) continue;
        const seen = byPackage.get(pkg) ?? {
            entries: 0,
            readable: 0,
            sampleKey: key,
        };
        seen.entries += 1;
        if (readCanonicalKey(key)) seen.readable += 1;
        byPackage.set(pkg, seen);
    }
    const findings = [];
    for (const [pkg, seen] of byPackage) {
        if (seen.entries > 0 && seen.readable === 0) {
            findings.push({
                package: pkg,
                entries: seen.entries,
                sampleKey: seen.sampleKey,
            });
        }
    }
    return findings;
}

/**
 * The file a package's vendored manifest is read from.
 *
 * Relative to the working directory, because that is where a diagnostic's
 * consumer — an editor jumping to the finding — resolves it from.
 */
function manifestPath(pkg, manifestDir) {
    const file = path.join(manifestDir, `${pkg}.json`);
    const relative = path.relative(process.cwd(), file);
    // A manifest outside the tree stays absolute rather than becoming a run of
    // `../`, which is harder to read and no more useful.
    return relative && !relative.startsWith("..") ? relative : file;
}

/**
 * Where a key literal sits in the manifest text, or `null` if it is not there.
 *
 * The finding is about a key the reader can see in the file, so its position is
 * implicit rather than absent and is recovered by searching for it. When the
 * search fails the position is **dropped**, never defaulted to `1:1` — a guessed
 * position sends the reader to the top of a 588KB file for a finding that is
 * not there.
 */
function locateKey(file, key) {
    let text;
    try {
        text = fs.readFileSync(file, "utf8");
    } catch {
        return null;
    }
    const at = text.indexOf(`"${key}"`);
    if (at < 0) return null;
    const before = text.slice(0, at);
    const line = before.split("\n").length;
    const column = at - (before.lastIndexOf("\n") + 1) + 1;
    return { line, column };
}

/**
 * One finding, in the toolchain's standard `file:line:column: severity: message`
 * form so an editor or CI annotator can act on it without being taught to.
 *
 * @param {{ package: string, entries: number, sampleKey: string }} finding
 * @param {string} manifestDir - The directory the manifests were loaded from.
 * @returns {string} The formatted diagnostic, path first on the line.
 */
export function formatUnaddressableFinding(finding, manifestDir) {
    const file = manifestPath(finding.package, manifestDir);
    const at = locateKey(file, finding.sampleKey);
    const where =
        at ?
            `${file}:${at.line}:${at.column}`
            // Only the file is known — a dropped field, not a guessed one.
        :   file;
    return (
        `${where}: error: no key in this manifest is a canonical ` +
        `\`package-type-shortcode\` address (${finding.entries} ` +
        `${finding.entries === 1 ? "entry" : "entries"}, none addressable; ` +
        `first is \`${finding.sampleKey}\`) — every cross-package link to ` +
        `${finding.package} would resolve to nothing, silently`
    );
}

/**
 * Fails the calling build when any vendored manifest has drifted out of reach.
 *
 * Written as an exit rather than a throw because both call sites are build
 * scripts that already report their own manifest problems this way, and a stack
 * trace would bury the diagnostic the reader needs.
 *
 * @param {Map<string, { package?: string }>} foreignIndex
 * @param {string} manifestDir
 */
export function assertForeignManifestsAddressable(foreignIndex, manifestDir) {
    const findings = unaddressableForeignPackages(foreignIndex);
    if (!findings.length) return;
    for (const finding of findings) {
        console.error(formatUnaddressableFinding(finding, manifestDir));
    }
    // Prose, not a finding, so it keeps prose form.
    console.error(
        "\nThe vendored manifest and this build disagree about the key shape " +
            "(#1664). Refresh the vendored copy from that package's own build " +
            "(#1465); if the format itself has moved, the reader in " +
            "@heroiclands/content-build must move with it.\n",
    );
    process.exit(1);
}
