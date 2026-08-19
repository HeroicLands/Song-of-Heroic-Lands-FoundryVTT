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
 * Macros pack compiler — produces JSON pack files for the "macros" Foundry
 * compendium from markdown notes in the `assets/content/` tree.
 *
 * A `type: macro` note compiles into **two** documents, and this module writes
 * only the first of them:
 *
 * 1. the **Macro**, whose `command` is the script the note carries; and
 * 2. a **JournalEntry** holding the note's documentation, compiled by the
 *    journals pass exactly as an item's prose is (see `item-docs.mjs`) and
 *    addressed by the virtual `docmacro/<shortcode>` qualifier.
 *
 * **The command is read from the raw markdown, never from the journal
 * pipeline's output.** The two copies diverge on purpose: the journal's is
 * table-expanded and wikilink-converted, so it is prose *about* the script,
 * while the executable copy must be exactly what the author typed. The
 * command is the first **language-tagged** JS fence on the page anchored
 * `{#script}`; prose around it and any later fence are ignored here and still
 * render in the journal.
 *
 * **Why an anchored page rather than "the first fence in the note".** The
 * anchor is what makes the script addressable — `[[docmacro-autoattack#script]]`
 * opens the page holding it — and what lets a note document its macro with
 * example snippets that are plainly not the macro.
 *
 * **This does not compile data into code.** A Macro's `command` is authored
 * source shipped as content and executed by Foundry's own macro runner under
 * the user's permission — the mechanism the security model already blesses.
 * Nothing here evaluates, compiles, or revives anything.
 *
 * Not a standalone script — exports the `Macros` compiler class, imported and
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
} from "./helpers.mjs";
import { CONTENT_PACKAGE } from "./content-package.mjs";
import { splitPages } from "./journals.mjs";

const STATS = buildStats();

/**
 * The anchor the executable script lives under: `# Script {#script}`.
 *
 * A reserved slug rather than a heading name, because the heading is prose an
 * author may word freely ("The Script", "Source") while the address must be
 * stable — it is what the compiler looks for and what an inbound section link
 * spells.
 */
export const MACRO_SCRIPT_ANCHOR = "script";

/**
 * The Foundry macro types (`CONST.MACRO_TYPES`).
 *
 * Only `script` compiles. `chat` is a real Foundry type but a different
 * document altogether — its `command` is chat text, not source, so none of the
 * fence rules above apply to it — and half-implementing it would ship a macro
 * whose body was a code block posted verbatim into chat.
 */
export const MACRO_TYPES = Object.freeze(["script", "chat"]);

/** The Foundry macro scopes (`CONST.MACRO_SCOPES`), in schema order. */
export const MACRO_SCOPES = Object.freeze(["global", "actors", "actor"]);

/**
 * Foundry's own default macro artwork, used when a note authors no `img`.
 *
 * A core path, deliberately: it is not translated by {@link resolveImg} (which
 * roots `icons/…` under this system's assets), so it must be stated after that
 * translation rather than as authored frontmatter.
 */
export const DEFAULT_MACRO_IMG = "icons/svg/dice-target.svg";

/** The fence tags that mark a block as the macro's executable source. */
const JS_FENCE_TAGS = new Set(["js", "javascript"]);

/**
 * The body of the first **language-tagged** JavaScript fence in a markdown
 * block, verbatim.
 *
 * "Language-tagged" is the whole rule: an untagged fence is a code sample
 * whose language nobody stated, and treating it as the macro's source would
 * make an author's illustrative snippet executable. A fence tagged for another
 * language is skipped for the same reason.
 *
 * The opening delimiter may be longer than three backticks, so a script may
 * itself contain a fence; the closing delimiter must be at least as long, as
 * CommonMark requires.
 *
 * @param {string} markdown - The markdown to search.
 * @returns {string|null} The fence's contents, with no trailing newline, or
 *   `null` when the block holds no tagged JS fence.
 */
export function extractJsFence(markdown) {
    const lines = String(markdown ?? "").split("\n");
    for (let i = 0; i < lines.length; i++) {
        const open = lines[i].match(/^\s*(`{3,})\s*([^\s`]*)/);
        if (!open) continue;
        const [, delim, info] = open;
        // Every fence is consumed, tagged or not — the scan resumes after its
        // close, so a snippet inside an untagged block can never be read as
        // the macro's source.
        let end = -1;
        for (let j = i + 1; j < lines.length; j++) {
            if (new RegExp(`^\\s*\`{${delim.length},}\\s*$`).test(lines[j])) {
                end = j;
                break;
            }
        }
        // An unterminated fence closes nothing, so there is no verbatim body
        // to take and nothing after it to keep scanning.
        if (end === -1) return null;
        if (JS_FENCE_TAGS.has(info.toLowerCase())) {
            return lines.slice(i + 1, end).join("\n");
        }
        i = end;
    }
    return null;
}

/**
 * The `command` a macro note compiles to: the first tagged JS fence on its
 * `{#script}` page.
 *
 * Read from the **raw** note body, before tables are expanded and wikilinks
 * converted, so the executable copy is exactly what the author wrote even
 * where the journal's rendered copy of the same fence is not.
 *
 * @param {string} body - The note's markdown body, frontmatter stripped.
 * @param {string} name - The macro's name, for the error messages.
 * @returns {string} The macro's command.
 * @throws {Error} When the note declares no `{#script}` page, or that page
 *   holds no language-tagged JS fence. Either is a build error: a macro with
 *   no command is a macro-bar button that does nothing.
 */
export function macroCommand(body, name) {
    const page = splitPages(String(body ?? ""), name).find(
        (p) => p.anchorSlug === MACRO_SCRIPT_ANCHOR,
    );
    if (!page) {
        throw new Error(
            `macro "${name}": no page declares the {#${MACRO_SCRIPT_ANCHOR}} ` +
                `anchor — a macro's source lives under a heading carrying it, ` +
                `e.g. "# Script {#${MACRO_SCRIPT_ANCHOR}}"`,
        );
    }
    const command = extractJsFence(page.markdown);
    if (command === null) {
        throw new Error(
            `macro "${name}": the {#${MACRO_SCRIPT_ANCHOR}} page holds no ` +
                `language-tagged JavaScript fence — tag it \`\`\`js (an ` +
                `untagged fence is a code sample, not the macro's source)`,
        );
    }
    return command;
}

/**
 * The **Foundry** macro type a note compiles to — not the note's `type:`,
 * which stays `macro` because that is what routes it to this pack.
 *
 * Foundry's schema initialises `type` to `CHAT`, so a script macro has to say
 * so explicitly; this states it for every note and defaults the authored field
 * to `script`, which is the only kind that compiles.
 *
 * @param {object} fm - The note's frontmatter.
 * @param {string} label - The macro, for the error message.
 * @returns {"script"} The macro type.
 * @throws {Error} For `chat`, and for any value Foundry does not define.
 */
export function resolveMacroType(fm, label) {
    const raw = String(sohlField(fm, "macroType", "script") ?? "script");
    if (raw === "script") return "script";
    if (raw === "chat") {
        throw new Error(
            `macro "${label}": sohl.macroType "chat" is not supported — a chat ` +
                `macro's command is chat text rather than source, so none of ` +
                `the {#${MACRO_SCRIPT_ANCHOR}} fence rules apply to it`,
        );
    }
    throw new Error(
        `macro "${label}": unknown sohl.macroType "${raw}" — Foundry defines ` +
            `${MACRO_TYPES.join(", ")}`,
    );
}

/**
 * The Foundry macro scope a note compiles to.
 *
 * @param {object} fm - The note's frontmatter.
 * @param {string} label - The macro, for the error message.
 * @returns {string} One of {@link MACRO_SCOPES}.
 * @throws {Error} When the authored scope is not one Foundry defines — it
 *   would fail the schema's `choices` validation at load and be replaced by
 *   the default, shipping a macro whose authored reach had quietly widened.
 */
export function resolveMacroScope(fm, label) {
    const raw = String(sohlField(fm, "macroScope", "global") ?? "global");
    if (!MACRO_SCOPES.includes(raw)) {
        throw new Error(
            `macro "${label}": unknown sohl.macroScope "${raw}" — Foundry ` +
                `defines ${MACRO_SCOPES.join(", ")}`,
        );
    }
    return raw;
}

/**
 * A compiled Macro document, in the shape the LevelDB packer consumes.
 *
 * @typedef {object} MacroDocument
 * @property {string} name - The macro's display name.
 * @property {string} type - The Foundry macro type; always `script`.
 * @property {null} author - No authoring user; Foundry's field is nullable.
 * @property {string} img - The Foundry-relative artwork path.
 * @property {string} scope - One of {@link MACRO_SCOPES}.
 * @property {string} command - The script the macro runs.
 * @property {string|null} folder - The folder id, or `null` for the root.
 * @property {number} sort - Sort order within its folder.
 * @property {{default: number}} ownership - Default ownership level.
 * @property {object} flags - Document flags from frontmatter.
 * @property {string} _id - The Foundry document id.
 * @property {object} _stats - The `_stats` block.
 * @property {string} _key - The LevelDB key, `!macros!<id>`.
 */

/**
 * The compendium envelope for one Macro.
 *
 * @param {object} fm - The note's frontmatter.
 * @param {object} opts
 * @param {string} opts.command - The command, from {@link macroCommand}.
 * @param {string|null} [opts.folder] - The resolved folder id.
 * @param {object} [opts.stats] - The `_stats` block.
 * @returns {MacroDocument} The Macro document.
 * @throws {Error} When the frontmatter's macro type or scope is unusable.
 */
export function buildMacroEntry(fm, { command, folder = null, stats = STATS }) {
    const name = resolveName(fm);
    const id = fm.id;
    return {
        name,
        // Stated rather than defaulted: Foundry's schema initialises `type` to
        // CHAT, so an omitted type ships a macro that posts its own source
        // into chat instead of running.
        type: resolveMacroType(fm, name),
        author: null,
        img: resolveImg(fm.img) || DEFAULT_MACRO_IMG,
        scope: resolveMacroScope(fm, name),
        command,
        folder,
        sort: 0,
        ownership: { default: 0 },
        flags: fm.flags || {},
        _id: id,
        _stats: stats,
        _key: `!macros!${id}`,
    };
}

/**
 * Macros pack compiler.
 *
 * Walks the content tree and compiles every `package: sohl`, `type: macro`
 * note into one Macro document. The same note's documentation is compiled by
 * the journals pass; neither pass reads the other's output.
 */
export class Macros {
    static id = "macros";

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
            throw new Error("Macros compiler requires `contentBase`");
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

    /**
     * Compile one note into a Macro.
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} body - The note body, frontmatter stripped.
     * @returns {MacroDocument} The Macro document.
     */
    buildEntry(fm, body) {
        const name = resolveName(fm);
        return buildMacroEntry(fm, {
            command: macroCommand(body, name),
            folder: this.folderResolver(sohlField(fm, "folder", null)),
        });
    }

    async compile() {
        let compiled = 0;
        let skippedDraft = 0;
        let skippedOther = 0;

        for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
            this.contentBase,
        )) {
            if (
                !fm ||
                fm.package !== CONTENT_PACKAGE ||
                fm.type !== "macro"
            ) {
                skippedOther++;
                continue;
            }
            if (fm.draft === true) {
                skippedDraft++;
                log.debug(`Skipping draft: ${absPath}`);
                continue;
            }
            if (!fm.id) {
                // Fatal, not a warning, exactly as for an item: a skipped
                // macro silently vanishes from the compendium while its
                // knowledgebase page still builds, so the omission is
                // invisible until someone looks for the macro.
                throw new Error(`Macro missing id: ${absPath}`);
            }

            log.debug(`Processing macro: ${resolveName(fm)} (${absPath})`);
            try {
                this.writeEntry(this.buildEntry(fm, body));
                compiled++;
            } catch (err) {
                this.errorCount++;
                log.error(
                    `Failed to compile macro at ${absPath}: ${err.message}`,
                );
            }
        }

        this.compiledCount = compiled;
        log.info(`Compiled ${compiled} macro${compiled === 1 ? "" : "s"}`);
        if (skippedDraft) log.info(`Skipped ${skippedDraft} draft(s)`);
        log.debug(`Skipped ${skippedOther} non-macro file(s)`);
    }
}
