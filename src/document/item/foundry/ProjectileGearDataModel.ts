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

import { GearDataModel } from "@src/document/item/foundry/GearDataModel";
import {
    ProjectileGearLogic,
    ProjectileGearData,
} from "@src/document/item/logic/ProjectileGearLogic";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspectChoices,
    ITEM_KIND,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
    ProjectileGearSubTypeChoices,
} from "@src/utils/constants";
const { NumberField, StringField, SchemaField, BooleanField } =
    foundry.data.fields;

/**
 * Builds the Projectile Gear data schema (sub-type and impact-base fields)
 * on top of the base gear schema.
 * @returns The Projectile Gear data schema.
 */
function defineProjectileGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        subType: new StringField({
            choices: ProjectileGearSubTypeChoices,
            required: true,
            initial: PROJECTILEGEAR_SUBTYPE.NONE,
        }),
        impactBase: new SchemaField({
            overrideDice: new BooleanField({ initial: false }),
            overrideModifier: new BooleanField({ initial: false }),
            numDice: new NumberField({
                integer: true,
                nullable: false,
                initial: 0,
                min: 0,
            }),
            die: new NumberField({
                integer: true,
                min: 2,
                nullable: true,
                initial: null,
            }),
            modifier: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
            }),
            aspect: new StringField({
                initial: IMPACT_ASPECT.BLUNT,
                required: true,
                choices: ImpactAspectChoices,
            }),
        }),
    };
}

type ProjectileGearDataSchema = ReturnType<typeof defineProjectileGearSchema>;

/** @internal */
export class ProjectileGearDataModel<
    TSchema extends foundry.data.fields.DataSchema = ProjectileGearDataSchema,
    TLogic extends ProjectileGearLogic<ProjectileGearData> =
        ProjectileGearLogic<ProjectileGearData>,
>
    extends GearDataModel<TSchema, TLogic>
    implements ProjectileGearData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.ProjectileGear",
        "SOHL.Gear",
        "SOHL.Item",
    ];
    /** @inheritDoc */
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

    /**
     * Defines the Projectile Gear data schema.
     * @returns The Projectile Gear data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineProjectileGearSchema();
    }
}
