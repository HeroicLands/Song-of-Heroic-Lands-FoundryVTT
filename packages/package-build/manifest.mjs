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
 * Building the Foundry package manifest — `system.json` or `module.json`.
 *
 * Foundry defines exactly two package kinds, and a repository is one of them,
 * so there is one job here with two spellings: read the repository's manifest
 * *template*, stamp the facts that must not be transcribed, and write the
 * result into the build stage.
 *
 * **The stamped fields are the ones a human copy rots.** A manifest carries the
 * version, the repository addresses, and the two release URLs Foundry fetches
 * to check for and install an update. Every one of them is already stated
 * somewhere that owns it — `package.json` — and a second, hand-maintained copy
 * in the template drifts the moment a release is cut. `sohl-kethira-basic`
 * hand-maintains its whole `module.json`, and its `download` still names an
 * older version than the module claims.
 *
 * **Nothing here invents an address.** The repository URL is read from
 * `package.json`'s `repository` field, normalised, and everything else is
 * derived from it. A manifest that advertised another package's URLs would send
 * Foundry to the wrong release on every update check — which is exactly what a
 * template copied between repositories produces.
 *
 * The rules are pure functions over data. I/O is confined to
 * {@link writeFoundryManifest}, which is the only export that touches disk.
 *
 * @module
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * The two package kinds Foundry defines, as the artifact name each one's
 * manifest and release archive are called.
 *
 * A system ships `system.json` / `system.zip`; a module ships `module.json` /
 * `module.zip`. Foundry fetches those exact names, so the pair is not a naming
 * convention this project is free to choose.
 */
export const ARTIFACTS = Object.freeze(["system", "module"]);

/**
 * Which artifact a template file builds.
 *
 * Inferred from the template's own name so the usual case takes no
 * configuration: a repository that ships `system.template.json` is a system,
 * and one that ships `module.template.json` is a module. That is the same pair
 * `@heroiclands/content-build` resolves a package manifest from, so the two
 * cannot disagree about what a repository is.
 *
 * @param {string} templatePath - Path to the manifest template.
 * @returns {"system"|"module"} The artifact name.
 * @throws {TypeError} When the name identifies neither kind — a template called
 *   something else leaves nothing to infer from, and guessing would silently
 *   emit a manifest Foundry never looks for.
 */
export function artifactFromTemplate(templatePath) {
    const base = path.basename(String(templatePath ?? ""));
    const artifact = ARTIFACTS.find((a) => base.startsWith(`${a}.`));
    if (!artifact) {
        throw new TypeError(
            `Cannot tell whether "${base}" builds a system or a module. ` +
                `Name it system.template.json or module.template.json, or pass ` +
                `\`artifact\` explicitly.`,
        );
    }
    return artifact;
}

/**
 * The repository's web address, from whatever spelling `package.json` carries.
 *
 * npm accepts several: a plain `https://` URL, the `git+https://…​.git` form npm
 * itself writes, and a trailing slash either way. Foundry fetches
 * `<url>/releases/latest/download/<artifact>.json` literally, so a `git+` prefix
 * or a `.git` suffix left in place yields a 404 on every update check — with no
 * error anywhere, because nothing fetches that URL until a user's Foundry does.
 * `sohl-kethira-basic` declares the `git+…​.git` form today.
 *
 * @param {string|{url?: string}} repository - `package.json`'s `repository`
 *   field, in either object or shorthand-string form.
 * @returns {string} The normalised `https://` URL, with no trailing slash.
 * @throws {TypeError} When no URL can be read. A manifest with no addresses is
 *   worse than a missing one: Foundry installs it and never offers an update.
 */
export function normalizeRepoUrl(repository) {
    const raw =
        typeof repository === "string" ? repository : (repository?.url ?? "");
    const url = String(raw)
        .trim()
        .replace(/^git\+/, "")
        .replace(/\.git$/, "")
        .replace(/\/+$/, "");
    if (!url) {
        throw new TypeError(
            "package.json declares no `repository.url`, so the manifest has no " +
                "release addresses to advertise. Add it.",
        );
    }
    return url;
}

/**
 * The four addresses a Foundry manifest advertises.
 *
 * `manifest` deliberately points at **`releases/latest`** rather than at this
 * version: it is the URL an *installed* package re-fetches to discover that a
 * newer one exists, so pinning it to the version being built would freeze every
 * install at that release forever. `download` points at this exact version,
 * because that is the archive this manifest describes.
 *
 * @param {object} opts
 * @param {string} opts.repoUrl - Normalised repository URL.
 * @param {string} opts.version - The version being built.
 * @param {"system"|"module"} opts.artifact - Which artifact is shipped.
 * @returns {{url: string, bugs: string, manifest: string, download: string}}
 */
export function releaseUrls({ repoUrl, version, artifact }) {
    return {
        url: repoUrl,
        bugs: `${repoUrl}/issues`,
        manifest: `${repoUrl}/releases/latest/download/${artifact}.json`,
        download: `${repoUrl}/releases/download/v${version}/${artifact}.zip`,
    };
}

/**
 * Stamp a manifest template with the facts that must not be transcribed.
 *
 * Pure: the template is not mutated, and the result is a new object.
 *
 * `flags` is merged **per namespace**, not wholesale, so a template may carry
 * its own keys under the same namespace and keep them. A caller supplies
 * whatever its package needs there — the credits journal's UUID, the settings
 * sidebar's links — because those are facts about one package, not about being
 * a Foundry package.
 *
 * @param {object} template - The parsed manifest template.
 * @param {object} opts
 * @param {string} opts.version - The version being built.
 * @param {string} opts.repoUrl - Normalised repository URL.
 * @param {"system"|"module"} opts.artifact - Which artifact is shipped.
 * @param {Record<string, object>} [opts.flags] - Namespaced flags to merge.
 * @returns {object} The stamped manifest.
 */
export function stampManifest(template, { version, repoUrl, artifact, flags }) {
    const stamped = {
        ...template,
        version,
        ...releaseUrls({ repoUrl, version, artifact }),
    };

    if (flags && Object.keys(flags).length) {
        stamped.flags = { ...(template.flags ?? {}) };
        for (const [namespace, values] of Object.entries(flags)) {
            stamped.flags[namespace] = {
                ...(template.flags?.[namespace] ?? {}),
                ...values,
            };
        }
    }

    return stamped;
}

/**
 * Read a manifest template, stamp it, and write the result into the stage.
 *
 * The only export here that touches disk. Everything it decides is decided by
 * the pure functions above, so the rules stay testable without a filesystem.
 *
 * @param {object} opts
 * @param {string} opts.templatePath - The manifest template to read.
 * @param {object} opts.packageJson - The parsed `package.json`, which owns the
 *   version and the repository address.
 * @param {string} opts.outDir - Directory to write the manifest into, created
 *   if absent.
 * @param {"system"|"module"} [opts.artifact] - Overrides the artifact inferred
 *   from the template's name.
 * @param {Record<string, object>} [opts.flags] - Namespaced flags to merge.
 * @returns {Promise<{path: string, manifest: object}>} Where it was written,
 *   and what was written.
 */
export async function writeFoundryManifest({
    templatePath,
    packageJson,
    outDir,
    artifact = undefined,
    flags = undefined,
}) {
    const kind = artifact ?? artifactFromTemplate(templatePath);
    const template = JSON.parse(await fs.readFile(templatePath, "utf8"));
    const manifest = stampManifest(template, {
        version: packageJson.version,
        repoUrl: normalizeRepoUrl(packageJson.repository),
        artifact: kind,
        flags,
    });

    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, `${kind}.json`);
    // Trailing newline: the file is committed to a release archive and read by
    // humans as often as by Foundry.
    await fs.writeFile(
        outPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf8",
    );
    return { path: outPath, manifest };
}
