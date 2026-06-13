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

import type { SohlSceneDataModel } from "@src/document/scene/foundry/SohlSceneDataModel";
import type { SohlSceneLogic } from "@src/document/scene/logic/SohlSceneLogic";

/**
 * The SoHL Scene document. Exists so that gameplay code can read scene-scoped
 * state via {@link logic} (mirroring `SohlActor.logic` / `SohlItem.logic`)
 * rather than reaching into the underlying DataModel by hand.
 *
 * Foundry's {@link Scene} is a non-generic document (no subtypes), so this class
 * is non-generic as well.
 */
export class SohlScene extends Scene {
    /**
     * Convenience accessor for the scene-scoped logic instance — equivalent
     * to `(this.system as SohlSceneDataModel).logic`.
     */
    get logic(): SohlSceneLogic {
        return ((this as any).system as SohlSceneDataModel).logic;
    }
}
