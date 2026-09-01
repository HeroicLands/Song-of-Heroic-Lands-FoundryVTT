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

import {
    createSceneData,
    SohlSceneLogic,
    SCENE_FLAG_SCOPE,
    TOTM_FLAG_KEY,
} from "@src/document/scene/logic/SohlSceneLogic";

/**
 * The SoHL Scene document. Exists so that gameplay code can read scene-scoped
 * state via {@link logic} (mirroring `SohlActor.logic` / `SohlItem.logic`)
 * rather than reaching into flags by hand.
 *
 * Foundry's {@link Scene} is a non-generic document (no subtypes), so this class
 * is non-generic as well.
 *
 * @internal The Foundry document layer is an implementation detail; author-facing
 * code reaches scene state through the logic layer (`scene.logic`).
 */
export class SohlScene extends Scene {
    /** Cached transient {@link sohl.document.scene.logic.SohlSceneLogic} for this scene. */
    private _sohlLogic?: SohlSceneLogic;

    /**
     * This scene's {@link sohl.document.scene.logic.SohlSceneLogic}, built lazily
     * over a transient flag-backed adapter.
     *
     * @remarks
     * A Scene is **not** one of Foundry's typed documents — `BaseScene` declares
     * no `hasTypeData`, so a scene has no `system` and no system DataModel can be
     * attached to it however it is registered in `CONFIG` (issue #1155). Like
     * `SohlTokenDocument`, the logic is therefore not created by `SohlDataModel`;
     * it wraps an adapter that reads the scene's SoHL flags live, so the toggle a
     * GM sets in the Scene config is observable immediately.
     */
    get logic(): SohlSceneLogic {
        this._sohlLogic ??= new SohlSceneLogic(createSceneData(this));
        return this._sohlLogic;
    }

    /**
     * Sets this scene's Theatre of the Mind toggle. The Scene config writes the
     * flag directly through its form; this is the programmatic equivalent for
     * macros and modules.
     * @param isTotm - Whether the scene runs as Theatre of the Mind.
     * @returns The updated scene.
     */
    async setTotm(isTotm: boolean): Promise<this> {
        return (await this.setFlag(SCENE_FLAG_SCOPE, TOTM_FLAG_KEY, isTotm)) as this;
    }
}
