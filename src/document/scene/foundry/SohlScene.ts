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

import type { SohlSceneDataModel } from "@src/document/scene/foundry/SohlSceneDataModel";
import type { SohlSceneLogic } from "@src/document/scene/logic/SohlSceneLogic";

/**
 * The SoHL Scene document. Exists so that gameplay code can read scene-scoped
 * state via {@link logic} (mirroring `SohlActor.logic` / `SohlItem.logic`)
 * rather than reaching into the underlying DataModel by hand.
 *
 * Foundry's {@link Scene} is a non-generic document (no subtypes), so this class
 * is non-generic as well.
 *
 * @internal The Foundry document layer is an implementation detail; author-facing
 * code reaches scene state through the logic layer (`scene.logic`).
 */
export class SohlScene extends Scene {
    /**
     * Convenience accessor for the scene-scoped logic instance — equivalent
     * to `(this.system as SohlSceneDataModel).logic`, or `undefined` when the
     * scene carries no SoHL system data.
     *
     * @remarks
     * A Scene is not one of Foundry's typed documents, so its `system` is not
     * always populated. Reading `.logic` off an absent `system` used to throw
     * — from inside the getter, where the caller's `?.` could not help — and
     * that crash took out every consumer, including the range measurement on
     * the automated-attack path (#1079). Callers must handle `undefined`.
     */
    get logic(): SohlSceneLogic | undefined {
        return ((this as any).system as SohlSceneDataModel | undefined)?.logic;
    }
}
