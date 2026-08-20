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
 * Shared helpers for the pack compilers in `packages/content-build/`.
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

import { packConfig } from "./pack-config.mjs";
import { packRouter } from "./pack-router.mjs";
import { CONTENT_PACKAGE, FOUNDRY_PACKAGE_ID } from "./content-package.mjs";
import { readPackageManifest } from "./package-manifest.mjs";
import { loadForeignManifests, PACKAGE_BASE } from "./kb-manifest.mjs";
import { buildWikilinkIndex, convertWikilinks } from "./wikilinks.mjs";
import { expandContentTables } from "./content-tables.mjs";
// The pure `sohl:` frontmatter readers live in a leaf module so the item-type
// registry can import them without reaching back through this one (#1504).
// Re-exported here so every existing importer keeps its single import path.
import { getFrontmatter } from "./frontmatter.mjs";
export {
    getFrontmatter,
    sohlField,
    resolveCharges,
    resolveSkillAptitudes,
    resolveRelation,
    requireSubType,
    parseValueDesc,
} from "./frontmatter.mjs";

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
 * Silently skips directories that don't exist.
 *
 * Directory names in `skipDirectories` are ignored wherever they appear. The
 * walk itself knows nothing about what they mean: `Templates/` is an Obsidian
 * templater convention this repository's vault happens to use, not a property
 * of a content tree, so it is configured rather than hard-coded (#1508).
 *
 * @param {string} rootDir - Root of the tree to walk.
 * @param {object} [opts]
 * @param {readonly string[]} [opts.skipDirectories] - Directory names to ignore.
 *   Defaults to the configured list.
 */
export function* walkMarkdownTree(
    rootDir,
    { skipDirectories = packConfig.skipDirectories } = {},
) {
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
                if (skipDirectories.includes(entry.name)) continue;
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
    return `${unidecode(name)}_${id}`.replace(/[^0-9a-zA-Z]+/g, "_") + ".json";
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
 * Translate a content-relative image path into its Foundry-relative form.
 *
 * Content frontmatter (`img` / `portrait`) authors a single path that has to
 * work for Foundry, the knowledgebase, and the website. For Foundry the bundled
 * asset roots — `icons/...` and `images/...` — are served from the package
 * directory, so they are rewritten to `<assetRoot>/<path>` — `systems/sohl/assets`
 * for this repository, `modules/<id>/assets` for a module (#1508). Any other
 * path (already package-rooted, an absolute URL) is returned unchanged, and an
 * empty path yields `""`.
 *
 * This is translation only: the per-type default for an empty result is
 * domain-specific (actors default differently from items, and gear differently
 * again), so each builder owns its own default map and applies it to the
 * result — `resolveImg(fm.img) || DEFAULT_IMG[type]`.
 *
 * @param {string | null | undefined} raw - content-relative path from frontmatter.
 * @param {{assetRoot: string}} [config] - The resolved build configuration.
 *   Defaults to this repository's.
 * @returns {string} the Foundry-relative path, or `""` when `raw` is empty.
 */
export function resolveImg(raw, config = packConfig) {
    if (!raw) return "";
    const s = String(raw);
    if (s.startsWith("icons/") || s.startsWith("images/")) {
        return `${config.assetRoot}/${s}`;
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

/** Memoised {@link supportedCoreVersion}, keyed by manifest directory. */
const cachedCoreVersion = new Map();

/**
 * The Foundry core version compiled documents declare, taken from the
 * manifest's own `compatibility.minimum`.
 *
 * **Derived, never written twice.** `_stats.coreVersion` is what Foundry gates
 * its migration shims on: a record stamped older than a shim is rewritten by it
 * on load. Every pack shipped `coreVersion: "14"`, which sorts *below* every
 * v14 build and so left all shipped content permanently eligible for every v14
 * migration — including `Scene`'s `migrateLevels`, an unconditional
 * `levels = [synthesised]` that discarded an authored Level and its map image
 * without a word (#1533).
 *
 * Stamping the supported floor is honest — the manifest refuses to load on an
 * older core, so no client can legitimately need those migrations — and it is
 * only *safe* because of that refusal, which is why the two must be one value.
 * A literal here, or in configuration, would rot apart from the manifest the
 * moment the floor moved, and the failure would again be silent. Configuration
 * therefore supplies only *where the manifest is* (#1508).
 *
 * The manifest is located through {@link resolvePackageManifestPath}, the same
 * resolution the package-id guard uses — one hoisted location, not two — which
 * also replaces the module-relative path this used to resolve. That path was
 * correct while the toolchain was vendored and would have pointed inside
 * `node_modules/@heroiclands/content-build/` once it is installed.
 *
 * @param {string} [templateDir] - Directory holding the manifest template.
 *   Defaults to the configured location.
 * @returns {string} The manifest's declared minimum core version.
 * @throws {Error} When the manifest cannot be read or declares no minimum —
 *   a silent fallback is how the original defect shipped.
 */
export function supportedCoreVersion(
    templateDir = packConfig.paths.packageManifest,
) {
    const cached = cachedCoreVersion.get(templateDir);
    if (cached) return cached;

    const { manifestPath, manifest } = readPackageManifest(templateDir);
    const minimum = manifest?.compatibility?.minimum;
    if (!minimum) {
        throw new Error(
            `${manifestPath} declares no compatibility.minimum, so compiled ` +
                `documents have no honest core version to stamp`,
        );
    }
    cachedCoreVersion.set(templateDir, String(minimum));
    return String(minimum);
}

/**
 * Default `_stats` block for compiled compendium entries.
 *
 * Every stamped identity is configuration (#1508): four compilers used to pass
 * the same frozen `"0.6.0"` literal, and `systemId` / `lastModifiedBy` were
 * written into this function. `coreVersion` alone is *not* configuration — it
 * comes from {@link supportedCoreVersion}, the manifest's own supported floor,
 * so a document never claims to predate the migrations that would rewrite it.
 *
 * @param {string} [systemVersion] - The system version to stamp. Defaults to the
 *   configured one.
 * @param {{stats: {systemId: string, systemVersion: string,
 *   lastModifiedBy: string}, paths: {packageManifest: string}}} [config] -
 *   The resolved build configuration. Defaults to this repository's.
 * @returns {object} The `_stats` block.
 */
export function buildStats(systemVersion = undefined, config = packConfig) {
    return {
        systemId: config.stats.systemId,
        systemVersion: systemVersion ?? config.stats.systemVersion,
        coreVersion: supportedCoreVersion(config.paths.packageManifest),
        createdTime: 0,
        modifiedTime: 0,
        lastModifiedBy: config.stats.lastModifiedBy,
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

// The content-type → document-type map, which decides *which* pack list a
// note's own document is routed against.
import { packForType } from "./ids.mjs";

/* ------------------------------------------------------------------------ */
/*  Wikilink resolution: the content-wide link index                        */
/* ------------------------------------------------------------------------ */

/**
 * Indexes **every** note in the content tree so any pack compiler can resolve a
 * wikilink to any other document. Shared by all three compilers: a skill links
 * to another skill, a journal to a creature, a creature to a rules page, and
 * each target's own **type** decides which pack the UUID points into.
 *
 * Each note's pack is resolved here, once, and stored on its index entry: a
 * UUID carries a pack name, so a repository shipping several packs of one type
 * (#1566) would otherwise address every one of them as the first. A note whose
 * declaration is unroutable is indexed against the conventional name and left
 * for the compile pass to report — the index has no business failing a build,
 * and the pass fails it with a far better message.
 *
 * @param {string} contentBase - Root of the content tree.
 * @param {object} [router] - The pack router. Supplied by the calling pass so
 *   the index and the compile agree about where each note landed; defaults to
 *   this repository's own.
 * @returns {{byShortcode: Map, byAlias: Map}} From `buildWikilinkIndex`.
 */
export function buildContentLinkIndex(contentBase, router = packRouter) {
    const docs = [];
    for (const { frontmatter: fm, absPath } of walkMarkdownTree(contentBase)) {
        if (!fm?.id) continue;
        const base = path.basename(absPath, ".md").replace(/_/g, " ");
        docs.push({
            type: fm.type,
            id: fm.id,
            // Where this note's own document lands, and where the JournalEntry
            // its prose compiles into lands — two documents, two packs (#1362).
            pack: router.resolveOrNull(fm, packForType(fm.type).docType),
            docPack: router.resolveOrNull(fm, "JournalEntry"),
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
    // Packages this build links *into* but does not publish. Their manifests
    // are vendored and committed, so a contributor without every repository
    // checked out resolves the same links CI does (#1446, #1499).
    // Packages this repository links into but does not publish; their vendored
    // manifests live at the configured location (#1446, #1499).
    const { index: foreign, stale } = loadForeignManifests(
        packConfig.paths.manifests,
        [CONTENT_PACKAGE],
        PACKAGE_BASE,
    );
    if (stale.length) {
        for (const st of stale) {
            log.error(
                `Unusable link manifest for "${st.package}": ${st.reason}`,
            );
        }
        throw new Error(
            "Cross-package links cannot be resolved from a stale manifest; " +
                "re-vendor it from that package's build.",
        );
    }
    log.debug(
        `Wikilink index: ${docs.length} local document(s), ` +
            `${foreign.size} foreign address(es)`,
    );
    return buildWikilinkIndex(
        docs,
        FOUNDRY_PACKAGE_ID,
        foreign,
        CONTENT_PACKAGE,
    );
}

/**
 * Converts the wikilinks in one note's markdown, logging any that have no
 * target in the content tree. Every compiler funnels through this so the
 * warning text and the leave-it-alone fallback are identical everywhere.
 *
 * @param {string} body - The note's markdown body.
 * @param {object} ctx - `{ type, id, pack, docPack, index, name }` — `name` is
 *   used in the log, and the two pack names address a `[[#slug]]` self-link,
 *   whose target is the source note itself and so has no index entry.
 * @returns {{markdown: string, unresolved: Array<object>}}
 */
export function convertNoteWikilinks(
    body,
    { type, id, pack, docPack, index, name },
) {
    const result = convertWikilinks(body ?? "", {
        type,
        id,
        pack,
        docPack,
        index,
    });
    for (const u of result.unresolved) {
        // A qualified address resolving nowhere is a typo, now that every
        // linkable package is either built here or vendored (#1499) — so it
        // fails the note rather than degrading to text. A bare alias stays a
        // warning: it may be ordinary prose that merely looks like a link.
        if (u.addressed) {
            throw new Error(
                `Unresolved address in "${name}": ${u.link} — no package ` +
                    `publishes it. Fix the shortcode, or re-vendor that ` +
                    `package's manifest into assets/manifests/.`,
            );
        }
        log.warn(`Unresolved wikilink in "${name}" (${u.reason}): ${u.link}`);
    }
    return result;
}

/* ------------------------------------------------------------------------ */
/*  Generated tables: the searchable content universe                       */
/* ------------------------------------------------------------------------ */

/**
 * Every note in the content tree, in the shape the `dataview` table expander
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
    docs.sort((a, b) =>
        a.absPath < b.absPath ? -1
        : a.absPath > b.absPath ? 1
        : 0,
    );
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
 * Expand the fenced `dataview` tables in one note's markdown, before wikilinks
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
 * @param {object} [ctx.fm] - The source note's frontmatter, which is what a
 *   query's `this` reads. Its entry in `docs` supplies the path as well.
 * @returns {string} The body with every table expanded.
 * @throws {Error} When a query is malformed or unsupported — the note fails to
 *   compile rather than shipping a table-shaped hole.
 */
export function expandNoteTables(body, { docs, name, pkg, fm }) {
    const scoped = pkg ? docs.filter((d) => d.fm?.package === pkg) : docs;
    const self =
        fm ?
            (docs.find((d) => d.fm?.id && d.fm.id === fm.id) ?? { fm })
        :   undefined;
    const { markdown, errors } = expandContentTables(body ?? "", {
        docs: scoped,
        linkable: packLinkable,
        source: name,
        self,
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
        const outPath = path.join(
            destDir,
            folderFilename(folder.name, folder.id),
        );
        fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
    }
    log.info(`Emitted ${folders.length} folder document(s) to ${destDir}`);
}
