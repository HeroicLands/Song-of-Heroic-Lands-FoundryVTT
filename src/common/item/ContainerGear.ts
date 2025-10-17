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
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import { Gear, GearDataModel } from "@common/item/Gear";
import { ITEM_KIND } from "@utils/constants";
const { NumberField } = foundry.data.fields;

export class ContainerGear<
        TData extends ContainerGear.Data = ContainerGear.Data,
    >
    extends Gear<TData>
    implements ContainerGear.Logic<TData>
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

export namespace ContainerGear {
    export const Kind = ITEM_KIND.CONTAINERGEAR;

    export interface Logic<
        TData extends ContainerGear.Data = ContainerGear.Data,
    > extends Gear.Logic<TData> {}

    export interface Data<
        TLogic extends ContainerGear.Logic<Data> = ContainerGear.Logic<any>,
    > extends Gear.Data<TLogic> {
        maxCapacityBase: number;
    }
}

function defineContainerGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        maxCapacityBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type ContainerGearSchema = ReturnType<typeof defineContainerGearSchema>;

export class ContainerGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = ContainerGearSchema,
        TLogic extends
            ContainerGear.Logic<ContainerGear.Data> = ContainerGear.Logic<ContainerGear.Data>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ContainerGear.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["ContainerGear"];
    maxCapacityBase!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineContainerGearSchema();
    }
}

export class ContainerGearSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/containergear.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
