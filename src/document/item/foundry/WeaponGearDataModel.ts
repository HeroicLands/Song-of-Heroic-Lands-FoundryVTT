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

import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { GearDataModel } from "@src/document/item/foundry/GearDataModel";
import {
    WeaponGearLogic,
    WeaponGearData,
} from "@src/document/item/logic/WeaponGearLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { ITEM_KIND, STRIKE_MODE_TYPE } from "@src/utils/constants";
const { NumberField, TypedObjectField, TypedSchemaField, SchemaField } =
    foundry.data.fields;

/**
 * Builds the Foundry data schema for weapon gear, extending the gear schema
 * with weapon-specific fields (encumbrance and strike modes).
 * @returns The weapon gear data schema.
 */
function defineWeaponGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        encumbranceBase: new NumberField({ initial: 0, min: 0 }),
        heftBase: new NumberField({ initial: 0, min: 0 }),
        // A keyed dict of strike modes, each a discriminated melee/missile
        // schema (the same schemas the combat-technique skill uses). Typing the
        // element means every strike mode's sub-fields — including
        // `defense.block` / `defense.counterstrike` — are validated and default
        // to complete values, so partial strike-mode data can no longer be
        // stored (the root cause of #512).
        strikeModes: new TypedObjectField(
            new TypedSchemaField({
                [STRIKE_MODE_TYPE.MELEE]: new SchemaField(
                    MeleeStrikeMode.schemaFields(),
                ),
                [STRIKE_MODE_TYPE.MISSILE]: new SchemaField(
                    MissileStrikeMode.schemaFields(),
                ),
            }),
        ),
    };
}

type WeaponGearSchema = ReturnType<typeof defineWeaponGearSchema>;

/** @internal */
export class WeaponGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = WeaponGearSchema,
    TLogic extends WeaponGearLogic<WeaponGearData> =
        WeaponGearLogic<WeaponGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements WeaponGearData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.WeaponGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.WEAPONGEAR;
    encumbranceBase!: number;
    heftBase!: number;
    strikeModes!: StrictObject<StrikeModeBase.Data>;

    /** Alias for the persisted strikeModes dict (Data interface name). */
    get strikeModeData(): StrictObject<StrikeModeBase.Data> {
        return this.strikeModes;
    }

    /**
     * Returns the Foundry data schema for the weapon gear item.
     * @returns The weapon gear data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineWeaponGearSchema();
    }
}
