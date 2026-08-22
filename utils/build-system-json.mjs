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
 * Generate this repository's Foundry `system.json`.
 *
 * **Being a Foundry package is `@heroiclands/package-build`'s job**, not this
 * script's: reading the template, stamping the version and the four release
 * addresses, and writing the result into the stage is the same work every
 * HeroicLands package does, and `sohl-thalorna` carries a forked copy of it
 * today. What stays here is only what is true of *this* package.
 *
 * Two things are:
 *
 * - the **settings-sidebar links**, single-sourced from `package.json` so the
 *   running system reads them rather than hardcoding them;
 * - the **Credits & Attributions journal's UUID**, resolved from the content
 *   tree so the note's frontmatter `id` stays the single source of truth.
 *
 * Usage:
 *   npm run build:system             // node utils/build-system-json.mjs
 *   node utils/build-system-json.mjs // direct invocation (no args)
 */

import { readFile } from "fs/promises";
import { resolve } from "path";

import { collectContentDocs } from "@heroiclands/content-build/engine/helpers";
import { compendiumUuid } from "@heroiclands/content-build/engine/ids";
import { packRouter as loadPackRouter } from "@heroiclands/content-build/engine/pack-router";
import {
    contentPackage,
    foundryPackageId,
} from "@heroiclands/content-build/engine/content-package";
import { writeFoundryManifest } from "@heroiclands/package-build/manifest";

// Resolved once, here, rather than at each use. The package exports these as
// accessors so that *importing* a module never needs a consumer config
// (#1559); this is a build entry point, which always has one, so reading them
// at module scope is the same instant the script runs.
const CONTENT_PACKAGE = contentPackage();
const FOUNDRY_PACKAGE_ID = foundryPackageId();
const packRouter = loadPackRouter();

const STAGE_DIR = resolve("build/stage");
const systemTemplatePath = resolve("assets/templates/system.template.json");
const packageJsonPath = resolve("package.json");
const contentBase = resolve("assets/content");

/**
 * The `shortcode` of the note that becomes the Credits & Attributions journal.
 *
 * Its Foundry UUID is stamped into `flags.sohl.creditsUuid` below so the runtime
 * never hardcodes a document id — the note's frontmatter `id` stays the single
 * source of truth, and the two cannot drift.
 */
const CREDITS_SHORTCODE = "credits";

/**
 * Resolve the credits note's compendium UUID from the content tree.
 *
 * Fails the build rather than emitting an empty flag: a silently absent UUID
 * would ship a system whose Credits link and settings menu both quietly do
 * nothing.
 *
 * @returns {string} `Compendium.sohl.journals.JournalEntry.<id>`
 * @throws {Error} When no note, or more than one, claims the shortcode.
 */
function resolveCreditsUuid() {
    const matches = collectContentDocs(contentBase).filter(
        (d) =>
            d.fm?.package === CONTENT_PACKAGE &&
            d.fm?.type === "doc" &&
            d.fm?.shortcode === CREDITS_SHORTCODE,
    );
    if (matches.length === 0) {
        throw new Error(
            `No content note found with package "${CONTENT_PACKAGE}", type "doc" ` +
                `and shortcode "${CREDITS_SHORTCODE}" under ${contentBase}. ` +
                `The Credits journal is required; add the note or update ` +
                `CREDITS_SHORTCODE.`,
        );
    }
    if (matches.length > 1) {
        throw new Error(
            `Multiple notes claim shortcode "${CREDITS_SHORTCODE}": ` +
                matches.map((m) => m.path).join(", "),
        );
    }
    const [note] = matches;
    if (!note.fm.id) {
        throw new Error(
            `The credits note (${note.path}) has no frontmatter \`id\`, so it ` +
                `compiles to no JournalEntry and cannot be addressed.`,
        );
    }
    // The credits note compiles into a JournalEntry, so it ships in the
    // default JournalEntry pack whatever else the repository declares (#1566).
    return compendiumUuid(
        FOUNDRY_PACKAGE_ID,
        "doc",
        note.fm.id,
        packRouter.defaultOf("JournalEntry"),
    );
}

const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));

const { path: written } = await writeFoundryManifest({
    templatePath: systemTemplatePath,
    packageJson: pkg,
    outDir: STAGE_DIR,
    // External links for the settings-sidebar "Game System" section, each used
    // as given: one unversioned tree of API documentation is published, for the
    // newest release (#1452), so there is no per-version address for a running
    // system to point at and nothing to compose.
    flags: {
        sohl: {
            mainSiteUrl: pkg.homepage,
            knowledgeBaseUrl: pkg.heroicLands.knowledgeBaseUrl,
            apiDocsUrl: pkg.heroicLands.apiDocsUrl,
            issuesUrl: `${pkg.repository.url}/issues`,
            discordInviteUrl: pkg.heroicLands.discordInviteUrl,
            // Resolved from the content tree rather than hardcoded — see
            // resolveCreditsUuid above. A module ships the same key in its own
            // manifest, which is the whole of what
            // `sohl.apps.foundry.registerCreditsMenu` needs from it.
            creditsUuid: resolveCreditsUuid(),
        },
    },
});

console.log(`✅ Wrote ${written}`);
