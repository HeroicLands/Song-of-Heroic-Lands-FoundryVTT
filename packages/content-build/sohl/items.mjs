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
 * driven by `packages/content-build/engine/generate.mjs` (via `npm run build:compiledb`).
 *
 * The walk itself — filtering by package and type, skipping drafts,
 * expanding tables, converting wikilinks, writing the JSON and counting
 * errors — belongs to {@link sohl.utils.packs.BasePackCompiler}; this module
 * states only what makes this pass its own (#1509).
 */

import log from "loglevel";

import {
    sohlField,
    resolveName,
    resolveImg,
    buildStats,
    withArchetypeFlag,
} from "../engine/helpers.mjs";
import { BasePackCompiler } from "../engine/base-compiler.mjs";
// Per-type `system` builders live in the item-type registry — the one list
// `ITEM_TYPES` is derived from, so the whitelist and the builder table cannot
// disagree (#1504).
import { itemBuilder } from "./item-builders.mjs";
// Per-type default art lives in one framework-free module shared with the
// runtime (`SohlItem.getDefaultArtwork`), so the two can't drift — see #932.
// It lives in the build package, not `src/`: a relative path out of the package
// resolves to garbage once this pipeline runs from `node_modules` (#1510).
import { defaultItemArt } from "./default-item-art.mjs";
import { journalPageId, splitPages } from "../engine/journals.mjs";
import { FOUNDRY_PACKAGE_ID } from "../engine/content-package.mjs";
import {
    ITEM_TYPES,
    itemDocEntryId,
    itemDocPointer,
} from "../engine/item-docs.mjs";

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

export class Items extends BasePackCompiler {
    static id = "items";
    static label = "item";

    /**
     * How many of each item type this pass wrote, for the summary. Every type
     * is present from the start so the tally reads as a census of the
     * whitelist rather than of what happened to compile.
     *
     * @type {Record<string, number>}
     */
    counts = Object.fromEntries([...ITEM_TYPES].map((t) => [t, 0]));

    /**
     * Every content type that compiles into an item.
     *
     * @param {object} fm - The note's frontmatter.
     * @returns {boolean} True for a whitelisted item type.
     */
    selects(fm) {
        return Boolean(fm.type) && ITEM_TYPES.has(fm.type);
    }

    /** An item is named by its own type in the log, not by "item". */
    noteLabel(fm) {
        return fm.type;
    }

    /**
     * Construct the full compendium envelope for one item, including
     * synthesized Active Effects where applicable.
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} markdown - The body, tables expanded and wikilinks
     *   resolved.
     * @returns {object} The item document, keyed for the pack.
     */
    buildEntry(fm, markdown) {
        const type = fm.type;
        const name = resolveName(fm);
        const description = itemDescription(markdown, fm, name);
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

    /** @inheritdoc */
    onCompiled(fm) {
        this.counts[fm.type]++;
    }

    /** @inheritdoc */
    reportCompiled(stats) {
        log.info(`Compiled ${stats.compiled} items:`);
        for (const [t, n] of Object.entries(this.counts)) {
            if (n > 0) log.info(`  ${t}: ${n}`);
        }
    }

    /** @inheritdoc */
    reportDetail(stats) {
        log.debug(
            `Skipped ${stats.skippedOther} non-item file(s) (no recognized type)`,
        );
    }
}
