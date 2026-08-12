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
 * Shared helpers for pack compilers (utils/packs/*.mjs).
 *
 * The HeroicLands vault is authoritative for compendium item data. Pack
 * compilers walk the vault, read markdown files with YAML frontmatter, and
 * emit Foundry-compatible JSON. These helpers handle the common shape:
 * markdown parsing, frontmatter access (including the nested `sohl:` block),
 * filename generation, and slug normalization.
 *
 * Not a standalone script — a shared helper module imported by the pack
 * generation orchestrator and compilers (generate.mjs, items.mjs,
 * journals.mjs, actors.mjs).
 */

import fs from "fs";
import crypto from "crypto";
import path from "path";
import yaml from "yaml";
import unidecode from "unidecode";
import markdownit from "markdown-it";
import log from "loglevel";

import { buildWikilinkIndex, convertWikilinks } from "./wikilinks.mjs";
import { expandContentTables } from "../content-tables.mjs";

export const md = markdownit({ html: true });

/**
 * Parses a markdown file with YAML frontmatter.
 * Returns { frontmatter, body, description } where `body` is the trimmed
 * raw markdown after the frontmatter block, and `description` is `body`
 * rendered to HTML. If the file has no frontmatter block, returns
 * `{ frontmatter: null, body: "", description: "" }` with a warn log.
 */
export function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) {
        return { frontmatter: null, body: "", description: "" };
    }
    let frontmatter;
    try {
        frontmatter = yaml.parse(fmMatch[1]) || {};
    } catch (err) {
        log.warn(`YAML parse error in ${filePath}: ${err.message}`);
        return { frontmatter: null, body: "", description: "" };
    }
    const body = fmMatch[2].trim();
    const description = body ? md.render(body) : "";
    return { frontmatter, body, description };
}

/**
 * Recursively yields every `.md` file under `rootDir`, parsed.
 * Yields { frontmatter, description, file, absPath } for each match.
 * Silently skips directories that don't exist. Skips any directory named
 * `Templates` (Obsidian templater scaffolding; never compendium content).
 */
export function* walkMarkdownTree(rootDir) {
    if (!fs.existsSync(rootDir)) return;
    const stack = [rootDir];
    while (stack.length > 0) {
        const dir = stack.pop();
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (err) {
            log.warn(`Cannot read directory ${dir}: ${err.message}`);
            continue;
        }
        for (const entry of entries) {
            const absPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "Templates") continue;
                stack.push(absPath);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                yield {
                    ...parseMarkdownFile(absPath),
                    file: entry.name,
                    absPath,
                };
            }
        }
    }
}

/**
 * Resolves a dotted frontmatter key (e.g., "name.full") into the nested
 * value. Returns `defaultValue` if any path segment is missing.
 */
export function getFrontmatter(fm, key, defaultValue = undefined) {
    if (fm == null || typeof fm !== "object") return defaultValue;
    if (key in fm) return fm[key];
    const parts = key.split(".");
    let current = fm;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return defaultValue;
        current = current[part];
    }
    return current !== undefined ? current : defaultValue;
}

/**
 * Reads a key from `fm.sohl` (the vault's nested system-fields block).
 * Supports dotted notation, e.g. sohlField(fm, "charges.value", 0).
 * Falls back to top-level `fm[key]` if `sohl` doesn't carry the key.
 */
export function sohlField(fm, key, defaultValue = undefined) {
    if (fm == null || typeof fm !== "object") return defaultValue;
    const sohl = fm.sohl;
    if (sohl && typeof sohl === "object") {
        if (key in sohl) return sohl[key] ?? defaultValue;
        const fromNested = getFrontmatter(sohl, key, undefined);
        if (fromNested !== undefined) return fromNested;
    }
    return getFrontmatter(fm, key, defaultValue);
}

/**
 * Resolve the `charges` block shared by Mystery and Mystical Ability items.
 *
 * Charge usage is carried by the **maximum** alone (#1129): a `null` max means
 * the item does not use charges at all, `0` means it is counted but uncapped,
 * and a positive number is a real cap. `value` is the current count, with
 * `null` meaning "infinite remaining". Both persist as nullable NumberFields,
 * so absent frontmatter must resolve to `null` — coercing it to `0` would ship
 * every item as an uncapped charge-user.
 *
 * A legacy `usesCharges` flag in authored frontmatter is ignored: it was inert
 * and has been dropped from the schema.
 *
 * @param {object} fm - The item frontmatter.
 * @returns {{value: number|null, max: number|null}} The persisted charges block.
 */
export function resolveCharges(fm) {
    const toCount = (raw) => {
        if (raw == null || raw === "") return null;
        const num = Number(raw);
        return Number.isFinite(num) ? Math.trunc(num) : null;
    };
    const max = toCount(sohlField(fm, "charges.max", null));
    // A blank maximum means "does not use charges" — a stray current count
    // cannot outlive it, since the logic layer disables both modifiers.
    return { value: max === null ? null : toCount(sohlField(fm, "charges.value", null)), max };
}

/**
 * Read the mandatory `subType` from an item's frontmatter, throwing when it is
 * absent or blank.
 *
 * Every subType-bearing item type declares `subType` as `required` with **no**
 * default in its DataModel — a subtype must always be specified, and it is an
 * error to omit it. The builder therefore substitutes no fallback: a content
 * file missing `subType` is a build error, surfaced here rather than shipped as
 * an invalid (typeless-fallback) item.
 *
 * @param {object} fm - The item frontmatter.
 * @param {string} [ctx] - Optional label for the error (defaults to the item's
 *   title/name, else "item").
 * @returns {string} The declared subType.
 * @throws {Error} When `subType` is missing or blank.
 */
export function requireSubType(fm, ctx) {
    const subType = sohlField(fm, "subType", undefined);
    if (subType == null || subType === "") {
        const label = ctx || fm?.title || fm?.name || "item";
        throw new Error(
            `${label}: missing required 'subType' — every subType-bearing item must declare its kind (the builder substitutes no default).`,
        );
    }
    return String(subType);
}

/**
 * Resolve the required `sohl.archetype` frontmatter for an Item/Actor entry
 * (see the archetype contract, #604 — `flags.sohl.docArchetype`). The property
 * is a nullable number that authors must state explicitly:
 *   - a number → the document is an archetype of that priority.
 *   - `null`   → the document is not an archetype.
 *   - absent   → an authoring error (throws), so "not an archetype" is never
 *                silently assumed.
 *
 * Reads `sohl.archetype`, falling back to a top-level `archetype` key to match
 * {@link sohlField}'s nested-then-top-level resolution.
 *
 * @param {object} fm      Parsed frontmatter.
 * @param {string} label   Human-readable context for error messages.
 * @returns {number|undefined}  The archetype priority, or `undefined` when null.
 * @throws {Error} When `sohl.archetype` is absent or is not a number/null.
 */
export function resolveArchetype(fm, label) {
    const sohl = fm != null && typeof fm.sohl === "object" ? fm.sohl : null;
    const inSohl = sohl != null && "archetype" in sohl;
    const inTop = fm != null && typeof fm === "object" && "archetype" in fm;
    if (!inSohl && !inTop) {
        throw new Error(
            `Missing required sohl.archetype for ${label} — set a number (this is an archetype) or null (it is not)`,
        );
    }
    const raw = inSohl ? sohl.archetype : fm.archetype;
    if (raw === null) return undefined;
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
        throw new Error(
            `Invalid sohl.archetype for ${label}: expected a number or null, got ${JSON.stringify(raw)}`,
        );
    }
    return raw;
}

/**
 * Merge the required `sohl.archetype` frontmatter into a document's `flags`,
 * returning a new object (the input is never mutated). A numeric archetype
 * seeds `flags.sohl.docArchetype`; `null` omits the flag (and clears any stale
 * `docArchetype` while preserving sibling `sohl` flags); an absent value
 * throws. See {@link resolveArchetype}.
 *
 * @param {object} fm              Parsed frontmatter.
 * @param {object} [flags]         The entry's existing flags (e.g. `fm.flags`).
 * @param {string} label           Human-readable context for error messages.
 * @returns {object}               The flags object with the archetype applied.
 * @throws {Error} When `sohl.archetype` is absent or invalid.
 */
export function withArchetypeFlag(fm, flags, label) {
    const archetype = resolveArchetype(fm, label);
    const out = { ...(flags || {}) };
    const sohl = { ...(out.sohl || {}) };
    if (archetype === undefined) {
        delete sohl.docArchetype;
    } else {
        sohl.docArchetype = archetype;
    }
    if (Object.keys(sohl).length > 0) out.sohl = sohl;
    else delete out.sohl;
    return out;
}

/**
 * Generates a compendium-source filename: `Name_id.json` with non-
 * alphanumeric runs replaced by underscores.
 */
export function makeFilename(name, id) {
    return (
        `${unidecode(name)}_${id}`.replace(/[^0-9a-zA-Z]+/g, "_") + ".json"
    );
}

/**
 * Standardize a name into a slug: lowercase, apostrophes removed,
 * non-alphanumerics collapsed to single hyphens.
 */
export function slugify(name) {
    return String(name)
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Build a documentation URL from an item type and its URL segment:
 *   https://heroiclands.org/sohl/{type}/{slug}/
 *
 * The segment is the item's shortcode (see {@link contentSlug}), so this URL and
 * the knowledgebase page address the same item the same way.
 */
export function buildDocUrl(type, slug) {
    return `https://heroiclands.org/sohl/${type}/${slug}/`;
}

/**
 * Parses the valueDesc / threshold array format. Accepts either:
 *   - Array of "Label:MaxValue" strings, e.g. ["Ugly:4", "Plain:12"]
 *   - Array of objects, e.g. [{ label, maxValue }]
 * Returns a normalized array of `{ label, maxValue: number }`.
 */
export function parseValueDesc(raw) {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((entry) => {
        if (typeof entry === "string") {
            const [label, maxStr] = entry.split(":");
            return {
                label: (label ?? "").trim(),
                maxValue: parseInt(maxStr, 10) || 0,
            };
        }
        if (typeof entry === "object" && entry?.label !== undefined) {
            return {
                label: String(entry.label),
                maxValue: Number(entry.maxValue) || 0,
            };
        }
        return { label: String(entry), maxValue: 0 };
    });
}

/**
 * Translate a content-relative image path into its Foundry-relative form.
 *
 * Content frontmatter (`img` / `portrait`) authors a single path that has to
 * work for Foundry, the knowledgebase, and the website. For Foundry the bundled
 * asset roots — `icons/...` and `images/...` — are served from the system
 * directory, so they are rewritten to `systems/sohl/assets/<path>`. Any other
 * path (already `systems/...`-rooted, a `modules/...` path, an absolute URL) is
 * returned unchanged, and an empty path yields `""`.
 *
 * This is translation only: the per-type default for an empty result is
 * domain-specific (actors default differently from items, and gear differently
 * again), so each builder owns its own default map and applies it to the
 * result — `resolveImg(fm.img) || DEFAULT_IMG[type]`.
 *
 * @param {string | null | undefined} raw - content-relative path from frontmatter.
 * @returns {string} the Foundry-relative path, or `""` when `raw` is empty.
 */
export function resolveImg(raw) {
    if (!raw) return "";
    const s = String(raw);
    if (s.startsWith("icons/") || s.startsWith("images/")) {
        return `systems/sohl/assets/${s}`;
    }
    return s;
}

/**
 * Resolves the display name from frontmatter, preferring `name.full`,
 * falling back to `name` (if string), then `defaultValue`.
 */
export function resolveName(fm, defaultValue = "Unnamed") {
    const fullName = getFrontmatter(fm, "name.full", null);
    if (fullName) return String(fullName);
    if (typeof fm?.name === "string") return fm.name;
    return defaultValue;
}

/**
 * Default `_stats` block for compiled compendium entries. Reads the
 * current system version from `assets/templates/system.template.json`
 * if available, otherwise falls back to the supplied default.
 */
export function buildStats(systemVersion = "0.6.0") {
    return {
        systemId: "sohl",
        systemVersion,
        coreVersion: "14",
        createdTime: 0,
        modifiedTime: 0,
        lastModifiedBy: "sohlbuilder00000",
    };
}

/**
 * Stable 16-char hex id derived from `${namespace}:${value}`.
 *
 * Defined in {@link sohl.utils.packs.ids} — a leaf module, so that the link
 * resolver this one imports can derive ids too — and re-exported here for the
 * passes that have always reached it through `helpers`.
 */
export { makeId } from "./ids.mjs";

/* ------------------------------------------------------------------------ */
/*  Wikilink resolution: the content-wide link index                        */
/* ------------------------------------------------------------------------ */

/**
 * Indexes **every** note in the content tree so any pack compiler can resolve a
 * wikilink to any other document. Shared by all three compilers: a skill links
 * to another skill, a journal to a creature, a creature to a rules page, and
 * each target's own **type** decides which pack the UUID points into.
 *
 * @param {string} contentBase - Root of the content tree.
 * @returns {{byShortcode: Map, byAlias: Map}} From `buildWikilinkIndex`.
 */
export function buildContentLinkIndex(contentBase) {
    const docs = [];
    for (const { frontmatter: fm, absPath } of walkMarkdownTree(contentBase)) {
        if (!fm?.id) continue;
        const base = path.basename(absPath, ".md").replace(/_/g, " ");
        docs.push({
            type: fm.type,
            id: fm.id,
            shortcode: fm.shortcode ?? null,
            name: fm.name?.full ?? base,
            aliases: [
                ...(Array.isArray(fm.aliases) ? fm.aliases : []),
                ...(fm.name?.full ? [fm.name.full] : []),
                ...(Array.isArray(fm.name?.aliases) ? fm.name.aliases : []),
                base,
            ].filter(Boolean),
        });
    }
    log.debug(`Wikilink index: ${docs.length} linkable document(s)`);
    return buildWikilinkIndex(docs);
}

/**
 * Converts the wikilinks in one note's markdown, logging any that have no
 * target in the content tree. Every compiler funnels through this so the
 * warning text and the leave-it-alone fallback are identical everywhere.
 *
 * @param {string} body - The note's markdown body.
 * @param {object} ctx - `{ type, id, index, name }` — `name` is used in the log.
 * @returns {{markdown: string, unresolved: Array<object>}}
 */
export function convertNoteWikilinks(body, { type, id, index, name }) {
    const result = convertWikilinks(body ?? "", { type, id, index });
    for (const u of result.unresolved) {
        log.warn(`Unresolved wikilink in "${name}" (${u.reason}): ${u.link}`);
    }
    return result;
}

/* ------------------------------------------------------------------------ */
/*  Generated tables: the searchable content universe                       */
/* ------------------------------------------------------------------------ */

/**
 * Every note in the content tree, in the shape the `(@Table …)` expander
 * searches: its frontmatter plus where it sits in the tree. Ordered by path so
 * a table that leaves rows tied still emits identically on every build.
 *
 * @param {string} contentBase - Root of the content tree.
 * @returns {Array<{fm: object, path: string, tld: string, folder: string,
 *   absPath: string}>}
 */
export function collectContentDocs(contentBase) {
    const docs = [];
    for (const { frontmatter: fm, absPath } of walkMarkdownTree(contentBase)) {
        if (!fm) continue;
        const segments = path.relative(contentBase, absPath).split(path.sep);
        docs.push({
            fm,
            // POSIX-separated and relative to the content root — what a
            // `path:` search term globs, on every platform.
            path: segments.join("/"),
            tld: segments[0],
            folder: segments[segments.length - 2] ?? segments[0],
            absPath,
        });
    }
    docs.sort((a, b) => (a.absPath < b.absPath ? -1 : a.absPath > b.absPath ? 1 : 0));
    log.debug(`Content table index: ${docs.length} searchable note(s)`);
    return docs;
}

/**
 * A note is linkable from a generated table cell when it carries the identity
 * {@link convertWikilinks} addresses it by — a `type` and a `shortcode`. Every
 * type routes to a pack ({@link packForType}), so nothing else can make a note
 * unlinkable; a note missing either renders as plain text rather than shipping a
 * literal wikilink into a journal.
 */
const packLinkable = (doc) =>
    Boolean(doc.fm?.shortcode) && Boolean(doc.fm?.type);

/**
 * Expand the `(@Table …)` directives in one note's markdown, before wikilinks
 * are resolved — so a generated cell may itself be a wikilink.
 *
 * A table searches only notes of the source note's own `package`, so a SoHL
 * page never tabulates setting-package content (and vice versa).
 *
 * @param {string} body - The note's markdown body.
 * @param {object} ctx
 * @param {Array<object>} ctx.docs - From {@link collectContentDocs}.
 * @param {string} ctx.name - The note, for the error message.
 * @param {string} [ctx.pkg] - The source note's `package`.
 * @returns {string} The body with every table expanded.
 * @throws {Error} When a directive is malformed or matches nothing — the note
 *   fails to compile rather than shipping a table-shaped hole.
 */
export function expandNoteTables(body, { docs, name, pkg }) {
    const scoped = pkg ? docs.filter((d) => d.fm?.package === pkg) : docs;
    const { markdown, errors } = expandContentTables(body ?? "", {
        docs: scoped,
        linkable: packLinkable,
        source: name,
    });
    if (errors.length) {
        throw new Error(
            errors.map((e) => `content table — ${e.reason}`).join("; "),
        );
    }
    return markdown;
}

/* ------------------------------------------------------------------------ */
/*  Folder hierarchy: loading, resolution, emission                         */
/* ------------------------------------------------------------------------ */

/**
 * Loads a folders.yaml file as an array of folder entries. Returns []
 * when the file is missing (logging a warning) so packs without folders
 * can opt out simply by not committing the file.
 */
export function loadFolders(foldersFile) {
    if (!fs.existsSync(foldersFile)) {
        log.warn(
            `No folders.yaml at ${foldersFile}; no folders will be emitted`,
        );
        return [];
    }
    const raw = fs.readFileSync(foldersFile, "utf8");
    const parsed = yaml.parse(raw);
    if (parsed == null) return [];
    if (!Array.isArray(parsed)) {
        throw new Error(
            `folders.yaml must contain a YAML list; got ${typeof parsed}`,
        );
    }
    return parsed;
}

/**
 * Validates folder invariants and returns a resolver function that maps a
 * folder id to the same id (after verifying it exists). Returns `null` for
 * a null/empty input; throws for an unknown id.
 *
 * Invariants:
 *   - Every folder must have a non-empty id
 *   - Every folder must have a name
 *   - Sibling folders (same parentFolderId) must have unique names
 *   - Every parentFolderId must match an existing folder id (or be "")
 *
 * Returns { resolver, folders } where folders is the validated list.
 */
export function buildFolderResolver(folders) {
    const byId = new Map();
    for (const f of folders) {
        if (!f.id) {
            throw new Error(`Folder missing id: ${JSON.stringify(f)}`);
        }
        if (!f.name) {
            throw new Error(`Folder ${f.id} missing name`);
        }
        if (byId.has(f.id)) {
            throw new Error(`Duplicate folder id ${f.id}`);
        }
        byId.set(f.id, f);
    }

    const siblingsByParent = new Map();
    for (const f of folders) {
        const parentId = f.parentFolderId || "";
        if (parentId && !byId.has(parentId)) {
            throw new Error(
                `Folder ${f.id} (${f.name}) references unknown parentFolderId ${parentId}`,
            );
        }
        if (!siblingsByParent.has(parentId)) {
            siblingsByParent.set(parentId, new Set());
        }
        const siblings = siblingsByParent.get(parentId);
        if (siblings.has(f.name)) {
            throw new Error(
                `Sibling folders share name "${f.name}" under parent ${parentId || "(root)"} — names must be unique among siblings`,
            );
        }
        siblings.add(f.name);
    }

    function resolver(folderId) {
        if (folderId == null || folderId === "") return null;
        const id = String(folderId).trim();
        if (!id) return null;
        if (!byId.has(id)) {
            throw new Error(`Unknown folder id "${id}"`);
        }
        return id;
    }

    return { resolver, folders };
}

/**
 * Builds a compendium-source filename for a folder JSON document:
 * `folder_Name_id.json` with non-alphanumeric runs replaced by
 * underscores.
 */
export function folderFilename(name, id) {
    return (
        `folder_${unidecode(name)}_${id}`.replace(/[^0-9a-zA-Z]+/g, "_") +
        ".json"
    );
}

/**
 * Writes one JSON document per folder into `destDir`. `documentType`
 * determines the folder's Foundry `type` field — `"Item"` for the items
 * pack, `"JournalEntry"` for the journals pack.
 */
export function writeFolderDocs(folders, stats, destDir, documentType) {
    for (const folder of folders) {
        const doc = {
            name: folder.name,
            sorting: "a",
            folder: folder.parentFolderId || null,
            type: documentType,
            _id: folder.id,
            sort: 0,
            color: folder.color,
            flags: folder.flags || {},
            _stats: stats,
            _key: `!folders!${folder.id}`,
        };
        const outPath = path.join(destDir, folderFilename(folder.name, folder.id));
        fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
    }
    log.info(`Emitted ${folders.length} folder document(s) to ${destDir}`);
}
