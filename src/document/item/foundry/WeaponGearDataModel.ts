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

import { GearDataModel } from "@src/document/item/foundry/GearDataModel";
import {
    WeaponGearLogic,
    WeaponGearData,
} from "@src/document/item/logic/WeaponGearLogic";
import type { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import {
    IMPACT_ASPECT,
    ImpactAspects,
    ITEM_KIND,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubTypes,
    STRIKE_MODE_TYPE,
    StrikeModeTypes,
} from "@src/utils/constants";
const { NumberField, StringField, ArrayField, SchemaField, ObjectField } =
    foundry.data.fields;

function defineWeaponGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        encumbrance: new NumberField({ initial: 0, min: 0 }),
        strikeModes: new ArrayField(
            new SchemaField({
                type: new StringField({
                    required: true,
                    initial: STRIKE_MODE_TYPE.MELEE,
                    choices: StrikeModeTypes,
                }),
                mode: new StringField(),
                minParts: new NumberField({
                    integer: true,
                    initial: 1,
                    min: 1,
                }),
                assocSkillCode: new StringField(),

                // Melee fields
                strikeAccuracy: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                lengthBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),

                // Missile fields
                projectileType: new StringField({
                    initial: PROJECTILEGEAR_SUBTYPE.NONE,
                    required: true,
                    choices: ProjectileGearSubTypes,
                }),
                maxVolleyMult: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                baseRangeBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                drawBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),

                // Shared fields
                impactBase: new SchemaField({
                    numDice: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    die: new NumberField({
                        integer: true,
                        initial: 6,
                        min: 0,
                    }),
                    modifier: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                    aspect: new StringField({
                        initial: IMPACT_ASPECT.BLUNT,
                        required: true,
                        choices: ImpactAspects,
                    }),
                }),
                traits: new ObjectField({ initial: {} }),
            }),
            { initial: [] },
        ),
    };
}

type WeaponGearSchema = ReturnType<typeof defineWeaponGearSchema>;

export class WeaponGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = WeaponGearSchema,
    TLogic extends WeaponGearLogic<WeaponGearData> =
        WeaponGearLogic<WeaponGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements WeaponGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.WeaponGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.WEAPONGEAR;
    lengthBase!: number;
    encumbrance!: number;
    strikeModes!: StrikeModeBase.Data[];

    /** Alias for the persisted strikeModes array (Data interface name). */
    get strikeModeData(): StrikeModeBase.Data[] {
        return this.strikeModes;
    }

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineWeaponGearSchema();
    }
}
