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
 * Journals pack compiler — produces JSON pack files for the "journals"
 * Foundry compendium from markdown notes in the `assets/content/` tree.
 *
 * The content root (`contentBase`) is walked recursively; any `.md` file
 * whose frontmatter declares `type: doc` and `package: sohl` is compiled
 * into one JournalEntry document. Each note's body is split on top-level
 * H1 headings; the optional content before the first H1 becomes an
 * "Introduction" page, and each subsequent H1 starts a new page named
 * after its heading text. All page bodies are rendered to HTML.
 *
 * Folder placement is identical to the items pack: `sohl.folder` in
 * frontmatter is the target folder's id (from folders.yaml), resolved
 * against a folders.yaml list via the constructor's `folderResolver`.
 *
 * Not a standalone script — exports the `Journals` compiler class, imported
 * and driven by `utils/packs/generate.mjs` (via `npm run build:compiledb`).
 */

import fs from "fs";
import path from "path";
import log from "loglevel";

import {
    walkMarkdownTree,
    sohlField,
    makeFilename,
    makeId,
    resolveName,
    buildStats,
    md,
    contentTld,
    buildContentLinkIndex,
    convertNoteWikilinks,
} from "./helpers.mjs";
import { anchorPageId } from "./wikilinks.mjs";

const STATS = buildStats("0.6.0");

/**
 * Splits a markdown body into pages by top-level H1 headings. Fenced
 * code blocks are respected so `# foo` inside ``` blocks doesn't trigger
 * a split. Content before the first H1 (if non-empty) becomes a leading
 * "Introduction" page. Each H1 yields a page whose name is the heading
 * text (with any `{#anchor-id}` suffix stripped out and surfaced as
 * `anchorId`).
 *
 * Returns an array of `{ name, anchorId, markdown }` in document order.
 */
function splitPages(body) {
    const lines = body.split("\n");
    const pages = [];
    const beforeFirstH1 = [];
    let current = null;
    let inCodeBlock = false;

    const closeCurrent = () => {
        if (!current) return;
        pages.push({
            name: current.name,
            anchorSlug: current.anchorSlug,
            level: current.level,
            markdown: current.lines.join("\n").trim(),
        });
        current = null;
    };

    for (const line of lines) {
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
        }

        // An H1 starts a page, as does any heading carrying an `{#slug}`
        // anchor: a Foundry UUID can only address a page, so a linkable
        // section has to be one.
        const headingMatch =
            !inCodeBlock ? line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/) : null;
        const rawHeading = headingMatch?.[2]?.trim();
        const anchorMatch = rawHeading?.match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
        const startsPage =
            headingMatch && (headingMatch[1].length === 1 || anchorMatch);
        if (startsPage) {
            closeCurrent();
            current = {
                name: (anchorMatch ? anchorMatch[1] : rawHeading).trim(),
                anchorSlug: anchorMatch?.[2]?.trim() || null,
                level: headingMatch[1].length,
                lines: [],
            };
            continue;
        }

        if (current) {
            current.lines.push(line);
        } else {
            beforeFirstH1.push(line);
        }
    }
    closeCurrent();

    const intro = beforeFirstH1.join("\n").trim();
    if (intro) {
        pages.unshift({
            name: "Introduction",
            anchorSlug: null,
            level: 1,
            markdown: intro,
        });
    }

    return pages;
}

export class Journals {
    static id = "journals";

    /** @type {string} */
    contentBase;
    /** @type {string} */
    outputDir;
    /** @type {(path: string|null) => string|null} */
    folderResolver;
    /** @type {number} */
    errorCount = 0;

    constructor({ contentBase, dest, folderResolver = () => null }) {
        if (!contentBase) {
            throw new Error("Journals compiler requires `contentBase`");
        }
        if (!fs.existsSync(contentBase)) {
            throw new Error(`Content tree not found at ${contentBase}`);
        }
        Object.defineProperty(this, "contentBase", {
            value: contentBase,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: dest,
            writable: false,
        });
        Object.defineProperty(this, "folderResolver", {
            value: folderResolver,
            writable: false,
        });
    }

    writeEntry(doc) {
        const fname = makeFilename(doc.name, doc._id);
        fs.writeFileSync(
            path.join(this.outputDir, fname),
            JSON.stringify(doc, null, 2),
            "utf8",
        );
    }

    buildPages(rawPages, entryId, noteName) {
        if (rawPages.length === 0) {
            throw new Error(
                `note "${noteName}" has no Introduction content and no H1 headings — nothing to compile`,
            );
        }
        return rawPages.map((page, index) => {
            // An anchored page takes the id its inbound links compute from the
            // note id and the slug, so link and page agree without shared state.
            const pageId = page.anchorSlug
                ? anchorPageId(entryId, page.anchorSlug)
                : makeId("journal-page", `${entryId}:${index}:${page.name}`);
            return {
                _id: pageId,
                name: page.name,
                type: "text",
                title: { show: true, level: page.level ?? 1 },
                text: {
                    format: 1,
                    content: page.markdown ? md.render(page.markdown) : "",
                },
                _key: `!journal.pages!${entryId}.${pageId}`,
            };
        });
    }

    buildEntry(fm, body, tld) {
        const name = resolveName(fm);
        const id = fm.id;
        const { markdown, unresolved } = convertNoteWikilinks(body, {
            tld,
            id,
            index: this.linkIndex,
            name,
        });
        this.unresolvedLinks += unresolved.length;
        const rawPages = splitPages(markdown);
        const pages = this.buildPages(rawPages, id, name);

        const folderId = sohlField(fm, "folder", null);
        const folder = this.folderResolver(folderId);

        return {
            name,
            pages,
            folder,
            sort: 0,
            ownership: { default: 0 },
            flags: fm.flags || {},
            _id: id,
            _stats: STATS,
            _key: `!journal!${id}`,
        };
    }

    /** @see contentTld */
    tldOf(absPath) {
        return contentTld(this.contentBase, absPath);
    }

    async compile() {
        let compiled = 0;
        let skippedNoId = 0;
        let skippedDraft = 0;
        let skippedOther = 0;

        this.linkIndex = buildContentLinkIndex(this.contentBase);
        this.unresolvedLinks = 0;

        for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
            this.contentBase,
        )) {
            if (!fm || fm.type !== "doc" || fm.package !== "sohl") {
                skippedOther++;
                continue;
            }
            if (fm.draft === true) {
                skippedDraft++;
                log.debug(`Skipping draft: ${absPath}`);
                continue;
            }
            if (!fm.id) {
                skippedNoId++;
                log.warn(`Journal note missing id, skipping: ${absPath}`);
                continue;
            }

            log.debug(`Processing journal: ${resolveName(fm)} (${absPath})`);
            try {
                const doc = this.buildEntry(fm, body, this.tldOf(absPath));
                this.writeEntry(doc);
                compiled++;
            } catch (err) {
                this.errorCount++;
                log.error(
                    `Failed to compile journal at ${absPath}: ${err.message}`,
                );
            }
        }

        log.info(`Compiled ${compiled} journal entr${compiled === 1 ? "y" : "ies"}`);
        if (this.unresolvedLinks) {
            log.info(
                `${this.unresolvedLinks} wikilink(s) left as literal text (no target in the content tree)`,
            );
        }
        if (skippedNoId) log.info(`Skipped ${skippedNoId} note(s) missing id`);
        if (skippedDraft) log.info(`Skipped ${skippedDraft} draft(s)`);
        log.debug(
            `Skipped ${skippedOther} non-doc file(s) (not type:doc package:sohl)`,
        );
    }
}
