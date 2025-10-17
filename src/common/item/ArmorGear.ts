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
import { SohlItemSheetBase } from "@common/item/SohlItem";
import { ITEM_KIND } from "@utils/constants";
import { Gear, GearDataModel } from "@common/item/Gear";
const { StringField, SchemaField, ArrayField } = foundry.data.fields;

export class ArmorGear<TData extends ArmorGear.Data = ArmorGear.Data>
    extends Gear<TData>
    implements ArmorGear.Logic<TData>
{
    protection!: PlainObject;
    traits!: StrictObject<string>;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.protection = {};
        this.traits = {};
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

export namespace ArmorGear {
    export const Kind = ITEM_KIND.ARMORGEAR;

    export interface Logic<TData extends ArmorGear.Data = ArmorGear.Data>
        extends Gear.Logic<TData> {}

    export interface Data<
        TLogic extends ArmorGear.Logic<Data> = ArmorGear.Logic<any>,
    > extends Gear.Data<TLogic> {
        material: string;
        locations: {
            flexible: string[];
            rigid: string[];
        };
    }
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
            ArmorGear.Logic<ArmorGear.Data> = ArmorGear.Logic<ArmorGear.Data>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ArmorGear.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["ArmorGear"];
    static override readonly kind = ArmorGear.Kind;
    material!: string;
    locations!: { flexible: string[]; rigid: string[] };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineArmorGearSchema();
    }
}

export class ArmorGearSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/armorgear.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
