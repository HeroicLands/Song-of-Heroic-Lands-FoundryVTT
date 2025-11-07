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

import type { SohlActionContext } from "@common/SohlActionContext";
import { SohlItemSheetBase } from "@common/item/SohlItem";
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";
import { ITEM_KIND } from "@utils/constants";
const { NumberField } = foundry.data.fields;

export class ContainerGearLogic<
    TData extends ContainerGearData = ContainerGearData,
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

export interface ContainerGearData<
    TLogic extends
        ContainerGearLogic<ContainerGearData> = ContainerGearLogic<any>,
> extends GearData<TLogic> {
    maxCapacityBase: number;
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
            ContainerGearLogic<ContainerGearData> = ContainerGearLogic<ContainerGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ContainerGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["ContainerGear"];
    static override readonly kind = ITEM_KIND.CONTAINERGEAR;
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
