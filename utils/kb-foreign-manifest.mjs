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
import { formatDiagnostic, positionOf } from "./lint-diagnostics.mjs";

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
 * One finding, in the toolchain's standard `file:line:column: severity: message`
 * form so an editor or CI annotator can act on it without being taught to.
 *
 * The position is recovered by locating the offending key in the manifest text:
 * the finding is about a literal the reader can see in the file, so its position
 * is implicit rather than absent. When the file cannot be read, or the key is
 * not in it, {@link positionOf} yields nothing and the locator degrades to the
 * file alone — a dropped field, never a guessed `1:1` that would send the reader
 * to the top of a 500KB manifest for a finding that is not there.
 *
 * @param {{ package: string, entries: number, sampleKey: string }} finding
 * @param {string} manifestDir - The directory the manifests were loaded from.
 * @returns {string} The formatted diagnostic, path first on the line.
 */
export function formatUnaddressableFinding(finding, manifestDir) {
    const file = path.join(manifestDir, `${finding.package}.json`);
    let at = {};
    try {
        at = positionOf(
            fs.readFileSync(file, "utf8"),
            `"${finding.sampleKey}"`,
        );
    } catch {
        // Unreadable here is not itself the finding — `loadForeignManifests`
        // already reports that as a stale manifest. The file is simply all that
        // is known about where this one is.
    }
    return formatDiagnostic({
        file,
        ...at,
        severity: "error",
        message:
            "no key in this manifest is a canonical " +
            `\`package-type-shortcode\` address (${finding.entries} ` +
            `${finding.entries === 1 ? "entry" : "entries"}, none addressable; ` +
            `first is \`${finding.sampleKey}\`) — every cross-package link to ` +
            `${finding.package} would resolve to nothing, silently`,
    });
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
