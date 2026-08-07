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

import type { SohlScene } from "@src/document/scene/foundry/SohlScene";

/** The flag scope SoHL persists scene-scoped state under. */
export const SCENE_FLAG_SCOPE = "sohl";

/** The flag key holding a scene's Theatre of the Mind toggle. */
export const TOTM_FLAG_KEY = "isTotm";

/**
 * The read surface {@link createSceneData} needs from a scene — Foundry's
 * document flag accessor. Declared structurally so the logic layer never
 * depends on a Foundry value import.
 */
export interface SceneFlagStore {
    /**
     * Reads a document flag.
     * @param scope - The flag scope (package id).
     * @param key - The flag key within that scope.
     * @returns The stored value, or `undefined` when unset.
     */
    getFlag(scope: string, key: string): unknown;
}

/**
 * The Foundry-free view of the scene-scoped state SoHL persists, mirroring the
 * `*Data` interfaces the actor/item logic layers are built over.
 *
 * A Foundry {@link Scene} is **not** a typed document — it declares no
 * `hasTypeData`, so it has no `system` and no system DataModel can ever be
 * attached to it (issue #1155). Scene-scoped state therefore lives in document
 * flags, and this adapter reads them live.
 */
export interface SceneData {
    /** Whether the scene is flagged as Theatre of the Mind. */
    readonly isTotm: boolean;
    /** The scene the state was read from. */
    readonly scene: SohlScene;
}

/**
 * Builds the {@link SceneData} adapter over a live scene document. Every
 * property is a live read of the scene's flags, so state written after the
 * adapter was built (a GM ticking Theatre of the Mind in the Scene config) is
 * picked up without rebuilding the logic.
 * @param scene - The scene whose flags back the adapter.
 * @returns The Foundry-free scene data adapter.
 */
export function createSceneData(scene: SohlScene & SceneFlagStore): SceneData {
    return {
        get isTotm(): boolean {
            return !!scene.getFlag(SCENE_FLAG_SCOPE, TOTM_FLAG_KEY);
        },
        get scene(): SohlScene {
            return scene;
        },
    };
}

/**
 * Scene-scoped gameplay logic for the SoHL system. Lightweight by design:
 * the only scene-level state today is the Theatre of the Mind toggle, which
 * gameplay code reads through {@link isTotm}. Future scene-scoped logic
 * (encounter rolls, biome lookups, etc.) lives here.
 *
 * Unlike Actor/Item logic, scenes do not participate in the phase-batched
 * initialize/evaluate/finalize lifecycle, so this is a plain class rather
 * than a `SohlLogic` subclass.
 */
export class SohlSceneLogic {
    private readonly _data: SceneData;

    /**
     * Creates scene logic bound to the given scene data adapter.
     * @param data - The scene's flag-backed {@link SceneData}, from
     *   {@link createSceneData}.
     */
    constructor(data: SceneData) {
        this._data = data;
    }

    /** The backing flag-derived {@link SceneData}. */
    get data(): SceneData {
        return this._data;
    }

    /** The owning `SohlScene`. */
    get scene(): SohlScene {
        return this._data.scene;
    }

    /**
     * Whether this scene is being run as Theatre of the Mind — a narrative,
     * non-tactical scene. When enabled, tactical distances between tokens
     * are abstracted to zero by `SohlTokenDocument.getRangeTo`.
     */
    get isTotm(): boolean {
        return this._data.isTotm;
    }
}
