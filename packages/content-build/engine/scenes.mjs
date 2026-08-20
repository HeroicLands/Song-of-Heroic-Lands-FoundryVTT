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
 * Scenes pack compiler — map notes in `assets/content/` → Foundry `Scene`
 * documents, and the `Adventure` bundles that make their references resolve
 * (issue #1525).
 *
 * The translation itself lives in the framework-free `map-notes.mjs`; this
 * module is the pass that walks the tree, resolves what one note says about
 * another, and writes the JSON the compendium CLI compiles.
 *
 * **Two outputs, for two different jobs.**
 *
 * - The **`scenes` pack** holds every map note's Scene. It is what a wikilink
 *   to a map addresses, and what a GM browses.
 * - The **`adventures` pack** holds one Adventure per *place* — a group of map
 *   notes sharing a `place:`, defaulting to the note's own shortcode — bundling
 *   those scenes with the JournalEntries their prose compiled into. A map with
 *   `locations:` **must** be imported this way: `Adventure#importContent`
 *   creates with `keepId: true`, and a pin's `Note.entryId` / `pageId`, a
 *   `teleportToken` destination and a `toggleBehavior` target are all
 *   id-based. Dragged out of the bare `scenes` pack, a pinned scene lands with
 *   pins pointing at ids no document in the world carries.
 *
 * **Cross-references are addresses, never UUIDs.** A note says
 * `to: {map: manorsolar, region: stair-landing}`; this pass turns that into
 * `Scene.<id>.Region.<id>` from an index built before any scene is compiled,
 * because every embedded id is derived from the scene id and the authored key
 * rather than stored. It is the same vocabulary the link manifest uses.
 *
 * Not a standalone script — exports the `Scenes` compiler class, imported and
 * driven by `packages/content-build/engine/generate.mjs` (via `npm run build:compiledb`).
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
    walkMarkdownTree,
    sohlField,
    resolveName,
    slugify,
    buildStats,
} from "./helpers.mjs";
import { BasePackCompiler } from "./base-compiler.mjs";
import { buildJournalEntry, splitPages, journalPageId } from "./journals.mjs";
import { compendiumUuid, makeId } from "./ids.mjs";
import { CONTENT_PACKAGE, FOUNDRY_PACKAGE_ID } from "./content-package.mjs";
import { itemDocEntryId } from "./item-docs.mjs";
import {
    behaviorDocId,
    buildScene,
    isMapType,
    regionDocId,
} from "./map-notes.mjs";

const STATS = buildStats();

/**
 * Every SoHL action name this build knows about, for the `action:` warning on a
 * region trigger.
 *
 * Deliberately a **superset**, gathered from the localization keys every
 * intrinsic action's `title:` points at and from the `shortcode:` / `executor:`
 * string literals the action definitions carry. A warning that fires on a real
 * action would be worse than one that misses a typo, so the wider net is the
 * right one: this only has to recognise the names that exist, not enumerate
 * them exactly.
 *
 * @param {string} repoRoot - The repository root.
 * @returns {Set<string>} The known action names.
 */
export function collectKnownActionNames(repoRoot) {
    const names = new Set();
    const langFile = path.join(repoRoot, "lang", "en.json");
    if (fs.existsSync(langFile)) {
        const lang = JSON.parse(fs.readFileSync(langFile, "utf8"));
        for (const key of Object.keys(lang)) {
            const at = key.indexOf(".Action.");
            if (at < 0) continue;
            const [leaf] = key.slice(at + ".Action.".length).split(".");
            if (/^[A-Za-z][A-Za-z0-9]*$/.test(leaf)) names.add(leaf);
        }
    }
    const srcRoot = path.join(repoRoot, "src");
    const pattern = /(?:shortcode|executor):\s*"([A-Za-z][A-Za-z0-9]*)"/g;
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const abs = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(abs);
            else if (entry.name.endsWith(".ts")) {
                const text = fs.readFileSync(abs, "utf8");
                for (const m of text.matchAll(pattern)) names.add(m[1]);
            }
        }
    };
    if (fs.existsSync(srcRoot)) walk(srcRoot);
    return names;
}

/**
 * Strip the LevelDB keys from a document tree.
 *
 * An Adventure's members are inline source data in a `SetField`, not sublevel
 * documents, so they carry no `_key` — the CLI's hierarchy does not recurse
 * into an adventure, and Foundry's schema has no such field to hold it.
 *
 * @param {*} value - A document, array, or scalar.
 * @returns {*} The same shape with every `_key` removed.
 */
function stripKeys(value) {
    if (Array.isArray(value)) return value.map(stripKeys);
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([k]) => k !== "_key")
                .map(([k, v]) => [k, stripKeys(v)]),
        );
    }
    return value;
}

export class Scenes extends BasePackCompiler {
    static id = "scenes";
    static label = "map";

    /** @type {string} */
    adventureDir;

    /**
     * Adventures this pass bundled, for the summary.
     *
     * @type {number}
     */
    adventureCount = 0;

    constructor({
        contentBase,
        dest,
        companionDests = {},
        folderResolver = () => null,
        repoRoot = process.cwd(),
    }) {
        super({ contentBase, dest, folderResolver });
        if (!companionDests.adventures) {
            throw new Error(
                "Scenes compiler requires an `adventures` companion destination",
            );
        }
        Object.defineProperty(this, "adventureDir", {
            value: companionDests.adventures,
            writable: false,
        });
        Object.defineProperty(this, "repoRoot", {
            value: repoRoot,
            writable: false,
        });
    }

    /**
     * @param {object} fm - The note's frontmatter.
     * @returns {boolean} True for a map note.
     */
    selects(fm) {
        return isMapType(fm.type);
    }

    /**
     * Collect every map note in the tree, and every item note's Active Effects.
     *
     * @returns {{maps: Array<object>, effectsByAddress: Map<string, object>}}
     */
    #collect() {
        const maps = [];
        const effectsByAddress = new Map();
        for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
            this.contentBase,
        )) {
            if (!fm || fm.package !== CONTENT_PACKAGE || !fm.id) continue;
            if (
                fm.shortcode &&
                Array.isArray(fm.effects) &&
                fm.effects.length
            ) {
                effectsByAddress.set(`${fm.type}-${fm.shortcode}`, {
                    id: fm.id,
                    type: fm.type,
                    effects: fm.effects,
                });
            }
            if (!isMapType(fm.type)) continue;
            if (fm.draft === true) {
                log.debug(`Skipping draft map: ${absPath}`);
                continue;
            }
            maps.push({ fm, body, absPath });
        }
        return { maps, effectsByAddress };
    }

    /**
     * Index every map's derived region and behaviour ids, keyed by shortcode.
     *
     * Built before any scene is compiled, because a cross-reference in the
     * first note may address the last. Every id is a pure function of the
     * scene id and the authored key (or an authored `_id`), so this needs
     * nothing but frontmatter.
     *
     * @param {Array<object>} maps - The collected map notes.
     * @returns {Map<string, object>} shortcode → `{sceneId, name, regions}`.
     */
    #indexMaps(maps) {
        const index = new Map();
        for (const { fm, absPath } of maps) {
            if (!fm.shortcode) {
                throw new Error(`Map note missing shortcode: ${absPath}`);
            }
            if (index.has(fm.shortcode)) {
                throw new Error(
                    `Two map notes share the shortcode "${fm.shortcode}"`,
                );
            }
            const regions = new Map();
            for (const [key, spec] of Object.entries(fm.sohl?.regions ?? {})) {
                const id = regionDocId(fm.id, key, spec?._id);
                const behaviors = new Map();
                for (const [bKey, bSpec] of Object.entries(
                    spec?.behaviors ?? {},
                )) {
                    behaviors.set(bKey, behaviorDocId(id, bKey, bSpec?._id));
                }
                regions.set(key, { id, behaviors });
            }
            index.set(fm.shortcode, {
                sceneId: fm.id,
                name: resolveName(fm),
                regions,
            });
        }
        return index;
    }

    /**
     * Build the three address → UUID resolvers a scene's behaviours need.
     *
     * @param {Map<string, object>} index - From {@link Scenes#indexMaps}.
     * @param {Map<string, object>} effectsByAddress - Item notes with effects.
     * @param {string} selfShortcode - The note being compiled, so `map:` may be
     *   omitted for a reference within the same map.
     * @returns {object} `{resolveRegionRef, resolveBehaviorRef, resolveEffectRef}`.
     */
    #resolvers(index, effectsByAddress, selfShortcode) {
        const lookupRegion = (addr, label) => {
            if (!addr || typeof addr !== "object" || !addr.region) {
                throw new Error(
                    `${label}: a cross-reference is {map, region} — the target ` +
                        `map's shortcode and the region's key, never a UUID`,
                );
            }
            const mapKey = addr.map ?? selfShortcode;
            const target = index.get(mapKey);
            if (!target) {
                throw new Error(
                    `${label}: no map note has the shortcode "${mapKey}"`,
                );
            }
            const region = target.regions.get(addr.region);
            if (!region) {
                throw new Error(
                    `${label}: map "${mapKey}" has no region "${addr.region}" — ` +
                        `it has ${[...target.regions.keys()].join(", ") || "none"}`,
                );
            }
            return { target, region };
        };

        return {
            resolveRegionRef: (addr, label) => {
                const { target, region } = lookupRegion(addr, label);
                return `Scene.${target.sceneId}.Region.${region.id}`;
            },
            resolveBehaviorRef: (addr, label) => {
                const { target, region } = lookupRegion(addr, label);
                if (!addr.behavior) {
                    throw new Error(
                        `${label}: a behaviour reference is {map, region, behavior}`,
                    );
                }
                const behaviorId = region.behaviors.get(addr.behavior);
                if (!behaviorId) {
                    throw new Error(
                        `${label}: region "${addr.region}" has no behaviour ` +
                            `"${addr.behavior}"`,
                    );
                }
                return (
                    `Scene.${target.sceneId}.Region.${region.id}` +
                    `.RegionBehavior.${behaviorId}`
                );
            },
            resolveEffectRef: (addr, label) => {
                if (!addr || typeof addr !== "object" || !addr.item) {
                    throw new Error(
                        `${label}: an effect reference is {item, effect} — the ` +
                            `owning item's \`type-shortcode\` address and the ` +
                            `effect's name, never a UUID`,
                    );
                }
                const item = effectsByAddress.get(addr.item);
                if (!item) {
                    throw new Error(
                        `${label}: no content note addressed "${addr.item}" ` +
                            `carries Active Effects`,
                    );
                }
                const effect = item.effects.find(
                    (e) => e.name === addr.effect || e._id === addr.effect,
                );
                if (!effect?._id) {
                    throw new Error(
                        `${label}: "${addr.item}" has no Active Effect named ` +
                            `"${addr.effect}" with an \`_id\``,
                    );
                }
                return `${compendiumUuid(FOUNDRY_PACKAGE_ID, item.type, item.id)}.ActiveEffect.${effect._id}`;
            },
        };
    }

    /**
     * The heading keys a map pin may name, mapped to the page each compiled to.
     *
     * A location key matches a heading's `{#anchor}` slug, or the slug of its
     * text. Both passes split the *converted* markdown, so the ids agree with
     * the journals pack without either reading the other's output.
     *
     * @param {string} markdown - The converted body.
     * @param {string} entryId - The JournalEntry's id.
     * @param {string} name - The map's name (its lead page).
     * @returns {Map<string, string>} heading key → page id.
     */
    #pageIds(markdown, entryId, name) {
        const pageIds = new Map();
        splitPages(markdown, name).forEach((page, index) => {
            const id = journalPageId(entryId, page, index);
            if (page.anchorSlug) pageIds.set(page.anchorSlug, id);
            const slug = slugify(page.name);
            if (slug && !pageIds.has(slug)) pageIds.set(slug, id);
        });
        return pageIds;
    }

    /**
     * Index every cross-reference before the walk: a reference in the first
     * note may address the last, and the effects an authored `to:` names live
     * on item notes this pass does not otherwise read.
     *
     * @returns {Promise<void>}
     */
    async prepare() {
        await super.prepare();
        const { maps, effectsByAddress } = this.#collect();
        this.index = this.#indexMaps(maps);
        this.effectsByAddress = effectsByAddress;
        this.knownActions = collectKnownActionNames(this.repoRoot);
        /** place key → `{name, img, scenes: [], journal: []}` */
        this.places = new Map();
    }

    /**
     * Compile one map note into a Scene, and accumulate the place it belongs
     * to — a map's Scene and the JournalEntry its prose compiles into ship
     * together in an Adventure, which is the only import that preserves the
     * ids its pins address.
     *
     * @param {object} fm - The note's frontmatter.
     * @param {string} markdown - The body, tables expanded and wikilinks
     *   resolved.
     * @returns {object} The Scene document.
     */
    compileNote(fm, markdown) {
        const name = resolveName(fm);
        const hasBody = Boolean(String(markdown).trim());
        // The same doc-entry id the journals pass derives, from the
        // shared `DOC_ENTRY_TYPES` arrangement (#1514) — so neither
        // pass has to read the other's output.
        const entryId = hasBody ? itemDocEntryId(fm.id) : undefined;
        const folder = this.folderResolver(sohlField(fm, "folder", null));
        const warnings = [];
        const scene = buildScene(fm, {
            packageId: FOUNDRY_PACKAGE_ID,
            name,
            folder,
            stats: STATS,
            journalEntryId: entryId,
            pageIds:
                hasBody ? this.#pageIds(markdown, entryId, name) : new Map(),
            knownActions: this.knownActions,
            warnings,
            ...this.#resolvers(this.index, this.effectsByAddress, fm.shortcode),
        });
        for (const message of warnings) {
            log.warn(`Map "${name}": ${message}`);
        }
        this.writeEntry(scene);

        // The journal the pins point at, derived here exactly as the
        // journals pass derives it, so the Adventure bundles the same
        // document that pack ships.
        const journal =
            hasBody ?
                buildJournalEntry({
                    id: entryId,
                    name,
                    markdown,
                    leadName: name,
                    folder: sohlField(fm, "folder", null),
                    flags: fm.flags,
                })
            :   null;

        const placeKey = sohlField(fm, "place", null) || fm.shortcode;
        if (!this.places.has(placeKey)) {
            this.places.set(placeKey, {
                key: placeKey,
                name: sohlField(fm, "placeName", null) || name,
                img: sohlField(fm, "image", null),
                pinned: false,
                scenes: [],
                journal: [],
            });
        }
        const place = this.places.get(placeKey);
        place.scenes.push(stripKeys(scene));
        if (journal) place.journal.push(stripKeys(journal));
        if (Object.keys(fm.sohl?.locations ?? {}).length) {
            place.pinned = true;
        }
        return scene;
    }

    /**
     * Bundle each pinned place into an Adventure, once every map of it has
     * compiled.
     *
     * @returns {Promise<void>}
     */
    async finish() {
        this.adventureCount = 0;
        for (const place of this.places.values()) {
            // A scene that references nothing ships fine as a plain `scenes`
            // entry; only pins need the id-preserving import an Adventure gives.
            if (!place.pinned) continue;
            this.writeTo(this.adventureDir, this.#buildAdventure(place));
            this.adventureCount++;
        }
    }

    /** @inheritdoc */
    reportCompiled(stats) {
        log.info(
            `Compiled ${stats.compiled} scene(s) and ${this.adventureCount} adventure(s)`,
        );
    }

    /**
     * Bundle one place's scenes and journals into an Adventure.
     *
     * @param {object} place - The accumulated place.
     * @returns {object} The Adventure document, keyed for the pack.
     */
    #buildAdventure(place) {
        const id = makeId("map-adventure", place.key);
        return {
            name: place.name,
            img: place.img ?? null,
            caption: "",
            description: "",
            actors: [],
            combats: [],
            items: [],
            journal: place.journal,
            scenes: place.scenes,
            tables: [],
            macros: [],
            cards: [],
            playlists: [],
            folders: [],
            folder: null,
            sort: 0,
            flags: {},
            _id: id,
            _stats: STATS,
            _key: `!adventures!${id}`,
        };
    }
}
