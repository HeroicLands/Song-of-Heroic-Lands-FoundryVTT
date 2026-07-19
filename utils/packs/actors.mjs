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
 * Actors pack compiler — produces JSON pack files for the "actors" Foundry
 * compendium from markdown character/creature notes in the `assets/content/` tree.
 *
 * Both content types `character` and `creature` produce a Foundry `being` actor;
 * no other distinction propagates to the output.
 *
 * Each actor's embedded items are resolved by looking up `<type>:<shortcode>`
 * against the items pack's generated JSON tree (built in a prior items pass).
 * Attributes (`sohl.attributes` map) become embedded attribute items with
 * `scoreBase` set from the map value. Each entry in `sohl.items` is similarly
 * resolved by `(type, shortcode)` and deep-merged with the entry's other
 * properties. `sohl.skills` is ignored.
 *
 * Not a standalone script — exports the `Actors` compiler class, imported and
 * driven by `utils/packs/generate.mjs` (via `npm run build:compiledb`). Must run
 * after the items pass, since it reads the items pack's generated JSON tree.
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

const ACTOR_VAULT_TYPES = new Set(["character", "creature"]);
const DEFAULT_IMG = "icons/svg/mystery-man.svg";

/**
 * Strip compendium-only fields from a predefined item before embedding it
 * inside an actor's `items[]`. These fields belong on a top-level
 * compendium document, not on an embedded one.
 */
function stripCompendiumFields(item) {
    const { _key, _stats, ownership, folder, ...rest } = item;
    return rest;
}

/**
 * Recursively merge `overlay` onto `base`. Plain objects merge key-by-key;
 * everything else (arrays, primitives, null) replaces. Inputs are not
 * mutated.
 */
function deepMerge(base, overlay) {
    if (overlay === undefined) return base;
    if (!isPlainObject(base) || !isPlainObject(overlay)) {
        return overlay;
    }
    const out = { ...base };
    for (const [k, v] of Object.entries(overlay)) {
        out[k] = k in base ? deepMerge(base[k], v) : v;
    }
    return out;
}

function isPlainObject(v) {
    return (
        v !== null &&
        typeof v === "object" &&
        !Array.isArray(v) &&
        Object.getPrototypeOf(v) === Object.prototype
    );
}

/**
 * Build a being's inline `system.body` + movement from a body-template's
 * `sohl` block. A body template (`type: body`, e.g. `Corpora/Human_Folk.md`)
 * is the reusable "genus": its anatomy/weight/reach are inlined into the
 * being's `system.body`, and its per-medium movement onto the base-actor
 * `system.currentMoveMedium` / `system.movementProfiles` (movement is now a
 * universal actor capability, not part of the body).
 */
function buildBodyFromTemplate(fm) {
    const weight = sohlField(fm, "weight", {}) || {};
    const movementProfiles = (sohlField(fm, "movementProfiles", []) || []).map(
        (p) => ({
            medium: String(p.medium ?? "terrestrial"),
            feetPerRound: Number(p.feetPerRound ?? 0) || 0,
            leaguesPerWatch: Number(p.leaguesPerWatch ?? 0) || 0,
            encumbrance: String(p.encumbrance ?? "0"),
            strMod: String(p.strMod ?? "0"),
            disabled: Boolean(p.disabled ?? false),
        }),
    );
    return {
        body: {
            structure: sohlField(fm, "structure", { parts: [], adjacent: [] }),
            weight: {
                base: weight.base == null ? null : Number(weight.base),
                calc: String(weight.calc ?? "0"),
            },
            reachBase: Number(sohlField(fm, "reachBase", 0)) || 0,
            bodyScaleBase: Number(sohlField(fm, "bodyScaleBase", 1)) || 1,
            personalFatigue: String(sohlField(fm, "personalFatigue", "enc")),
        },
        currentMoveMedium: String(sohlField(fm, "defaultMoveMedium", "none")),
        movementProfiles,
    };
}

/**
 * Walk the content tree for body templates (`type: body`), returning a Map
 * keyed by `shortcode` → the resolved `{ body, currentMoveMedium,
 * movementProfiles }`. Body templates are not Foundry items (they never enter
 * the items compendium); they are resolved here and inlined into beings.
 */
function loadBodyTemplates(contentBase) {
    const map = new Map();
    for (const { frontmatter: fm } of walkMarkdownTree(contentBase)) {
        if (!fm || fm.package !== "sohl" || fm.type !== "body") continue;
        const shortcode = sohlField(fm, "shortcode", fm.shortcode);
        if (!shortcode) continue;
        map.set(String(shortcode), buildBodyFromTemplate(fm));
    }
    return map;
}

/**
 * Load every JSON file under `itemsSourceDir`, returning a Map keyed by
 * `${type}:${system.shortcode}`. Folder docs and entries without a
 * shortcode are skipped. The `_key` field is stripped from each entry —
 * it is not part of the item data model.
 */
function loadItemsMap(itemsSourceDir) {
    const map = new Map();
    if (!fs.existsSync(itemsSourceDir)) {
        throw new Error(
            `Items source directory ${itemsSourceDir} does not exist — actors must be generated after items`,
        );
    }
    for (const name of fs.readdirSync(itemsSourceDir)) {
        if (!name.endsWith(".json")) continue;
        if (name.startsWith("folder_")) continue;
        const full = path.join(itemsSourceDir, name);
        let doc;
        try {
            doc = JSON.parse(fs.readFileSync(full, "utf8"));
        } catch (err) {
            log.warn(`Skipping unparseable item JSON ${full}: ${err.message}`);
            continue;
        }
        const shortcode = doc?.system?.shortcode;
        if (!doc?.type || !shortcode) continue;
        const { _key, ...rest } = doc;
        map.set(`${doc.type}:${shortcode}`, rest);
    }
    return map;
}

/**
 * Extract the body of an H1 section whose heading carries the explicit
 * anchor decorator `{#<anchorId>}`. Captures every line after the H1 up
 * to (but not including) the next H1 — nested H2/H3 etc. and their bodies
 * are included. The H1 line itself is discarded. Returns "" if no such
 * heading exists. Fenced code blocks are respected so `# foo` inside
 * ``` blocks does not trigger a match.
 */
function extractAnchorSection(body, anchorId) {
    const lines = body.split("\n");
    const captured = [];
    let inCodeBlock = false;
    let capturing = false;
    const wanted = String(anchorId).toLowerCase();
    for (const line of lines) {
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            if (capturing) captured.push(line);
            continue;
        }
        const h1Match =
            !inCodeBlock ? line.match(/^\s*#\s+(.+?)\s*#*\s*$/) : null;
        if (h1Match) {
            const anchor = h1Match[1].match(/\{#([^}]+)\}\s*$/);
            const id = anchor?.[1]?.trim().toLowerCase() || null;
            if (capturing) break;
            if (id === wanted) {
                capturing = true;
                continue;
            }
        }
        if (capturing) captured.push(line);
    }
    return captured.join("\n").trim();
}

/**
 * Render an extracted markdown section to HTML, or "" if empty.
 */
function renderSection(body, anchorId) {
    const slice = extractAnchorSection(body, anchorId);
    return slice ? md.render(slice) : "";
}

export class Actors {
    static id = "actors";

    /** @type {string} */
    contentBase;
    /** @type {string} */
    outputDir;
    /** @type {string} */
    itemsSourceDir;
    /** @type {(path: string|null) => string|null} */
    folderResolver;
    /** @type {number} */
    errorCount = 0;

    constructor({ contentBase, dest, folderResolver = () => null }) {
        if (!contentBase) {
            throw new Error("Actors compiler requires `contentBase`");
        }
        if (!fs.existsSync(contentBase)) {
            throw new Error(`Content tree not found at ${contentBase}`);
        }
        // The items pack's JSON is generated as a sibling under build/packs-json/.
        const itemsSourceDir = path.resolve(dest, "..", "items");
        Object.defineProperty(this, "contentBase", {
            value: contentBase,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: dest,
            writable: false,
        });
        Object.defineProperty(this, "itemsSourceDir", {
            value: itemsSourceDir,
            writable: false,
        });
        Object.defineProperty(this, "folderResolver", {
            value: folderResolver,
            writable: false,
        });
    }

    writeActor(doc) {
        const fname = makeFilename(doc.name, doc._id);
        fs.writeFileSync(
            path.join(this.outputDir, fname),
            JSON.stringify(doc, null, 2),
            "utf8",
        );
    }

    /**
     * Resolve one embedded item from a `(type, shortcode?, overlay)`
     * descriptor. If `shortcode` is given, the predefined item is fetched
     * from `itemsMap` and the overlay deep-merged on top. If absent, the
     * descriptor must carry enough fields to stand alone. The embedded
     * item's `_id` is regenerated deterministically from
     * `(actorId, type, shortcode, indexKey)` so re-exports are stable.
     * Returns null if the descriptor cannot be resolved.
     */
    resolveEmbedded(itemsMap, actorId, type, shortcode, overlay, indexKey, ctx) {
        let base = null;
        if (shortcode) {
            base = itemsMap.get(`${type}:${shortcode}`);
            if (!base) {
                log.error(
                    `${ctx}: no predefined item for "${type}:${shortcode}"`,
                );
                this.errorCount++;
                return null;
            }
            base = stripCompendiumFields(base);
        } else if (overlay && overlay.name && overlay.system) {
            base = { type, name: overlay.name, system: {} };
        } else {
            log.error(
                `${ctx}: embedded item missing shortcode and not enough fields to stand alone`,
            );
            this.errorCount++;
            return null;
        }
        const merged = overlay ? deepMerge(base, overlay) : base;
        merged.type = type;
        merged._id = makeId(actorId, `${type}:${shortcode || merged.name}:${indexKey}`);
        // Foundry's pack compiler flattens the document hierarchy into LevelDB,
        // storing each embedded document under its own `_key`. Embedded items
        // therefore need a hierarchical key, as do any effects they carry
        // (re-keyed under this actor's item rather than the items-pack key they
        // inherited). Mirrors the items pack convention in items.mjs.
        merged._key = `!actors.items!${actorId}.${merged._id}`;
        if (Array.isArray(merged.effects)) {
            for (const effect of merged.effects) {
                if (!effect?._id) continue;
                effect._key = `!actors.items.effects!${actorId}.${merged._id}.${effect._id}`;
            }
        }
        return merged;
    }

    /**
     * Build all embedded items for an actor: one per `sohl.attributes`
     * entry plus one per `sohl.items` entry. `sohl.skills` is ignored.
     */
    buildEmbeddedItems(itemsMap, actorId, fm, ctx) {
        const items = [];

        const attributes = sohlField(fm, "attributes", null);
        if (attributes && typeof attributes === "object") {
            for (const [shortcode, value] of Object.entries(attributes)) {
                const overlay = { system: { scoreBase: Number(value) || 0 } };
                const embedded = this.resolveEmbedded(
                    itemsMap,
                    actorId,
                    "attribute",
                    shortcode,
                    overlay,
                    `attr:${shortcode}`,
                    ctx,
                );
                if (embedded) items.push(embedded);
            }
        }

        const sohlItems = sohlField(fm, "items", null);
        if (Array.isArray(sohlItems)) {
            sohlItems.forEach((entry, index) => {
                if (!entry || typeof entry !== "object") {
                    log.error(`${ctx}: sohl.items[${index}] is not an object`);
                    this.errorCount++;
                    return;
                }
                const { shortcode, type, ...rest } = entry;
                if (!type) {
                    log.error(`${ctx}: sohl.items[${index}] missing type`);
                    this.errorCount++;
                    return;
                }
                const embedded = this.resolveEmbedded(
                    itemsMap,
                    actorId,
                    type,
                    shortcode || null,
                    rest,
                    `items:${index}`,
                    ctx,
                );
                if (embedded) items.push(embedded);
            });
        }

        return items;
    }

    buildEntry(itemsMap, bodyTemplates, fm, body) {
        const name = resolveName(fm);
        const id = fm.id;
        const ctx = `actor "${name}"`;

        const items = this.buildEmbeddedItems(itemsMap, id, fm, ctx);

        const folderId = sohlField(fm, "folder", null);
        const folder = this.folderResolver(folderId);

        const system = {
            portrait: fm.portrait || "",
            appearance: renderSection(body || "", "appearance"),
            dossier: renderSection(body || "", "dossier"),
        };

        // Inline the referenced body template into `system.body` (+ movement),
        // rather than embedding a corpus item (#535). Incorporeal beings omit
        // `sohl.body` and fall back to the schema's empty body.
        const bodyRef = sohlField(fm, "body", null);
        if (bodyRef) {
            const template = bodyTemplates.get(String(bodyRef));
            if (!template) {
                log.error(`${ctx}: no body template for "${bodyRef}"`);
                this.errorCount++;
            } else {
                system.body = template.body;
                system.currentMoveMedium = template.currentMoveMedium;
                system.movementProfiles = template.movementProfiles;
            }
        }

        return {
            name,
            type: "being",
            img: fm.img || DEFAULT_IMG,
            _id: id,
            system,
            items,
            prototypeToken: {
                name,
                displayName: 0,
                actorLink: false,
                texture: { src: fm.img || DEFAULT_IMG },
                width: 1,
                height: 1,
                sight: { enabled: false },
                detectionModes: [],
            },
            effects: [],
            folder,
            sort: 0,
            ownership: { default: 0 },
            flags: fm.flags || {},
            _stats: STATS,
            _key: `!actors!${id}`,
        };
    }

    async compile() {
        const itemsMap = loadItemsMap(this.itemsSourceDir);
        log.info(`Loaded ${itemsMap.size} predefined items for actor resolution`);
        const bodyTemplates = loadBodyTemplates(this.contentBase);
        log.info(`Loaded ${bodyTemplates.size} body template(s) for actor resolution`);

        let compiled = 0;
        let skippedNoId = 0;
        let skippedDraft = 0;
        let skippedOther = 0;

        for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
            this.contentBase,
        )) {
            if (!fm || fm.package !== "sohl") {
                skippedOther++;
                continue;
            }
            if (!ACTOR_VAULT_TYPES.has(fm.type)) {
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
                log.warn(`Actor missing id, skipping: ${absPath}`);
                continue;
            }

            log.debug(`Processing actor: ${resolveName(fm)} (${absPath})`);
            try {
                const doc = this.buildEntry(itemsMap, bodyTemplates, fm, body);
                this.writeActor(doc);
                compiled++;
            } catch (err) {
                this.errorCount++;
                log.error(
                    `Failed to compile actor at ${absPath}: ${err.message}`,
                );
            }
        }

        log.info(`Compiled ${compiled} actor${compiled === 1 ? "" : "s"}`);
        if (skippedNoId) log.info(`Skipped ${skippedNoId} actor(s) missing id`);
        if (skippedDraft) log.info(`Skipped ${skippedDraft} draft(s)`);
        log.debug(
            `Skipped ${skippedOther} non-actor file(s) (not character/creature, package:sohl)`,
        );
    }
}
