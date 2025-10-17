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
import { Gear, GearDataModel } from "@common/item/Gear";
import { ITEM_KIND } from "@utils/constants";
import { SohlItemSheetBase } from "./SohlItem";
const { NumberField } = foundry.data.fields;

export class WeaponGear<TData extends WeaponGear.Data = WeaponGear.Data>
    extends Gear<TData>
    implements WeaponGear.Logic
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

export namespace WeaponGear {
    export const Kind = ITEM_KIND.WEAPONGEAR;

    export interface Logic<TData extends WeaponGear.Data = WeaponGear.Data>
        extends Gear.Logic<TData> {}

    export interface Data<
        TLogic extends WeaponGear.Logic<Data> = WeaponGear.Logic<any>,
    > extends Gear.Data<TLogic> {
        lengthBase: number;
    }
}

function defineWeaponGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        lengthBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type WeaponGearSchema = ReturnType<typeof defineWeaponGearSchema>;

export class WeaponGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = WeaponGearSchema,
        TLogic extends
            WeaponGear.Logic<WeaponGear.Data> = WeaponGear.Logic<WeaponGear.Data>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements WeaponGear.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["WeaponGear"];
    lengthBase!: number;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineWeaponGearSchema();
    }
}

export class WeaponGearSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/weapongear.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
