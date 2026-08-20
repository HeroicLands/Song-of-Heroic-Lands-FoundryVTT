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
 * **Scene ↔ Level integrity** for a compiled compendium pack (issue #1538).
 *
 * A v14 Scene keeps its map image on an embedded `Level`, and a compiled pack
 * stores the two in *separate* LevelDB keys: the Scene at `!scenes!<id>`
 * holding `levels` as an array of ids, and each Level at
 * `!scenes.levels!<sceneId>.<levelId>`. Nothing in Foundry ties them together
 * on read. If a Level record is missing, `EmbeddedCollectionField#expandEmbedded`
 * merely warns
 *
 * > _N embedded levels records in Level `<sceneId>` were undefined and not
 * > retrieved from the scenes.levels sublevel_
 *
 * and yields an empty collection. The very next world launch migrates that
 * scene, **persists `levels: []`**, and leaves `initialLevel` pointing at an id
 * that no longer exists — measured on both 14.359 and 14.367. The map image is
 * gone for good, and the only symptom a human sees is a blank battlemap.
 *
 * Foundry is behaving correctly there: a scene with no Level records genuinely
 * has no levels. The damage is that the condition is *unobservable* until it is
 * permanent. So the pack build asserts the invariant on the artefact it just
 * wrote — the compiled LevelDB, not the JSON it was compiled from — because the
 * gap this closes is the write path (the emitter is already unit-tested, and
 * the compendium CLI has previously mishandled Scene Levels).
 *
 * An {@link https://foundryvtt.com/api/classes/foundry.documents.BaseAdventure.html Adventure}
 * carries its scenes *inline*, levels and all, so the same invariant has a
 * second shape and a second way to ship a mapless map; both are checked here.
 *
 * Plain ESM with no Foundry, so the rule itself is a pure function over records
 * and is unit-tested directly.
 *
 * @module
 */

import { ClassicLevel } from "classic-level";

/** LevelDB key prefix for a pack's primary Scene records. */
const SCENE_PREFIX = "!scenes!";

/** LevelDB key prefix for the `levels` sublevel of those Scene records. */
const LEVEL_PREFIX = "!scenes.levels!";

/** LevelDB key prefix for a pack's Adventure records. */
const ADVENTURE_PREFIX = "!adventures!";

/**
 * Check the `levels` a scene declares, whatever shape it declared them in.
 *
 * Each violation is reported once, at its most specific: a level id whose
 * record is missing is reported by the caller, and does not also count as the
 * scene "having no Level" — one broken fact, one message.
 *
 * @param {object} scene - The scene document.
 * @param {string[]} levelIds - The Level ids the scene declares.
 * @param {string} where - How to name the scene in a problem report.
 * @returns {string[]} A problem per broken rule; empty when the scene is sound.
 */
function checkDeclaredLevels(scene, levelIds, where) {
    if (!levelIds.length) {
        return [
            `${where} has no Level — its map image cannot be stored, and ` +
                `Foundry will persist \`levels: []\` on the next world launch.`,
        ];
    }
    const initial = scene.initialLevel;
    if (initial && !levelIds.includes(initial)) {
        return [
            `${where} names initialLevel "${initial}", which is not one of ` +
                `its levels (${levelIds.join(", ")}) — a dangling reference.`,
        ];
    }
    return [];
}

/**
 * Every way a compiled pack can ship a Scene that has lost its Level.
 *
 * @param {Iterable<[string, object]>} records - `[key, value]` pairs from a
 *   compiled pack's LevelDB, in any order.
 * @returns {string[]} One human-readable problem per violation, empty when the
 *   pack is sound.
 */
export function checkSceneLevels(records) {
    /** @type {Array<[string, object]>} `!scenes!` records, by key. */
    const scenes = [];
    /** @type {Set<string>} `<sceneId>.<levelId>` for every sublevel record. */
    const levelKeys = new Set();
    /** @type {Array<object>} `!adventures!` records. */
    const adventures = [];

    for (const [key, value] of records) {
        if (key.startsWith(LEVEL_PREFIX)) {
            levelKeys.add(key.slice(LEVEL_PREFIX.length));
        } else if (key.startsWith(SCENE_PREFIX)) {
            scenes.push([key.slice(SCENE_PREFIX.length), value]);
        } else if (key.startsWith(ADVENTURE_PREFIX)) {
            adventures.push(value);
        }
    }

    const problems = [];

    for (const [sceneId, scene] of scenes) {
        const declared = Array.isArray(scene?.levels) ? scene.levels : [];
        const where = `Scene "${scene?.name ?? sceneId}" [${sceneId}]`;
        const orphans = declared.filter(
            (id) => !levelKeys.has(`${sceneId}.${id}`),
        );
        for (const id of orphans) {
            problems.push(
                `${where} lists level "${id}", but no record exists at ` +
                    `${LEVEL_PREFIX}${sceneId}.${id} — the map image is lost.`,
            );
        }
        // A missing record is already reported above; only the declaration
        // itself is judged here, so nothing is reported twice.
        if (!orphans.length) {
            problems.push(...checkDeclaredLevels(scene ?? {}, declared, where));
        }
    }

    for (const adventure of adventures) {
        const inline = Array.isArray(adventure?.scenes) ? adventure.scenes : [];
        for (const scene of inline) {
            const levelIds = (
                Array.isArray(scene?.levels) ?
                    scene.levels
                :   []).map((level) => level?._id ?? level);
            const where =
                `Adventure "${adventure?.name ?? adventure?._id}" scene ` +
                `"${scene?.name ?? scene?._id}"`;
            problems.push(...checkDeclaredLevels(scene ?? {}, levelIds, where));
        }
    }

    return problems;
}

/**
 * Read a compiled pack back off disk and check it.
 *
 * The pack is opened after the compendium CLI has closed it, so this reads the
 * bytes that will actually ship rather than the JSON they were compiled from.
 *
 * @param {string} packDir - Directory of the compiled LevelDB pack.
 * @returns {Promise<string[]>} The problems found, empty when the pack is sound.
 */
export async function verifyPackSceneLevels(packDir) {
    const db = new ClassicLevel(packDir, {
        keyEncoding: "utf8",
        valueEncoding: "json",
        createIfMissing: false,
    });
    await db.open();
    try {
        const records = [];
        for await (const entry of db.iterator()) records.push(entry);
        return checkSceneLevels(records);
    } finally {
        await db.close();
    }
}
