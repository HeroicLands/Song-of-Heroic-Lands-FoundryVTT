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
 * The namespaced manifest flags this repository has to **work out** rather than
 * state, called by `package-build manifest` (package-build#9).
 *
 * Everything else in the manifest is a literal, and literals belong in
 * `package-build.config.yaml` — which is where the other 190-odd lines of the
 * retired `system.template.json` now live. What is left here is the one value
 * that cannot be written down: an address that does not exist until the content
 * tree has been walked.
 *
 * The rest of the `sohl` flag namespace is read from `package.json`, the file
 * that owns each of those URLs. They were transcribed into the template once,
 * and that is exactly the drift this whole change removes.
 *
 * @module
 */

import fs from "node:fs";
import path from "node:path";

import {
    authoredFrontmatter,
    indexRecordsFor,
    isNoteRecord,
} from "@heroiclands/package-build/engine/content-index";
import { compendiumUuid } from "@heroiclands/package-build/engine/ids";
import { noteDocId } from "@heroiclands/package-build/engine/note-ids";
import { packRouter } from "@heroiclands/package-build/engine/pack-router";

/** The `type` and `shortcode` the credits journal is addressed by. */
const CREDITS = { type: "doc", shortcode: "credits" };

/**
 * The compendium `@UUID` of the credits journal.
 *
 * Foundry's "Credits & Attributions" link opens this document, so the manifest
 * has to carry its address — and the address depends on which pack the journal
 * routed into and what id it compiled with. Neither is knowable without reading
 * the content tree, which is why this is code and not configuration.
 *
 * Fails loudly on absence or ambiguity. A manifest carrying a dead `@UUID`
 * gives the reader a link that silently opens nothing.
 *
 * @param {object} config - The resolved package-build configuration.
 * @returns {string} The credits journal's compendium UUID.
 */
function creditsUuid(config) {
    const contentBase = config.paths.content;
    // The corpus is derived once and handed to the pass that reads it, so no
    // two passes can disagree about which files the tree holds; `records` and
    // the resolved `config` are both required rather than re-derived here.
    const records = indexRecordsFor({ contentBase, config });
    const matches = records.filter(
        (record) =>
            isNoteRecord(record) &&
            record.package === config.contentPackage &&
            record.type === CREDITS.type &&
            record.shortcode === CREDITS.shortcode,
    );

    if (matches.length === 0) {
        throw new Error(
            `No content note found with package "${config.contentPackage}", ` +
                `type "${CREDITS.type}" and shortcode "${CREDITS.shortcode}" ` +
                `under ${contentBase}. The Credits journal is required by the ` +
                `manifest's \`flags.sohl.creditsUuid\`.`,
        );
    }
    if (matches.length > 1) {
        throw new Error(
            `Multiple notes claim shortcode "${CREDITS.shortcode}": ` +
                matches.map((record) => record.file.path).join(", "),
        );
    }

    const [note] = matches;
    // The id the credits journal compiles under: its pin if it has one, and
    // otherwise the id derived from its canonical address. Asked of the
    // engine rather than read off the frontmatter, because a note no longer
    // authors an `id` — reading `fm.id` here would address the journal by a
    // value that is usually absent, and the manifest would carry a dead
    // `@UUID`. `noteDocId` is the one function every pass asks, so the address
    // stamped here is the address the journals pass compiled.
    const fm = authoredFrontmatter(note);
    const id = noteDocId(fm);
    if (!id) {
        throw new Error(
            `The credits note (${note.file.path}) has no address — a note is ` +
                `addressed as "<type>-<shortcode>" and must declare both — so ` +
                `it compiles to no JournalEntry and cannot be addressed.`,
        );
    }

    return compendiumUuid(
        config.foundryPackage,
        CREDITS.type,
        id,
        packRouter().defaultOf("JournalEntry"),
    );
}

/**
 * The `sohl` flag namespace, merged into the generated manifest.
 *
 * @param {object} config - The resolved package-build configuration.
 * @returns {Record<string, object>} Namespaced flags.
 */
export function flags(config) {
    const pkg = JSON.parse(fs.readFileSync(path.join(config.rootDir, "package.json"), "utf8"));

    return {
        sohl: {
            mainSiteUrl: pkg.homepage,
            knowledgeBaseUrl: pkg.heroicLands.knowledgeBaseUrl,
            apiDocsUrl: pkg.heroicLands.apiDocsUrl,
            issuesUrl: `${pkg.repository.url}/issues`,
            discordInviteUrl: pkg.heroicLands.discordInviteUrl,
            creditsUuid: creditsUuid(config),
        },
    };
}
