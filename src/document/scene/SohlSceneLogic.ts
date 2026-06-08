/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlSceneDataModel } from "@src/document/scene/SohlSceneDataModel";
import type { SohlScene } from "@src/document/scene/SohlScene";

/**
 * Scene-scoped gameplay logic for the SoHL system. Lightweight by design:
 * the only scene-level state today is the Theatre of the Mind toggle, which
 * gameplay code reads through {@link isTotm}. Future scene-scoped logic
 * (encounter rolls, biome lookups, etc.) lives here.
 *
 * Unlike Actor/Item logic, scenes do not participate in the phase-batched
 * initialize/evaluate/finalize lifecycle, so this is a plain class rather
 * than a {@link import("@src/core/SohlLogic").SohlLogic} subclass.
 */
export class SohlSceneLogic {
    private readonly _data: SohlSceneDataModel;

    constructor(data: SohlSceneDataModel) {
        this._data = data;
    }

    get data(): SohlSceneDataModel {
        return this._data;
    }

    get scene(): SohlScene | null {
        return (this._data.parent ?? null) as SohlScene | null;
    }

    /**
     * Whether this scene is being run as Theatre of the Mind — a narrative,
     * non-tactical scene. When enabled, tactical distances between tokens
     * are abstracted to zero by {@link import("@src/document/token/SohlTokenDocument").SohlTokenDocument.getRangeTo}.
     */
    get isTotm(): boolean {
        return this._data.isTotm;
    }
}
