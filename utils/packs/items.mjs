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
 * Items pack compiler — produces JSON pack files for the single "items"
 * Foundry compendium from markdown notes in the `assets/content/` tree.
 *
 * The content root (`contentBase`) is walked recursively; any `.md` file whose
 * frontmatter declares a recognized `type:` is compiled into one JSON entry.
 * Files outside the whitelist (blog posts, rules text, templates) are
 * silently skipped.
 *
 * Type-specific `system.*` fields come from the nested `sohl:` block in
 * vault frontmatter, read via `sohlField()`. The body is **not** rendered
 * here: it compiles into the item's doc in the journals pack, and
 * `system.docHtml` becomes a pointer to it (see `item-docs.mjs`). Folder
 * assignment is deferred — every item currently emits `folder: null`.
 *
 * Not a standalone script — exports the `Items` compiler class, imported and
 * driven by `utils/packs/generate.mjs` (via `npm run build:compiledb`).
 */

import fs from "fs";
import path from "path";
import log from "loglevel";

import {
    walkMarkdownTree,
    sohlField,
    makeFilename,
    resolveName,
    resolveImg,
    buildStats,
    withArchetypeFlag,
    buildContentLinkIndex,
    convertNoteWikilinks,
    collectContentDocs,
    expandNoteTables,
} from "./helpers.mjs";
// Per-type `system` builders live in the item-type registry — the one list
// `ITEM_TYPES` is derived from, so the whitelist and the builder table cannot
// disagree (#1504).
import { itemBuilder } from "./item-builders.mjs";
// Per-type default art lives in one framework-free module shared with the
// runtime (`SohlItem.getDefaultArtwork`), so the two can't drift — see #932.
// It lives in the build package, not `src/`: a relative path out of the package
// resolves to garbage once this pipeline runs from `node_modules` (#1510).
import { defaultItemArt } from "@heroiclands/content-build/sohl/default-item-art";
import { journalPageId, splitPages } from "./journals.mjs";
import { CONTENT_PACKAGE, FOUNDRY_PACKAGE_ID } from "./content-package.mjs";
import { ITEM_TYPES, itemDocEntryId, itemDocPointer } from "./item-docs.mjs";

const STATS = buildStats();

/**
 * The description an item carries: a pointer to its **item doc**, the
 * JournalEntry the journals pass compiles this same body into (#1348).
 *
 * The prose is not rendered here at all. Carrying it would duplicate it onto
 * every actor holding the item — 7.59 MB of copies across the actors pack, of
 * which 133 KB was distinct — where a link is 60 bytes and always current. The
 * two passes derive the target from the note's own id, so neither has to see
 * the other's output; both split the *converted* markdown, so an H1 carrying a
 * wikilink names the same page on both sides.
 *
 * An item with no prose points at nothing, exactly as the journals pass writes
 * no entry for it.
 *
 * @param {string} markdown - The note body, tables expanded and wikilinks
 *   resolved.
 * @param {object} fm - The note's frontmatter.
 * @param {string} name - The item's name.
 * @returns {string} The pointer, or "" for a note with no body.
 */
function itemDescription(markdown, fm, name) {
    if (!String(markdown).trim()) return "";
    const [leadPage] = splitPages(markdown, name);
    const pageId = journalPageId(itemDocEntryId(fm.id), leadPage, 0);
    return itemDocPointer(FOUNDRY_PACKAGE_ID, fm.id, name, pageId);
}

/**
 * Build the `system.*` fields shared by every item type:
 *   shortcode, actionDefs, notes, docHtml.
 */
function commonSystem(fm, description) {
    return {
        shortcode: fm.shortcode,
        actionDefs: Array.isArray(fm.actionDefs) ? fm.actionDefs : [],
        notes: "",
        docHtml: description || "",
    };
}

/* -------------------------------------------------------------------- */
/*  Synthesized Active Effects                                          */
/* -------------------------------------------------------------------- */

/* -------------------------------------------------------------------- */
/*  Compiler                                                            */
/* -------------------------------------------------------------------- */

export class Items {
    static id = "items";

    /** @type {string} */
    contentBase;
    /** @type {string} */
    outputDir;
    /** @type {(path: string|null) => string|null} */
    folderResolver;
    /** @type {number} */
    errorCount = 0;

    /**
     * Entries this pass wrote to its own pack. Zero from a non-empty content
     * tree is a build failure, not a quiet no-op — see `generate.mjs`.
     *
     * @type {number}
     */
    compiledCount = 0;

    constructor({ contentBase, dest, folderResolver = () => null }) {
        if (!contentBase) {
            throw new Error("Items compiler requires `contentBase`");
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

    writeItem(outputData) {
        const fname = makeFilename(outputData.name, outputData._id);
        const outputPath = path.join(this.outputDir, fname);
        fs.writeFileSync(
            outputPath,
            JSON.stringify(outputData, null, 2),
            "utf8",
        );
    }

    /**
     * Construct the full compendium envelope for one item, including
     * synthesized Active Effects where applicable.
     */
    buildEntry(type, fm, description) {
        const name = resolveName(fm);
        const id = fm.id;
        const system = {
            ...commonSystem(fm, description),
            ...itemBuilder(type)(fm),
        };

        const effects = Array.isArray(fm.effects) ? [...fm.effects] : [];

        const folderId = sohlField(fm, "folder", null);
        const folder = this.folderResolver(folderId);

        return {
            name,
            type,
            img: resolveImg(fm.img) || defaultItemArt(type),
            _id: id,
            system,
            effects,
            // `sohl.archetype` (required nullable number) drives
            // `flags.sohl.docArchetype` (#640 / archetype contract #604).
            flags: withArchetypeFlag(fm, fm.flags, `item "${name}"`),
            _stats: STATS,
            ownership: { default: 0 },
            folder,
            _key: `!items!${id}`,
        };
    }

    async compile() {
        const counts = Object.fromEntries(
            [...ITEM_TYPES].map((t) => [t, 0]),
        );
        let skippedDraft = 0;
        let skippedOtherType = 0;

        this.linkIndex = buildContentLinkIndex(this.contentBase);
        this.contentDocs = collectContentDocs(this.contentBase);
        this.unresolvedLinks = 0;

        for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
            this.contentBase,
        )) {
            if (!fm || fm.package !== CONTENT_PACKAGE) {
                skippedOtherType++;
                continue;
            }
            const type = fm.type;
            if (!type || !ITEM_TYPES.has(type)) {
                skippedOtherType++;
                continue;
            }
            if (fm.draft === true) {
                skippedDraft++;
                log.debug(`Skipping draft: ${absPath}`);
                continue;
            }
            if (!fm.id) {
                // Fatal, not a warning: a skipped item silently vanishes from
                // the compendium while its KB page and content still build, so
                // the omission is invisible until someone looks for the item.
                // Matches the folder-id check in helpers.mjs, which throws.
                throw new Error(`Item missing id: ${absPath}`);
            }

            log.debug(`Processing ${type}: ${resolveName(fm)} (${absPath})`);
            try {
                // Wikilinks resolve against the whole content tree, so an item
                // may link to another item, a creature, or a rules journal.
                // Generated tables expand before wikilinks, so a cell
                // they emit is resolved along with the authored links.
                const tabulated = expandNoteTables(body, {
                    docs: this.contentDocs,
                    name: resolveName(fm),
                    pkg: fm.package,
                    fm,
                });
                const { markdown, unresolved } = convertNoteWikilinks(tabulated, {
                    type,
                    id: fm.id,
                    index: this.linkIndex,
                    name: resolveName(fm),
                });
                this.unresolvedLinks += unresolved.length;
                const entry = this.buildEntry(
                    type,
                    fm,
                    itemDescription(markdown, fm, resolveName(fm)),
                );
                this.writeItem(entry);
                counts[type]++;
            } catch (err) {
                this.errorCount++;
                log.error(
                    `Failed to compile ${type} at ${absPath}: ${err.message}`,
                );
            }
        }

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        this.compiledCount = total;
        log.info(`Compiled ${total} items:`);
        for (const [t, n] of Object.entries(counts)) {
            if (n > 0) log.info(`  ${t}: ${n}`);
        }
        if (skippedDraft) log.info(`Skipped ${skippedDraft} draft(s)`);
        log.debug(
            `Skipped ${skippedOtherType} non-item file(s) (no recognized type)`,
        );
    }
}
