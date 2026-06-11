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

import type { SohlScene } from "@src/document/scene/SohlScene";
import { SohlSceneLogic } from "@src/document/scene/SohlSceneLogic";

/**
 * Builds the data schema for the SoHL {@link Scene} data model, currently just the
 * Theatre of the Mind (`isTotm`) toggle.
 * @returns The Foundry data schema for the scene.
 */
function defineSohlSceneDataSchema(): foundry.data.fields.DataSchema {
    return {
        isTotm: new foundry.data.fields.BooleanField({
            required: false,
            initial: false,
            label: "SOHL.Scene.FIELDS.isTotm.label",
            hint: "SOHL.Scene.FIELDS.isTotm.hint",
        }),
    };
}

type SohlSceneDataSchema = ReturnType<typeof defineSohlSceneDataSchema>;

/**
 * The single data model registered for the Foundry {@link Scene} document in the
 * SoHL system. Scene has no user-facing subtypes, so this is the only model
 * and lives under the `base` type.
 * @internal
 */
export class SohlSceneDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlSceneDataSchema,
> extends foundry.abstract.TypeDataModel<
    TSchema,
    SohlScene & foundry.abstract.Document.Any
> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Scene"];
    static readonly kind = "sohlscenedata";

    isTotm!: boolean;

    private _logic?: SohlSceneLogic;

    /** The lazily-constructed {@link SohlSceneLogic} wrapper for this scene. */
    get logic(): SohlSceneLogic {
        if (!this._logic) {
            this._logic = new SohlSceneLogic(this);
        }
        return this._logic;
    }

    /**
     * Returns the Foundry data schema for the SoHL scene data model.
     * @returns The scene data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlSceneDataSchema();
    }
}
