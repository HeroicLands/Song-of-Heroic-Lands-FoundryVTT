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
 * whose frontmatter declares `package: sohl` and either `type: doc` or a
 * **doc-carrying type** ({@link sohl.utils.packs.DOC_ENTRY_TYPES} — every item
 * type, plus `macro`) is compiled into one JournalEntry document. Each note's
 * body is split on top-level H1 headings; the optional content before the
 * first H1 becomes a lead page, and each subsequent H1 starts a new page named
 * after its heading text. All page bodies are rendered to HTML.
 *
 * A doc-carrying note compiles into that document's **documentation** — the
 * same prose and pages, filed in the same folder as the document itself, which
 * keeps only a pointer to it. See `item-docs.mjs` for why, and for the ids the
 * two passes agree on. A macro note's `{#script}` page is compiled here like
 * any other: the macro pass reads the same page independently, and withholds
 * nothing from the journal (#1514).
 *
 * Folder placement is identical to the items pack: `sohl.folder` in
 * frontmatter is the target folder's id (from folders.yaml), resolved
 * against a folders.yaml list via the constructor's `folderResolver`. A
 * documentation entry reuses its document's folder id verbatim.
 *
 * Not a standalone script — exports the `Journals` compiler class, imported
 * and driven by `packages/content-build/engine/generate.mjs` (via `npm run build:compiledb`).
 *
 * The walk itself — filtering by package and type, skipping drafts,
 * expanding tables, converting wikilinks, writing the JSON and counting
 * errors — belongs to {@link sohl.utils.packs.BasePackCompiler}; this module
 * states only what makes this pass its own (#1509).
 */

import log from "loglevel";

import { sohlField, makeId, resolveName, buildStats, md } from "./helpers.mjs";
import { BasePackCompiler } from "./base-compiler.mjs";
import { CONTENT_PACKAGE } from "./content-package.mjs";
import { anchorPageId } from "./wikilinks.mjs";
import { hasDocEntry, itemDocEntryId } from "./item-docs.mjs";

const STATS = buildStats();

/**
 * Splits a markdown body into pages by top-level H1 headings. Fenced
 * code blocks are respected so `# foo` inside ``` blocks doesn't trigger
 * a split. Content before the first H1 (if non-empty) becomes a leading
 * page. Each H1 yields a page whose name is the heading
 * text (with any `{#anchor-id}` suffix stripped out and surfaced as
 * `anchorId`).
 *
 * `leadName` names that leading page. A journal note's is "Introduction",
 * because it introduces the pages that follow. An item doc's is the item — a
 * note with no headings at all is one page holding the whole description, and
 * calling that page "Introduction" would label the description as a preamble to
 * nothing.
 *
 * Returns an array of `{ name, anchorId, markdown }` in document order.
 */
export function splitPages(body, leadName = "Introduction") {
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
            name: leadName,
            anchorSlug: null,
            level: 1,
            markdown: intro,
        });
    }

    return pages;
}

/**
 * Two headings in one note sharing an `{#anchor}` derive the same page id, which
 * the LevelDB packer reports only as an opaque duplicate-key collision. Catch it
 * here, where the note and the slug can be named.
 *
 * @param {Array<{anchorSlug: string|null}>} rawPages - From {@link splitPages}.
 * @param {string} noteName - The note, for the error message.
 * @throws {Error} When an anchor is declared twice in the same note.
 */
export function assertUniqueAnchors(rawPages, noteName) {
    const seen = new Set();
    for (const page of rawPages) {
        if (!page.anchorSlug) continue;
        if (seen.has(page.anchorSlug)) {
            throw new Error(
                `note "${noteName}" declares the anchor {#${page.anchorSlug}} on more than one heading; an anchor must be unique within its note`,
            );
        }
        seen.add(page.anchorSlug);
    }
}

/**
 * The id of one page within its entry.
 *
 * An anchored page takes the id its inbound links compute from the note id and
 * the slug, so link and page agree without shared state. Every other page is
 * keyed by its position and name, which is what lets the items pass address an
 * item doc's first page without having compiled it (see
 * {@link sohl.utils.packs.itemDocPointer}).
 *
 * @param {string} entryId - The owning JournalEntry's `_id`.
 * @param {{anchorSlug: string|null, name: string}} page - From {@link splitPages}.
 * @param {number} index - The page's position in the entry.
 * @returns {string} A 16-character Foundry id.
 */
export function journalPageId(entryId, page, index) {
    return page.anchorSlug ?
            anchorPageId(entryId, page.anchorSlug)
        :   makeId("journal-page", `${entryId}:${index}:${page.name}`);
}

/**
 * Compile split pages into JournalEntryPage documents.
 *
 * @param {Array<object>} rawPages - From {@link splitPages}.
 * @param {string} entryId - The owning JournalEntry's `_id`.
 * @param {string} noteName - The note, for error messages.
 * @returns {Array<{_id: string, name: string, type: string,
 *   title: {show: boolean, level: number},
 *   text: {format: number, content: string}, _key: string}>} The page
 *   documents, in order.
 * @throws {Error} When the note has no content at all, or repeats an anchor.
 */
export function buildPages(rawPages, entryId, noteName) {
    if (rawPages.length === 0) {
        throw new Error(
            `note "${noteName}" has no Introduction content and no H1 headings — nothing to compile`,
        );
    }
    assertUniqueAnchors(rawPages, noteName);
    return rawPages.map((page, index) => {
        const pageId = journalPageId(entryId, page, index);
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

/**
 * Assemble one JournalEntry document from a note's converted markdown.
 *
 * Shared with the scenes pass, which needs the *same* entry a map note's prose
 * compiles into so it can bundle it into an Adventure alongside the Scene. Two
 * passes deriving the same document from the same body is what keeps a map
 * pin's `pageId` pointing at a page that actually exists.
 *
 * @param {object} params
 * @param {string} params.id - The entry's `_id`.
 * @param {string} params.name - The entry's name.
 * @param {string} params.markdown - The body, tables expanded and wikilinks
 *   resolved.
 * @param {string} [params.leadName] - Name for the page before the first
 *   heading; see {@link splitPages}.
 * @param {string|null} [params.folder] - The folder id, or `null`.
 * @param {object} [params.flags] - Document flags.
 * @returns {object} The JournalEntry document, keyed for the pack.
 */
export function buildJournalEntry({
    id,
    name,
    markdown,
    leadName,
    folder = null,
    flags,
}) {
    const rawPages = splitPages(markdown, leadName);
    const pages = buildPages(rawPages, id, name);
    return {
        name,
        pages,
        folder,
        sort: 0,
        ownership: { default: 0 },
        flags: flags || {},
        _id: id,
        _stats: STATS,
        _key: `!journal!${id}`,
    };
}

export class Journals extends BasePackCompiler {
    static id = "journals";
    static label = "journal";

    /**
     * A note with no id is skipped with a warning rather than failing the
     * build: unlike an item or a macro, an unidentified journal note is prose
     * that simply never became an entry.
     */
    static requiresId = false;

    /**
     * How many of the compiled entries were documentation for a document
     * compiled elsewhere, for the summary.
     *
     * @type {number}
     */
    docEntries = 0;

    /**
     * Journal notes, plus every doc-carrying note — an item's prose is its
     * documentation, so it compiles here and the item keeps a pointer to it
     * (#1348); a macro's is the same arrangement (#1514), and so is a map's,
     * whose prose is the place description its pins point at (#1525).
     *
     * The membership is {@link sohl.utils.packs.DOC_ENTRY_TYPES}, read through
     * {@link sohl.utils.packs.hasDocEntry} — the one set the link manifest also
     * reads, so what compiles and what is published cannot drift apart.
     *
     * @param {object} fm - The note's frontmatter.
     * @returns {boolean} True for a `doc` note or a doc-carrying note.
     */
    selects(fm) {
        return fm.type === "doc" || hasDocEntry(fm.type);
    }

    /**
     * An item with no prose gets no doc, and the items pass leaves its
     * description empty rather than pointing at nothing; a map with no prose
     * gets no entry and no pin target. The two passes apply the same rule to
     * the same body, so they agree.
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} body - The note body, frontmatter stripped.
     * @returns {boolean} True to skip the note.
     */
    skipNote(fm, body) {
        return hasDocEntry(fm.type) && !String(body).trim();
    }

    /**
     * Compile one note into a JournalEntry.
     *
     * A `doc` note becomes the entry its frontmatter describes. A
     * **doc-carrying note** — every item note, and every macro note — becomes
     * that document's documentation instead: the same prose, the same pages,
     * in the same folder, under an id derived from the note's, so the pointer
     * the items pass wrote resolves to it (see
     * {@link sohl.utils.packs.itemDocPointer}). A macro's `{#script}` page is
     * compiled here like any other; nothing is withheld from the journal
     * because the macro pass also reads it (#1514).
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} markdown - The body, tables expanded and wikilinks
     *   resolved. The links are resolved from the note as authored — against
     *   the note's own id, not the entry's.
     * @returns {object} The JournalEntry document.
     */
    buildEntry(fm, markdown) {
        const name = resolveName(fm);
        const ownsDoc = hasDocEntry(fm.type);
        const id = ownsDoc ? itemDocEntryId(fm.id) : fm.id;

        // A documentation entry is filed exactly where the document it
        // describes is, so the journals pack mirrors the items pack and a doc
        // sits under the same heading a reader found the item under. The id is
        // taken verbatim rather than through `folderResolver`, which validates
        // against this pack's own folders.yaml — an item folder is declared in
        // the items one, a macro folder in the macros one, and a map's in the
        // scenes one.
        const folderId = sohlField(fm, "folder", null);
        const folder = ownsDoc ? folderId : this.folderResolver(folderId);

        return buildJournalEntry({
            id,
            name,
            markdown,
            // A doc-carrying note's lead page is the document itself, not an
            // "Introduction" — see {@link splitPages}.
            leadName: ownsDoc ? name : undefined,
            folder,
            flags: fm.flags,
        });
    }

    /** @inheritdoc */
    onCompiled(fm) {
        if (hasDocEntry(fm.type)) this.docEntries++;
    }

    /** @inheritdoc */
    reportCompiled(stats) {
        log.info(
            `Compiled ${stats.compiled} journal entr${stats.compiled === 1 ? "y" : "ies"} (${this.docEntries} documentation entr${this.docEntries === 1 ? "y" : "ies"})`,
        );
    }

    /** @inheritdoc */
    reportDetail(stats) {
        log.debug(
            `Skipped ${stats.skippedOther} non-doc file(s) ` +
                `(not type:doc package:${CONTENT_PACKAGE})`,
        );
    }
}
