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

export class ProjectileGearLogic<
    TData extends ProjectileGearData = ProjectileGearData,
> extends GearLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface ProjectileGearData<
    TLogic extends
        ProjectileGearLogic<ProjectileGearData> = ProjectileGearLogic<any>,
> extends GearData<TLogic> {
    subType: ProjectileGearSubType;
    shortName: string;
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
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.ProjectileGear.DATA",
    ];
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
        return context;
    }
}
