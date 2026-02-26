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
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";
const { StringField, SchemaField, ArrayField } = foundry.data.fields;

export class ArmorGearLogic<
    TData extends ArmorGearData = ArmorGearData,
> extends GearLogic<TData> {
    protection!: PlainObject;
    traits!: StrictObject<string>;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        this.protection = {};
        this.traits = {};
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

export interface ArmorGearData<
    TLogic extends ArmorGearLogic<ArmorGearData> = ArmorGearLogic<any>,
> extends GearData<TLogic> {
    material: string;
    locations: {
        flexible: string[];
        rigid: string[];
    };
}

function defineArmorGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        material: new StringField(),
        locations: new SchemaField({
            flexible: new ArrayField(new StringField()),
            rigid: new ArrayField(new StringField()),
        }),
    };
}

type ArmorGearDataSchema = ReturnType<typeof defineArmorGearSchema>;

export class ArmorGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = ArmorGearDataSchema,
        TLogic extends
            ArmorGearLogic<ArmorGearData> = ArmorGearLogic<ArmorGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ArmorGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.ArmorGear.DATA"];
    static override readonly kind = ITEM_KIND.ARMORGEAR;
    material!: string;
    locations!: { flexible: string[]; rigid: string[] };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineArmorGearSchema();
    }
}

export class ArmorGearSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
