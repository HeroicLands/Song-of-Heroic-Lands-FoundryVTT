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

import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { registerEntity } from "@src/entity/entityRegistry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { entity } from "@src/entity/registry";
import type { CombatModifier } from "@src/entity/modifier/CombatModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { STRIKE_MODE_TYPE } from "@src/utils/constants";

/**
 * A melee strike mode — close-combat attack with spread, reach, and
 * defense capabilities (block and counterstrike).
 */
export class MeleeStrikeMode extends StrikeModeBase {
    /**
     * Effective melee engagement range (feet). Seeded from the weapon's
     * `lengthBase`; the wielder's corpus reach is added on top during the
     * owning logic's evaluate phase (see `WeaponGearLogic`/`SkillLogic`).
     */
    reach: ValueModifier;
    /** Defense modifiers for block and counterstrike. */
    defense: {
        /** Block-defense mastery-level modifier. */
        block: CombatModifier;
        /** Counterstrike-defense modifier (a responding attack). */
        counterstrike: CombatModifier;
    };

    /**
     * Rebuilds a melee strike mode, adding reach and defense modifiers on top
     * of the base attack/impact setup.
     *
     * Derives {@link reach} from {@link MeleeStrikeMode.Data.lengthBase | data.lengthBase}
     * and the {@link defense} block/counterstrike modifiers from
     * {@link MeleeStrikeMode.Data.defense | data.defense} (seeded as `"BlkMod"`
     * and `"CtrMod"` deltas). Block is disabled by `defense.block.disabled` or
     * the `noBlock` trait; counterstrike is disabled by
     * `defense.counterstrike.disabled` or the `noAttack` trait (a counterstrike
     * is itself an attack, so there is no separate `noCounterstrike` trait).
     *
     * @param data - Persisted melee strike-mode fields (see {@link MeleeStrikeMode.Data}).
     * @param parentLogic - The owning Logic instance, used as the modifiers' parent.
     * @param id - This strike mode's key within the parent's `strikeModes` map.
     */
    constructor(
        data: MeleeStrikeMode.Data,
        parentLogic: SohlLogic,
        id: string,
    ) {
        super(data, parentLogic, id);
        // Reach is seeded from the weapon's length; the wielder's corpus
        // reach is layered on during the owning logic's evaluate phase.
        this.reach = new entity.ValueModifier(parentLogic).setBase(
            data.lengthBase,
        );
        this.defense = {
            block: new entity.CombatModifier(parentLogic),
            counterstrike: new entity.CombatModifier(parentLogic),
        };
        // Weapon strike modes persist in an untyped ObjectField, so `defense`
        // (or its block / counterstrike sub-objects) can be absent on a
        // partially-created weapon. Read them defensively — an unguarded read
        // here threw during WeaponGearLogic.initialize and aborted the actor's
        // whole data preparation, silently hiding every strike mode (#512).
        const block = data.defense?.block;
        const counterstrike = data.defense?.counterstrike;
        if (block?.modifier) {
            this.defense.block.add("Block Modifier", "BlkMod", block.modifier);
        }
        if (counterstrike?.modifier) {
            this.defense.counterstrike.add(
                "Counterstrike Modifier",
                "CtrMod",
                counterstrike.modifier,
            );
        }
        if (block?.disabled || data.traits?.noBlock) {
            this.defense.block.disabledReason =
                "This strike mode cannot be used for blocking.";
        }
        // A counterstrike is an attack made in response, so `noAttack` disables it
        // (there is no separate `noCounterstrike` trait); it can also be disabled
        // on its own via `defense.counterstrike.disabled`.
        if (counterstrike?.disabled || data.traits?.noAttack) {
            this.defense.counterstrike.disabledReason =
                "This strike mode cannot be used for counterstriking.";
        }
    }

    /**
     * SchemaField definition for melee strike modes — used as one branch
     * of the TypedSchemaField on the combat-technique `SkillDataModel.strikeMode`.
     * @returns The data schema describing a melee strike mode.
     */
    static schemaFields(): foundry.data.fields.DataSchema {
        // Lazy access: foundry globals exist only when Foundry-side code
        // calls this; the module itself must load without them.
        const { NumberField, StringField, SchemaField, BooleanField } =
            foundry.data.fields;
        return {
            ...StrikeModeBase.baseSchemaFields(),
            type: new StringField({
                required: true,
                blank: false,
                choices: [STRIKE_MODE_TYPE.MELEE],
                initial: STRIKE_MODE_TYPE.MELEE,
            }),
            lengthBase: new NumberField({
                integer: false,
                min: 0,
                initial: 0,
            }),
            defense: new SchemaField({
                block: new SchemaField({
                    disabled: new BooleanField({ initial: false }),
                    modifier: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                    successLevelMod: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                }),
                counterstrike: new SchemaField({
                    disabled: new BooleanField({ initial: false }),
                    modifier: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                    successLevelMod: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                }),
            }),
        };
    }
}

export namespace MeleeStrikeMode {
    /** Persisted fields for a melee strike mode (extends {@link StrikeModeBase.Data}). */
    export interface Data extends StrikeModeBase.Data {
        /** Discriminator fixing this as a melee mode. */
        type: "melee";
        /** Weapon length (feet) seeding {@link MeleeStrikeMode.reach} before corpus reach is added. */
        lengthBase: number;
        /** Block and counterstrike defense configuration. */
        defense: {
            /** Block (defensive parry) configuration. */
            block: {
                /** When `true`, the mode cannot be used to block. */
                disabled?: boolean;
                /** Flat block mastery-level modifier seeded as the `"BlkMod"` delta. */
                modifier?: number;
                /** Adjustment applied to the block test's success level. */
                successLevelMod?: number;
            };
            /** Counterstrike (defend-and-attack) configuration. */
            counterstrike: {
                /** When `true`, the mode cannot be used to counterstrike. */
                disabled?: boolean;
                /** Flat counterstrike mastery-level modifier seeded as the `"CtrMod"` delta. */
                modifier?: number;
                /** Adjustment applied to the counterstrike test's success level. */
                successLevelMod?: number;
            };
        };
    }
}
registerEntity("MeleeStrikeMode", MeleeStrikeMode);
