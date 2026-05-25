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
    ProjectileGearLogic,
    ProjectileGearData,
} from "@src/document/item/logic/ProjectileGearLogic";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    ITEM_KIND,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@src/utils/constants";
const { NumberField, StringField, SchemaField, BooleanField } =
    foundry.data.fields;

function defineProjectileGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        subType: new StringField({
            choices: ProjectileGearSubTypes,
            required: true,
        }),
        impactBase: new SchemaField({
            overrideDice: new BooleanField({ initial: false }),
            overrideModifier: new BooleanField({ initial: false }),
            numDice: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
                min: 0,
            }),
            die: new NumberField({
                integer: true,
                initial: 6,
                min: 0,
            }),
            modifier: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
                min: 0,
            }),
            aspect: new StringField({
                initial: IMPACT_ASPECT.BLUNT,
                required: true,
                choices: ImpactAspects,
            }),
        }),
    };
}

type ProjectileGearDataSchema = ReturnType<typeof defineProjectileGearSchema>;

export class ProjectileGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = ProjectileGearDataSchema,
    TLogic extends ProjectileGearLogic<ProjectileGearData> =
        ProjectileGearLogic<ProjectileGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements ProjectileGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.ProjectileGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.PROJECTILEGEAR;
    subType!: ProjectileGearSubType;
    shortName!: string;
    impactBase!: {
        overrideDice: boolean;
        overrideModifier: boolean;
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineProjectileGearSchema();
    }
}
