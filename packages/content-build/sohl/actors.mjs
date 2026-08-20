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
 * against the generated JSON tree of every Item pack (built in prior items
 * passes and named by the caller as `itemsSourceDirs`). All of them, because a
 * repository may group its items into several Item packs (#1566) and a being
 * may hold items from any of them.
 * Attributes (`sohl.attributes` map) become embedded attribute items with
 * `scoreBase` set from the map value. Each entry in `sohl.items` is similarly
 * resolved by `(type, shortcode)` and deep-merged with the entry's other
 * properties. `sohl.skills` is ignored.
 *
 * Not a standalone script — exports the `Actors` compiler class, imported and
 * driven by `packages/content-build/engine/generate.mjs` (via `npm run build:compiledb`). Must run
 * after the items pass, since it reads the items pack's generated JSON tree.
 *
 * The walk itself — filtering by package and type, skipping drafts,
 * expanding tables, converting wikilinks, writing the JSON and counting
 * errors — belongs to {@link sohl.utils.packs.BasePackCompiler}; this module
 * states only what makes this pass its own (#1509).
 */

import fs from "fs";
import path from "path";
import log from "loglevel";

import {
    sohlField,
    getFrontmatter,
    makeId,
    resolveName,
    resolveImg,
    buildStats,
    withArchetypeFlag,
    md,
} from "../engine/helpers.mjs";
import { BasePackCompiler } from "../engine/base-compiler.mjs";
import { CONTENT_PACKAGE } from "../engine/content-package.mjs";

const STATS = buildStats();

const ACTOR_VAULT_TYPES = new Set(["character", "creature"]);

// Default art per actor type, applied when frontmatter supplies no `img` /
// `portrait`. Beings default to the generic person icon; other actor types add
// their own default here as they gain a builder.
const DEFAULT_IMG = {
    being: "systems/sohl/assets/icons/game-icons/delapouite/person.svg",
};

/**
 * Strip compendium-only fields from a predefined item before embedding it
 * inside an actor's `items[]`. These fields belong on a top-level
 * compendium document, not on an embedded one.
 */
function stripCompendiumFields(item) {
    // eslint-disable-next-line no-unused-vars
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
 * Normalize a being's persisted `system.body` from a `sohl.body` block. The
 * authoring frontmatter mirrors the schema field-for-field: `sohl.body` nests
 * `structure` / `weight` / `reachBase` / `bodyScaleBase` / `personalFatigue`,
 * exactly like `system.body`.
 */
function normalizeBody(bodyObj) {
    const b = bodyObj && typeof bodyObj === "object" ? bodyObj : {};
    const weight = b.weight || {};
    return {
        structure: b.structure ?? { parts: [], adjacent: [] },
        weight: {
            base: weight.base == null ? null : Number(weight.base),
            calc: String(weight.calc ?? "0"),
        },
        reachBase: Number(b.reachBase ?? 0) || 0,
        bodyScaleBase: Number(b.bodyScaleBase ?? 1) || 1,
        personalFatigue: String(b.personalFatigue ?? "enc"),
    };
}

/** Normalize per-medium movement profiles from a `sohl.movementProfiles` list. */
function normalizeMovementProfiles(list) {
    return (Array.isArray(list) ? list : []).map((p) => ({
        medium: String(p.medium ?? "terrestrial"),
        feetPerRound: Number(p.feetPerRound ?? 0) || 0,
        leaguesPerWatch: Number(p.leaguesPerWatch ?? 0) || 0,
        encumbrance: String(p.encumbrance ?? "0"),
        strMod: String(p.strMod ?? "0"),
        disabled: Boolean(p.disabled ?? false),
    }));
}

/**
 * Extract a being's body (+ its movement) from a `sohl` block that mirrors the
 * schema: `sohl.body` (nested → `system.body`) and the flat
 * `sohl.currentMoveMedium` / `sohl.movementProfiles` (→ the base-actor movement
 * fields; movement is a universal actor capability, not part of the body).
 */
function extractBodyAndMovement(fm) {
    return {
        body: normalizeBody(sohlField(fm, "body", {})),
        currentMoveMedium: String(sohlField(fm, "currentMoveMedium", "none")),
        movementProfiles: normalizeMovementProfiles(
            sohlField(fm, "movementProfiles", []),
        ),
    };
}

/**
 * Load every JSON file under each of `itemsSourceDirs`, returning one Map keyed
 * by `${type}:${system.shortcode}`. Folder docs and entries without a
 * shortcode are skipped. The `_key` field is stripped from each entry —
 * it is not part of the item data model.
 *
 * The directories are read as one address space, because a being names an item
 * by `(type, shortcode)` and never by the pack it happens to ship in. Two Item
 * packs claiming the same address is therefore ambiguous rather than a
 * last-one-wins ordering detail, and fails here.
 *
 * @param {readonly string[]} itemsSourceDirs - Every Item pack's JSON tree.
 * @returns {Map<string, object>} The predefined items, by address.
 */
function loadItemsMap(itemsSourceDirs) {
    const map = new Map();
    const source = new Map();
    for (const itemsSourceDir of itemsSourceDirs) {
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
                log.warn(
                    `Skipping unparseable item JSON ${full}: ${err.message}`,
                );
                continue;
            }
            const shortcode = doc?.system?.shortcode;
            if (!doc?.type || !shortcode) continue;
            const address = `${doc.type}:${shortcode}`;
            const owner = source.get(address);
            if (owner && owner !== itemsSourceDir) {
                throw new Error(
                    `Two Item packs both define "${address}" (${owner} and ` +
                        `${itemsSourceDir}); a being addresses an item by ` +
                        `(type, shortcode), so the address must be unique across ` +
                        `every Item pack`,
                );
            }
            source.set(address, itemsSourceDir);
            // eslint-disable-next-line no-unused-vars
            const { _key, ...rest } = doc;
            map.set(address, rest);
        }
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

export class Actors extends BasePackCompiler {
    static id = "actors";
    static label = "actor";

    /** @type {readonly string[]} */
    itemsSourceDirs;

    constructor({ itemsSourceDirs, ...options }) {
        super(options);
        // Where the items passes wrote their JSON. Stated by the caller rather
        // than assumed to be this pack's sibling: the packs' locations are
        // configuration, and a consumer may put them anywhere (#1508). Every
        // Item pack, because a repository may ship more than one (#1566).
        if (!itemsSourceDirs?.length) {
            throw new Error(
                "Actors compiler requires `itemsSourceDirs` — the generated JSON " +
                    "of every Item pack, which each being's embedded items are " +
                    "resolved against. Declare at least one pack of type " +
                    '"Item" in content-build.config.mjs.',
            );
        }
        Object.defineProperty(this, "itemsSourceDirs", {
            value: Object.freeze([...itemsSourceDirs]),
            writable: false,
        });
    }

    /**
     * Both content types `character` and `creature` produce a Foundry `being`
     * actor; no other distinction propagates to the output.
     *
     * @param {object} fm - The note's frontmatter.
     * @returns {boolean} True for a character or creature note.
     */
    selects(fm) {
        return ACTOR_VAULT_TYPES.has(fm.type);
    }

    /**
     * The predefined items each being's embedded items resolve against, loaded
     * before the walk from the items passes' output.
     *
     * @returns {Promise<void>}
     */
    async prepare() {
        await super.prepare();
        this.itemsMap = loadItemsMap(this.itemsSourceDirs);
        log.info(
            `Loaded ${this.itemsMap.size} predefined items for actor resolution`,
        );
    }

    /**
     * Compile one character or creature note into a `being`.
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} markdown - The body, tables expanded and wikilinks
     *   resolved.
     * @returns {object} The actor document, keyed for the pack.
     */
    buildEntry(fm, markdown) {
        return this.buildBeing(this.itemsMap, fm, markdown);
    }

    /** @inheritdoc */
    reportDetail(stats) {
        log.debug(
            `Skipped ${stats.skippedOther} non-actor file(s) ` +
                `(not character/creature, package:${CONTENT_PACKAGE})`,
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
    resolveEmbedded(
        itemsMap,
        actorId,
        type,
        shortcode,
        overlay,
        indexKey,
        ctx,
    ) {
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
        merged._id = makeId(
            actorId,
            `${type}:${shortcode || merged.name}:${indexKey}`,
        );
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

    buildBeing(itemsMap, fm, body) {
        const name = resolveName(fm);
        const id = fm.id;
        const ctx = `actor "${name}"`;

        const items = this.buildEmbeddedItems(itemsMap, id, fm, ctx);

        const folderId = sohlField(fm, "folder", null);
        const folder = this.folderResolver(folderId);

        const system = {
            // The frontmatter shortcode is the actor's stable `(type, shortcode)`
            // key — and, for a `docArchetype`-flagged being, its archetype
            // identity (the dedup/override key of the Create-dialog picker, #604).
            shortcode: fm.shortcode || "",
            portrait: resolveImg(fm.portrait) || DEFAULT_IMG.being,
            appearance: renderSection(body || "", "appearance"),
            dossier: renderSection(body || "", "dossier"),
        };

        // Fill `system.body` (+ the base-actor movement fields) from the being's
        // frontmatter, rather than embedding a corpus item (#535). The `sohl`
        // block mirrors `system` field-for-field: `sohl.body` nests the body
        // (`structure` / `weight` / …), with `currentMoveMedium` /
        // `movementProfiles` flat alongside it. An **incorporeal** being omits
        // `sohl.body` and keeps the schema's empty body.
        const bodyField = sohlField(fm, "body", null);
        if (bodyField && typeof bodyField === "object") {
            const bodyData = extractBodyAndMovement(fm);
            system.body = bodyData.body;
            system.currentMoveMedium = bodyData.currentMoveMedium;
            system.movementProfiles = bodyData.movementProfiles;
        } else if (bodyField != null) {
            log.error(
                `${ctx}: sohl.body must be an inline object (structure/weight/…), got ${typeof bodyField}`,
            );
            this.errorCount++;
        }

        // Being-only combat grouping (mirrors `system.defaultCombatGroup`).
        const defaultCombatGroup = sohlField(
            fm,
            "defaultCombatGroup",
            undefined,
        );
        if (defaultCombatGroup !== undefined) {
            system.defaultCombatGroup = defaultCombatGroup;
        }

        return {
            name,
            type: "being",
            img: resolveImg(fm.img) || DEFAULT_IMG.being,
            _id: id,
            system,
            items,
            prototypeToken: {
                name,
                displayName: 0,
                actorLink: false,
                texture: { src: resolveImg(fm.img) || DEFAULT_IMG.being },
                width: 1,
                height: 1,
                sight: { enabled: false },
                detectionModes: [],
            },
            effects: [],
            folder,
            sort: 0,
            ownership: { default: 0 },
            // `sohl.archetype` (required nullable number) drives
            // `flags.sohl.docArchetype` (#640 / archetype contract #604).
            flags: withArchetypeFlag(fm, fm.flags, ctx),
            _stats: STATS,
            _key: `!actors!${id}`,
        };
    }
}
