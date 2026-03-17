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

import type { SohlActionContext } from "@common/SohlActionContext";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ITEM_KIND,
    ITEM_METADATA,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@utils/constants";
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";
const { NumberField, StringField, SchemaField } = foundry.data.fields;

/**
 * Logic for the **Projectile Gear** item type — ammunition for ranged weapons.
 *
 * Projectile Gear represents arrows, bolts, sling stones, throwing axes, and
 * other objects launched by {@link MissileWeaponStrikeModeLogic | missile weapon
 * strike modes}. Each projectile defines its own **impact** characteristics
 * (damage dice, modifier, and aspect), which combine with the weapon's base
 * values during attack resolution.
 *
 * Projectiles are categorized by {@link ProjectileGearData.subType | subType}
 * (matching the weapon's `projectileType`) and have a **shortName** for
 * compact display. Quantity tracking (from {@link GearLogic}) represents
 * the number of projectiles remaining.
 *
 * @typeParam TData - The ProjectileGear data interface.
 */
export class ProjectileGearLogic<
    TData extends ProjectileGearData = ProjectileGearData,
> extends GearLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface ProjectileGearData<
    TLogic extends
        ProjectileGearLogic<ProjectileGearData> = ProjectileGearLogic<any>,
> extends GearData<TLogic> {
    /** Projectile category (Arrow, Bolt, Bullet, etc.) */
    subType: ProjectileGearSubType;
    /** Abbreviated name for compact display */
    shortName: string;
    /** Base damage characteristics: dice, modifier, and aspect */
    impactBase: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };
}

function defineProjectileGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        subType: new StringField({
            choices: ProjectileGearSubTypes,
            required: true,
        }),
        shortName: new StringField(),
        impactBase: new SchemaField({
            numDice: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            die: new NumberField({
                integer: true,
                initial: 6,
                min: 1,
            }),
            modifier: new NumberField({
                integer: true,
                initial: -1,
                min: -1,
            }),
            aspect: new StringField({
                initial: IMPACT_ASPECT.BLUNT,
                required: true,
                choices: IMPACT_ASPECT,
            }),
        }),
    };
}

type ProjectileGearDataSchema = ReturnType<typeof defineProjectileGearSchema>;

export class ProjectileGearDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = ProjectileGearDataSchema,
        TLogic extends
            ProjectileGearLogic<ProjectileGearData> = ProjectileGearLogic<ProjectileGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ProjectileGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.ProjectileGear", "SOHL.Gear", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.PROJECTILEGEAR;
    subType!: ProjectileGearSubType;
    shortName!: string;
    impactBase!: {
        numDice: number;
        die: number;
        modifier: number;
        aspect: ImpactAspect;
    };

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineProjectileGearSchema();
    }
}

export class ProjectileGearSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            quantity: system.quantity,
            weightBase: system.weightBase,
            valueBase: system.valueBase,
            isCarried: system.isCarried,
            isEquipped: system.isEquipped,
            qualityBase: system.qualityBase,
            durabilityBase: system.durabilityBase,
            visibleToCohort: system.visibleToCohort,
            subType: system.subType,
            shortName: system.shortName,
            impactBase: system.impactBase,
        });
    }
}
