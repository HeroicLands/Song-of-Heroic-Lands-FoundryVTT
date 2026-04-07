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
    WeaponGearStrikeMode,
} from "@src/document/item/logic/WeaponGearLogic";
import {
    IMPACT_ASPECT,
    ImpactAspects,
    ITEM_KIND,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubTypes,
} from "@src/utils/constants";
const { NumberField, StringField, ArrayField, SchemaField } =
    foundry.data.fields;

function defineWeaponGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        encumbrance: new NumberField({ initial: 0, min: 0 }),
        strikeModes: new ArrayField(
            new SchemaField({
                mode: new StringField(),
                strikeAccuracy: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                assocSkillCode: new StringField(),
                lengthBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
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
    strikeModes!: WeaponGearStrikeMode[];

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineWeaponGearSchema();
    }
}
