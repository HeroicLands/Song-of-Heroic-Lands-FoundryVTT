/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlEventContext } from "@common/event/SohlEventContext";
import { SohlItemDataModel, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ITEM_KIND,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@utils/constants";
import { Gear, GearDataModel } from "@common/item/Gear";
const { NumberField, StringField, SchemaField } = foundry.data.fields;

export class ProjectileGear<
        TData extends ProjectileGear.Data = ProjectileGear.Data,
    >
    extends Gear<TData>
    implements ProjectileGear.Logic<TData>
{
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace ProjectileGear {
    export const Kind = ITEM_KIND.PROJECTILEGEAR;

    export interface Logic<
        TData extends ProjectileGear.Data = ProjectileGear.Data,
    > extends Gear.Logic<TData> {}

    export interface Data<
        TLogic extends ProjectileGear.Logic<Data> = ProjectileGear.Logic<any>,
    > extends Gear.Data<TLogic> {
        subType: ProjectileGearSubType;
        shortName: string;
        impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactAspect;
        };
    }
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
            ProjectileGear.Logic<ProjectileGear.Data> = ProjectileGear.Logic<ProjectileGear.Data>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ProjectileGear.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["ProjectileGear"];
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
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/projectilegear.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
