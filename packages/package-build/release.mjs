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
 * The release archive — the two files a Foundry package's GitHub Release
 * carries.
 *
 * Foundry installs a package by fetching the `download` URL its manifest
 * advertises, so a release publishes exactly two assets: `<artifact>.zip`, the
 * whole staged tree, and `<artifact>.json` beside it, which is what an already
 * installed package re-fetches to notice a new version. Both names are fixed by
 * what the manifest says, not chosen here — see `manifest.mjs`.
 *
 * Kept apart from `stage.mjs` because this is the only part of assembling a
 * package that needs a dependency. A repository that never cuts a release from
 * a local build imports the staging half and pays nothing for this one.
 *
 * @module
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

// archiver 8 is pure ESM and exports **classes**, with no default export. The
// old `import archiver from "archiver"` factory call throws at import —
// `does not provide an export named 'default'` — which is how this repository's
// release job came to fail before a single byte was written (#1683).
import { ZipArchive } from "archiver";

/**
 * Zip the staged tree and place the manifest beside the archive.
 *
 * **Waits for the output stream to close, not merely for the archive to
 * finalize.** `finalize()` resolves once archiver has finished *appending*
 * entries, which is before the bytes have necessarily reached disk; returning
 * there can hand a later step — an upload, a checksum — a truncated file. The
 * failure is timing-dependent, so it survives every run that happens to be
 * fast enough, which is what makes it worth being explicit about.
 *
 * @param {object} [opts]
 * @param {string} [opts.stageDir] - The staged package tree.
 * @param {string} [opts.outDir] - Where the release assets are written.
 * @param {"system"|"module"} [opts.artifact] - Which artifact is shipped.
 *   Determines both asset names.
 * @returns {Promise<{zip: string, manifest: string, bytes: number,
 *   version: string}>} The two paths written, the archive's size, and the
 *   version the manifest declares.
 * @throws {Error} When the stage has no manifest — there is nothing to release,
 *   and an archive without one installs as nothing.
 */
export async function packRelease({
    stageDir = "build/stage",
    outDir = "build/dist",
    artifact = "system",
} = {}) {
    const stage = path.resolve(stageDir);
    const out = path.resolve(outDir);
    const manifestName = `${artifact}.json`;
    const stagedManifest = path.join(stage, manifestName);

    if (!fs.existsSync(stagedManifest)) {
        throw new Error(
            `${stagedManifest} does not exist, so there is nothing to release. ` +
                `Build the package first.`,
        );
    }

    const manifest = JSON.parse(await fsp.readFile(stagedManifest, "utf8"));
    await fsp.mkdir(out, { recursive: true });

    const zipPath = path.join(out, `${artifact}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    // Settled before anything is appended, so an error raised during the walk
    // rejects rather than leaving the await below hanging forever.
    const closed = new Promise((resolve, reject) => {
        output.on("close", resolve);
        output.on("error", reject);
        archive.on("error", reject);
        // A warning archiver can recover from (a vanished file, say) still
        // means the archive is not the tree that was asked for.
        archive.on("warning", reject);
    });

    archive.pipe(output);
    // `false` — no top-level directory inside the zip. Foundry unpacks the
    // archive *into* the package directory, so an extra level would nest the
    // manifest one deeper than it looks for it.
    archive.directory(stage, false);
    await archive.finalize();
    await closed;

    await fsp.copyFile(stagedManifest, path.join(out, manifestName));

    return {
        zip: zipPath,
        manifest: path.join(out, manifestName),
        bytes: archive.pointer(),
        version: manifest.version,
    };
}
