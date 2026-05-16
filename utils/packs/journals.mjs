/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Foundry compendium from markdown notes in the HeroicLands vault.
 *
 * The vault root (`vaultBase`) is walked recursively; any `.md` file
 * whose frontmatter declares `type: doc` and `package: sohl` is compiled
 * into one JournalEntry document. Each note's body is split on top-level
 * H1 headings; the optional content before the first H1 becomes an
 * "Introduction" page, and each subsequent H1 starts a new page named
 * after its heading text. All page bodies are rendered to HTML.
 *
 * Folder placement is identical to the items pack: `sohl.folder` in
 * frontmatter is the target folder's id (from folders.yaml), resolved
 * against a folders.yaml list via the constructor's `folderResolver`.
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
} from "./helpers.mjs";

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
            anchorId: current.anchorId,
            markdown: current.lines.join("\n").trim(),
        });
        current = null;
    };

    for (const line of lines) {
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
        }

        const h1Match =
            !inCodeBlock ? line.match(/^\s*#\s+(.+?)\s*#*\s*$/) : null;
        if (h1Match) {
            closeCurrent();
            const rawHeading = h1Match[1].trim();
            const anchorMatch = rawHeading.match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
            const name = (anchorMatch ? anchorMatch[1] : rawHeading).trim();
            const anchorId = anchorMatch?.[2]?.trim() || null;
            current = { name, anchorId, lines: [] };
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
        pages.unshift({ name: "Introduction", anchorId: null, markdown: intro });
    }

    return pages;
}

export class Journals {
    static id = "journals";

    /** @type {string} */
    vaultBase;
    /** @type {string} */
    outputDir;
    /** @type {(path: string|null) => string|null} */
    folderResolver;
    /** @type {number} */
    errorCount = 0;

    constructor({ vaultBase, dest, folderResolver = () => null }) {
        if (!vaultBase) {
            throw new Error("Journals compiler requires `vaultBase`");
        }
        if (!fs.existsSync(vaultBase)) {
            throw new Error(
                `HeroicLands vault not found at ${vaultBase} — expected sibling to the SoHL project`,
            );
        }
        Object.defineProperty(this, "vaultBase", {
            value: vaultBase,
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
            const pageId =
                page.anchorId ||
                makeId(
                    "journal-page",
                    `${entryId}:${index}:${page.name}`,
                );
            return {
                _id: pageId,
                name: page.name,
                type: "text",
                title: { show: true, level: 1 },
                text: {
                    format: 1,
                    content: page.markdown ? md.render(page.markdown) : "",
                },
                _key: `!journal.pages!${entryId}.${pageId}`,
            };
        });
    }

    buildEntry(fm, body) {
        const name = resolveName(fm);
        const id = fm.id;
        const rawPages = splitPages(body);
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

    async compile() {
        let compiled = 0;
        let skippedNoId = 0;
        let skippedDraft = 0;
        let skippedOther = 0;

        for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
            this.vaultBase,
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
                const doc = this.buildEntry(fm, body);
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
        if (skippedNoId) log.info(`Skipped ${skippedNoId} note(s) missing id`);
        if (skippedDraft) log.info(`Skipped ${skippedDraft} draft(s)`);
        log.debug(
            `Skipped ${skippedOther} non-doc file(s) (not type:doc package:sohl)`,
        );
    }
}
