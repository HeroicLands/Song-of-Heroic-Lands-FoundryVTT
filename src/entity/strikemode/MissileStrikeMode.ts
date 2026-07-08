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

import { entity } from "@src/entity/registry";
import { registerEntity } from "@src/entity/entityRegistry";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { STRIKE_MODE_TYPE } from "@src/utils/constants";

/**
 * A missile strike mode — ranged attack with projectile type, range,
 * and draw time.
 */
export class MissileStrikeMode extends StrikeModeBase {
    /** What ammunition this mode uses ("none" if the weapon itself is thrown). */
    projectileType: string;
    /** Maximum volley multiplier for rapid fire. */
    maxVolleyMult: number;
    /** Base range before modifiers (feet). */
    baseRange: ValueModifier;
    /** Draw/reload time before firing. */
    draw: ValueModifier;

    /**
     * Rebuilds a missile strike mode, adding ranged-specific fields on top of
     * the base attack/impact setup.
     *
     * Copies {@link projectileType} and {@link maxVolleyMult} directly, and
     * derives {@link baseRange} from {@link MissileStrikeMode.Data.baseRangeBase | data.baseRangeBase}
     * and {@link draw} from {@link MissileStrikeMode.Data.drawBase | data.drawBase}.
     *
     * @param data - Persisted missile strike-mode fields (see {@link MissileStrikeMode.Data}).
     * @param parentLogic - The owning Logic instance, used as the modifiers' parent.
     * @param id - This strike mode's key within the parent's `strikeModes` map.
     */
    constructor(
        data: MissileStrikeMode.Data,
        parentLogic: SohlLogic,
        id: string,
    ) {
        super(data, parentLogic, id);
        this.projectileType = data.projectileType;
        this.maxVolleyMult = data.maxVolleyMult;
        this.baseRange = new entity.ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.baseRangeBase);
        this.draw = new entity.ValueModifier(
            {},
            { parent: parentLogic },
        ).setBase(data.drawBase);
    }

    /**
     * SchemaField definition for missile strike modes — used as one branch
     * of the TypedSchemaField on `CombatTechniqueDataModel.strikeMode`.
     *
     * @returns The data schema describing a missile strike mode.
     */
    static schemaFields(): foundry.data.fields.DataSchema {
        // Lazy access: foundry globals exist only when Foundry-side code
        // calls this; the module itself must load without them.
        const { NumberField, StringField } = foundry.data.fields;
        return {
            ...StrikeModeBase.baseSchemaFields(),
            type: new StringField({
                required: true,
                blank: false,
                choices: [STRIKE_MODE_TYPE.MISSILE],
                initial: STRIKE_MODE_TYPE.MISSILE,
            }),
            projectileType: new StringField({
                required: true,
                blank: false,
                initial: "none",
            }),
            maxVolleyMult: new NumberField({
                integer: true,
                min: 1,
                initial: 1,
            }),
            baseRangeBase: new NumberField({
                integer: false,
                min: 0,
                initial: 0,
            }),
            drawBase: new NumberField({
                integer: false,
                min: 0,
                initial: 0,
            }),
        };
    }
}

export namespace MissileStrikeMode {
    /** Persisted fields for a missile strike mode (extends {@link StrikeModeBase.Data}). */
    export interface Data extends StrikeModeBase.Data {
        /** Discriminator fixing this as a missile mode. */
        type: "missile";
        /** Ammunition type consumed, or `"none"` when the weapon itself is thrown. */
        projectileType: string;
        /** Maximum volley multiplier permitted when firing rapidly. */
        maxVolleyMult: number;
        /** Base range (feet) seeding {@link MissileStrikeMode.baseRange} before modifiers. */
        baseRangeBase: number;
        /** Base draw/reload time seeding {@link MissileStrikeMode.draw} before modifiers. */
        drawBase: number;
    }
}
registerEntity("MissileStrikeMode", MissileStrikeMode);
