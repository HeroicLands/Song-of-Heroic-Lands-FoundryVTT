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
 * Reads item and actor definitions from the test-only setting.
 *
 * Gear belongs to a setting, so the end-to-end specs build the gear they need,
 * and the actors that carry it, from the notes under
 * `tests/fixtures/test-setting/` instead of reading them out of a shipped
 * compendium. That tree is not packaged, so nothing here reaches a player.
 * Runs in Node, as Cypress tasks.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../../tests/fixtures/test-setting");
const SYSTEM_ROOT = path.resolve(import.meta.dirname, "../../assets/content");

/** The shipped folders the system's own items (attributes and skills) come from. */
const SYSTEM_ITEM_FOLDERS = ["Attributes", "Skills"];

/** The item types the system defines itself; an actor takes these from the shipped compendium. */
const SYSTEM_ITEM_TYPES = new Set(["attribute", "skill"]);

/** Every `.md` note under a directory, recursively. */
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
    });
}

/** The frontmatter of the first note under `roots` carrying the type and shortcode, or null. */
function findNote(roots, type, shortcode) {
    for (const root of roots) {
        for (const file of walk(root)) {
            const { data } = matter(fs.readFileSync(file, "utf8"));
            if (data.type === type && data.shortcode === shortcode) return data;
        }
    }
    return null;
}

/** The create payload for an item note's frontmatter. */
function itemPayload(data) {
    const system = {
        shortcode: data.shortcode,
        ...(data.subType ? { subType: data.subType } : {}),
    };
    return {
        name: data.name.full,
        type: data.type,
        system: { ...system, ...(data.sohl?.system ?? {}) },
    };
}

/** `overlay` merged over `base`, recursing into plain objects; arrays and scalars replace. */
function deepMerge(base, overlay) {
    const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
    const out = { ...base };
    for (const [key, value] of Object.entries(overlay)) {
        out[key] = isObject(value) && isObject(base[key]) ? deepMerge(base[key], value) : value;
    }
    return out;
}

/**
 * The create payload for the fixture note of the given item type and shortcode.
 *
 * @param {{type: string, shortcode: string}} ref
 * @returns {{name: string, type: string, system: object}}
 * @throws {Error} when no fixture note carries that type and shortcode.
 */
export function readFixtureItem({ type, shortcode }) {
    const data = findNote([FIXTURE_ROOT], type, shortcode);
    if (!data) throw new Error(`No ${type} with shortcode "${shortcode}" in the test setting`);
    return itemPayload(data);
}

/**
 * The create payloads for several fixture notes of one item type.
 *
 * @param {{type: string, shortcodes: string[]}} ref
 * @returns {{name: string, type: string, system: object}[]}
 * @throws {Error} when any shortcode has no fixture note of that type.
 */
export function readFixtureItems({ type, shortcodes }) {
    return shortcodes.map((shortcode) => readFixtureItem({ type, shortcode }));
}

/**
 * The create payload for a fixture actor, with its embedded items.
 *
 * Each `sohl.items` entry's `model` names an item by its last two address
 * segments, `<type>-<shortcode>`. Gear resolves only against the test setting,
 * and the entry's remaining properties merge over the note the way the pack
 * build merges them. Attributes and skills are the system's own: the note must
 * exist in the system's `Attributes` or `Skills` folder, and the entry is
 * returned as `{ pack: { type, shortcode }, overlay }` for the caller to
 * resolve against the shipped `sohl.items` compendium, whose documents carry
 * the compiled field shapes. A model that names gear the setting does not
 * define is an error rather than a silent omission.
 *
 * Setting items carry a stable `_id` derived from their type and shortcode.
 *
 * @param {{shortcode: string}} ref - The fixture being's shortcode.
 * @returns {{name: string, type: string, system: object, items: object[]}}
 * @throws {Error} when the note is absent or a model does not resolve.
 */
export function readFixtureActor({ shortcode }) {
    const note = findNote([FIXTURE_ROOT], "being", shortcode);
    if (!note) throw new Error(`No being with shortcode "${shortcode}" in the test setting`);

    const itemRoots = [
        FIXTURE_ROOT,
        ...SYSTEM_ITEM_FOLDERS.map((folder) => path.join(SYSTEM_ROOT, folder)),
    ];
    const ids = new Map();
    const items = (note.sohl?.items ?? []).map((entry) => {
        const { model, type: ownType, ...overlay } = entry;
        if (!model) {
            return {
                _id: stableId(`${ownType}:${entry.system?.shortcode}`, ids),
                ...overlay,
                type: ownType,
            };
        }
        const [itemType, itemShortcode] = model.split("-").slice(-2);
        const data = findNote(itemRoots, itemType, itemShortcode);
        if (data && SYSTEM_ITEM_TYPES.has(itemType)) {
            const { data: _art, ...fields } = overlay;
            return { pack: { type: itemType, shortcode: itemShortcode }, overlay: fields };
        }
        if (!data) {
            throw new Error(
                `${note.name.full}: model "${model}" resolves to no ${itemType} "${itemShortcode}" ` +
                    "in the test setting or the system's Attributes and Skills",
            );
        }
        const { data: _art, ...fields } = overlay;
        return {
            ...deepMerge(itemPayload(data), fields),
            _id: stableId(`${itemType}:${itemShortcode}`, ids),
        };
    });

    const system = {
        shortcode,
        templatePriority: note.data?.templatePriority ?? null,
        ...(note.sohl?.system ?? {}),
    };

    return { name: note.name.full, type: "being", system, items };
}

/** A 16-character document id derived from a key, unique within one actor. */
function stableId(key, seen) {
    let hash = 0xcbf29ce484222325n;
    for (const ch of key)
        hash = ((hash ^ BigInt(ch.charCodeAt(0))) * 0x100000001b3n) & 0xffffffffffffffffn;
    const id = hash.toString(16).padStart(16, "0");
    if (seen.has(id)) throw new Error(`Two items share the id key "${key}"`);
    seen.set(id, key);
    return id;
}
